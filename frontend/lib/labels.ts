const fieldOverrides: Record<string, string> = {
  codigo_municipio: "Codigo do municipio",
  nome_municipio: "Nome do municipio",
  exercicio_orcamento: "Exercicio orcamentario",
  data_referencia: "Data de referencia",
  data_emissao: "Data de emissao",
  data_realizacao: "Data de realizacao",
  data_publicacao: "Data de publicacao",
  data_abertura: "Data de abertura",
  numero_documento: "Numero do documento",
  nome_negociante: "Nome do negociante",
  numero_documento_negociante: "Documento do negociante",
  valor_total_fixado: "Valor total fixado",
  numero_perc_sup: "Percentual de suplementacao",
};

const contextualFieldOverrides: Record<string, Record<string, string>> = {
  contrato: {
    data_contrato: "Data",
    numero_contrato: "Numero",
    numero_contrato_original: "Numero original",
    data_contrato_original: "Data original",
    tipo_contrato: "Tipo",
    modalidade_contrato: "Modalidade",
    data_inicio_vigencia_contrato: "Inicio da vigencia",
    data_fim_vigencia_contrato: "Fim da vigencia",
    descricao_objeto_contrato: "Objeto",
    valor_total_contrato: "Valor total",
  },
  contratados: {
    data_contrato: "Data",
    numero_contrato: "Numero",
  },
  licitacoes: {
    numero_licitacao: "Numero",
    modalidade_licitacao: "Modalidade",
    data_realizacao_autuacao_licitacao: "Data de realizacao/autuacao",
  },
  licitantes: {
    numero_licitacao: "Numero",
    data_realizacao_licitacao: "Data de realizacao",
  },
  agentes_publicos: {
    nome_servidor: "Nome",
    cpf_servidor: "CPF",
    codigo_ingresso: "Ingresso",
    situacao_funcional: "Situacao",
    data_referencia_agente_publico: "Data de referencia",
    codigo_orgao: "Orgao",
    codigo_unidade: "Unidade",
  },
  notas_empenhos: {
    data_referencia_empenho: "Data de referencia",
    numero_empenho: "Numero",
    data_emissao_empenho: "Data de emissao",
  },
  orgaos: {
    codigo_orgao: "Codigo",
    nome_orgao: "Nome",
  },
  programas: {
    codigo_programa: "Codigo",
    nome_programa: "Nome",
  },
  dados_orcamentos: {
    valor_total_fixado_orcamento: "Valor total fixado",
    numero_perc_sup_orcamento: "Percentual de suplementacao",
  },
};

const wordMap: Record<string, string> = {
  codigo: "Codigo",
  municipio: "municipio",
  municipios: "municipios",
  nome: "Nome",
  numero: "Numero",
  contrato: "contrato",
  contratos: "contratos",
  data: "Data",
  tipo: "Tipo",
  modalidade: "Modalidade",
  descricao: "Descricao",
  objeto: "objeto",
  valor: "Valor",
  total: "total",
  original: "original",
  inicio: "inicio",
  fim: "fim",
  vigencia: "vigencia",
  orgao: "orgao",
  exercicio: "Exercicio",
  orcamento: "orcamento",
  referencia: "referencia",
  publicacao: "publicacao",
  edital: "edital",
  realizacao: "realizacao",
  autuacao: "autuacao",
  licitacao: "licitacao",
  aquisicao: "aquisicao",
  bem: "bem",
  emissao: "emissao",
  empenho: "empenho",
  avaliacao: "avaliacao",
  liquidacao: "liquidacao",
  movimentacao: "movimentacao",
  servidor: "servidor",
  ativo: "Ativo",
  cargo: "Cargo",
  cpf: "CPF",
  cnpj: "CNPJ",
  id: "ID",
  ibge: "IBGE",
  geo: "Geo",
  geonames: "Geonames",
};

function splitIdentifier(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .split(/[_\-\s]+/)
    .filter(Boolean);
}

function singularizeToken(token: string) {
  if (token.endsWith("oes")) return `${token.slice(0, -3)}ao`;
  if (token.endsWith("ais")) return `${token.slice(0, -3)}al`;
  if (token.endsWith("eis")) return `${token.slice(0, -3)}el`;
  if (token.endsWith("s") && token.length > 3) return token.slice(0, -1);
  return token;
}

function compactIdentifier(value: string, resourceKey?: string) {
  if (!resourceKey) return value;

  const resourceTokens = new Set(
    splitIdentifier(resourceKey)
      .map((token) => token.toLowerCase())
      .flatMap((token) => [token, singularizeToken(token)])
  );

  const parts = splitIdentifier(value);
  while (parts.length > 1) {
    const token = parts[parts.length - 1]?.toLowerCase() ?? "";
    if (!resourceTokens.has(token) && !resourceTokens.has(singularizeToken(token))) {
      break;
    }

    parts.pop();
  }

  return parts.join("_");
}

export function formatFieldLabel(value: string, resourceKey?: string) {
  const normalized = value.trim();
  if (!normalized) return value;

  const contextualOverride = resourceKey
    ? contextualFieldOverrides[resourceKey]?.[normalized]
    : undefined;
  if (contextualOverride) {
    return contextualOverride;
  }

  const override = fieldOverrides[normalized];
  if (override) {
    return override;
  }

  const compacted = compactIdentifier(normalized, resourceKey);
  const compactOverride = fieldOverrides[compacted];
  if (compactOverride) {
    return compactOverride;
  }

  const words = splitIdentifier(compacted).map((segment, index) => {
    const lower = segment.toLowerCase();
    const mapped = wordMap[lower];
    if (mapped) {
      return mapped;
    }

    if (segment === segment.toUpperCase()) {
      return segment;
    }

    const base = lower.charAt(0).toUpperCase() + lower.slice(1);
    return index === 0 ? base : base.toLowerCase();
  });

  return words.join(" ");
}

export function formatResourceLabel(value: string) {
  const label = formatFieldLabel(value);
  return label.charAt(0).toUpperCase() + label.slice(1);
}
