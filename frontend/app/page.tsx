import { Header } from "@/components/header";
import { QueryForm } from "@/components/query-form";
import { ResultsPanel } from "@/components/results-panel";
import { ErrorCard } from "@/components/error-card";
import { Toast } from "@/components/toast";
import { getPublicApiBaseUrl, getServerApiBaseUrl } from "@/lib/api-base-url";

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
  try {
    const response = await fetch(`${getServerApiBaseUrl()}/api/resources`, {
      next: { revalidate: 3600 },
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
      `${getServerApiBaseUrl()}/api/resources/municipios?page=1&pageSize=250`,
      { next: { revalidate: 3600 } }
    );
    if (!response.ok) return [];
    const payload = (await response.json()) as PaginatedEnvelope;
    return payload.items as MunicipalityRecord[];
  } catch {
    return [];
  }
}

async function fetchResourceEnvelope(
  resource: string,
  page: number,
  pageSize: number,
  filters: Array<{ key: string; value: string }>
): Promise<ResourcePageResult> {
  if (!resource) return { payload: null, error: null };

  const url = new URL(`${getServerApiBaseUrl()}/api/resources/${resource}`);
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
        detail: `Nao foi possivel conectar ao servidor em ${getServerApiBaseUrl()}.`,
      },
    };
  }
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

  const initialResource = catalog.resources[0]?.key ?? "";
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
    catalog.resources.find((r) => r.key === selectedResourceKey) ?? null;
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

  const { payload, error } =
    missingRequiredParameters.length === 0
      ? await getResourcePage(selectedResourceKey, [
          ...dynamicFilters,
          ...(effectiveMunicipalityCode
            ? [{ key: "codigo_municipio", value: effectiveMunicipalityCode }]
            : []),
        ], pageSize)
      : { payload: null, error: null };

  const filteredPayload =
    payload &&
    selectedResource &&
    !usesSourcePagination(selectedResource) &&
    dynamicFilters.length > 0 &&
    payload.items.length === 0
      ? await (async () => {
          const baseResult = await getResourcePage(selectedResourceKey, [
            ...(effectiveMunicipalityCode
              ? [{ key: "codigo_municipio", value: effectiveMunicipalityCode }]
              : []),
          ], pageSize);

          if (!baseResult.payload) {
            return payload;
          }

          return applyLocalFilterFallback(baseResult.payload, dynamicFilters);
        })()
      : payload;

  const hasDataAlert = Boolean(
    filteredPayload && filteredPayload.items.length > 0 && selectedMunicipality
  );

  return (
    <div className="min-h-screen bg-background">
      {hasDataAlert && selectedMunicipality && (
        <Toast
          message={`${filteredPayload?.items.length} registros retornados para ${selectedMunicipality.nome_municipio}`}
          type="success"
        />
      )}

      <Header
        resourceCount={catalog.resources.length}
        municipalityCount={municipalities.length}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="soft-reveal mb-8 overflow-hidden rounded-[28px] border border-border/70 bg-card/70 px-6 py-6 shadow-[0_24px_80px_hsl(200_30%_10%_/_0.08)] backdrop-blur-xl">
          <div className="max-w-5xl">
            <div className="mb-3 inline-flex rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              Dados Abertos do TCE-CE
            </div>
            <h2 className="max-w-none text-2xl font-extrabold tracking-[-0.04em] text-foreground sm:text-3xl lg:text-[2.1rem] lg:leading-[1.1]">
              Consulta Técnica no Tribunal de Contas do Estado do Ceará
            </h2>
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
                resources={catalog.resources}
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

          {filteredPayload && (
            <ResultsPanel
              payload={filteredPayload}
              filters={dynamicFilters}
              selectedResource={selectedResourceKey}
              resourceCategory={selectedResource?.category ?? null}
              municipality={selectedMunicipality}
              apiBaseUrl={getPublicApiBaseUrl()}
              selectedMunicipalityCode={effectiveMunicipalityCode}
              requestPageSize={pageSize}
            />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-10 border-t border-border/80 bg-background/80 backdrop-blur-xl">
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
