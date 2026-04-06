"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import TableContainer from "@mui/material/TableContainer";
import {
  DataGrid,
  type GridColDef,
  type GridRowParams,
} from "@mui/x-data-grid";
import { ArrowRight, ArrowUpRight, Check, Clock3, Copy, FileSpreadsheet, Inbox, MapPin, Search, Tag, X } from "lucide-react";
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

type ResultsTableRow = Record<string, unknown> & {
  id: string;
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

function getDesktopPriorityColumns(resourceKey: string) {
  const priorityByResource: Record<string, string[]> = {
    agentes_publicos: [
      "nome_servidor",
      "cargo",
      "cpf",
      "ingresso",
      "codigo_vinculo",
      "numero_expediente_nomeacao",
      "codigo_expediente",
      "data_expediente",
    ],
    contrato: [
      "numero_contrato",
      "modalidade_contrato",
      "tipo_contrato",
      "data_inicio_vigencia_contrato",
      "data_termino_vigencia_contrato",
      "valor_total_contrato",
      "nome_negociante",
      "descricao_objeto_contrato",
    ],
  };

  return priorityByResource[resourceKey] ?? [];
}

function getPrimaryTableColumns(resourceKey: string) {
  const primaryByResource: Record<string, string[]> = {
    agentes_publicos: [
      "nome_servidor",
      "cargo",
      "cpf",
      "ingresso",
      "codigo_vinculo",
      "numero_expediente_nomeacao",
      "codigo_expediente",
      "data_expediente",
      "orgao",
    ],
    contrato: [
      "numero_contrato",
      "modalidade_contrato",
      "tipo_contrato",
      "nome_negociante",
      "valor_total_contrato",
      "data_inicio_vigencia_contrato",
      "data_termino_vigencia_contrato",
      "descricao_objeto_contrato",
    ],
  };

  return primaryByResource[resourceKey] ?? [];
}

function orderDesktopColumns(resourceKey: string, columns: string[]) {
  const priority = getDesktopPriorityColumns(resourceKey);

  if (priority.length === 0) {
    return columns;
  }

  const ranked = new Map(priority.map((column, index) => [column, index]));

  return [...columns].sort((left, right) => {
    const leftRank = ranked.get(left);
    const rightRank = ranked.get(right);

    if (leftRank != null && rightRank != null) {
      return leftRank - rightRank;
    }

    if (leftRank != null) {
      return -1;
    }

    if (rightRank != null) {
      return 1;
    }

    return 0;
  });
}

function formatDateTimeValue(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatCellValue(value: unknown) {
  if (value == null) return "-";
  if (typeof value === "boolean") return value ? "Sim" : "Nao";
  if (typeof value === "object") return JSON.stringify(value);
  return formatDateValue(String(value));
}

function toSortableDateTimestamp(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return Number.POSITIVE_INFINITY;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}

function sortContractItemsByDateAsc(items: Array<Record<string, unknown>>) {
  return [...items].sort((left, right) => {
    const leftTimestamp = toSortableDateTimestamp(left.data_inicio_vigencia_contrato);
    const rightTimestamp = toSortableDateTimestamp(right.data_inicio_vigencia_contrato);

    return leftTimestamp - rightTimestamp;
  });
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

function buildRecordDetailGroups(
  resourceKey: string,
  columns: string[]
) {
  const orderedColumns = orderDesktopColumns(resourceKey, columns);
  const primaryColumns = orderedColumns.slice(0, 6);
  const secondaryColumns = orderedColumns.slice(6);

  return {
    primary: primaryColumns,
    secondary: secondaryColumns,
  };
}

function selectMainTableColumns(resourceKey: string, columns: string[]) {
  const priority = getPrimaryTableColumns(resourceKey);

  if (priority.length === 0) {
    return columns.slice(0, Math.min(6, columns.length));
  }

  const selected = priority.filter((column) => columns.includes(column));
  return selected.length > 0 ? selected : columns.slice(0, Math.min(6, columns.length));
}

function NoSearchResultsOverlay() {
  return (
    <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-3 text-center">
      <Inbox className="h-9 w-9 text-[hsl(210_10%_62%)]" aria-hidden="true" />
      <div className="space-y-1">
        <div className="text-sm font-semibold text-[hsl(210_24%_22%)]">
          Sem registros encontrados
        </div>
        <div className="text-xs text-[hsl(210_10%_52%)]">
          Ajuste a pesquisa para localizar outros registros.
        </div>
      </div>
    </div>
  );
}

function getGridColumnConfig(resourceKey: string, column: string) {
  const columnConfigByResource: Record<
    string,
    Record<string, { minWidth?: number; flex?: number }>
  > = {
    agentes_publicos: {
      nome_servidor: { minWidth: 210, flex: 1.35 },
      cargo: { minWidth: 190, flex: 1.15 },
      cpf: { minWidth: 128, flex: 0.8 },
      ingresso: { minWidth: 112, flex: 0.7 },
      codigo_vinculo: { minWidth: 128, flex: 0.8 },
      numero_expediente_nomeacao: { minWidth: 170, flex: 1 },
      codigo_expediente: { minWidth: 132, flex: 0.82 },
      data_expediente: { minWidth: 136, flex: 0.84 },
      orgao: { minWidth: 98, flex: 0.58 },
    },
    contrato: {
      numero_contrato: { minWidth: 138, flex: 0.9 },
      modalidade_contrato: { minWidth: 124, flex: 0.72 },
      tipo_contrato: { minWidth: 138, flex: 0.85 },
      nome_negociante: { minWidth: 210, flex: 1.2 },
      valor_total_contrato: { minWidth: 142, flex: 0.84 },
      data_inicio_vigencia_contrato: { minWidth: 148, flex: 0.84 },
      data_termino_vigencia_contrato: { minWidth: 148, flex: 0.84 },
      descricao_objeto_contrato: { minWidth: 240, flex: 1.45 },
    },
  };

  return columnConfigByResource[resourceKey]?.[column] ?? { minWidth: 148, flex: 0.9 };
}

function ResultsTable({
  items,
  resourceLabel,
  resourceCategory,
  municipality,
  isExportingCsv,
  onExportCsv,
  resourceKey,
  cachedAtUtc,
  expiresAtUtc,
  gridContainerRef,
}: {
  items: Array<Record<string, unknown>>;
  resourceLabel: string;
  resourceCategory: string | null;
  municipality: MunicipalityInfo | null;
  isExportingCsv: boolean;
  onExportCsv: () => Promise<void>;
  resourceKey: string;
  cachedAtUtc: string;
  expiresAtUtc: string;
  gridContainerRef: RefObject<HTMLDivElement | null>;
}) {
  const modalCloseTimeoutRef = useRef<number | null>(null);
  const allColumns = Array.from(new Set(items.flatMap((item) => Object.keys(item))));
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
  const desktopColumns = orderDesktopColumns(resourceKey, columns);
  const compactDesktopColumns = selectMainTableColumns(resourceKey, desktopColumns);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [detailModalState, setDetailModalState] = useState<"closed" | "open" | "closing">("closed");
  const [tableSearch, setTableSearch] = useState("");
  const [copyFeedback, setCopyFeedback] = useState<"idle" | "copied">("idle");
  const normalizedSearch = tableSearch.trim().toLocaleLowerCase("pt-BR");
  const visibleItems = resourceKey === "contrato"
    ? sortContractItemsByDateAsc(items)
    : items;
  const filteredItems = normalizedSearch
    ? visibleItems.filter((item) =>
        allColumns.some((column) =>
          formatCellValue(item[column]).toLocaleLowerCase("pt-BR").includes(normalizedSearch)
        )
      )
    : visibleItems;
  const gridColumns: GridColDef[] = compactDesktopColumns.map((column) => {
    const config = getGridColumnConfig(resourceKey, column);

    return {
      field: column,
      headerName: formatFieldLabel(column, resourceKey),
      minWidth: config.minWidth ?? 148,
      flex: config.flex ?? 0.9,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => formatCellValue(params.value),
    };
  });
  const filteredRows: ResultsTableRow[] = filteredItems.map((item, index) => ({
    id: `${resourceKey}-filtered-${index}`,
    ...item,
  }));
  const selectedRow =
    filteredRows.find((row) => row.id === selectedRowId) ??
    filteredRows[0] ??
    null;
  const selectedRowIndex = selectedRow
    ? filteredRows.findIndex((row) => row.id === selectedRow.id)
    : -1;
  const hasNextRow = selectedRowIndex >= 0 && selectedRowIndex < filteredRows.length - 1;
  const detailGroups = selectedRow
    ? buildRecordDetailGroups(resourceKey, columns)
    : { primary: [], secondary: [] };
  const updatedAtLabel = formatDateTimeValue(cachedAtUtc);

  useEffect(() => {
    setSelectedRowId(filteredRows[0]?.id ?? null);
    setDetailModalState("closed");
  }, [resourceKey, items, tableSearch]);

  useEffect(() => {
    setCopyFeedback("idle");
  }, [selectedRowId, detailModalState]);

  useEffect(() => () => {
    if (modalCloseTimeoutRef.current != null) {
      window.clearTimeout(modalCloseTimeoutRef.current);
    }
  }, []);

  function handleRowSelection(params: GridRowParams) {
    if (modalCloseTimeoutRef.current != null) {
      window.clearTimeout(modalCloseTimeoutRef.current);
      modalCloseTimeoutRef.current = null;
    }

    setSelectedRowId(String(params.id));
    setDetailModalState("open");
  }

  function closeDetailModal() {
    setDetailModalState("closing");

    if (modalCloseTimeoutRef.current != null) {
      window.clearTimeout(modalCloseTimeoutRef.current);
    }

    modalCloseTimeoutRef.current = window.setTimeout(() => {
      setDetailModalState("closed");
      modalCloseTimeoutRef.current = null;
    }, 180);
  }

  function goToNextRow() {
    if (!hasNextRow) {
      return;
    }

    const nextRow = filteredRows[selectedRowIndex + 1];
    if (!nextRow) {
      return;
    }

    setSelectedRowId(String(nextRow.id));
  }

  async function copySelectedRecord() {
    if (!selectedRow) {
      return;
    }

    const { id: _gridId, ...recordToCopy } = selectedRow;
    const content = JSON.stringify(recordToCopy, null, 2);

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = content;
        textArea.setAttribute("readonly", "true");
        textArea.style.position = "absolute";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }

      setCopyFeedback("copied");
      window.setTimeout(() => {
        setCopyFeedback("idle");
      }, 1600);
    } catch {
      setCopyFeedback("idle");
    }
  }

  return (
    <div className="soft-reveal w-full max-w-full overflow-hidden rounded-[22px] border border-[hsl(205_24%_84%)] bg-[linear-gradient(180deg,hsl(0_0%_100%),hsl(210_30%_97.5%))] shadow-[0_12px_28px_hsl(205_22%_18%_/_0.06)] dark:border-[hsl(210_12%_22%)] dark:bg-[linear-gradient(180deg,hsl(210_16%_14%),hsl(210_18%_11%))] dark:shadow-[0_18px_44px_hsl(210_30%_2%_/_0.24)]">
      <div className="border-b border-border/80 bg-[linear-gradient(180deg,hsl(0_0%_100%),hsl(210_24%_97.5%))] px-4 py-3.5 dark:border-[hsl(210_12%_22%)] dark:bg-[linear-gradient(180deg,hsl(210_16%_15%),hsl(210_18%_12%))]">
        <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 inline-flex items-center gap-2 rounded-full border border-[hsl(205_24%_82%)] bg-[hsl(210_35%_97%)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[hsl(201_34%_35%)] dark:border-[hsl(210_12%_26%)] dark:bg-[hsl(210_15%_18%)] dark:text-[hsl(185_32%_77%)]">
              Painel executivo
            </div>
            <h3 className="text-[1.02rem] font-bold tracking-[-0.02em] text-[hsl(210_24%_22%)] dark:text-[hsl(0_0%_96%)]">
              Registros em tabela
            </h3>
            <p className="mt-0.5 text-sm leading-5 text-[hsl(210_10%_47%)] dark:text-[hsl(210_10%_66%)]">
              Leitura consolidada do controle `{resourceLabel}`.
            </p>
          </div>

          <label className="flex min-w-[240px] max-w-[280px] items-center gap-2 rounded-[12px] border border-[hsl(205_24%_84%)] bg-white px-3 py-2 shadow-[inset_0_1px_0_hsl(0_0%_100%_/_0.92)] dark:border-[hsl(210_12%_24%)] dark:bg-[hsl(210_16%_15%)] dark:shadow-[inset_0_1px_0_hsl(0_0%_100%_/_0.03)]">
            <Search className="h-3.5 w-3.5 text-[hsl(210_10%_52%)] dark:text-[hsl(210_10%_66%)]" aria-hidden="true" />
            <input
              type="search"
              value={tableSearch}
              onChange={(event) => setTableSearch(event.target.value)}
              placeholder="Pesquisar na tabela"
              className="w-full border-0 bg-transparent text-[12px] text-[hsl(210_24%_22%)] outline-none placeholder:text-[hsl(210_10%_60%)] dark:text-[hsl(0_0%_96%)] dark:placeholder:text-[hsl(210_10%_54%)]"
              aria-label="Pesquisar na tabela"
            />
          </label>

          <div className="flex w-full flex-col gap-1.5 xl:w-auto xl:flex-row xl:flex-wrap xl:items-stretch xl:justify-end">
            <button
              type="button"
              onClick={() => {
                void onExportCsv();
              }}
              disabled={isExportingCsv}
              className="flux-button-primary min-h-[34px] min-w-[146px] rounded-[12px] px-3 py-1.5 text-[9px] uppercase tracking-[0.16em] shadow-[0_6px_14px_hsl(var(--primary)_/_0.12)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isExportingCsv ? (
                <CircularProgress size={14} sx={{ color: "currentColor" }} />
              ) : (
                <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {isExportingCsv ? "Gerando CSV..." : "Exportar CSV"}
              {!isExportingCsv && <ArrowUpRight className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />}
            </button>
            <div className="min-w-[140px] max-w-[140px] rounded-[12px] border border-[hsl(205_24%_84%)] bg-white px-3 py-1.5 shadow-[inset_0_1px_0_hsl(0_0%_100%_/_0.92)] dark:border-[hsl(210_12%_24%)] dark:bg-[hsl(210_16%_15%)] dark:shadow-[inset_0_1px_0_hsl(0_0%_100%_/_0.03)]">
              <div className="mb-0.5 flex items-center gap-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-[hsl(210_10%_52%)] dark:text-[hsl(210_10%_66%)]">
                <Clock3 className="h-3 w-3 text-primary/80" aria-hidden="true" />
                Atualizacao
              </div>
              <div className="text-[12px] font-semibold leading-4 text-[hsl(210_24%_22%)] dark:text-[hsl(0_0%_96%)]">{updatedAtLabel}</div>
            </div>
            {municipality && (
              <div className="min-w-[128px] max-w-[128px] rounded-[12px] border border-[hsl(188_34%_80%)] bg-[linear-gradient(180deg,hsl(190_42%_97.5%),hsl(0_0%_100%))] px-3 py-1.5 text-xs shadow-[0_5px_12px_hsl(192_35%_45%_/_0.05)] dark:border-[hsl(185_20%_26%)] dark:bg-[linear-gradient(180deg,hsl(185_18%_16%),hsl(210_18%_13%))]">
                <div className="mb-0.5 flex items-center gap-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-[hsl(210_10%_52%)] dark:text-[hsl(210_10%_66%)]">
                  <MapPin className="h-3 w-3 text-primary/80" aria-hidden="true" />
                  Contexto
                </div>
                <div className="space-y-0.5">
                  <div className="truncate text-[12px] font-semibold leading-4 text-[hsl(210_24%_22%)] dark:text-[hsl(0_0%_96%)]">{municipality.nome_municipio}</div>
                  <div className="text-[10px] leading-4 text-[hsl(210_10%_52%)] dark:text-[hsl(210_10%_66%)]">TCE: {municipality.codigo_municipio}</div>
                </div>
              </div>
            )}
            {resourceCategory && (
              <div className="min-w-[148px] max-w-[148px] rounded-[12px] border border-[hsl(205_24%_84%)] bg-[linear-gradient(180deg,hsl(0_0%_100%),hsl(210_28%_98.5%))] px-3 py-1.5 text-xs shadow-[0_5px_12px_hsl(210_20%_24%_/_0.04)] dark:border-[hsl(210_12%_24%)] dark:bg-[linear-gradient(180deg,hsl(210_16%_15%),hsl(210_18%_13%))]">
                <div className="mb-0.5 flex items-center gap-1 text-[8px] font-semibold uppercase tracking-[0.16em] text-[hsl(210_10%_52%)] dark:text-[hsl(210_10%_66%)]">
                  <Tag className="h-3 w-3 text-primary/80" aria-hidden="true" />
                  Categoria
                </div>
                <div className="line-clamp-2 text-[12px] font-semibold leading-4 text-[hsl(210_24%_22%)] dark:text-[hsl(0_0%_96%)]">{resourceCategory}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border/70 bg-[linear-gradient(180deg,hsl(200_45%_99%),hsl(0_0%_100%))] p-4 dark:border-[hsl(210_12%_22%)] dark:bg-[linear-gradient(180deg,hsl(210_16%_14%),hsl(210_18%_11.5%))] md:hidden">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Registros carregados
        </div>
        <div className="space-y-3">
          {filteredItems.map((item, index) => (
            <article
              key={`${resourceKey}-mobile-${index}`}
              className="rounded-2xl border border-border bg-background p-4 shadow-[0_6px_16px_hsl(210_18%_18%_/_0.05)]"
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

      <div ref={gridContainerRef} className="hidden md:block bg-[linear-gradient(180deg,hsl(0_0%_100%),hsl(210_30%_98%))] p-2.5 dark:bg-[linear-gradient(180deg,hsl(210_16%_14%),hsl(210_18%_11.5%))]">
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: "100%",
            backgroundColor: "transparent",
            borderRadius: "0.9rem",
            border: "1px solid hsl(var(--border) / 0.75)",
            boxShadow:
              "0 1px 0 hsl(0 0% 100% / 0.88) inset, 0 10px 22px hsl(208 26% 20% / 0.06)",
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
            rows={filteredRows}
            columns={gridColumns}
            slots={{
              noRowsOverlay: NoSearchResultsOverlay,
            }}
            disableRowSelectionOnClick
            hideFooter
            rowHeight={46}
            columnHeaderHeight={48}
            disableColumnResize={false}
            onRowClick={handleRowSelection}
            sx={{
              "--DataGrid-overlayHeight": "160px",
              border: 0,
              minWidth: "100%",
              background:
                "linear-gradient(180deg, hsl(0 0% 100%), hsl(210 33% 98%))",
              ".dark &": {
                backgroundColor: "hsl(200 22% 10%)",
              },
              "& .MuiDataGrid-main": {
                overflow: "auto",
                maxHeight: "65vh",
              },
              "& .MuiDataGrid-columnHeaders": {
                background:
                  "linear-gradient(180deg, hsl(205 34% 95%), hsl(0 0% 100%))",
                color: "hsl(206 36% 30%)",
                borderBottom: "1px solid hsl(var(--border) / 0.95)",
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 700,
                fontSize: "0.7rem",
                letterSpacing: "0.11em",
                textTransform: "uppercase",
                whiteSpace: "normal",
                lineHeight: 1.15,
              },
              "& .MuiDataGrid-columnHeader": {
                paddingTop: "0.1rem",
                paddingBottom: "0.1rem",
                justifyContent: "center",
              },
              "& .MuiDataGrid-cell": {
                alignItems: "center",
                justifyContent: "center",
                py: 0,
                color: "hsl(var(--foreground))",
                borderBottom: "1px solid hsl(var(--border) / 0.62)",
                whiteSpace: "nowrap",
                lineHeight: 1.2,
                fontSize: "0.86rem",
              },
              "& .MuiDataGrid-columnHeaderTitleContainer": {
                justifyContent: "center",
              },
              "& .MuiDataGrid-columnHeaderTitleContainerContent": {
                width: "100%",
              },
              "& .MuiDataGrid-cellContent": {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                minHeight: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                textAlign: "center",
              },
              "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus-within": {
                outline: "none",
              },
              "& .MuiDataGrid-row:nth-of-type(odd)": {
                backgroundColor: "hsl(0 0% 100%)",
              },
              "& .MuiDataGrid-row:nth-of-type(even)": {
                backgroundColor: "hsl(200 38% 98%)",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "hsl(198 48% 96.5%)",
              },
              "& .MuiDataGrid-row.Mui-selected": {
                backgroundColor: "hsl(188 60% 95%)",
              },
              "& .MuiDataGrid-row.Mui-selected:hover": {
                backgroundColor: "hsl(188 60% 93%)",
              },
              "& .MuiDataGrid-columnSeparator": {
                color: "hsl(var(--border) / 0.95)",
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

      {detailModalState !== "closed" && selectedRow && typeof document !== "undefined"
        ? createPortal(
        <div className={`${detailModalState === "closing" ? "modal-fade-out" : "modal-fade-in"} fixed inset-0 z-50 flex items-start justify-center bg-[hsl(210_20%_10%_/_0.28)] px-4 pb-4 pt-10 backdrop-blur-[1px]`}>
          <div className={`${detailModalState === "closing" ? "modal-panel-out" : "modal-panel-in"} max-h-[calc(100vh-5rem)] w-full max-w-[1080px] overflow-hidden rounded-[20px] border border-border bg-[linear-gradient(180deg,hsl(0_0%_100%),hsl(210_28%_98.5%))] shadow-[0_20px_48px_hsl(210_25%_12%_/_0.18)]`}>
            <div className="flex items-start justify-between border-b border-border/80 px-5 py-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(210_10%_52%)]">
                  Detalhamento do registro
                </div>
                <div className="mt-1 text-base font-semibold text-[hsl(210_24%_22%)]">
                  {resourceLabel}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void copySelectedRecord();
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-white px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(210_18%_34%)] transition-colors hover:bg-secondary"
                >
                  {copyFeedback === "copied" ? (
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {copyFeedback === "copied" ? "Copiado" : "Copiar registro"}
                </button>
                <button
                  type="button"
                  onClick={goToNextRow}
                  disabled={!hasNextRow}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-white px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[hsl(210_18%_34%)] transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Proximo registro
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={closeDetailModal}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-[hsl(210_18%_34%)] transition-colors hover:bg-secondary"
                  aria-label="Fechar detalhamento"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="max-h-[calc(100vh-10rem)] overflow-y-auto px-5 py-4">
              <div className="space-y-5">
                <section className="space-y-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(210_10%_52%)]">
                    Informacoes principais
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {detailGroups.primary.map((column) => (
                      <div
                        key={`modal-primary-${column}`}
                        className="rounded-[14px] border border-[hsl(190_30%_82%)] bg-[linear-gradient(180deg,hsl(190_32%_97.5%),hsl(0_0%_100%))] px-3.5 py-3"
                      >
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[hsl(210_10%_52%)]">
                          {formatFieldLabel(column, resourceKey)}
                        </div>
                        <div className="mt-1.5 break-words text-sm font-medium leading-6 text-[hsl(210_24%_22%)]">
                          {formatCellValue(selectedRow[column])}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {detailGroups.secondary.length > 0 && (
                  <section className="space-y-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[hsl(210_10%_52%)]">
                      Campos complementares
                    </div>
                    <div className="rounded-[16px] border border-border/80 bg-white p-2.5">
                      <dl className="grid gap-2 sm:grid-cols-2">
                        {detailGroups.secondary.map((column) => (
                          <div
                            key={`modal-secondary-${column}`}
                            className="rounded-[12px] border border-border/70 bg-[hsl(210_30%_99%)] px-3 py-2.5"
                          >
                            <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(210_10%_52%)]">
                              {formatFieldLabel(column, resourceKey)}
                            </dt>
                            <dd className="mt-1 break-words text-sm leading-5 text-[hsl(210_24%_22%)]">
                              {formatCellValue(selectedRow[column])}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
        ,
        document.body
      )
        : null}
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
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [initialLoadError, setInitialLoadError] = useState<string | null>(null);
  const pageCacheRef = useRef(new Map<number, PaginatedEnvelope>());
  const gridContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCurrentPayload(payload);
    setIsLoadingInitial(false);
    setIsLoadingMore(false);
    setIsExportingCsv(false);
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
    if (isExportingCsv) {
      return;
    }

    setIsExportingCsv(true);
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
      setIsExportingCsv(false);
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
        isExportingCsv={isExportingCsv}
        onExportCsv={exportAllRecords}
        resourceKey={selectedResource}
        cachedAtUtc={currentPayload.cachedAtUtc}
        expiresAtUtc={currentPayload.expiresAtUtc}
        gridContainerRef={gridContainerRef}
      />

      <div className="surface-panel flex min-h-14 flex-col items-center justify-center gap-3 rounded-[24px] px-4 py-4 sm:flex-row">
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

      <nav aria-label="Resumo dos resultados" className="surface-panel flex flex-col gap-3 rounded-[24px] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
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
