"use client";

import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Copy, Check, FileJson, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

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

function readBooleanMetadata(
  metadata: Record<string, unknown>,
  key: string
) {
  return metadata[key] === true;
}

type ResultsPanelProps = {
  payload: PaginatedEnvelope | null;
  filters: FilterPair[];
  selectedResource: string;
  selectedMunicipalityCode: string;
  page: number;
  pageSize: number;
};

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
    if (start && end) return `${start} ate ${end}`;
    return start || value;
  }

  return value;
}

function buildQueryString(
  resource: string,
  page: number,
  pageSize: number,
  selectedMunicipalityCode: string,
  filters: FilterPair[]
) {
  const query = new URLSearchParams();
  query.set("resource", resource);
  query.set("page", String(page));
  query.set("pageSize", String(pageSize));
  if (selectedMunicipalityCode) {
    query.set("codigo_municipio", selectedMunicipalityCode);
  }
  filters.forEach((f) => {
    if (f.key.trim() !== "") query.set(f.key, f.value);
  });
  return `/?${query.toString()}`;
}

function JsonBlock({
  data,
  recordNumber,
}: {
  data: Record<string, unknown>;
  recordNumber: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);

  function handleCopy() {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <article className="surface-panel soft-reveal overflow-hidden rounded-2xl">
      <div className="border-b border-border/70 bg-secondary/20 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-sm font-medium text-foreground">
            <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-primary px-2 text-sm font-semibold text-primary-foreground shadow-sm">
              {recordNumber}
            </span>
            <span className="flex items-center gap-2 text-base font-semibold">
              <FileJson className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Registro {recordNumber}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background/70 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            aria-expanded={expanded}
          >
            {expanded ? "Ocultar" : "Mostrar"}
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                expanded && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="relative">
          <button
            onClick={handleCopy}
            className="absolute right-3 top-3 flex items-center gap-1.5 rounded-xl border border-border/70 bg-background/80 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
            aria-label="Copiar JSON"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" aria-hidden="true" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" aria-hidden="true" />
                Copiar
              </>
            )}
          </button>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words bg-background/55 p-4 pr-24 font-mono text-xs leading-7 text-foreground">
            {jsonString}
          </pre>
        </div>
      )}
    </article>
  );
}

export function ResultsPanel({
  payload,
  filters,
  selectedResource,
  selectedMunicipalityCode,
  page,
  pageSize
}: ResultsPanelProps) {
  if (!payload) {
    return null;
  }

  const hasPreviousPage = payload.page > 1;
  const hasMorePages = readBooleanMetadata(payload.metadata, "hasMorePages");
  const totalItemsExact = !readBooleanMetadata(payload.metadata, "sourcePagination")
    || readBooleanMetadata(payload.metadata, "totalItemsExact");
  const hasNextPage = hasMorePages || payload.page < payload.totalPages;
  const firstRecordNumber = (payload.page - 1) * payload.pageSize + 1;

  if (payload.items.length === 0) {
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
    <section aria-labelledby="results-heading" className="space-y-4">
      {/* Header */}
      <div className="surface-panel soft-reveal flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4">
        <div>
          <h2 id="results-heading" className="text-xl font-bold tracking-[-0.02em] text-foreground">
            Resultados
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalItemsExact
              ? `Total da pesquisa: ${payload.totalItems.toLocaleString("pt-BR")} registros`
              : `${payload.items.length.toLocaleString("pt-BR")} registros nesta pagina`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {totalItemsExact
              ? `Total exato: ${payload.totalItems.toLocaleString("pt-BR")}`
              : `Total minimo conhecido: ${payload.totalItems.toLocaleString("pt-BR")}+`}
          </span>
          <span className="rounded-full border border-border/80 bg-background/70 px-3 py-1 text-xs font-semibold text-secondary-foreground">
            {totalItemsExact
              ? `Pagina ${payload.page} de ${payload.totalPages || 1}`
              : `Pagina ${payload.page}`}
          </span>
          {filters.map((f) => (
            <span
              key={`${f.key}-${f.value}`}
              className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
            >
              {f.key}={formatFilterValue(f.key, f.value)}
            </span>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {payload.items.map((item, index) => (
          <JsonBlock
            key={`${payload.resource}-${index}`}
            data={item}
            recordNumber={firstRecordNumber + index}
          />
        ))}
      </div>

      {/* Pagination */}
      <nav aria-label="Paginacao dos resultados" className="surface-panel flex items-center justify-between rounded-2xl px-5 py-4">
        <p className="text-sm text-muted-foreground">
          {totalItemsExact
            ? `Exibindo ${((payload.page - 1) * payload.pageSize) + 1} a ${Math.min(payload.page * payload.pageSize, payload.totalItems)} de ${payload.totalItems}`
            : `Exibindo ${firstRecordNumber} a ${firstRecordNumber + payload.items.length - 1}`}
        </p>

        <div className="flex items-center gap-2">
          <a
            href={hasPreviousPage ? buildQueryString(selectedResource, Math.max(1, page - 1), pageSize, selectedMunicipalityCode, filters) : "#"}
            aria-disabled={!hasPreviousPage}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
              hasPreviousPage
                ? "bg-background/70 text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                : "pointer-events-none opacity-50"
            )}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Anterior
          </a>
          <a
            href={hasNextPage ? buildQueryString(selectedResource, page + 1, pageSize, selectedMunicipalityCode, filters) : "#"}
            aria-disabled={!hasNextPage}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
              hasNextPage
                ? "bg-background/70 text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                : "pointer-events-none opacity-50"
            )}
          >
            Proxima
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </nav>
    </section>
  );
}
