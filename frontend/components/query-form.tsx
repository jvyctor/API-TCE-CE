"use client";

import { startTransition, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, RotateCcw, ChevronDown, Info, AlertCircle } from "lucide-react";
import { formatFieldLabel, formatResourceLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";

type FilterPair = {
  key: string;
  value: string;
};

type MunicipalityOption = {
  codigo_municipio: string;
  nome_municipio: string;
  geoibgeId?: string | null;
};

type QueryParameterOption = {
  name: string;
  required: boolean;
  description?: string;
  type?: string;
};

type ResourceOption = {
  key: string;
  category?: string;
  requiredQueryParameters: string[];
  optionalQueryParameters: string[];
  queryParameters: QueryParameterOption[];
};

type QueryFormProps = {
  initialFilters: FilterPair[];
  municipalities: MunicipalityOption[];
  page: number;
  pageSize: number;
  resources: ResourceOption[];
  selectedMunicipalityCode: string;
  selectedResource: string;
};

type ValidationRule = {
  kind: "interval-date" | "year-month";
  pattern: string;
  title: string;
  example: string;
  inputMode?: "numeric" | "text";
};

const reserved = new Set(["codigo_municipio"]);
const fullFetchPageSize = 250;
const sourceFetchPageSize = 100;

const parameterHelp: Record<string, string> = {
  exercicio_orcamento: "Use o ano no formato yyyymm. Exemplo: 2024 -> 202400.",
  data_contrato: "Formato yyyy-mm-dd ou intervalo yyyy-mm-dd_yyyy-mm-dd.",
  data_realizacao_autuacao_licitacao: "Formato yyyy-mm-dd ou intervalo yyyy-mm-dd_yyyy-mm-dd.",
  data_realizacao_licitacao: "Formato yyyy-mm-dd ou intervalo yyyy-mm-dd_yyyy-mm-dd.",
  data_referencia_empenho: "Formato yyyymm. Exemplo: 202401."
};

const intervalDateRule: ValidationRule = {
  kind: "interval-date",
  pattern: "^\\d{4}-\\d{2}-\\d{2}(?:_\\d{4}-\\d{2}-\\d{2})?$",
  title: "Use yyyy-mm-dd ou yyyy-mm-dd_yyyy-mm-dd.",
  example: "Ex: 2025-01-01 ou 2025-01-01_2025-11-30",
  inputMode: "text"
};

const yearMonthRule: ValidationRule = {
  kind: "year-month",
  pattern: "^\\d{6}$",
  title: "Use o formato yyyymm.",
  example: "Ex: 202401",
  inputMode: "numeric"
};

function applyVisualMask(value: string, rule: ValidationRule | null) {
  if (!rule) return value;
  if (rule.kind === "year-month") return value.replace(/\D/g, "").slice(0, 6);
  return value;
}

function getValidationRule(parameterName: string): ValidationRule | null {
  const dateFields = [
    "data_contrato", "data_realizacao_autuacao_licitacao", "data_realizacao_licitacao",
    "data_aquisicao_bem", "data_abertura_credito", "data_emissao_empenho",
    "data_avaliacao", "data_liquidacao", "data_movimentacao", "data_publicacao_edital"
  ];
  const yearMonthFields = [
    "data_referencia_empenho", "data_referencia_agente_publico", "data_referencia_bem",
    "data_referencia", "data_ref_mf", "data_ref_pagamento", "data_ref_nota",
    "data_referencia_nota_fiscal", "exercicio_orcamento"
  ];
  if (dateFields.includes(parameterName)) return intervalDateRule;
  if (yearMonthFields.includes(parameterName)) return yearMonthRule;
  return null;
}

function renderHelpText(parameter: QueryParameterOption) {
  return parameter.description ?? parameterHelp[parameter.name] ?? `Tipo: ${parameter.type ?? "string"}`;
}

function parseIntervalDateValue(value: string) {
  const [start = "", end = ""] = value.split("_", 2);
  return { start, end };
}

function buildIntervalDateValue(start: string, end: string) {
  if (!start) return "";
  return end ? `${start}_${end}` : start;
}

function usesSourcePagination(resource: ResourceOption | undefined) {
  return Boolean(
    resource?.queryParameters.some(
      (parameter) =>
        parameter.name === "quantidade" || parameter.name === "deslocamento"
    )
  );
}

function getFetchPageSize(resource: ResourceOption | undefined) {
  return usesSourcePagination(resource)
    ? sourceFetchPageSize
    : fullFetchPageSize;
}

export function QueryForm({
  initialFilters,
  municipalities,
  page,
  pageSize,
  resources,
  selectedMunicipalityCode,
  selectedResource
}: QueryFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const shouldHighlightValidationRef = useRef(true);
  const [activeResource, setActiveResource] = useState(selectedResource);
  const [municipalityCode, setMunicipalityCode] = useState(selectedMunicipalityCode);
  const [localPage, setLocalPage] = useState(1);
  const [localPageSize, setLocalPageSize] = useState(pageSize);
  const [showOptional, setShowOptional] = useState(false);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [dateRangeErrors, setDateRangeErrors] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(
    String(pageSize)
  );
  const [offset, setOffset] = useState(
    "0"
  );
  const [dateRanges, setDateRanges] = useState<Record<string, { start: string; end: string }>>(() => {
    const entries: Record<string, { start: string; end: string }> = {};
    initialFilters.forEach((filter) => {
      if (getValidationRule(filter.key)?.kind === "interval-date") {
        entries[filter.key] = parseIntervalDateValue(filter.value);
      }
    });
    return entries;
  });

  const selectedMetadata = useMemo(
    () => resources.find((r) => r.key === activeResource) ?? resources[0],
    [activeResource, resources]
  );

  const filterMap = useMemo(() => {
    const entries = new Map<string, string>();
    initialFilters.forEach((f) => entries.set(f.key, f.value));
    return entries;
  }, [initialFilters]);

  const requiredParameters = selectedMetadata?.queryParameters.filter((p) => p.required) ?? [];
  const optionalParameters = selectedMetadata?.queryParameters.filter(
    (p) => !p.required && !reserved.has(p.name)
  ) ?? [];
  useEffect(() => {
    setActiveResource(selectedResource);
    setMunicipalityCode(selectedMunicipalityCode);
    setLocalPage(page);
    setLocalPageSize(pageSize);
    setShowOptional(false);
    setInvalidFields([]);
    setDateRangeErrors({});
    setQuantity(
      String(pageSize)
    );
    setOffset(
      "0"
    );
    setDateRanges(() => {
      const entries: Record<string, { start: string; end: string }> = {};
      initialFilters.forEach((filter) => {
        if (getValidationRule(filter.key)?.kind === "interval-date") {
          entries[filter.key] = parseIntervalDateValue(filter.value);
        }
      });
      return entries;
    });
  }, [initialFilters, page, pageSize, selectedMunicipalityCode, selectedResource]);

  function clearInvalidField(fieldName: string) {
    setInvalidFields((current) => current.filter((entry) => entry !== fieldName));
  }

  function setDateRangeError(fieldName: string, message: string | null) {
    setDateRangeErrors((current) => {
      if (!message) {
        const next = { ...current };
        delete next[fieldName];
        return next;
      }

      return {
        ...current,
        [fieldName]: message
      };
    });
  }

  function validateRequiredFields(formData: FormData, municipalityValue: string) {
    const missingFields = requiredParameters
      .map((parameter) => parameter.name)
      .filter((parameterName) => {
        if (parameterName === "codigo_municipio") {
          return municipalityValue === "";
        }

        const value = formData.get(parameterName);
        return typeof value !== "string" || value.trim() === "";
      });

    if (shouldHighlightValidationRef.current) {
      setInvalidFields(missingFields);
    }

    return missingFields.length === 0;
  }

  function navigateWithParams(params: URLSearchParams) {
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function buildResourceParams(resourceKey: string) {
    const nextResource = resources.find((resource) => resource.key === resourceKey);
    const params = new URLSearchParams();

    if (!nextResource) return params;

    const nextPageSize = getFetchPageSize(nextResource);
    params.set("resource", resourceKey);
    params.set("page", "1");
    params.set("pageSize", String(nextPageSize));

    if (municipalityCode) {
      params.set("codigo_municipio", municipalityCode);
    }

    const requiredNames = new Set(
      nextResource.queryParameters.map((parameter) => parameter.name)
    );

    return params;
  }

  function submitForm() {
    shouldHighlightValidationRef.current = false;
    formRef.current?.requestSubmit();
  }

  function handleReset() {
    setActiveResource(resources[0]?.key ?? "");
    setMunicipalityCode("");
    setLocalPage(1);
    setLocalPageSize(getFetchPageSize(resources[0]));
    setQuantity(String(getFetchPageSize(resources[0])));
    setOffset("0");
    startTransition(() => {
      router.replace(pathname);
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    const resourceValue = String(formData.get("resource") ?? activeResource).trim();
    const targetResource = resources.find((resource) => resource.key === resourceValue) ?? selectedMetadata;
    const allowedParameterNames = new Set(
      (targetResource?.queryParameters ?? []).map((parameter) => parameter.name)
    );
    const targetPageSize = getFetchPageSize(targetResource);
    const municipalityValue = String(
      formData.get("codigo_municipio") ?? municipalityCode
    ).trim();

    const hasInvalidDateRange = Object.values(dateRanges).some(
      ({ start, end }) => Boolean(start && end && end < start)
    );

    const isValid = validateRequiredFields(formData, municipalityValue);
    shouldHighlightValidationRef.current = true;

    if (!isValid || hasInvalidDateRange) {
      return;
    }

    if (resourceValue) {
      params.set("resource", resourceValue);
    }

    params.set("page", "1");
    params.set("pageSize", String(targetPageSize));

    if (municipalityValue) {
      params.set("codigo_municipio", municipalityValue);
    }

    for (const [key, value] of formData.entries()) {
      if (
        key === "resource" ||
        key === "page" ||
        key === "pageSize" ||
        key === "codigo_municipio" ||
        key === "quantidade" ||
        key === "deslocamento"
      ) {
        continue;
      }

      if (!allowedParameterNames.has(key)) {
        continue;
      }

      const normalizedValue = typeof value === "string" ? value.trim() : "";
      if (!normalizedValue) {
        continue;
      }

      params.set(key, normalizedValue);
    }

    navigateWithParams(params);
  }

  function renderInput(parameter: QueryParameterOption, isOptional = false) {
    const validationRule = getValidationRule(parameter.name);
    const id = `field-${parameter.name}`;
    const helpId = `help-${parameter.name}`;
    const isInvalid = invalidFields.includes(parameter.name);
    const dateRangeError = dateRangeErrors[parameter.name];

    if (validationRule?.kind === "interval-date") {
      const currentRange = dateRanges[parameter.name] ?? parseIntervalDateValue(filterMap.get(parameter.name) ?? "");
      const hiddenValue = buildIntervalDateValue(currentRange.start, currentRange.end);

      return (
        <div className="space-y-1.5">
          <label htmlFor={`${id}-start`} className="flex items-center gap-2 text-sm font-medium text-foreground">
            {formatFieldLabel(parameter.name, activeResource)}
            {!isOptional && (
              <span className="rounded bg-warning/20 px-1.5 py-0.5 text-xs font-medium text-warning">
                Obrigatorio
              </span>
            )}
          </label>
          <input
            type="hidden"
            name={parameter.name}
            value={hiddenValue}
            disabled={hiddenValue === ""}
            readOnly
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor={`${id}-start`} className="block text-xs font-medium text-muted-foreground">
                Data inicial
              </label>
              <input
                id={`${id}-start`}
                type="date"
                value={currentRange.start}
                required={!isOptional}
                max={currentRange.end || undefined}
                aria-describedby={helpId}
                aria-invalid={isInvalid}
                className={cn(
                  "block w-full rounded-md border bg-card px-3 py-2.5 text-sm text-foreground",
                  "transition-colors focus:outline-none focus:ring-2",
                  isInvalid
                    ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                    : "focus:border-primary focus:ring-primary/20"
                )}
                onChange={(e) => {
                  const nextStart = e.currentTarget.value;
                  clearInvalidField(parameter.name);
                  setDateRanges((current) => {
                    const previous = current[parameter.name] ?? { start: "", end: "" };
                    const nextEnd = previous.end && nextStart && previous.end < nextStart ? previous.end : previous.end;
                    const nextError = previous.end && nextStart && previous.end < nextStart
                      ? "A data final nao pode ser menor que a data inicial."
                      : null;
                    setDateRangeError(parameter.name, nextError);

                    return {
                      ...current,
                      [parameter.name]: {
                        start: nextStart,
                        end: nextEnd
                      }
                    };
                  });
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor={`${id}-end`} className="block text-xs font-medium text-muted-foreground">
                Data final
              </label>
              <input
                id={`${id}-end`}
                type="date"
                value={currentRange.end}
                min={currentRange.start || undefined}
                aria-describedby={helpId}
                aria-invalid={isInvalid}
                className={cn(
                  "block w-full rounded-md border bg-card px-3 py-2.5 text-sm text-foreground",
                  "transition-colors focus:outline-none focus:ring-2",
                  isInvalid
                    ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                    : "focus:border-primary focus:ring-primary/20"
                )}
                onChange={(e) => {
                  const nextEnd = e.currentTarget.value;
                  clearInvalidField(parameter.name);
                  setDateRangeError(
                    parameter.name,
                    currentRange.start && nextEnd && nextEnd < currentRange.start
                      ? "A data final nao pode ser menor que a data inicial."
                      : null
                  );
                  setDateRanges((current) => ({
                    ...current,
                    [parameter.name]: {
                      start: currentRange.start,
                      end: nextEnd
                    }
                  }));
                }}
              />
            </div>
          </div>
          <p id={helpId} className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
            <span>{renderHelpText(parameter)}</span>
          </p>
          {isInvalid && (
            <p className="text-xs font-medium text-destructive">Preencha este campo obrigatorio para consultar.</p>
          )}
          {dateRangeError && (
            <p className="text-xs font-medium text-destructive">{dateRangeError}</p>
          )}
          <p className="text-xs text-primary">Selecione uma data unica ou um intervalo pelo calendario.</p>
        </div>
      );
    }

    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium text-foreground">
          {formatFieldLabel(parameter.name, activeResource)}
          {!isOptional && (
            <span className="rounded bg-warning/20 px-1.5 py-0.5 text-xs font-medium text-warning">
              Obrigatorio
            </span>
          )}
        </label>
        <input
          id={id}
          name={parameter.name}
          type="text"
          defaultValue={filterMap.get(parameter.name) ?? ""}
          inputMode={validationRule?.inputMode}
          placeholder={isOptional ? "Opcional" : "Preencher"}
          pattern={validationRule?.pattern}
          title={validationRule?.title}
          aria-describedby={helpId}
          aria-invalid={isInvalid}
          className={cn(
            "block w-full rounded-md border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground",
            "transition-colors focus:outline-none focus:ring-2",
            isInvalid
              ? "border-destructive focus:border-destructive focus:ring-destructive/20"
              : "focus:border-primary focus:ring-primary/20",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
          onInvalid={(e) => {
            const input = e.currentTarget;
            if (input.validity.patternMismatch) {
              input.setCustomValidity(validationRule?.title ?? "Formato invalido.");
            }
          }}
          onInput={(e) => e.currentTarget.setCustomValidity("")}
          onChange={(e) => {
            clearInvalidField(parameter.name);
            e.currentTarget.value = applyVisualMask(e.currentTarget.value, validationRule);
          }}
        />
        <p id={helpId} className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
          <span>{renderHelpText(parameter)}</span>
        </p>
        {validationRule && (
          <p className="text-xs text-primary">{validationRule.example}</p>
        )}
        {isInvalid && (
          <p className="text-xs font-medium text-destructive">Preencha este campo obrigatorio para consultar.</p>
        )}
      </div>
    );
  }

  return (
    <form
      action="/"
      method="get"
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="space-y-8"
    >
      <section className="grid items-start gap-6 border-b border-border/60 pb-7 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
              Fluxo de consulta
            </div>
            <div>
              <h3 className="text-[1.45rem] font-extrabold tracking-[-0.04em] text-foreground">
                Configure o endpoint antes de consultar
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                Escolha o endpoint, defina o municipio e preencha os filtros obrigatorios. A navegacao da consulta fica concentrada no mesmo card, sem repetir informacoes do painel lateral.
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="municipality" className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Municipio
              </label>
              <div className="relative">
                <select
                  id="municipality"
                  name="codigo_municipio"
                  value={municipalityCode}
                  onChange={(e) => {
                    setMunicipalityCode(e.target.value);
                    clearInvalidField("codigo_municipio");
                    setTimeout(submitForm, 0);
                  }}
                  className="block w-full appearance-none rounded-[20px] border border-border/75 bg-card/80 px-4 py-3.5 pr-10 text-sm font-medium text-foreground shadow-[0_6px_20px_hsl(190_18%_30%_/_0.05)] transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Selecione um municipio</option>
                  {municipalities.map((m) => (
                    <option key={m.codigo_municipio} value={m.codigo_municipio}>
                      {m.nome_municipio} ({m.codigo_municipio})
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="resource" className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Endpoint
              </label>
              <div className="relative">
                <select
                  id="resource"
                  name="resource"
                  value={activeResource}
                  onChange={(e) => {
                    const nextResource = e.target.value;
                    const nextMetadata = resources.find((resource) => resource.key === nextResource);
                    const nextPageSize = getFetchPageSize(nextMetadata);
                    setActiveResource(nextResource);
                    setLocalPage(1);
                    setLocalPageSize(nextPageSize);
                    setQuantity(String(nextPageSize));
                    setOffset("0");
                    setDateRanges({});
                    navigateWithParams(buildResourceParams(nextResource));
                  }}
                  className="block w-full appearance-none rounded-[20px] border border-border/75 bg-card/80 px-4 py-3.5 pr-10 text-sm font-medium text-foreground shadow-[0_6px_20px_hsl(190_18%_30%_/_0.05)] transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {resources.map((r) => (
                    <option key={r.key} value={r.key}>{formatResourceLabel(r.key)}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              </div>
            </div>
          </div>

        </div>

        <aside className="min-w-0 rounded-[26px] border border-border/75 bg-background/60 p-4 shadow-[0_10px_30px_hsl(190_20%_30%_/_0.05)] lg:sticky lg:top-4">
          <div className="grid gap-4">
            <div className="rounded-[22px] border border-primary/10 bg-[linear-gradient(180deg,hsl(var(--primary)/0.07),hsl(var(--background)/0.85))] p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Consulta integral
              </div>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                A consulta exibe os dados em blocos de 250 registros. Para endpoints paginados na origem, as requisicoes internas podem ser menores para manter a consulta leve e estavel.
              </p>
              <input name="page" type="hidden" value={localPage} readOnly />
              <input name="pageSize" type="hidden" value={localPageSize} readOnly />
              <div className="mt-3 rounded-[18px] border border-border/75 bg-card/85 px-4 py-3 text-sm text-foreground shadow-[0_4px_16px_hsl(190_18%_30%_/_0.05)]">
                Exibicao por bloco: 250 registros.
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* Required Fields */}
      {requiredParameters.length > 0 && (
        <fieldset
          className={cn(
            "space-y-5 rounded-[26px] border border-border/75 bg-background/55 p-5 shadow-[0_10px_30px_hsl(190_20%_30%_/_0.04)] transition-colors",
            invalidFields.length > 0 && "border-destructive bg-destructive/5"
          )}
        >
          <legend className="flex items-center gap-2 px-2 text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
            <AlertCircle className="h-4 w-4 text-warning" aria-hidden="true" />
            Campos obrigatorios ({requiredParameters.length})
          </legend>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {requiredParameters.map((p) => {
              if (p.name === "codigo_municipio") {
                return null;
              }

              if (p.name === "quantidade") {
                return (
                  <input
                    key={p.name}
                    name={p.name}
                    type="hidden"
                    value={quantity}
                    readOnly
                  />
                );
              }

              if (p.name === "deslocamento") {
                return (
                  <input
                    key={p.name}
                    name={p.name}
                    type="hidden"
                    value={offset}
                    readOnly
                  />
                );
              }

              return <div key={p.name}>{renderInput(p)}</div>;
            })}
          </div>
        </fieldset>
      )}

      {/* Optional Fields */}
      {optionalParameters.length > 0 && (
        <div className="overflow-hidden rounded-[26px] border border-border/75 bg-background/50 shadow-[0_10px_30px_hsl(190_20%_30%_/_0.04)]">
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-secondary/40"
            aria-expanded={showOptional}
          >
            <span>Campos opcionais ({optionalParameters.length})</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                showOptional && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>

          {showOptional && (
            <div className="border-t border-border/70 bg-background/60 p-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {optionalParameters.map((p) => (
                  <div key={p.name}>{renderInput(p, true)}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-[26px] border border-border/75 bg-[linear-gradient(180deg,hsl(0_0%_100%_/_0.72),hsl(var(--background)/0.92))] px-5 py-4 shadow-[0_14px_40px_hsl(190_18%_28%_/_0.06)] dark:bg-[linear-gradient(180deg,hsl(var(--card)/0.86),hsl(var(--background)/0.92))] dark:shadow-[0_18px_44px_hsl(200_30%_2%_/_0.28)] sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-foreground">
            Consulta pronta para executar
          </div>
          <p className="text-xs leading-6 text-muted-foreground">
            Use os filtros acima e consulte com o endpoint, municipio e navegacao centralizados no mesmo fluxo.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center justify-center gap-2 rounded-[20px] border border-border/75 bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-w-32"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span>Limpar</span>
        </button>
        <button
          type="submit"
          onClick={() => {
            shouldHighlightValidationRef.current = true;
          }}
          className="flex items-center justify-center gap-2 rounded-[20px] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_12px_28px_hsl(var(--primary)/0.28)] transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-w-44"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Consultar
        </button>
      </div>
    </form>
  );
}
