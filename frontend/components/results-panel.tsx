"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Inbox, MapPin, Tag } from "lucide-react";
import { formatFieldLabel, formatResourceLabel } from "@/lib/labels";

type FilterPair = {
  key: string;
  value: string;
};

type PaginatedEnvelope = {
  resource: string;
  sourceUrl: string;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: Array<Record<string, unknown>>;
  metadata: Record<string, unknown>;
  cachedAtUtc: string;
  expiresAtUtc: string;
};

type MunicipalityInfo = {
  codigo_municipio: string;
  nome_municipio: string;
  geoibgeId?: string | null;
};

type ResultsPanelProps = {
  payload: PaginatedEnvelope | null;
  filters: FilterPair[];
  selectedResource: string;
  resourceCategory: string | null;
  municipality: MunicipalityInfo | null;
  selectedMunicipalityCode: string;
  requestPageSize: number;
  shouldFetchOnMount?: boolean;
};

const csvDelimiter = ";";
const displayBatchSize = 250;
const hiddenTableColumns = new Set(["codigo_municipio", "exercicio_orcamento"]);
const ngrokBypassHeaders = {
  "ngrok-skip-browser-warning": "1",
};

function orderVisibleColumns(resourceKey: string, columns: string[]) {
  if (resourceKey !== "contrato") {
    return columns;
  }

  return [...columns].sort((left, right) => {
    const leftIsObjectField = left === "descricao_objeto_contrato";
    const rightIsObjectField = right === "descricao_objeto_contrato";

    if (leftIsObjectField === rightIsObjectField) {
      return 0;
    }

    return leftIsObjectField ? 1 : -1;
  });
}

function readBooleanMetadata(metadata: Record<string, unknown>, key: string) {
  return metadata[key] === true;
}

function isIntervalDateField(key: string) {
  return [
    "data_contrato",
    "data_realizacao_autuacao_licitacao",
    "data_realizacao_licitacao",
    "data_aquisicao_bem",
    "data_abertura_credito",
    "data_emissao_empenho",
    "data_avaliacao",
    "data_liquidacao",
    "data_movimentacao",
    "data_publicacao_edital",
  ].includes(key);
}

function formatFilterValue(key: string, value: string) {
  if (isIntervalDateField(key)) {
    const [start = "", end = ""] = value.split("_", 2);
    if (start && end) return `${formatDateValue(start)} ate ${formatDateValue(end)}`;
    return formatDateValue(start || value);
  }

  return formatDateValue(value);
}

function formatDateValue(value: string) {
  const trimmed = value.trim();

  const dateOnlyMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return `${day}-${month}-${year}`;
  }

  const dateTimeMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[T ]\d{2}:\d{2}:\d{2}/);
  if (dateTimeMatch) {
    const [, year, month, day] = dateTimeMatch;
    return `${day}-${month}-${year}`;
  }

  return value;
}

function formatCellValue(value: unknown) {
  if (value == null) return "-";
  if (typeof value === "boolean") return value ? "Sim" : "Nao";
  if (typeof value === "object") return JSON.stringify(value);
  return formatDateValue(String(value));
}

function createItemKey(item: Record<string, unknown>) {
  return JSON.stringify(item);
}

function mergeItems(
  previousItems: Array<Record<string, unknown>>,
  nextItems: Array<Record<string, unknown>>
) {
  const merged = [...previousItems];
  const seen = new Set(previousItems.map((item) => createItemKey(item)));

  nextItems.forEach((item) => {
    const key = createItemKey(item);
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    merged.push(item);
  });

  return merged;
}

function toSerializableCellValue(value: unknown) {
  if (value == null) return "";
  if (typeof value === "boolean") return value ? "Sim" : "Nao";
  if (typeof value === "object") return JSON.stringify(value);
  return formatDateValue(String(value));
}

function escapeCsvValue(value: string) {
  if (
    value.includes(csvDelimiter) ||
    value.includes("\"") ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replace(/"/g, "\"\"")}"`;
  }

  return value;
}

function buildCsvContent(
  items: Array<Record<string, unknown>>,
  resourceKey: string
) {
  const columns = orderVisibleColumns(
    resourceKey,
    Array.from(new Set(items.flatMap((item) => Object.keys(item))))
  );
  const header = columns
    .map((column) => escapeCsvValue(formatFieldLabel(column, resourceKey)))
    .join(csvDelimiter);
  const rows = items.map((item) =>
    columns
      .map((column) => escapeCsvValue(toSerializableCellValue(item[column])))
      .join(csvDelimiter)
  );

  return [header, ...rows].join("\r\n");
}

