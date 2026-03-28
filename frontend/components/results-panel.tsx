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

type ResultsPanelProps = {
  payload: PaginatedEnvelope | null;
  filters: FilterPair[];
  selectedResource: string;
  selectedMunicipalityCode: string;
  page: number;
  pageSize: number;
};

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

function JsonBlock({ data, index }: { data: Record<string, unknown>; index: number }) {
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);

  function handleCopy() {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border bg-card">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-secondary/50"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <FileJson className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Registro {index + 1}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            expanded && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        <div className="relative border-t">
          <button
            onClick={handleCopy}
            className="absolute right-2 top-2 flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
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
          <pre className="overflow-x-auto whitespace-pre-wrap break-words p-4 pr-20 font-mono text-xs leading-relaxed text-foreground">
            {jsonString}
          </pre>
        </div>
      )}
    </div>
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
  const hasNextPage = payload.page < payload.totalPages;

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="results-heading" className="text-lg font-semibold text-foreground">
            Resultados
          </h2>
          <p className="text-sm text-muted-foreground">
            {payload.totalItems.toLocaleString("pt-BR")} registros encontrados
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            Pagina {payload.page} de {payload.totalPages || 1}
          </span>
          {filters.map((f) => (
            <span
              key={`${f.key}-${f.value}`}
              className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              {f.key}={f.value}
            </span>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-3">
        {payload.items.map((item, index) => (
          <JsonBlock key={`${payload.resource}-${index}`} data={item} index={index} />
        ))}
      </div>

      {/* Pagination */}
      <nav aria-label="Paginacao dos resultados" className="flex items-center justify-between border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Exibindo {((payload.page - 1) * payload.pageSize) + 1} a {Math.min(payload.page * payload.pageSize, payload.totalItems)} de {payload.totalItems}
        </p>

        <div className="flex items-center gap-2">
          <a
            href={hasPreviousPage ? buildQueryString(selectedResource, Math.max(1, page - 1), pageSize, selectedMunicipalityCode, filters) : "#"}
            aria-disabled={!hasPreviousPage}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
              hasPreviousPage
                ? "bg-card text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                ? "bg-card text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
