import catalogSnapshot from "./tcece-catalog.json";

const officialApiBaseUrl = "https://api-dados-abertos.tce.ce.gov.br";
const defaultCacheSeconds = 300;

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

type CachedCatalog = {
  expiresAt: number;
  resources: ResourceDescriptor[];
};

let cachedCatalog: CachedCatalog | null = null;

function getTimeoutSignal(timeoutMs: number) {
  return AbortSignal.timeout(timeoutMs);
}

function normalizeTag(tag: string | undefined) {
  if (!tag?.trim()) {
    return "Outros";
  }

  return tag
    .replace("Documentação referente a ", "")
    .replace("Documentacao referente a ", "")
    .replace(" - SIM", "")
    .trim();
}

function extractSwaggerDocument(content: string) {
  const marker = "\"swaggerDoc\":";
  const markerIndex = content.indexOf(marker);

  if (markerIndex < 0) {
    throw new Error("Nao foi possivel localizar swaggerDoc.");
  }

  const startIndex = content.indexOf("{", markerIndex + marker.length);
  if (startIndex < 0) {
    throw new Error("Nao foi possivel localizar o inicio do swagger.");
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = startIndex; index < content.length; index += 1) {
    const current = content[index];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }

      if (current === "\\") {
        escaped = true;
        continue;
      }

      if (current === "\"") {
        inString = false;
      }

      continue;
    }

    if (current === "\"") {
      inString = true;
      continue;
    }

    if (current === "{") {
      depth += 1;
      continue;
    }

    if (current === "}") {
      depth -= 1;
      if (depth === 0) {
        return content.slice(startIndex, index + 1);
      }
    }
  }

  throw new Error("Nao foi possivel fechar o JSON do swagger.");
}

function inferType(schema: Record<string, unknown> | undefined) {
  const type = schema?.type;
  return typeof type === "string" ? type : undefined;
}

function normalizeResource(
  key: string,
  operation: Record<string, unknown>
): ResourceDescriptor {
  const rawParameters = Array.isArray(operation.parameters)
    ? operation.parameters
    : [];

  const queryParameters = rawParameters
    .filter((parameter): parameter is Record<string, unknown> => {
      return Boolean(
        parameter &&
        typeof parameter === "object" &&
        parameter.in === "query" &&
        typeof parameter.name === "string"
      );
    })
    .map((parameter) => ({
      name: String(parameter.name),
      required: Boolean(parameter.required),
      description:
        typeof parameter.description === "string"
          ? parameter.description
          : undefined,
      type: inferType(
        parameter.schema && typeof parameter.schema === "object"
          ? (parameter.schema as Record<string, unknown>)
          : undefined
      ),
    }))
    .sort((left, right) => {
      if (left.required !== right.required) {
        return left.required ? -1 : 1;
      }
      return left.name.localeCompare(right.name);
    });

  return {
    key,
    path: key,
    category: normalizeTag(
      Array.isArray(operation.tags) ? String(operation.tags[0] ?? "") : ""
    ),
    description:
      typeof operation.summary === "string" ? operation.summary : undefined,
    requiredQueryParameters: queryParameters
      .filter((parameter) => parameter.required)
      .map((parameter) => parameter.name),
    optionalQueryParameters: queryParameters
      .filter((parameter) => !parameter.required)
      .map((parameter) => parameter.name),
    queryParameters,
    requiresAuthentication: false,
  };
}

function usesSourcePagination(resource: ResourceDescriptor | undefined) {
  if (!resource) {
    return false;
  }

  const names = new Set(
    resource.queryParameters.map((parameter) => parameter.name.toLowerCase())
  );

  return names.has("quantidade") || names.has("deslocamento");
}

function toObjectList(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) => {
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      return { ...(entry as Record<string, unknown>) };
    }

    return { value: entry };
  });
}

function normalizePayload(root: unknown) {
  if (Array.isArray(root)) {
    return {
      items: toObjectList(root),
      metadata: {} as Record<string, unknown>,
    };
  }

  if (!root || typeof root !== "object") {
    return {
      items: [],
      metadata: { value: root },
    };
  }

  const record = root as Record<string, unknown>;
  const candidateCollectionProperties = ["data", "items", "results", "records"];
  const candidateCountProperties = ["total", "count", "length"];

  for (const property of candidateCollectionProperties) {
    const value = record[property];

    if (Array.isArray(value)) {
      const metadata = Object.fromEntries(
        Object.entries(record).filter(([key]) => key !== property)
      );

      return {
        items: toObjectList(value),
        metadata,
      };
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      const nestedRecord = value as Record<string, unknown>;

      for (const nestedProperty of candidateCollectionProperties) {
        const nestedValue = nestedRecord[nestedProperty];
        if (!Array.isArray(nestedValue)) {
          continue;
        }

        const metadata = Object.fromEntries(
          Object.entries({
            ...Object.fromEntries(
              Object.entries(record).filter(([key]) => key !== property)
            ),
            ...Object.fromEntries(
              Object.entries(nestedRecord).filter(([key]) => key !== nestedProperty)
            ),
          })
        );

        for (const countProperty of candidateCountProperties) {
          if (nestedRecord[countProperty] !== undefined) {
            metadata[countProperty] = nestedRecord[countProperty];
          }
        }

        return {
          items: toObjectList(nestedValue),
          metadata,
        };
      }
    }
  }

  return {
    items: [record],
    metadata: {},
  };
}

