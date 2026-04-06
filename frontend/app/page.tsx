import { Header } from "@/components/header";
import { QueryForm } from "@/components/query-form";
import { ResultsPanel } from "@/components/results-panel";
import { ErrorCard } from "@/components/error-card";
import { headers } from "next/headers";
import { getPublicApiBaseUrl, getServerApiBaseUrl } from "@/lib/api-base-url";
import { formatResourceLabel } from "@/lib/labels";
import municipalitiesSnapshot from "@/lib/tcece-municipalities.json";

export const dynamic = "force-dynamic";

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

type FilterPair = {
  key: string;
  value: string;
};

const defaultCatalog: ResourceCatalog = {
  baseUrl: getPublicApiBaseUrl(),
  resources: [],
};
const fullFetchBatchSize = 250;
const sourceFetchBatchSize = 100;

const reservedParams = new Set([
  "resource",
  "page",
  "pageSize",
  "codigo_municipio",
]);

async function getCatalog(): Promise<ResourceCatalog> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";

  if (host) {
    try {
      const response = await fetch(`${protocol}://${host}/api/resources`, {
        cache: "no-store",
      });
      if (response.ok) {
        return (await response.json()) as ResourceCatalog;
      }
    } catch {
      // Fall through to the direct API call.
    }
  }

  try {
    const response = await fetch(`${getServerApiBaseUrl()}/api/resources`, {
      cache: "no-store",
    });
    if (!response.ok) return defaultCatalog;
    return (await response.json()) as ResourceCatalog;
  } catch {
    return defaultCatalog;
  }
}

async function getMunicipalities(): Promise<MunicipalityRecord[]> {
  return municipalitiesSnapshot as MunicipalityRecord[];
}

async function fetchResourceEnvelope(
  resource: string,
  page: number,
  pageSize: number,
  filters: Array<{ key: string; value: string }>
): Promise<ResourcePageResult> {
  if (!resource) return { payload: null, error: null };

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";

  const buildUrl = (baseUrl: string) => {
    const url = new URL(`${baseUrl}/api/resources/${resource}`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("pageSize", String(pageSize));
    filters.forEach((f) => {
      if (f.key.trim() !== "") url.searchParams.set(f.key, f.value);
    });
    return url;
  };

  const candidateUrls = [];
  if (host) {
    candidateUrls.push(buildUrl(`${protocol}://${host}`));
  }
  candidateUrls.push(buildUrl(getServerApiBaseUrl()));

  let lastError: ResourcePageResult["error"] = null;

  for (const url of candidateUrls) {
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

        lastError = { status: response.status, title, detail };

        // Se a rota atual falhar com erro de infraestrutura, tenta o proximo backend.
        if (response.status >= 500) {
          continue;
        }

        return {
          payload: null,
          error: lastError,
        };
      }

      return {
        payload: (await response.json()) as PaginatedEnvelope,
        error: null,
      };
    } catch {
      continue;
    }
  }

  if (lastError) {
    return {
      payload: null,
      error: lastError,
    };
  }

  return {
    payload: null,
    error: {
      status: 0,
      title: "Falha de conexao",
      detail: `Nao foi possivel conectar ao servidor em ${getServerApiBaseUrl()}.`,
    },
  };
}

function usesSourcePagination(resource: ResourceDescriptor | null | undefined) {
  return Boolean(
    resource?.queryParameters.some(
      (parameter) =>
        parameter.name === "quantidade" || parameter.name === "deslocamento"
    )
  );
}

function getFetchBatchSize(resource: ResourceDescriptor | null | undefined) {
  return usesSourcePagination(resource)
    ? sourceFetchBatchSize
    : fullFetchBatchSize;
}

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function sortResourcesAlphabetically(resources: ResourceDescriptor[]) {
  return [...resources].sort((left, right) =>
    formatResourceLabel(left.key).localeCompare(formatResourceLabel(right.key), "pt-BR")
  );
}

function applyLocalFilterFallback(
  payload: PaginatedEnvelope,
  filters: FilterPair[]
) {
  const filteredItems = payload.items.filter((item) =>
    filters.every((filter) => {
      const rawValue = item[filter.key];
      if (rawValue == null) {
        return false;
      }

      const filterValue = normalizeSearchValue(filter.value);
      const itemValue = normalizeSearchValue(String(rawValue));

      if (!filterValue) {
        return true;
      }

      return itemValue.includes(filterValue);
    })
  );

  return {
    ...payload,
    items: filteredItems,
    totalItems: filteredItems.length,
    totalPages: filteredItems.length === 0 ? 0 : 1,
    page: 1,
  } satisfies PaginatedEnvelope;
}

