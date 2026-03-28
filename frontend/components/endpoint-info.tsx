import { MapPin, Tag } from "lucide-react";

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

type MunicipalityRecord = {
  codigo_municipio: string;
  nome_municipio: string;
  geoibgeId?: string | null;
  geonamesId?: string | null;
};

type EndpointInfoProps = {
  resource: ResourceDescriptor | null;
  municipality: MunicipalityRecord | null;
};

export function EndpointInfo({ resource, municipality }: EndpointInfoProps) {
  if (!resource) {
    return (
      <aside className="surface-panel soft-reveal rounded-2xl p-5">
        <p className="text-sm text-muted-foreground">
          Selecione um endpoint para ver informacoes detalhadas.
        </p>
      </aside>
    );
  }

  return (
    <aside
      className="surface-panel soft-reveal space-y-5 rounded-2xl p-5"
      aria-label="Informacoes do endpoint"
    >
      <div className="space-y-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Endpoint selecionado
        </div>
        <p className="inline-flex rounded-xl border border-border/80 bg-background/70 px-3 py-2 font-mono text-sm font-semibold text-foreground">
          {resource.key}
        </p>
      </div>

      {resource.description && (
        <p className="text-sm leading-7 text-muted-foreground">
          {resource.description}
        </p>
      )}

      {municipality && (
        <div className="rounded-2xl border border-primary/10 bg-primary/[0.04] p-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Contexto territorial
          </div>
          <div className="flex items-start gap-3">
            <MapPin className="subtle-location-pulse mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0 space-y-0.5">
              <p className="font-semibold tracking-[-0.01em] text-foreground">{municipality.nome_municipio}</p>
              <p className="text-xs text-muted-foreground">
                TCE-CE: {municipality.codigo_municipio}
                {municipality.geoibgeId && ` | IBGE: ${municipality.geoibgeId}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {resource.category && (
        <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Categoria
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">{resource.category}</p>
        </div>
      )}

      {resource.requiredQueryParameters.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <Tag className="h-3 w-3" aria-hidden="true" />
            Parametros obrigatorios
          </h3>
          <div className="flex flex-wrap gap-2">
            {resource.requiredQueryParameters.map((param) => (
              <span
                key={param}
                className="rounded-xl border border-warning/20 bg-warning/10 px-2.5 py-1.5 text-xs font-semibold text-warning"
              >
                {param}
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
