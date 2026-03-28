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
      <aside className="rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Selecione um endpoint para ver informacoes detalhadas.
        </p>
      </aside>
    );
  }

  return (
    <aside className="space-y-4 rounded-lg border bg-card p-4" aria-label="Informacoes do endpoint">
      <div>
        <h2 className="text-sm font-medium text-muted-foreground">Endpoint selecionado</h2>
        <p className="mt-1 font-mono text-sm font-semibold text-foreground">{resource.key}</p>
      </div>

      {resource.description && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {resource.description}
        </p>
      )}

      {municipality && (
        <div className="flex items-start gap-3 rounded-md bg-secondary/50 p-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <div className="min-w-0 space-y-0.5">
            <p className="font-medium text-foreground">{municipality.nome_municipio}</p>
            <p className="text-xs text-muted-foreground">
              TCE-CE: {municipality.codigo_municipio}
              {municipality.geoibgeId && ` | IBGE: ${municipality.geoibgeId}`}
            </p>
          </div>
        </div>
      )}

      {resource.requiredQueryParameters.length > 0 && (
        <div className="space-y-2">
          <h3 className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <Tag className="h-3 w-3" aria-hidden="true" />
            Parametros obrigatorios
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {resource.requiredQueryParameters.map((param) => (
              <span
                key={param}
                className="rounded-md bg-warning/10 px-2 py-1 text-xs font-medium text-warning"
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