function buildExportFileName(resource: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${resource}_${timestamp}.csv`;
}

function buildRelativeApiUrl(
  resource: string,
  page: number,
  pageSize: number,
  selectedMunicipalityCode: string,
  filters: FilterPair[]
) {
  const url = new URL(`/api/resources/${resource}`, window.location.origin);
  url.searchParams.set("page", String(page));
  url.searchParams.set("pageSize", String(pageSize));

  if (selectedMunicipalityCode) {
    url.searchParams.set("codigo_municipio", selectedMunicipalityCode);
  }

  filters.forEach((filter) => {
    if (filter.key.trim()) {
      url.searchParams.set(filter.key, filter.value);
    }
  });

  return url.toString();
}

function ResultsTable({
  items,
  resourceLabel,
  resourceCategory,
  municipality,
  isExporting,
  onExport,
  resourceKey,
  gridContainerRef,
}: {
  items: Array<Record<string, unknown>>;
  resourceLabel: string;
  resourceCategory: string | null;
  municipality: MunicipalityInfo | null;
  isExporting: boolean;
  onExport: () => Promise<void>;
  resourceKey: string;
  gridContainerRef: RefObject<HTMLDivElement | null>;
}) {
  const columns = orderVisibleColumns(
    resourceKey,
    Array.from(
      new Set(
        items.flatMap((item) =>
          Object.keys(item).filter((column) => !hiddenTableColumns.has(column))
        )
      )
    )
  );
  const gridColumns: GridColDef[] = columns.map((column) => ({
    field: column,
    headerName: formatFieldLabel(column, resourceKey),
    minWidth: 160,
    flex: 1,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    renderCell: (params) => formatCellValue(params.value),
  }));
  const rows = items.map((item, index) => ({
    id: `${resourceKey}-${index}`,
    ...item,
  }));

  return (
    <div className="surface-panel soft-reveal w-full max-w-full overflow-hidden rounded-2xl">
      <div className="border-b border-border/70 bg-card px-5 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Registros em tabela
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Visualizacao tabular habilitada para o endpoint `{resourceLabel}`.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => {
                void onExport();
              }}
              disabled={isExporting}
              className="inline-flex min-h-[60px] items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground shadow-[0_10px_24px_hsl(var(--primary)/0.22)] transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_14px_30px_hsl(var(--primary)/0.28)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isExporting && <CircularProgress size={16} sx={{ color: "currentColor" }} />}
              {isExporting ? "Gerando CSV..." : "Exportar CSV completo"}
            </button>
            {municipality && (
              <div className="rounded-xl border border-border/80 bg-background px-3 py-2 text-xs">
                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary/80" aria-hidden="true" />
                  Contexto territorial
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium text-foreground">{municipality.nome_municipio}</span>
                  <span className="text-muted-foreground">TCE-CE: {municipality.codigo_municipio}</span>
                  {municipality.geoibgeId && <span className="text-muted-foreground">IBGE: {municipality.geoibgeId}</span>}
                </div>
              </div>
            )}

            {resourceCategory && (
              <div className="rounded-xl border border-border/80 bg-background px-3 py-2 text-xs">
                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <Tag className="h-3.5 w-3.5 text-primary/80" aria-hidden="true" />
                  Categoria
                </div>
                <span className="font-medium text-foreground">{resourceCategory}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border/70 bg-card p-4 md:hidden">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Registros carregados
        </div>
        <div className="space-y-3">
          {items.map((item, index) => (
            <article
              key={`${resourceKey}-mobile-${index}`}
              className="rounded-2xl border border-border/80 bg-background/95 p-4 shadow-[0_6px_18px_hsl(200_18%_18%_/_0.05)]"
            >
              <div className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Registro {index + 1}
              </div>
              <dl className="space-y-2">
                {columns.map((column) => (
                  <div
                    key={`${resourceKey}-mobile-${index}-${column}`}
                    className="rounded-xl border border-border/60 bg-card/80 px-3 py-2"
                  >
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {formatFieldLabel(column, resourceKey)}
                    </dt>
                    <dd className="mt-1 break-words text-sm leading-6 text-foreground">
                      {formatCellValue(item[column])}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </div>

      <div ref={gridContainerRef} className="hidden md:block">
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: "100%",
            backgroundColor: "hsl(var(--card))",
            borderRadius: "0 0 1rem 1rem",
            borderTop: "1px solid hsl(var(--border) / 0.45)",
            "&::-webkit-scrollbar": {
              width: 8,
              height: 8,
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "hsl(var(--muted))",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "hsl(var(--muted-foreground) / 0.32)",
              borderRadius: 999,
            },
          }}
        >
          <DataGrid
            rows={rows}
            columns={gridColumns}
            disableRowSelectionOnClick
            hideFooter
            rowHeight={56}
            columnHeaderHeight={56}
            disableColumnResize={false}
            sx={{
              "--DataGrid-overlayHeight": "160px",
              border: 0,
              minWidth: "100%",
              backgroundColor: "hsl(var(--card))",
              ".dark &": {
                backgroundColor: "hsl(200 22% 10%)",
              },
              "& .MuiDataGrid-main": {
                overflow: "auto",
                maxHeight: "65vh",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "hsl(var(--secondary))",
                color: "hsl(var(--secondary-foreground))",
                borderBottom: "1px solid hsl(var(--border) / 0.8)",
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 700,
                fontSize: "0.78rem",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                whiteSpace: "normal",
                lineHeight: 1.25,
              },
              "& .MuiDataGrid-cell": {
                alignItems: "start",
                py: 1.5,
                color: "hsl(var(--foreground))",
                borderBottom: "1px solid hsl(var(--border) / 0.5)",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                lineHeight: 1.65,
              },
              "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus-within": {
                outline: "none",
              },
              "& .MuiDataGrid-row:nth-of-type(odd)": {
                backgroundColor: "hsl(var(--card))",
              },
              "& .MuiDataGrid-row:nth-of-type(even)": {
                backgroundColor: "hsl(var(--muted) / 0.45)",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "hsl(var(--secondary) / 0.72)",
              },
              "& .MuiDataGrid-columnSeparator": {
                color: "hsl(var(--border) / 0.8)",
              },
              "& .MuiDataGrid-virtualScroller": {
                overflowX: "auto",
              },
              ".dark & .MuiDataGrid-columnHeaders": {
                backgroundColor: "hsl(200 20% 14%)",
                color: "hsl(180 15% 92%)",
                borderBottom: "1px solid hsl(200 18% 20%)",
              },
              ".dark & .MuiDataGrid-columnHeader": {
                backgroundColor: "hsl(200 20% 14%)",
              },
              ".dark & .MuiDataGrid-cell": {
                backgroundColor: "transparent",
                color: "hsl(180 15% 94%)",
                borderBottom: "1px solid hsl(200 18% 18%)",
              },
              ".dark & .MuiDataGrid-row:nth-of-type(odd)": {
                backgroundColor: "hsl(200 22% 11%)",
              },
              ".dark & .MuiDataGrid-row:nth-of-type(even)": {
                backgroundColor: "hsl(200 20% 13.5%)",
              },
              ".dark & .MuiDataGrid-row:hover": {
                backgroundColor: "hsl(200 20% 17%)",
              },
              ".dark & .MuiDataGrid-columnSeparator": {
                color: "hsl(200 18% 22%)",
              },
              ".dark & .MuiDataGrid-virtualScroller": {
                backgroundColor: "hsl(200 22% 10%)",
              },
            }}
          />
        </TableContainer>
      </div>
    </div>
  );
}

export function ResultsPanel({
  payload,
  filters,
  selectedResource,
  resourceCategory,
  municipality,
  selectedMunicipalityCode,
  requestPageSize,
  shouldFetchOnMount = false,
}: ResultsPanelProps) {
  const [currentPayload, setCurrentPayload] = useState(payload);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);
  const pageCacheRef = useRef(new Map<number, PaginatedEnvelope>());
  const gridContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCurrentPayload(payload);
    setIsLoadingInitial(false);
    setIsLoadingMore(false);
    setIsExporting(false);
    setLoadMoreError(null);
    setExportError(null);
    setInitialLoadError(null);
    pageCacheRef.current = new Map();

    if (payload) {
      pageCacheRef.current.set(payload.page, payload);
    }
  }, [payload]);

  const querySummary = useMemo(
    () =>
      filters.map((filter) => ({
        key: filter.key,
        value: formatFilterValue(filter.key, filter.value),
      })),
    [filters]
  );

  async function fetchEnvelope(page: number) {
    const cached = pageCacheRef.current.get(page);
    if (cached) {
      return cached;
    }

    const requestUrl = buildRelativeApiUrl(
      selectedResource,
      page,
      requestPageSize,
      selectedMunicipalityCode,
      filters
    );

    try {
      const response = await fetch(requestUrl, {
        cache: "no-store",
        headers: ngrokBypassHeaders,
      });
      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as PaginatedEnvelope;
      pageCacheRef.current.set(page, payload);
      return payload;
    } catch {
      return null;
    }
  }

  useEffect(() => {
    if (!shouldFetchOnMount || currentPayload || isLoadingInitial) {
      return;
    }

    let isMounted = true;

    async function loadInitialPayload() {
      setIsLoadingInitial(true);
      setInitialLoadError(null);

      try {
        const firstPayload = await fetchEnvelope(1);

        if (!isMounted) {
          return;
        }

        if (!firstPayload) {
          setInitialLoadError("Nao foi possivel consultar o recurso selecionado agora.");
          return;
        }

        setCurrentPayload(firstPayload);
      } finally {
        if (isMounted) {
          setIsLoadingInitial(false);
        }
      }
    }

    void loadInitialPayload();

    return () => {
      isMounted = false;
    };
  }, [currentPayload, isLoadingInitial, shouldFetchOnMount]);

  if (!currentPayload) {
    if (isLoadingInitial) {
      return (
        <section className="surface-panel flex min-h-40 items-center justify-center rounded-2xl px-6 py-10">
          <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
            <CircularProgress size={18} />
            <span>Consultando dados...</span>
          </div>
        </section>
      );
    }

    if (initialLoadError) {
      return (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {initialLoadError}
        </div>
      );
    }

    return null;
  }

  const hasMorePages = readBooleanMetadata(currentPayload.metadata, "hasMorePages");
  const usesSourcePagination = readBooleanMetadata(
    currentPayload.metadata,
    "sourcePagination"
  );
  const totalItemsExact = readBooleanMetadata(currentPayload.metadata, "totalItemsExact");
  const hasNextPage = hasMorePages || currentPayload.page < currentPayload.totalPages;
  const displayBatchCount = Math.max(1, Math.ceil(currentPayload.items.length / displayBatchSize));
  const visibleTotalLabel = totalItemsExact || !usesSourcePagination
    ? `Total informado: ${currentPayload.totalItems.toLocaleString("pt-BR")}`
    : `Carregados ate agora: ${currentPayload.items.length.toLocaleString("pt-BR")} de ${currentPayload.totalItems.toLocaleString("pt-BR")}`;

  async function loadMoreRecords() {
    if (isLoadingMore || !hasNextPage) {
      return;
    }

    const initialPayload = currentPayload;
    if (!initialPayload) {
      return;
    }

    setIsLoadingMore(true);
    setLoadMoreError(null);

    try {
      let aggregatedPayload = initialPayload;
      let aggregatedItems = [...initialPayload.items];
      const startingCount = aggregatedItems.length;
      const maxPagesPerClick = Math.max(
        1,
        Math.ceil(displayBatchSize / Math.max(requestPageSize, 1)) + 2
      );
      let fetchedPages = 0;

      while (
        aggregatedItems.length - startingCount < displayBatchSize &&
        (readBooleanMetadata(aggregatedPayload.metadata, "hasMorePages") ||
          aggregatedPayload.page < aggregatedPayload.totalPages) &&
        fetchedPages < maxPagesPerClick
      ) {
        const nextPayload = await fetchEnvelope(aggregatedPayload.page + 1);

        if (!nextPayload) {
          setLoadMoreError("Nao foi possivel carregar mais registros agora.");
          return;
        }

        aggregatedItems = mergeItems(aggregatedItems, nextPayload.items);
        aggregatedPayload = {
          ...nextPayload,
          items: aggregatedItems,
        };
        fetchedPages += 1;
      }

      setCurrentPayload(aggregatedPayload);
    } catch {
      setLoadMoreError("Nao foi possivel carregar mais registros agora.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  useEffect(() => {
    if (!usesSourcePagination || isLoadingMore || !hasNextPage) {
      return;
    }

    if (currentPayload.items.length >= displayBatchSize) {
      return;
    }

    void loadMoreRecords();
  }, [
    currentPayload.items.length,
    hasNextPage,
    isLoadingMore,
    usesSourcePagination,
  ]);

  useEffect(() => {
    if (!hasNextPage) {
      return;
    }

    const scrollerElement = gridContainerRef.current?.querySelector<HTMLElement>(
      ".MuiDataGrid-virtualScroller"
    );

    if (!scrollerElement) {
      return;
    }

    const stableScroller = scrollerElement;

    function handleGridScroll() {
      if (isLoadingMore) {
        return;
      }

      const remainingDistance =
        stableScroller.scrollHeight -
        stableScroller.scrollTop -
        stableScroller.clientHeight;

      if (remainingDistance <= 240) {
        void loadMoreRecords();
      }
    }

    stableScroller.addEventListener("scroll", handleGridScroll, { passive: true });

    return () => {
      stableScroller.removeEventListener("scroll", handleGridScroll);
    };
  }, [hasNextPage, isLoadingMore, currentPayload.items.length]);

  async function exportAllRecords() {
    if (isExporting) {
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      const allItems = await fetchAllUniqueItems();
      if (!allItems) {
        setExportError("Nao foi possivel exportar os registros agora.");
        return;
      }

      const csvContent = buildCsvContent(allItems, selectedResource);
      const blob = new Blob(["\uFEFF", csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = buildExportFileName(selectedResource);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
    } catch {
      setExportError("Nao foi possivel exportar os registros agora.");
    } finally {
      setIsExporting(false);
    }
  }

  async function fetchAllUniqueItems() {
    const firstPage = await fetchEnvelope(1);
    if (!firstPage) {
      return null;
    }

    let allItems = [...firstPage.items];
    let page = 1;
    let pagePayload = firstPage;
    const maxPages = 1000;

    while (page < maxPages) {
      const shouldContinue =
        readBooleanMetadata(pagePayload.metadata, "hasMorePages") ||
        pagePayload.page < pagePayload.totalPages;

      if (!shouldContinue) {
        break;
      }

      page += 1;
      const nextPayload = await fetchEnvelope(page);

      if (!nextPayload) {
        return null;
      }

      allItems = mergeItems(allItems, nextPayload.items);
      pagePayload = nextPayload;
    }

    return allItems;
  }

  if (currentPayload.items.length === 0) {
    return (
      <section aria-labelledby="results-heading" className="rounded-lg border bg-card p-8 text-center">
        <h2 id="results-heading" className="sr-only">Resultados da consulta</h2>
        <Inbox className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
        <h3 className="mt-4 text-lg font-medium text-foreground">Nenhum registro encontrado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          A consulta foi executada com sucesso, mas nao retornou dados para os filtros aplicados.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="results-heading" className="min-w-0 space-y-4">
      <ResultsTable
        items={currentPayload.items}
        resourceLabel={formatResourceLabel(selectedResource)}
        resourceCategory={resourceCategory}
        municipality={municipality}
        isExporting={isExporting}
        onExport={exportAllRecords}
        resourceKey={selectedResource}
        gridContainerRef={gridContainerRef}
      />

      <div className="surface-panel flex min-h-14 flex-col items-center justify-center gap-3 rounded-2xl px-4 py-4 sm:flex-row">
        {hasNextPage ? (
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            {isLoadingMore && <CircularProgress size={16} sx={{ color: "currentColor" }} />}
            <span>
              {isLoadingMore
                ? "Carregando mais registros..."
                : "Role ate o fim da grade para carregar mais registros automaticamente."}
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">
            Todos os registros carregados.
          </span>
        )}
      </div>

      <nav aria-label="Resumo dos resultados" className="surface-panel flex flex-col gap-3 rounded-2xl px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {visibleTotalLabel}
          </span>
          <span className="rounded-full border border-border/80 bg-background px-3 py-1 text-xs font-semibold text-secondary-foreground">
            {hasNextPage ? `Blocos carregados: ${displayBatchCount}` : "Consulta completa"}
          </span>
          {querySummary.map((filter) => (
            <span
              key={`${filter.key}-${filter.value}`}
              className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
            >
              {formatFieldLabel(filter.key, selectedResource)}: {filter.value}
            </span>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Exibindo {currentPayload.items.length.toLocaleString("pt-BR")} registros carregados.
        </p>
      </nav>

      {loadMoreError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadMoreError}
        </div>
      )}

      {exportError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {exportError}
        </div>
      )}
    </section>
  );
}