function buildEnvelope(
  resourceKey: string,
  sourceUrl: string,
  page: number,
  pageSize: number,
  resource: ResourceDescriptor | undefined,
  items: Array<Record<string, unknown>>,
  metadata: Record<string, unknown>
): PaginatedEnvelope {
  const now = new Date();
  const normalizedPage = Math.max(1, page);
  const normalizedPageSize = Math.min(250, Math.max(1, pageSize));
  const sourcePagination = usesSourcePagination(resource);

  if (!sourcePagination) {
    const totalItems = items.length;
    const totalPages =
      totalItems === 0 ? 0 : Math.ceil(totalItems / normalizedPageSize);
    const skip = (normalizedPage - 1) * normalizedPageSize;

    return {
      resource: resourceKey,
      sourceUrl,
      page: normalizedPage,
      pageSize: normalizedPageSize,
      totalItems,
      totalPages,
      items: items.slice(skip, skip + normalizedPageSize),
      metadata: {
        ...metadata,
        sourcePagination: false,
        totalItemsExact: true,
      },
      cachedAtUtc: now.toISOString(),
      expiresAtUtc: new Date(now.getTime() + defaultCacheSeconds * 1000).toISOString(),
    };
  }

  const upstreamTotal =
    typeof metadata.total === "number"
      ? metadata.total
      : typeof metadata.count === "number"
        ? metadata.count
        : null;
  const hasMorePages = items.length === normalizedPageSize;
  const knownItemCount = (normalizedPage - 1) * normalizedPageSize + items.length;
  const totalItems = upstreamTotal ?? (hasMorePages ? knownItemCount + 1 : knownItemCount);
  const totalPages =
    upstreamTotal != null
      ? totalItems === 0
        ? 0
        : Math.ceil(totalItems / normalizedPageSize)
      : hasMorePages
        ? normalizedPage + 1
        : normalizedPage;

  return {
    resource: resourceKey,
    sourceUrl,
    page: normalizedPage,
    pageSize: normalizedPageSize,
    totalItems,
    totalPages,
    items,
    metadata: {
      ...metadata,
      hasMorePages,
      sourcePagination: true,
      totalItemsExact: upstreamTotal != null,
      totalPagesExact: upstreamTotal != null,
    },
    cachedAtUtc: now.toISOString(),
    expiresAtUtc: new Date(now.getTime() + defaultCacheSeconds * 1000).toISOString(),
  };
}

export async function getCatalog() {
  const now = Date.now();
  if (cachedCatalog && cachedCatalog.expiresAt > now) {
    return cachedCatalog.resources;
  }
  const resources = catalogSnapshot as ResourceDescriptor[];

  cachedCatalog = {
    resources,
    expiresAt: now + 60 * 60 * 1000,
  };

  return resources;
}

export async function getCatalogResponse() {
  const resources = await getCatalog();
  return {
    baseUrl: officialApiBaseUrl,
    resources,
  };
}

export async function getResourceResponse(
  resourceKey: string,
  page: number,
  pageSize: number,
  queryParameters: URLSearchParams
) {
  const resources = await getCatalog();
  const resource = resources.find((entry) => entry.key === resourceKey);

  if (!resource) {
    return {
      status: 404,
      body: {
        title: "Recurso nao encontrado",
        status: 404,
        detail: `O recurso '${resourceKey}' nao esta configurado no catalogo.`,
      },
    };
  }

  const sourcePagination = usesSourcePagination(resource);

  const normalizedPage = Math.max(1, page);
  const normalizedPageSize = Math.min(250, Math.max(1, pageSize));
  const sourceUrl = new URL(`${officialApiBaseUrl}/${resource.path.replace(/^\/+/, "")}`);

  for (const [key, value] of queryParameters.entries()) {
    if (!value.trim() || key === "page" || key === "pageSize") {
      continue;
    }

    if (sourcePagination && (key === "quantidade" || key === "deslocamento")) {
      continue;
    }

    sourceUrl.searchParams.set(key, value);
  }

  if (sourcePagination) {
    sourceUrl.searchParams.set("quantidade", String(normalizedPageSize));
    sourceUrl.searchParams.set(
      "deslocamento",
      String((normalizedPage - 1) * normalizedPageSize)
    );
  }

  try {
    const response = await fetch(sourceUrl.toString(), {
      cache: "no-store",
      signal: getTimeoutSignal(30000),
      headers: {
        accept: "application/json",
        "user-agent": "Mozilla/5.0 API-TCE-CE/1.0",
      },
    });

    if (!response.ok) {
      return {
        status: response.status,
        body: {
          title: "Falha na consulta",
          status: response.status,
          detail: "Nao foi possivel consultar o recurso selecionado.",
        },
      };
    }

    const root = (await response.json()) as unknown;
    const normalized = normalizePayload(root);

    return {
      status: 200,
      body: buildEnvelope(
        resourceKey,
        sourceUrl.toString(),
        normalizedPage,
        normalizedPageSize,
        resource,
        normalized.items,
        normalized.metadata
      ),
    };
  } catch {
    return {
      status: 502,
      body: {
        title: "Falha de conectividade com o TCE-CE",
        status: 502,
        detail: "Nao foi possivel concluir a comunicacao com o servico remoto.",
      },
    };
  }
}
