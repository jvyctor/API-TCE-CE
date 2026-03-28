"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, RotateCcw, ChevronDown, Info, AlertCircle } from "lucide-react";
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
const pageSizeOptions = [25, 50, 100];

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
  const [localPage, setLocalPage] = useState(page);
  const [localPageSize, setLocalPageSize] = useState(pageSize);
  const [showOptional, setShowOptional] = useState(false);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(
    initialFilters.find((f) => f.key === "quantidade")?.value ?? String(pageSize)
  );
  const [offset, setOffset] = useState(
    initialFilters.find((f) => f.key === "deslocamento")?.value ?? String((page - 1) * pageSize)
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
    setQuantity(
      initialFilters.find((f) => f.key === "quantidade")?.value ?? String(pageSize)
    );
    setOffset(
      initialFilters.find((f) => f.key === "deslocamento")?.value ?? String((page - 1) * pageSize)
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

  function syncPagination(nextPage: number, nextPageSize: number) {
    setQuantity(String(nextPageSize));
    setOffset(String(Math.max(0, (nextPage - 1) * nextPageSize)));
  }

  function updatePageSize(nextPageSize: number) {
    setLocalPage(1);
    setLocalPageSize(nextPageSize);
    syncPagination(1, nextPageSize);
  }

  function navigateWithParams(params: URLSearchParams) {
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function buildResourceParams(resourceKey: string) {
    const nextResource = resources.find((resource) => resource.key === resourceKey);
    const params = new URLSearchParams();

    if (!nextResource) return params;

    params.set("resource", resourceKey);
    params.set("page", "1");
    params.set("pageSize", String(localPageSize));

    if (municipalityCode) {
      params.set("codigo_municipio", municipalityCode);
    }

    const requiredNames = new Set(
      nextResource.queryParameters.map((parameter) => parameter.name)
    );

    if (requiredNames.has("quantidade")) {
      params.set("quantidade", String(localPageSize));
    }

    if (requiredNames.has("deslocamento")) {
      params.set("deslocamento", "0");
    }

    return params;
  }

  function getEffectivePageSize(formData?: FormData) {
    const rawQuantity = formData?.get("quantidade");
    const rawPageSize = formData?.get("pageSize");
    const quantityValue = typeof rawQuantity === "string" ? Number(rawQuantity) : Number.NaN;
    const pageSizeValue = typeof rawPageSize === "string" ? Number(rawPageSize) : Number.NaN;

    if (Number.isFinite(quantityValue) && quantityValue > 0) {
      return Math.min(100, Math.max(1, quantityValue));
    }

    if (Number.isFinite(pageSizeValue) && pageSizeValue > 0) {
      return Math.min(100, Math.max(1, pageSizeValue));
    }

    return localPageSize;
  }

  function submitForm() {
    shouldHighlightValidationRef.current = false;
    formRef.current?.requestSubmit();
  }

  function handleReset() {
    setActiveResource(resources[0]?.key ?? "");
    setMunicipalityCode("");
    setLocalPage(1);
    setLocalPageSize(25);
    setQuantity("25");
    setOffset("0");
    window.location.href = "/";
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
    const pageValue = String(formData.get("page") ?? localPage).trim();
    const effectivePageSize = getEffectivePageSize(formData);
    const pageSizeValue = String(effectivePageSize);
    const municipalityValue = String(
      formData.get("codigo_municipio") ?? municipalityCode
    ).trim();

    const isValid = validateRequiredFields(formData, municipalityValue);
    shouldHighlightValidationRef.current = true;

    if (!isValid) {
      return;
    }

    if (resourceValue) {
      params.set("resource", resourceValue);
    }

    params.set("page", pageValue || String(localPage));
    params.set("pageSize", pageSizeValue || String(localPageSize));

    if (municipalityValue) {
      params.set("codigo_municipio", municipalityValue);
    }

    for (const [key, value] of formData.entries()) {
      if (
        key === "resource" ||
        key === "page" ||
        key === "pageSize" ||
        key === "codigo_municipio"
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

      if (key === "quantidade") {
        params.set(key, pageSizeValue);
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

    if (validationRule?.kind === "interval-date") {
      const currentRange = dateRanges[parameter.name] ?? parseIntervalDateValue(filterMap.get(parameter.name) ?? "");
      const hiddenValue = buildIntervalDateValue(currentRange.start, currentRange.end);

      return (
        <div className="space-y-1.5">
          <label htmlFor={`${id}-start`} className="flex items-center gap-2 text-sm font-medium text-foreground">
            {parameter.name}
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
                    return {
                      ...current,
                      [parameter.name]: {
                        start: nextStart,
                        end: previous.end && nextStart && previous.end < nextStart ? "" : previous.end
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
          <p className="text-xs text-primary">Selecione uma data unica ou um intervalo pelo calendario.</p>
        </div>
      );
    }

    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium text-foreground">
          {parameter.name}
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
      className="space-y-6"
    >
      {/* Primary Selection */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="resource" className="block text-sm font-medium text-foreground">
            Endpoint
          </label>
          <div className="relative">
            <select
              id="resource"
              name="resource"
              value={activeResource}
              onChange={(e) => {
                const nextResource = e.target.value;
                setActiveResource(nextResource);
                setLocalPage(1);
                setQuantity(String(localPageSize));
                setOffset("0");
                setDateRanges({});
                navigateWithParams(buildResourceParams(nextResource));
              }}
              className="block w-full appearance-none rounded-md border bg-card px-3 py-2.5 pr-10 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {resources.map((r) => (
                <option key={r.key} value={r.key}>{r.key}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="municipality" className="block text-sm font-medium text-foreground">
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
              className="block w-full appearance-none rounded-md border bg-card px-3 py-2.5 pr-10 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
      </div>

      {/* Pagination */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,180px)_1fr]">
        <div className="space-y-1.5">
          <label htmlFor="page" className="block text-sm font-medium text-foreground">
            Pagina
          </label>
          <input
            id="page"
            name="page"
            type="number"
            min={1}
            value={localPage}
            onChange={(e) => {
              const nextPage = Math.max(1, Number(e.target.value) || 1);
              setLocalPage(nextPage);
              syncPagination(nextPage, localPageSize);
            }}
            className="block w-full rounded-md border bg-card px-3 py-2.5 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <input
          name="pageSize"
          type="hidden"
          value={localPageSize}
          readOnly
        />

        <div className="flex items-end gap-2">
          <button
            type="submit"
            onClick={() => {
              shouldHighlightValidationRef.current = true;
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            Consultar
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center gap-2 rounded-md border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">Limpar</span>
          </button>
        </div>
      </div>

      {/* Required Fields */}
      {requiredParameters.length > 0 && (
        <fieldset
          className={cn(
            "space-y-4 rounded-lg border bg-card/50 p-4 transition-colors",
            invalidFields.length > 0 && "border-destructive bg-destructive/5"
          )}
        >
          <legend className="flex items-center gap-2 px-2 text-sm font-medium text-foreground">
            <AlertCircle className="h-4 w-4 text-warning" aria-hidden="true" />
            Campos obrigatorios ({requiredParameters.length})
          </legend>

          <div className="grid gap-4 sm:grid-cols-2">
            {requiredParameters.map((p) => {
              if (p.name === "codigo_municipio") {
                return (
                  <div key={p.name} className="space-y-1.5">
                    <label className="block text-sm font-medium text-foreground">
                      {p.name}
                      <span className="ml-2 rounded bg-warning/20 px-1.5 py-0.5 text-xs font-medium text-warning">
                        Obrigatorio
                      </span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={municipalityCode}
                      placeholder="Selecione um municipio acima"
                      aria-invalid={invalidFields.includes(p.name)}
                      className={cn(
                        "block w-full rounded-md border bg-secondary px-3 py-2.5 text-sm text-muted-foreground",
                        invalidFields.includes(p.name) && "border-destructive"
                      )}
                    />
                    <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                      <span>Preenchido automaticamente ao selecionar o municipio.</span>
                    </p>
                    {invalidFields.includes(p.name) && (
                      <p className="text-xs font-medium text-destructive">Selecione um municipio para consultar.</p>
                    )}
                  </div>
                );
              }

              if (p.name === "quantidade") {
                return (
                  <div key={p.name} className="space-y-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                      {p.name}
                      <span className="rounded bg-warning/20 px-1.5 py-0.5 text-xs font-medium text-warning">
                        Obrigatorio
                      </span>
                    </label>
                    <input
                      name={p.name}
                      type="hidden"
                      value={quantity}
                      readOnly
                    />
                    <div className="grid grid-cols-3 gap-2">
                      {pageSizeOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => updatePageSize(option)}
                          className={cn(
                            "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                            quantity === String(option)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "bg-card text-foreground hover:bg-secondary"
                          )}
                          aria-pressed={quantity === String(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                    <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                      <span>{renderHelpText(p)}</span>
                    </p>
                  </div>
                );
              }

              if (p.name === "deslocamento") {
                return (
                  <div key={p.name} className="space-y-1.5">
                    <label htmlFor="deslocamento" className="flex items-center gap-2 text-sm font-medium text-foreground">
                      {p.name}
                      <span className="rounded bg-warning/20 px-1.5 py-0.5 text-xs font-medium text-warning">
                        Obrigatorio
                      </span>
                    </label>
                    <input
                      id="deslocamento"
                      name={p.name}
                      type="number"
                      min={0}
                      value={offset}
                      onChange={(e) => {
                        clearInvalidField(p.name);
                        setOffset(e.target.value);
                      }}
                      aria-invalid={invalidFields.includes(p.name)}
                      className={cn(
                        "block w-full rounded-md border bg-card px-3 py-2.5 text-sm text-foreground transition-colors focus:outline-none focus:ring-2",
                        invalidFields.includes(p.name)
                          ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                          : "focus:border-primary focus:ring-primary/20"
                      )}
                    />
                    <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                      <span>{renderHelpText(p)}</span>
                    </p>
                    {invalidFields.includes(p.name) && (
                      <p className="text-xs font-medium text-destructive">Preencha este campo obrigatorio para consultar.</p>
                    )}
                  </div>
                );
              }

              return <div key={p.name}>{renderInput(p)}</div>;
            })}
          </div>
        </fieldset>
      )}

      {/* Optional Fields */}
      {optionalParameters.length > 0 && (
        <div className="rounded-lg border">
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary/50"
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
            <div className="border-t bg-card/50 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {optionalParameters.slice(0, 6).map((p) => (
                  <div key={p.name}>{renderInput(p, true)}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
