import { Header } from "@/components/header";
import { QueryForm } from "@/components/query-form";
import { ResultsPanel } from "@/components/results-panel";
import { ErrorCard } from "@/components/error-card";
import { EndpointInfo } from "@/components/endpoint-info";
import { Toast } from "@/components/toast";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type QueryParameterDescriptor = {
  name: string;
  required: boolean;
  description?: string;
  type?: string;
};

type ResourceDescriptor = {
  key: string;
  path: string;
  category?: string;
  description?: string;
  requiredQueryParameters: string[];
  optionalQueryParameters: string[];
  queryParameters: QueryParameterDescriptor[];
  requiresAuthentication?: boolean;
};

type ResourceCatalog = {
  baseUrl: string;
  resources: ResourceDescriptor[];
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

type MunicipalityRecord = {
  codigo_municipio: string;
  nome_municipio: string;
  geoibgeId?: string | null;
  geonamesId?: string | null;
};

type ResourcePageResult = {
  payload: PaginatedEnvelope | null;
  error: {
    status: number;
    title: string;
    detail: string;
  } | null;
};

const defaultCatalog: ResourceCatalog = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  resources: [],
};

const reservedParams = new Set([
  "resource",
  "page",
  "pageSize",
  "codigo_municipio",
]);

function getApiBaseUrl() {
  return (
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8080"
  ).replace(/\/$/, "");
}

async function getCatalog(): Promise<ResourceCatalog> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/resources`, {
      cache: "no-store",
    });
    if (!response.ok) return defaultCatalog;
    return (await response.json()) as ResourceCatalog;
  } catch {
    return defaultCatalog;
  }
}

async function getMunicipalities(): Promise<MunicipalityRecord[]> {
  try {
    const response = await fetch(
      `${getApiBaseUrl()}/api/resources/municipios?page=1&pageSize=250`,
      { cache: "no-store" }
    );
    if (!response.ok) return [];
    const payload = (await response.json()) as PaginatedEnvelope;
    return payload.items as MunicipalityRecord[];
  } catch {
    return [];
  }
}

async function getResourcePage(
  resource: string,
  page: number,
  pageSize: number,
  filters: Array<{ key: string; value: string }>
): Promise<ResourcePageResult> {
  if (!resource) return { payload: null, error: null };

  const url = new URL(`${getApiBaseUrl()}/api/resources/${resource}`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("pageSize", String(pageSize));
  filters.forEach((f) => {
    if (f.key.trim() !== "") url.searchParams.set(f.key, f.value);
  });

  try {
    const response = await fetch(url.toString(), { cache: "no-store" });

    if (!response.ok) {
      let title = "Falha na consulta";
      let detail = "Nao foi possivel consultar o recurso selecionado.";

      try {
        const problem = (await response.json()) as {
          title?: string;
          detail?: string;
        };
        title = problem.title ?? title;
        detail = problem.detail ?? detail;
      } catch {
        detail = await response.text();
      }

      return {
        payload: null,
        error: { status: response.status, title, detail },
      };
    }

    return {
      payload: (await response.json()) as PaginatedEnvelope,
      error: null,
    };
  } catch {
    return {
      payload: null,
      error: {
        status: 0,
        title: "Falha de conexao",
        detail: `Nao foi possivel conectar ao servidor em ${getApiBaseUrl()}.`,
      },
    };
  }
}

function normalizeParam(
  value: string | string[] | undefined,
  fallback: string
) {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

function extractDynamicFilters(
  searchParams: Record<string, string | string[] | undefined>
) {
  return Object.entries(searchParams)
    .filter(([key]) => !reservedParams.has(key))
    .map(([key, value]) => ({
      key,
      value: Array.isArray(value) ? value[0] ?? "" : value ?? "",
    }))
    .filter((f) => f.key !== "");
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const [catalog, municipalities] = await Promise.all([
    getCatalog(),
    getMunicipalities(),
  ]);

  const initialResource = catalog.resources[0]?.key ?? "";
  const selectedResourceKey = normalizeParam(
    resolvedSearchParams.resource,
    initialResource
  );
  const selectedMunicipalityCode = normalizeParam(
    resolvedSearchParams.codigo_municipio,
    ""
  );
  const page =
    Number.parseInt(normalizeParam(resolvedSearchParams.page, "1"), 10) || 1;
  const pageSize =
    Number.parseInt(normalizeParam(resolvedSearchParams.pageSize, "25"), 10) ||
    25;
  const dynamicFilters = extractDynamicFilters(resolvedSearchParams);

  const selectedResource =
    catalog.resources.find((r) => r.key === selectedResourceKey) ?? null;
  const selectedMunicipality =
    municipalities.find(
      (m) => m.codigo_municipio === selectedMunicipalityCode
    ) ?? null;

  const { payload, error } = await getResourcePage(selectedResourceKey, page, pageSize, [
    ...dynamicFilters,
    ...(selectedMunicipalityCode
      ? [{ key: "codigo_municipio", value: selectedMunicipalityCode }]
      : []),
  ]);

  const hasDataAlert = Boolean(
    payload && payload.items.length > 0 && selectedMunicipality
  );

  return (
    <div className="min-h-screen bg-background">
      {hasDataAlert && selectedMunicipality && (
        <Toast
          message={`${payload?.items.length} registros retornados para ${selectedMunicipality.nome_municipio}`}
          type="success"
        />
      )}

      <Header
        resourceCount={catalog.resources.length}
        municipalityCount={municipalities.length}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Query Section */}
            <section aria-labelledby="query-heading">
              <div className="mb-6">
                <h2
                  id="query-heading"
                  className="text-lg font-semibold text-foreground"
                >
                  Consulta
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Selecione um endpoint e preencha os filtros para consultar os
                  dados.
                </p>
              </div>

              <div className="rounded-xl border bg-card p-6">
                <QueryForm
                  initialFilters={dynamicFilters}
                  municipalities={municipalities}
                  page={page}
                  pageSize={pageSize}
                  resources={catalog.resources}
                  selectedMunicipalityCode={selectedMunicipalityCode}
                  selectedResource={selectedResourceKey}
                />
              </div>
            </section>

            {/* Error Display */}
            {error && (
              <ErrorCard
                title={error.title}
                detail={error.detail}
                status={error.status}
              />
            )}

            {/* Results Section */}
            {payload && (
              <ResultsPanel
                payload={payload}
                filters={dynamicFilters}
                selectedResource={selectedResourceKey}
                selectedMunicipalityCode={selectedMunicipalityCode}
                page={page}
                pageSize={pageSize}
              />
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            <EndpointInfo
              resource={selectedResource}
              municipality={selectedMunicipality}
            />

            {/* Quick Help */}
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-medium text-foreground">
                Ajuda rapida
              </h3>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  Selecione um endpoint para ver os campos disponiveis
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  Campos obrigatorios sao destacados em amarelo
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  Formatos de data: yyyy-mm-dd ou yyyymm
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  Clique em um registro para expandir o JSON completo
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-muted-foreground">
            Dados fornecidos pela API de Dados Abertos do TCE-CE. Esta interface
            e apenas um facilitador de consulta.
          </p>
        </div>
      </footer>
    </div>
  );
}