async function getResourcePage(
  resource: string,
  filters: Array<{ key: string; value: string }>,
  pageSize: number
): Promise<ResourcePageResult> {
  if (!resource) return { payload: null, error: null };
  return fetchResourceEnvelope(resource, 1, pageSize, filters);
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

function filterResourceFilters(
  filters: Array<{ key: string; value: string }>,
  resource: ResourceDescriptor | null
) {
  if (!resource) return [];

  const allowedParameters = new Set(
    resource.queryParameters.map((parameter) => parameter.name)
  );

  return filters.filter((filter) => allowedParameters.has(filter.key));
}

function getMissingRequiredParameters(
  resource: ResourceDescriptor | null,
  filters: Array<{ key: string; value: string }>,
  municipalityCode: string
) {
  if (!resource) return [];

  const filterMap = new Map(
    filters.map((filter) => [filter.key, filter.value.trim()])
  );

  return resource.requiredQueryParameters.filter((parameterName) => {
    if (parameterName === "quantidade" || parameterName === "deslocamento") {
      return false;
    }

    if (parameterName === "codigo_municipio") {
      return municipalityCode.trim() === "";
    }

    return (filterMap.get(parameterName) ?? "") === "";
  });
}

function supportsMunicipality(resource: ResourceDescriptor | null) {
  return Boolean(
    resource?.queryParameters.some(
      (parameter) => parameter.name === "codigo_municipio"
    )
  );
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
  const sortedResources = sortResourcesAlphabetically(catalog.resources);

  const initialResource = "";
  const selectedResourceKey = normalizeParam(
    resolvedSearchParams.resource,
    initialResource
  );
  const selectedMunicipalityCode = normalizeParam(
    resolvedSearchParams.codigo_municipio,
    ""
  );
  const requestFilters = extractDynamicFilters(resolvedSearchParams);

  const selectedResource =
    sortedResources.find((r) => r.key === selectedResourceKey) ?? null;
  const page = 1;
  const pageSize = getFetchBatchSize(selectedResource);
  const dynamicFilters = filterResourceFilters(requestFilters, selectedResource);
  const shouldUseMunicipality = supportsMunicipality(selectedResource);
  const effectiveMunicipalityCode = shouldUseMunicipality
    ? selectedMunicipalityCode
    : "";
  const missingRequiredParameters = getMissingRequiredParameters(
    selectedResource,
    dynamicFilters,
    effectiveMunicipalityCode
  );
  const selectedMunicipality =
    municipalities.find(
      (m) => m.codigo_municipio === effectiveMunicipalityCode
    ) ?? null;

  const shouldFetchResults =
    Boolean(selectedResourceKey) && missingRequiredParameters.length === 0;
  const requestPayloadFilters = [
    ...dynamicFilters,
    ...(effectiveMunicipalityCode
      ? [{ key: "codigo_municipio", value: effectiveMunicipalityCode }]
      : []),
  ];
  const { payload, error } = shouldFetchResults
    ? await getResourcePage(
        selectedResourceKey,
        requestPayloadFilters,
        pageSize
      )
    : { payload: null, error: null };

  return (
    <div className="min-h-screen bg-background">
      <Header
        resourceCount={catalog.resources.length}
        municipalityCount={municipalities.length}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="soft-reveal mb-8 overflow-hidden rounded-[32px] border border-primary/15 bg-[linear-gradient(135deg,#007F86_0%,#2BAFB6_100%)] shadow-[0_20px_50px_rgba(0,127,134,0.2)]">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="px-7 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-14">
            <div className="mb-4 inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/90">
              Dados Abertos do TCE-CE
            </div>
            <h2 className="max-w-4xl text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl lg:text-[3.25rem] lg:leading-[1.04]">
              Consulta Técnica no Tribunal de Contas do Estado do Ceará
            </h2>
            <p className="mt-5 max-w-3xl text-sm leading-8 text-white/84 sm:text-base">
              Estrutura de consulta orientada a operacao, com contraste forte, superficies claras
              e a mesma paleta teal corporativa usada no projeto de referencia.
            </p>
            <div className="mt-10 flex flex-wrap gap-3 text-white/92">
              <div className="rounded-md px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] hover:bg-white/10">
                Consulta integral
              </div>
              <div className="rounded-md px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] hover:bg-white/10">
                Exportacao CSV
              </div>
              <div className="rounded-md px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] hover:bg-white/10">
                Filtros dinamicos
              </div>
            </div>
          </div>
          <aside className="border-t border-white/10 bg-white/96 px-6 py-7 lg:border-l lg:border-t-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Modo dev
            </div>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Esta interface consulta o catalogo de recursos, organiza filtros por endpoint
              e prepara exportacao completa em CSV.
            </p>
            <div className="mt-8 rounded-[20px] border border-primary/10 bg-primary/5 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Referencia visual
              </div>
              <p className="mt-2 text-sm leading-7 text-foreground">
                Inspirada no desenho do Fluxus: cor primaria dominante, blocos claros e leitura mais direta.
              </p>
            </div>
          </aside>
          </div>
        </section>

        <section className="min-w-0">
          <section aria-label="Formulario de consulta">
            <div className="surface-panel soft-reveal overflow-hidden rounded-[26px] p-6">
              <QueryForm
                key={selectedResourceKey || "default-resource"}
                initialFilters={dynamicFilters}
                municipalities={municipalities}
                page={page}
                pageSize={pageSize}
                resources={sortedResources}
                selectedMunicipalityCode={effectiveMunicipalityCode}
                selectedResource={selectedResourceKey}
              />
            </div>
          </section>
        </section>

        <section className="mt-8 min-w-0 space-y-8">
          {error && (
            <ErrorCard
              title={error.title}
              detail={error.detail}
              status={error.status}
            />
          )}

          {payload && (
            <ResultsPanel
              payload={payload}
              filters={dynamicFilters}
              selectedResource={selectedResourceKey}
              resourceCategory={selectedResource?.category ?? null}
              municipality={selectedMunicipality}
              selectedMunicipalityCode={effectiveMunicipalityCode}
              requestPageSize={pageSize}
            />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-10 border-t border-border/80 bg-background/90">
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
