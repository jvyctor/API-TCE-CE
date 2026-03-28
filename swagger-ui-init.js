
window.onload = function() {
  // Build a system
  var url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  var options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "paths": {
      "/municipios": {
        "get": {
          "operationId": "MunicipioController_findAll",
          "summary": "Relação de Municípios do Estado do Ceará",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": false,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "nome_municipio",
              "required": false,
              "in": "query",
              "description": "Nome do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "geoibgeId",
              "required": false,
              "in": "query",
              "description": "Referência do município em IBGE",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "geonamesId",
              "required": false,
              "in": "query",
              "description": "Referência do município em geonames.org",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/MunicipioDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação de Informações Básicas - SIM"
          ]
        }
      },
      "/unidades_gestoras": {
        "get": {
          "operationId": "UnidadeGestoraController_findAll",
          "summary": "Relação de Unidades Gestoras do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do exercício do orçamento. Atenção: dados disponíveis a partir de 2008. Adicione “00” ao final do ano. Exemplo: 2010 → 201000",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UnidadeGestoraDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação de Informações Básicas - SIM"
          ]
        }
      },
      "/funcoes": {
        "get": {
          "operationId": "TipoFuncaoController_findAll",
          "summary": "Relação de Tipos de Funções",
          "parameters": [
            {
              "name": "codigo_funcao",
              "required": false,
              "in": "query",
              "description": "Codigo da Funcao",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "nome_funcao",
              "required": false,
              "in": "query",
              "description": "Nome da Funcao",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/TipoFuncaoDTO"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação de Informações Básicas - SIM"
          ]
        }
      },
      "/gestores_unidades_gestoras": {
        "get": {
          "operationId": "GestoresUgController_findAll",
          "summary": "Relação de Gestores Unidades Gestoras do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_unidade_gestora",
              "required": false,
              "in": "query",
              "description": "Código da unidade gestora",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do orgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da unidade orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "cpf_servidor",
              "required": false,
              "in": "query",
              "description": "Forma de ingresso no serviço público municipal",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_ingresso",
              "required": false,
              "in": "query",
              "description": "Forma de ingresso no serviço público municipal",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_vinculo",
              "required": false,
              "in": "query",
              "description": "Tipo de relação com o serviço público",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_expediente",
              "required": false,
              "in": "query",
              "description": "Número do expediente de nomeação ou posse",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_inicio_gestao",
              "required": false,
              "in": "query",
              "description": "Data de início da gestao",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/GestoresUgDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação de Informações Básicas - SIM"
          ]
        }
      },
      "/unidades_federacao": {
        "get": {
          "operationId": "UnidadeFederacaoController_findAll",
          "summary": "Relação de Unidades da Federação",
          "parameters": [
            {
              "name": "codigo_unidade_federacao",
              "required": false,
              "in": "query",
              "description": "Código da Unidade da Federação",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "sigla_unidade_federacao",
              "required": false,
              "in": "query",
              "description": "Sigla da Unidade da Federação",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "nome_unidade_federacao",
              "required": false,
              "in": "query",
              "description": "Nome da Unidade de Federação",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UnidadeFederacaoDTO"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação de Informações Básicas - SIM"
          ]
        }
      },
      "/dados_orcamentos": {
        "get": {
          "operationId": "DadosOrcamentoController_findAll",
          "summary": "Relação de Dados do Orçamento Municipal",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006. adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "nu_lei_orcamento",
              "required": false,
              "in": "query",
              "description": "Número da Lei do Orçamento",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "valor_total_fixado_orcamento",
              "required": false,
              "in": "query",
              "description": "Valor Total Fixado no Orçamento",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "numero_perc_sup_orcamento",
              "required": false,
              "in": "query",
              "description": "Número do Percentual de Suplementação do Orçamento",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "valor_total_supl_orcamento",
              "required": false,
              "in": "query",
              "description": "Valor Total para Suplementações do Orçamento",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_envio_loa",
              "required": false,
              "in": "query",
              "description": "Data de envio do projeto LOA",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            },
            {
              "name": "data_aprov_loa",
              "required": false,
              "in": "query",
              "description": "Data de aprovação do projeto LOA",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            },
            {
              "name": "data_public_loa",
              "required": false,
              "in": "query",
              "description": "Data de Publicação da LOA",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/DadosOrcamentoDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação referente ao Orçamento Municipal - SIM"
          ]
        }
      },
      "/contas_bancarias": {
        "get": {
          "operationId": "ContaBancariaController_findAll",
          "summary": "Relação de Dados das Contas Bancárias dos Municípios",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão enviada no SIM ao final do ano. ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do Órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código na Unidade Orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_banco",
              "required": false,
              "in": "query",
              "description": "Número do Banco",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_agencia",
              "required": false,
              "in": "query",
              "description": "Número da Agência",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_referencia",
              "required": false,
              "in": "query",
              "description": "Data de Referência da Documentação",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ContasBancariasDTO"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação de Informações Básicas - SIM"
          ]
        }
      },
      "/orgaos": {
        "get": {
          "operationId": "OrgaoController_findAll",
          "summary": "Relações de Órgãos Municipais",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: A partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do Órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "nome_orgao",
              "required": false,
              "in": "query",
              "description": "Nome do Órgão",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OrgaoDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação de Informações Básicas - SIM"
          ]
        }
      },
      "/unidades_orcamentarias": {
        "get": {
          "operationId": "UnidadeOrcamentariaController_findAll",
          "summary": "Relação de Unidades Orçamentárias descritas no Orçamento Municipal",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00’ ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do Órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da Unidade Orçamentária",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UnidadeOrcamentariaDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação de Informações Básicas - SIM"
          ]
        }
      },
      "/tipos_unidades_administrativas": {
        "get": {
          "operationId": "TipoUnidadeAdmController_findAll",
          "summary": "Relação de Tipos de Unidades Administrativas",
          "parameters": [
            {
              "name": "codigo_tipo_unidade_administrativa",
              "required": false,
              "in": "query",
              "description": "Código do Tipo de Unidade Administrativa",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "nome_tipo_unidade_administrativa",
              "required": false,
              "in": "query",
              "description": "Nome do Tipo de Unidade Administrativa",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/TipoUnidadeAdmDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação de Informações Básicas - SIM"
          ]
        }
      },
      "/ordenadores": {
        "get": {
          "operationId": "OrdenadorController_findAll",
          "summary": "Relação de Ordenadores de Despesas do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_unidade_gestora",
              "required": false,
              "in": "query",
              "description": "Código da Unidade Gestora",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do Órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da Unidade Orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_referencia_ordenador",
              "required": false,
              "in": "query",
              "description": "Data de Referência da Documentação",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Ordenador"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação de Informações Básicas - SIM"
          ]
        }
      },
      "/contas_extra_orcamentarias": {
        "get": {
          "operationId": "ContasExtraOrcamentariaController_findAll",
          "summary": "Relação de Contas Extra-Orçamentárias do Munícipio",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": " Ano do Exercício do Orçamento. Atenção: A partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_conta_extra_orc",
              "required": false,
              "in": "query",
              "description": "Código da Conta Extra-Orçamentária",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "data_referencia_doc",
              "required": false,
              "in": "query",
              "description": "Data de Referência da Documentação",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "desc_conta_extra_orc",
              "required": false,
              "in": "query",
              "description": "Descrição da Conta Extra-Orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "vl_saldo_ini",
              "required": false,
              "in": "query",
              "description": "Situação Patrimonial e Saldo no Início do Exercício",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ContasExtraOrcamentaria"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação de Informações Básicas - SIM"
          ]
        }
      },
      "/programas": {
        "get": {
          "operationId": "ProgramaController_findAll",
          "summary": "Relação de Programas de Governo estabelecidos na Lei de Orçamento Municipal",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_programa",
              "required": false,
              "in": "query",
              "description": "Código do Programa",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "nome_programa",
              "required": false,
              "in": "query",
              "description": "Nome do Programa",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Programa"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação referente ao Orçamento Municipal - SIM"
          ]
        }
      },
      "/balancete_receita_orcamentaria": {
        "get": {
          "operationId": "BalanceteRecOrcController_findAll",
          "summary": "Relação de Balancetes de Receitas Orçamentárias do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "data_referencia",
              "required": true,
              "in": "query",
              "description": "Data de Referência da Documentação. Utilize o formato “yyyymm”. Exemplo: 201001. ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do Órgão",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da Unidade Orçamentária",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_rubrica",
              "required": false,
              "in": "query",
              "description": "Código Rubrica Orçamentária",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/BalanceteRecOrc"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação referente aos Balancetes - SIM"
          ]
        }
      },
      "/balancete_despesa_orcamentaria": {
        "get": {
          "operationId": "BalanceteDespOrcController_findAll",
          "summary": "Relação de Balancetes de Receitas Orçamentárias do Município ",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "data_referencia",
              "required": true,
              "in": "query",
              "description": "Data de Referência da Documentação. Utilize o formato “yyyymm”. Exemplo: 201001. ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados (Count). Máximo: 100.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset).  ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do Órgão",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Codigo da unidade orcamentaria",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_rubrica",
              "required": false,
              "in": "query",
              "description": "Código Rubrica Orçamentária",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/BalanceteDespOrc"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação referente aos Balancetes - SIM"
          ]
        }
      },
      "/balancete_despesa_extra_orcamentaria": {
        "get": {
          "operationId": "BalanceteDespExtOrcController_findAll",
          "summary": "Relação de Balancetes Extra-Orçamentárias pagas pelo Município ",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_referencia",
              "required": true,
              "in": "query",
              "description": "Data de Referência da Documentação. Utilize o formato “yyyymm”. Exemplo: 201001.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do Órgão",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da Unidade Orçamentária",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_conta_extraorcamentaria",
              "required": false,
              "in": "query",
              "description": "Código da Conta Extra-orçamentária ",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CreateBalanceteDespExtOrcDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação referente aos Balancetes - SIM"
          ]
        }
      },
      "/balancete_receita_extra_orcamentaria": {
        "get": {
          "operationId": "BalanceteRecExtOrcController_findAll",
          "summary": "Relação de Balancetes de Receitas Extra-Orçamentárias arrecadadas pelo município mensalmente",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "data_referencia",
              "required": true,
              "in": "query",
              "description": "Data de Referência da Documentação. Utilize o formato “yyyymm”. Exemplo: 201001.",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do Órgão",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da Unidade Orçamentária",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_conta_extraorcamentaria",
              "required": false,
              "in": "query",
              "description": "Código da Conta Extra-orçamentária",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "tipo_balancete",
              "required": false,
              "in": "query",
              "description": "Tipo do Balancete",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "valor_anulacoes_empenhos_no_mes",
              "required": false,
              "in": "query",
              "description": "Valor das anulações de empenhos no mês",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "valor_nulacoes_dotacao_ate_mes",
              "required": false,
              "in": "query",
              "description": "Valor das anulacoes de dotação ate mês",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "valor_arrecadacao_empenhos_no_mes",
              "required": false,
              "in": "query",
              "description": "Valor da arrecadação no mês",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "valor_arrecadacao_dotacao_ate_mes",
              "required": false,
              "in": "query",
              "description": "Valor da arrecadação ate mês",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/BalanceteRecExtOrcDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação referente aos Balancetes - SIM"
          ]
        }
      },
      "/despesa_categoria_economica": {
        "get": {
          "operationId": "DespesaCategoriaEconomiaController_findAll",
          "summary": "Relação de Orçamentos de Despesas por Categoria Econômica do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do Órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da Unidade Orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_elemento_despesa",
              "required": false,
              "in": "query",
              "description": "Código do Elemento de Despesa",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/DespesaCategoriaEconomia"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação referente ao Orçamento Municipal - SIM"
          ]
        }
      },
      "/taloes_extras": {
        "get": {
          "operationId": "TaloesExtraController_findAll",
          "summary": "Relação de Talões de Receitas Extra-Orçamentárias do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do Órgão",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da Unidade Orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "dt_talao_receita_tx",
              "required": false,
              "in": "query",
              "description": "Data do Talão de Receita Extra-orçamentária",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/TaloesExtra"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação Comprobatoria de Receitas - SIM"
          ]
        }
      },
      "/despesa_elemento_projeto": {
        "get": {
          "operationId": "DespesaElementoProjetoController_findAll",
          "summary": "Relação de Orçamentos de Despesas por Projetos, Atividades e Elemento do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do Órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da Unidade Orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_funcao",
              "required": false,
              "in": "query",
              "description": "Código da Função",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_subfuncao",
              "required": false,
              "in": "query",
              "description": "Código da Sub-função",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_programa",
              "required": false,
              "in": "query",
              "description": "Código do Programa",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_projeto_atividade",
              "required": false,
              "in": "query",
              "description": "Codigo de Projeto ou Atividade",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_projeto_atividade",
              "required": false,
              "in": "query",
              "description": "Número do Projeto ou Atividade",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_subprojeto_atividade",
              "required": false,
              "in": "query",
              "description": "Número do Sub-projeto ou Sub-atividade",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_elemento_despesa",
              "required": false,
              "in": "query",
              "description": "Código do Elemento de Despesa",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "tipo_fonte",
              "required": false,
              "in": "query",
              "description": "Código do Grupo da Fonte",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_fonte",
              "required": false,
              "in": "query",
              "description": "Código da Especificação da Fonte",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "valor_atual_categoria_economica",
              "required": false,
              "in": "query",
              "description": "Valor Atual",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "valor_orcado_categoria_economica",
              "required": false,
              "in": "query",
              "description": "Valor Orçado",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/DespesaElementoProjeto"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação referente ao Orçamento Municipal - SIM"
          ]
        }
      },
      "/orcamento_receita": {
        "get": {
          "operationId": "OrcamentoReceitaController_findAll",
          "summary": "Relação de Despesas por Categoria Econômica do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do Órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da Unidade Orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_rubrica",
              "required": false,
              "in": "query",
              "description": "Código Rubrica Orçamentária",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/OrcamentoReceita"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação referente ao Orçamento Municipal - SIM"
          ]
        }
      },
      "/despesa_projeto_atividade": {
        "get": {
          "operationId": "DespesaProjetoAtividadeController_findAll",
          "summary": "Relação de Orçamentos de Despesas por Projetos e Atividades do Município ",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do Órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da Unidade Orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_funcao",
              "required": false,
              "in": "query",
              "description": "Função do Código",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/DespesaProjetoAtividade"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação referente ao Orçamento Municipal - SIM"
          ]
        }
      },
      "/taloes_receitas": {
        "get": {
          "operationId": "TaloesReceitasController_findAll",
          "summary": "Relação de Talões de Receitas Orçamentárias do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do Órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da Unidade Orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_rubrica",
              "required": false,
              "in": "query",
              "description": "Código Rubrica Orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_referencia",
              "required": false,
              "in": "query",
              "description": "Data de Referência da Documentação. Utilize o formato “yyyymm”. Exemplo: 201001. ",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/TaloesReceita"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação Comprobatoria de Receitas - SIM"
          ]
        }
      },
      "/anulacoes_taloes_receitas": {
        "get": {
          "operationId": "AnulacoesTaloesRecController_getAll",
          "summary": "Relação de Anulações de Talões de Receitas Orçamentárias do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do Órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da Unidade Orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_rubrica",
              "required": false,
              "in": "query",
              "description": "Código Rubrica Orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_referencia",
              "required": false,
              "in": "query",
              "description": "Data de Referência da Documentação da Anulação. Atencao: Apartir do ano de 2007 adicione 00 ao final do ano. Exemplo: para o ano 2010 use 201000. Já nos anos de 2003 à 2006 adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/AnulacoesTaloesRec"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação Comprobatoria de Receitas - SIM"
          ]
        }
      },
      "/anulacoes_taloes_extras": {
        "get": {
          "operationId": "AnulacoesTaloesExtController_findAll",
          "summary": "Relação de Anulações de Talões de Receitas Extra-Orçamentárias do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do Órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da Unidade Orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_anulacao",
              "required": false,
              "in": "query",
              "description": "Data da Anulação do Talão de Receita Extra-orçamentária",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/AnulacoesTaloesExt"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação Comprobatoria de Receitas - SIM"
          ]
        }
      },
      "/publicacoes_editais_licitacoes": {
        "get": {
          "operationId": "PublicEditaisLicitacoesController_findAll",
          "summary": "Relação de Publicações de Processos Administrativos para Aquisição de Bens e Serviços do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "data_realizacao_licitacao",
              "required": true,
              "in": "query",
              "description": "Data de Autuação Processo Administrativo para Aquisição de Bens e Serviços. Utilize o seguinte formato: yyyy-mm-dd. Para pesquisar intervalos utilize o seguinte formato: yyyy-mm-dd_yyyy-mm-dd. Exemplo: 2010-01-01_2010-01-31",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_licitacao",
              "required": false,
              "in": "query",
              "description": "Número do Processo Administrativo para Aquisição de Bens e Serviços ",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_sequencial_publicacao_edital",
              "required": false,
              "in": "query",
              "description": "Número Sequencial da Publicação do Processo Administrativo para Aquisição de Bens e Serviços",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_publicacao_edital",
              "required": false,
              "in": "query",
              "description": "Código do Veículo de Publicaçãoo do Processo Administrativo para Aquisição de Bens e Serviços",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "descricao_publicacao_edital",
              "required": false,
              "in": "query",
              "description": "Descrição do Veículo de Publicação do Processo Administrativo para Aquisição de Bens e Serviços",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_publicacao_edital",
              "required": false,
              "in": "query",
              "description": "Data da Publicação do Processo Administrativo para Aquisição de Bens e Serviços",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PublicEditaisLicitacoe"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentacao referente a Processos de Aquisicoes e Contratos - SIM"
          ]
        }
      },
      "/contratados": {
        "get": {
          "operationId": "ContratadosController_findAll",
          "summary": "Relação de Contratados pelo Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "data_contrato",
              "required": true,
              "in": "query",
              "description": "Data que o Contrato foi firmado. Utilize o formato “yyyy-mm-dd” e para pesquisar intervalos “yyyy-mm-dd_yyyy-mm-dd”. Exemplo 2010-01-01 e intervalos 2010-01-01_2010-01-31",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_contrato",
              "required": false,
              "in": "query",
              "description": "Número do contrato",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_documento_negociante",
              "required": false,
              "in": "query",
              "description": "Número do Documento de Identificação do Contratado",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "nome_negociante",
              "required": false,
              "in": "query",
              "description": "Nome ou Razão Social do Contratado",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Contratado"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentacao referente a Processos de Aquisicoes e Contratos - SIM"
          ]
        }
      },
      "/itens_licitacoes": {
        "get": {
          "operationId": "ItensLicitacaoController_findAll",
          "summary": "Relação de Itens de Licitações do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "data_realizacao_licitacao",
              "required": true,
              "in": "query",
              "description": "Data de Autuação Processo Administrativo para Aquisição de Bens e Serviços. Utilize o seguinte formato: yyyy-mm-dd. Para pesquisar intervalos yyyy-mm-dd_yyyy-mm-dd. Exemplo 2010-01-01 e intervalos 2010-01-01_2010-01-31",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_licitacao",
              "required": false,
              "in": "query",
              "description": "Número do Processo Administrativo para Aquisição de Bens e Serviços.",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ItensLicitacao"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentacao referente a Processos de Aquisicoes e Contratos - SIM"
          ]
        }
      },
      "/licitacoes": {
        "get": {
          "operationId": "LicitacaoController_findAll",
          "summary": "Relação de Licitações do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_realizacao_autuacao_licitacao",
              "required": true,
              "in": "query",
              "description": "Data da Realização da Licitação até 2009 e Data da Autuação a partir de 2010. Utilize o seguinte formato: yyyy-mm-dd. Para pesquisar intervalos yyyy-mm-dd_yyyy-mm-dd. EX: 2010-01-01 e intervalos 2010-01-01_2010-01-31",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_licitacao",
              "required": false,
              "in": "query",
              "description": "Número da Licitação",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "modalidade_licitacao",
              "required": false,
              "in": "query",
              "description": "Modalidade da licitação",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "tp_licitacao_li",
              "required": false,
              "in": "query",
              "description": "Tipo de licitação",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "modalidade_processo_administrativo",
              "required": false,
              "in": "query",
              "description": "Modalidade da licitação",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/LicitacaoDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentacao referente a Processos de Aquisicoes e Contratos - SIM"
          ]
        }
      },
      "/licitantes": {
        "get": {
          "operationId": "LicitantesController_findAll",
          "summary": "Relação de Licitantes que participaram de processos de aquisições de bens/serviços no Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_realizacao_licitacao",
              "required": true,
              "in": "query",
              "description": "Data de Autuação Processo Administrativo para Aquisição de Bens e Serviços. Utilize o seguinte formato: yyyy-mm-dd. Para pesquisar intervalos yyyy-mm-dd_yyyy-mm-dd. Exemplo 2010-01-01 e intervalos 2010-01-01_2010-01-31",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "numero_licitacao",
              "required": false,
              "in": "query",
              "description": "Número da Licitação",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_documento_negociante",
              "required": false,
              "in": "query",
              "description": "Número do Documento de Identificação do Contratado",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "nome_negociante",
              "required": false,
              "in": "query",
              "description": "Nome ou Razão Social do Licitante ou Fornecedor",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Licitante"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentacao referente a Processos de Aquisicoes e Contratos - SIM"
          ]
        }
      },
      "/comissoes-licitacoes": {
        "get": {
          "operationId": "ComissoesLicitacaoController_findAll",
          "summary": "Relação de Comissões de Licitação criadas no Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "data_criacao_comissao",
              "required": false,
              "in": "query",
              "description": "Data de Criação da Comissão de Licitacao. Utilize o formato “yyyy-mm-dd” e para pesquisar intervalos “yyyy-mm-dd_yyyy-mm-dd”. Exemplo: 2010-01-01 e intervalos 2010-01-01_2010-01-31",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ComissoesLicitacao"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentacao referente a Processos de Aquisicoes e Contratos - SIM"
          ]
        }
      },
      "/dotacoes_licitacoes": {
        "get": {
          "operationId": "DotacoesLicitacaoController_findAll",
          "summary": "Relação de Dotações Utilizadas para Aquisições de Bens e Serviço do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_realizacao_licitacao",
              "required": true,
              "in": "query",
              "description": "Data de Autuação Processo Administrativo para Aquisição de Bens e Serviços. Utilize o seguinte formato: yyyy-mm-dd  para pesquisar intervalos yyyy-mm-dd_yyyy-mm-dd.",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "numero_licitacao",
              "required": false,
              "in": "query",
              "description": "Número da Licitação",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": false,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: adicione “00” ao final do ano. Exemplo: para o ano 2010 use 201000.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do Órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da Unidade Orçamentária",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/DotacoesLicitacao"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentacao referente a Processos de Aquisicoes e Contratos - SIM"
          ]
        }
      },
      "/contrato": {
        "get": {
          "operationId": "ContratoController_findAll",
          "summary": "Relação de Contratos firmados no Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_contrato",
              "required": true,
              "in": "query",
              "description": "Data que o Contrato foi firmado. Utilize o formato “yyyy-mm-dd” e para pesquisar intervalos “yyyy-mm-dd_yyyy-mm-dd”. Exemplo: 2010-01-01 e intervalos 2010-01-01_2010-01-31",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "numero_contrato",
              "required": false,
              "in": "query",
              "description": "Número do contrato",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "tipo_contrato",
              "required": false,
              "in": "query",
              "description": "Tipo de Contrato",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "modalidade_contrato",
              "required": false,
              "in": "query",
              "description": "Modalidade do Contrato",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Contrato"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentacao referente a Processos de Aquisicoes e Contratos - SIM"
          ]
        }
      },
      "/despesas_extra_orcamentaria": {
        "get": {
          "operationId": "DespesasExtOrcController_findAll",
          "summary": "Relação de Despesas Extra-Orçamentárias do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: adicione “00” ao final do ano. Exemplo: para o ano 2010 use 201000.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do Órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_referencia_documentacao",
              "required": false,
              "in": "query",
              "description": "Ano do Referencia de Documentação. Atenção: adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da Unidade Orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_conta_extraorcamentaria",
              "required": false,
              "in": "query",
              "description": "Código da conta Extraorçamentária ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "numero_banco",
              "required": false,
              "in": "query",
              "description": "Número do banco",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_agencia",
              "required": false,
              "in": "query",
              "description": "Número da agência",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_conta",
              "required": false,
              "in": "query",
              "description": "Número da conta",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_documento_despesa_extra",
              "required": false,
              "in": "query",
              "description": "Número do Cheque, Documento Bancário ou Controle de Caixa que identifique o saque.",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/DespesasExtOrc"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação Comprobatoria de Despesas - SIM"
          ]
        }
      },
      "/notas_fiscais_liquid": {
        "get": {
          "operationId": "NfLiquidadasController_findAll",
          "summary": "Relação de Notas Fiscais Liquidadas do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_referencia_nota_fiscal",
              "required": true,
              "in": "query",
              "description": "Data de Referência da Documentação. Ex: 200201",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": false,
              "in": "query",
              "description": "Ano do Exercício do Orcamento. Atencao: Apartir do ano de 2007 adicione 00 ao final do ano. Exemplo: para o ano 2010 use 201000. Já nos anos de 2003 à 2006 adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano. ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "quantidade",
              "required": false,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": false,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da unidade orçamentária ",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "tipo_nota_fiscal",
              "required": false,
              "in": "query",
              "description": "Tipo de Nota Fiscal",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_emissao_nota_fiscal",
              "required": false,
              "in": "query",
              "description": "Data da Emissão da Nota Fiscal",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/NfLiquidadasController"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentacao Comprobatoria de Despesas - SIM"
          ]
        }
      },
      "/itens_notas_fiscais": {
        "get": {
          "operationId": "ItensNfController_findAll",
          "summary": "Relação de Itens das Notas Fiscais emitidas no Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: para o ano 2010 use 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados (Count). Máximo: 100.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset).  ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da unidade orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_emissao",
              "required": false,
              "in": "query",
              "description": "Data da Emissão da Nota de Empenho",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            },
            {
              "name": "numero_nota_empenho",
              "required": false,
              "in": "query",
              "description": " Número da Nota de Empenho",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_liquidacao",
              "required": false,
              "in": "query",
              "description": "Data da Liquidação da Despesa",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            },
            {
              "name": "tipo_nota_fiscal",
              "required": false,
              "in": "query",
              "description": "Tipo da Nota Fiscal",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_nota_fiscal",
              "required": false,
              "in": "query",
              "description": "Número da Nota Fiscal",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ItensNf"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação Comprobatoria de Despesas - SIM"
          ]
        }
      },
      "/estornos_pagamentos": {
        "get": {
          "operationId": "EstornosPagController_findAll",
          "summary": "Relação de Estornos de Pagamentos do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: para o ano 2010 use 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados (Count). Máximo: 100.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset).  ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do órgão",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da unidade orçamentária",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "data_estorno_pagamento",
              "required": false,
              "in": "query",
              "description": "Data do Estorno de Pagamento",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            },
            {
              "name": "data_referencia_estorno_pagamento",
              "required": false,
              "in": "query",
              "description": "Data de Referência da Documentação",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/EstornosPag"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação Comprobatoria de Despesas - SIM"
          ]
        }
      },
      "/liquidacoes": {
        "get": {
          "operationId": "LiquidacaoController_findAll",
          "summary": "Relação de Liquidações das Despesa do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: para o ano 2010 use 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da unidade orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_liquidacao",
              "required": false,
              "in": "query",
              "description": "Data da Liquidação da Despesa",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            },
            {
              "name": "data_referencia_liquidacao",
              "required": false,
              "in": "query",
              "description": "Data de Referência da Documentação",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Liquidacao"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentacao Comprobatoria de Despesas - SIM"
          ]
        }
      },
      "/notas_pagamentos": {
        "get": {
          "operationId": "NotasPagamentosController_findAll",
          "summary": "Relação das Notas de Pagamento do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: para o ano 2010 use 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados (Count). Máximo: 100.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset).  ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da unidade orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_emissao_empenho",
              "required": false,
              "in": "query",
              "description": "Data da Emissao da Nota de Empenho",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            },
            {
              "name": "numero_empenho",
              "required": false,
              "in": "query",
              "description": "Número da Nota de Empenho",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_nota_pagamento",
              "required": false,
              "in": "query",
              "description": "Número da Nota de Pagamento",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_referencia",
              "required": false,
              "in": "query",
              "description": "Data de Referencia da Documentação: YYYYMM. Exemplo: 201201.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "data_nota_pagamento",
              "required": false,
              "in": "query",
              "description": "Data da Nota de Pagamento",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/NotasPagamento"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação Comprobatoria de Despesas - SIM"
          ]
        }
      },
      "/notas_fiscais": {
        "get": {
          "operationId": "NotasFiscaisController_findAll",
          "summary": "Relação de Notas Fiscais emitidas no Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: para o ano 2010 use 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados (Count). Máximo: 100.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da unidade orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_liquidacao",
              "required": false,
              "in": "query",
              "description": "Data da liquidação da despesa",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            },
            {
              "name": "tipo_nota_fiscal",
              "required": false,
              "in": "query",
              "description": "Tipo de Nota Fiscal",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_referencia",
              "required": false,
              "in": "query",
              "description": "Data de Referencia da Documentação",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/NotasFiscai"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação Comprobatoria de Despesas - SIM"
          ]
        }
      },
      "/negociantes": {
        "get": {
          "operationId": "NegocianteController_findAll",
          "summary": "Relação de Negociantes",
          "parameters": [
            {
              "name": "numero_documento_negociante",
              "required": false,
              "in": "query",
              "description": "Número do Documento do Negociante",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "nome_negociante",
              "required": true,
              "in": "query",
              "description": "Nome do negociante",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Negociante"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentacao Comprobatoria de Despesas - SIM"
          ]
        }
      },
      "/anulacoes_empenhos": {
        "get": {
          "operationId": "AnulacoesEmpenhosController_findAll",
          "summary": "Relação de Notas de Anulações de Empenhos do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: para o ano 2010 use 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados (Count). Máximo: 100.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da unidade orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_referencia_anulacao",
              "required": false,
              "in": "query",
              "description": "Data de Referência da Documentação da Anulação",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "data_anulacao",
              "required": false,
              "in": "query",
              "description": "Data da Anulacao da Nota de Empenho. Utilize o formto “yyyymmdd”,  e para pesquisar intervalos “yyyymmdd_yyyymmdd”. Exemplo: 20100101 e intervalos 20100101_20100131",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/AnulacoesEmpenhoDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação Comprobatoria de Despesas - SIM"
          ]
        }
      },
      "/recursos_empenhos": {
        "get": {
          "operationId": "RecursosEmpenhosController_findAll",
          "summary": "Relação de Recursos para empenhos do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: para o ano 2010 use 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da unidade orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "tipo_recurso_empenho",
              "required": false,
              "in": "query",
              "description": "Tipo de recurso",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_celebracao_convenio",
              "required": false,
              "in": "query",
              "description": "Data da Celebracao. Utilize o formato “yyyymmdd”, e para pesquisar intervalos “yyyymmdd_yyyymmdd”. Exemplo 20100101 e intervalos 20100101_20100131",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/RecursosEmpenho"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação Comprobatoria de Despesas - SIM"
          ]
        }
      },
      "/notas_empenhos": {
        "get": {
          "operationId": "NotasEmpenhosController_findAll",
          "summary": "Relação de Notas de Empenho expedidas no Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "data_referencia_empenho",
              "required": true,
              "in": "query",
              "description": "Data de Referência da Documentação. Utilize o formato \"yyyymm”. Exemplo: 201001.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": true,
              "in": "query",
              "description": "Código do órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": false,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Utilize o formato \"yyyymm”. Exemplo: 201001.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da unidade orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_emissao_empenho",
              "required": false,
              "in": "query",
              "description": "Data da Emissão da Nota de Empenho. Utilize o seguinte formato yyyy-mm-dd. Para pesquisar intervalos yyyy-mm-dd_yyyy-mm-dd. Exemplo 2010-01-01 e intervalos 2010-01-01_2010-01-31.",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_empenho",
              "required": false,
              "in": "query",
              "description": "Número da Nota de Empenho",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_documento_negociante",
              "required": false,
              "in": "query",
              "description": "Dados do Documento de Identificação do Credor",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_licitacao",
              "required": false,
              "in": "query",
              "description": "Número do processo administrativo para Aquisição de Bens e Serviços.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_tipo_negociante",
              "required": false,
              "in": "query",
              "description": "Código do tipo de negociante",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "nome_negociante",
              "required": false,
              "in": "query",
              "description": "Nome do negociante",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "nome_municipio_negociante",
              "required": false,
              "in": "query",
              "description": "Município do negociante",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_uf",
              "required": false,
              "in": "query",
              "description": "Código UF",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/NotasEmpenho"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentacao Comprobatoria de Despesas - SIM"
          ]
        }
      },
      "/estornos_liquidacoes": {
        "get": {
          "operationId": "EstornosLiquidacaoController_findAll",
          "summary": "Relação de Estornos de Liquidação do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: para o ano 2010 use 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da unidade orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_estorno_liquidacao",
              "required": false,
              "in": "query",
              "description": "Data do Estorno da Liquidacao. Utilize o formato “yyyy-mm-dd”, e para pesquisar intervalos “yyyy-mm-dd_yyyy-mm-dd”. Exemplo 20100101 e intervalos 20100101_20100131",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_referencia_estorno_liquidacao",
              "required": false,
              "in": "query",
              "description": "Data de Referência da Documentação",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/EstornosLiquidacao"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação Comprobatoria de Despesas - SIM"
          ]
        }
      },
      "/cheques_notas_pagamentos": {
        "get": {
          "operationId": "CheqNotasPagController_findAll",
          "summary": "Relação de Cheques das Notas de Pagamento do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_referencia_cheque",
              "required": true,
              "in": "query",
              "description": "Data de Referência da Documentação. Ex: 201201 (ano e mês).",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da unidade orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": false,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: para o ano 2010 use 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "data_emissao_empenho",
              "required": false,
              "in": "query",
              "description": "Data da Emissão da Nota de Empenho",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            },
            {
              "name": "numero_empenho",
              "required": false,
              "in": "query",
              "description": "Número da Nota de Empenho",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_pagamento",
              "required": false,
              "in": "query",
              "description": "Número da Nota de Pagamento",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_banco",
              "required": false,
              "in": "query",
              "description": "Número do Banco",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_agencia",
              "required": false,
              "in": "query",
              "description": "Número da Agência Bancária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "numero_conta",
              "required": false,
              "in": "query",
              "description": "Número da Conta-corrente",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_emissao_cheque",
              "required": false,
              "in": "query",
              "description": "Data da Emissão do Cheque",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            },
            {
              "name": "tipo_documento_bancario",
              "required": false,
              "in": "query",
              "description": "Tipo Cheque ou outro Documento Bancário. Utilize “1” para Cheque ou “2” para Documento Bancário que não seja cheque.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do órgão",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CheqNotasPag"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação Comprobatoria de Despesas - SIM"
          ]
        }
      },
      "/itens_remuneratorios": {
        "get": {
          "operationId": "ItemRemuneratorioController_findall",
          "summary": "Relação de Itens Remuneratórios do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município ",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_item",
              "required": false,
              "in": "query",
              "description": "Código item",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "tipo_item",
              "required": false,
              "in": "query",
              "description": "Tipo do item",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ItemRemuneratorio"
                  }
                }
              }
            }
          },
          "tags": [
            "Cadastro de Pessoal e Folha - SIM"
          ]
        }
      },
      "/desligamentos": {
        "get": {
          "operationId": "DesligamentosController_findall",
          "summary": "Relação dos desligamentos dos agentes públicos municipais",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: para o ano 2010 use 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da unidade orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_ingresso",
              "required": false,
              "in": "query",
              "description": "Forma de Ingresso no Serviço Publico Municipal",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_vinculo",
              "required": false,
              "in": "query",
              "description": "Tipo de relação com o serviço publico",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/Desligamento"
                  }
                }
              }
            }
          },
          "tags": [
            "Cadastro de Pessoal e Folha - SIM"
          ]
        }
      },
      "/agentes_publicos": {
        "get": {
          "operationId": "AgentesPublicosController_findall",
          "summary": "Relação de Dados Funcionais dos Agentes Públicos Municipais",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: para o ano 2010 use 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da unidade orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_ingresso",
              "required": false,
              "in": "query",
              "description": "Forma de Ingresso no Serviço Publico Municipal",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "situacao_funcional",
              "required": false,
              "in": "query",
              "description": "Situação Funcional",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_referencia_agente_publico",
              "required": false,
              "in": "query",
              "description": "Data de Referência da Documentação: utilize o formato “yyyymm”. Exemplo: 201001",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            },
            {
              "name": "nome_servidor",
              "required": false,
              "in": "query",
              "description": "Nome do Servidor Municipal",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/AgentesPublico"
                  }
                }
              }
            }
          },
          "tags": [
            "Cadastro de Pessoal e Folha - SIM"
          ]
        }
      },
      "/reaval_baixas_bens": {
        "get": {
          "operationId": "ReavalBaixasBensController_findAll",
          "summary": "Relação de Ajustes / Reavaliações Patrimonial ou Desincorporação de bem do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_avaliacao",
              "required": true,
              "in": "query",
              "description": "Data da avaliação. Utilize o seguinte formato yyyy-mm-dd. Para pesquisar intervalos yyyy-mm-dd_yyyy-mm-dd. Exemplo 2010-01-01 e intervalos 2010-01-01_2010-01-31.",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "numero_registro_bem",
              "required": false,
              "in": "query",
              "description": "Número do Registro do Bem",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_referencia",
              "required": false,
              "in": "query",
              "description": "Data de Referencia da Documentação. Utilize o seguinte formato yyyymm. Exemplo 201001",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do orgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Codigo da unidade orçamentária",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/ReavalBaixasBensController"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentacao de Controle do Patrimonio Municipal - SIM"
          ]
        }
      },
      "/unidade_orcamentaria_bens": {
        "get": {
          "operationId": "UndOrcamentariaBensController_findAll",
          "summary": "Relação de Controles de Bens por Unidade Orçamentária do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_referencia",
              "required": true,
              "in": "query",
              "description": "Data da referência, YYYYMM. Ex: 201201",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "numero_registro_bem",
              "required": false,
              "in": "query",
              "description": "Número do registro do Bem",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_disponibilizacao",
              "required": false,
              "in": "query",
              "description": "Data da disponibilização. Utilize o formato “yyyy-mm-dd\" ou para intervalos “yyyy-mm-dd_yyyy-mm-dd\".",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da unidade orçamentária",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UndOrcamentariaBenDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentacao de Controle do Patrimonio Municipal - SIM"
          ]
        }
      },
      "/bens_municipios": {
        "get": {
          "operationId": "BensMunicipiosController_findAll",
          "summary": "Relação de Bens Incorporados ao Patrimônio do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_aquisicao_bem",
              "required": true,
              "in": "query",
              "description": "Data de Aquisicao do Bem.. Utilize o seguinte formato yyyy-mm-dd e para pesquisar intervalos yyyy-mm-dd_yyyy-mm-dd. Exemplo 20100101 e intervalos 2010-01-01_2010-01-31.",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "numero_registro_bem",
              "required": false,
              "in": "query",
              "description": "Número do Registro do Bem",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "data_referencia_bem",
              "required": false,
              "in": "query",
              "description": "Data de Referência do Bem, YYYYMM. Ex: 201201.",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CreateBensMunicipioDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentacao de Controle do Patrimonio Municipal - SIM"
          ]
        }
      },
      "/empenhos_bens": {
        "get": {
          "operationId": "EmpenhosBensController_findAll",
          "summary": "Relação de Bens Incorporados ao Patrimônio do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "numero_registro_bem",
              "required": false,
              "in": "query",
              "description": "Número do Registro do Bem",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da unidade orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_emissao_empenho",
              "required": false,
              "in": "query",
              "description": "Data da Emissão do Empenho do Bem",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            },
            {
              "name": "data_referencia",
              "required": false,
              "in": "query",
              "description": "Data de Referência, YYYYMM. Ex: 201201.",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/EmpenhosBensController"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentacao de Controle do Patrimonio Municipal - SIM"
          ]
        }
      },
      "/fontes_anulacao": {
        "get": {
          "operationId": "FontesAnulacaoController_getAll",
          "summary": "Relação de Fontes para Abertura de Crédito por Anulação de Dotação do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_abertura_credito",
              "required": true,
              "in": "query",
              "description": "Data da Abertura de Crédito. Utilize o seguinte formato yyyy-mm-dd e para pesquisar intervalos yyyy-mm-dd_yyyy-mm-dd. Exemplo 20100101 e intervalos 2010-01-01_2010-01-31",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": false,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: para o ano 2010 use 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do Orgão da Dotação Anulada",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade_orcamentaria",
              "required": false,
              "in": "query",
              "description": "Código da Unidade Orçamentaria da Dotação Anulada",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/FontesAnulacaoController"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentacao referente a Abertura de Creditos Adicionais - SIM"
          ]
        }
      },
      "/gestores_unidades_orcamentarias_2007": {
        "get": {
          "operationId": "GestoresUoController_findAll",
          "summary": "Relação de Gestores do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": false,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do orgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da unidade orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "cpf_servidor",
              "required": false,
              "in": "query",
              "description": "Numero do CPF do gestor",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_fim_gestao",
              "required": false,
              "in": "query",
              "description": "Data de Inicio da Gestao. Utilize o seguinte formato yyyy-mm-dd e para pesquisar intervalos yyyy-mm-dd_yyyy-mm-dd. Exemplo 2010-01-01 e intervalos 2010-01-01_2010-01-31",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_referencia_gestor",
              "required": false,
              "in": "query",
              "description": "Data de Referencia da Documentacao",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/GestoresUoDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação de Informações Básicas - SIM"
          ]
        }
      },
      "/realocacoes_orcamentarias": {
        "get": {
          "operationId": "RealocOrcamentariasController_findAll",
          "summary": "Relação de Remanejamentos, Transposições e Transferências de Dotações do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Codigo do municipio",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orcamento. Atencao: Apartir do ano de 2007 adicione 00 ao final do ano. Exemplo: para o ano 2010 use 201000. Já nos anos de 2003 à 2006 adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "data_alteracao",
              "required": false,
              "in": "query",
              "description": "Data da Alteração do Orçamento",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Codigo do órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Codigo da unidade orcamentaria",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/RealocOrcamentariasController"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentacao referente a Abertura de Creditos Adicionais - SIM"
          ]
        }
      },
      "/destino_realocacoes_orcamentarias": {
        "get": {
          "operationId": "DestinoRealocOrcController_getAll",
          "summary": "Relação de Destinações de Remanejamentos Transposições e Transferências de Dotações do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Codigo do municipio",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orcamento. Atencao: Apartir do ano de 2007 adicione 00 ao final do ano. Exemplo: para o ano 2010 use 201000. Já nos anos de 2003 à 2006 adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "data_alteracao",
              "required": false,
              "in": "query",
              "description": "Data da Alteração Orçamentária",
              "schema": {
                "format": "date-time",
                "type": "string"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Codigo do órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Codigo da unidade orcamentaria",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/DestinoRealocOrcController"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentacao referente a Abertura de Creditos Adicionais - SIM"
          ]
        }
      },
      "/creditos_adicionais": {
        "get": {
          "operationId": "CreditosAdicionaisController_findAll",
          "summary": "Relação de Aberturas de Créditos Adicionais do Município",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Codigo do municipio",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": false,
              "in": "query",
              "description": "Ano do Exercício do Orcamento. Atencao: Apartir do ano de 2007 adicione 00 ao final do ano. Exemplo: para o ano 2010 use 201000. Já nos anos de 2003 à 2006 adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "data_abertura_credito",
              "required": true,
              "in": "query",
              "description": "Data da Abertura de Crédito. Utilize o seguinte formato yyyy-mm-dd e para pesquisar intervalos yyyy-mm-dd_yyyy-mm-dd. Exemplo 20100101 e intervalos 2010-01-01_2010-01-31",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Codigo do Orgao",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade_orcamentaria",
              "required": false,
              "in": "query",
              "description": "Codigo da Unidade Orcamentaria",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "tipo_abertura_credito",
              "required": false,
              "in": "query",
              "description": "Tipo de Abertura de Credito",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/CreditosAdicionaisController"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentacao referente a Abertura de Creditos Adicionais - SIM"
          ]
        }
      },
      "/movimentacoes_fontes": {
        "get": {
          "operationId": "MovimentacoesFontesController_findAll",
          "summary": "Relação de Movimentações de Fontes de Recursos",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "exercicio_orcamento",
              "required": true,
              "in": "query",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: para o ano 2010 use 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano.",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "quantidade",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados desejados(Count). Máximo 100",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "deslocamento",
              "required": true,
              "in": "query",
              "description": "Quantidade de dados pulados(Offset). ",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do órgão",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "codigo_unidade",
              "required": false,
              "in": "query",
              "description": "Código da unidade orçamentária",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_movimentacao",
              "required": false,
              "in": "query",
              "description": "Data da Movimentação da Fonte",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_ref_mf",
              "required": false,
              "in": "query",
              "description": "Ano de Referência da Movimentação",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/MovimentacoesFontes"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentacao Comprobatoria de Despesas - SIM"
          ]
        }
      },
      "/situacao-remessa": {
        "get": {
          "operationId": "SituacaoRemessaController_findAll",
          "summary": "Relações de Situações de Remessas Municipais",
          "parameters": [
            {
              "name": "codigo_municipio",
              "required": true,
              "in": "query",
              "description": "Código do Município",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "data_referencia",
              "required": false,
              "in": "query",
              "description": "Data de Referência da Remessa: utilize o formato “yyyymm”. Exemplo: 201001",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "codigo_orgao",
              "required": false,
              "in": "query",
              "description": "Código do Órgão",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Registro encontrado",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/SituacaoRemessaDto"
                  }
                }
              }
            }
          },
          "tags": [
            "Documentação de Informações Básicas - SIM"
          ]
        }
      }
    },
    "info": {
      "title": "DADOS ABERTOS",
      "description": "<p>O <strong>TCE/CE</strong> mais uma vez transforma o óbvio em realidade: abrimos os dados.Só que agora de uma maneira diferente, estamos possibilitando que programas de computador acessem os dados facilmente. O TCE/CE está disponibilizando os dados do SIM via Interface de Programação de Aplicativos (ou API ). Acreditamos na criatividade coletiva e através dela temos a certeza que a comunidade tem condições de criar suas próprias aplicações fazendo uso dos dados da maneira que melhor lhe convier. E para isso, nada melhor que facilitar a criação desses aplicativos. Buscamos estabelecer contato com desenvolvedores interessados em criar seus próprios aplicativos usando os dados do TCE/CE, veja a seguir como.</p></br><strong>URL Básica  </strong><br/>Para acessar os dados é preciso conhecer o endereço ou url básica.<br/>https://api-dados-abertos.tce.ce.gov.br/metodo?campo1=valor1&campo2=valor2<br/><br/><p>Por motivos de segurança, o consumo dos dados deve ser limitado até 500 acessos HTTP ou HTTPS por segundo e o endereço IP da origem deve estar localizado no território brasileiro.</p>",
      "version": "2.0",
      "contact": {}
    },
    "tags": [
      {
        "name": "Documentação de Informações Básicas - SIM",
        "description": ""
      },
      {
        "name": "Documentação referente ao Orçamento Municipal - SIM",
        "description": ""
      },
      {
        "name": "Documentação referente aos Balancetes - SIM",
        "description": ""
      },
      {
        "name": "Documentação Comprobatoria de Receitas - SIM",
        "description": ""
      },
      {
        "name": "Documentacao referente a Processos de Aquisicoes e Contratos - SIM",
        "description": ""
      },
      {
        "name": "Documentação Comprobatoria de Despesas - SIM",
        "description": ""
      },
      {
        "name": "Cadastro de Pessoal e Folha - SIM",
        "description": ""
      }
    ],
    "servers": [],
    "components": {
      "schemas": {
        "MunicipioDto": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string",
              "description": "Código do Município"
            },
            "nome_municipio": {
              "type": "string",
              "description": "Nome do Município"
            },
            "geoibgeId": {
              "type": "string",
              "description": "Referência do município em IBGE"
            },
            "geonamesId": {
              "type": "string",
              "description": "Referência do município em geonames.org"
            }
          }
        },
        "UnidadeGestoraDto": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string",
              "description": "Código do Município"
            },
            "exercicio_orcamento": {
              "type": "string",
              "description": "Ano do exercício do orçamento. Atenção: dados disponíveis a partir de 2008. Adicione “00” ao final do ano. Exemplo: 2010 → 201000"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento"
          ]
        },
        "TipoFuncaoDTO": {
          "type": "object",
          "properties": {
            "codigo_funcao": {
              "type": "string",
              "description": "Codigo da Funcao"
            },
            "nome_funcao": {
              "type": "string",
              "description": "Nome da Funcao"
            }
          }
        },
        "GestoresUgDto": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string",
              "description": "Código do Município"
            },
            "exercicio_orcamento": {
              "type": "number",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano."
            },
            "codigo_unidade_gestora": {
              "type": "number",
              "description": "Código da unidade gestora"
            },
            "codigo_orgao": {
              "type": "string",
              "description": "Código do orgão"
            },
            "codigo_unidade": {
              "type": "string",
              "description": "Código da unidade orçamentária"
            },
            "cpf_servidor": {
              "type": "string",
              "description": "Forma de ingresso no serviço público municipal"
            },
            "codigo_ingresso": {
              "type": "string",
              "description": "Forma de ingresso no serviço público municipal"
            },
            "codigo_vinculo": {
              "type": "string",
              "description": "Tipo de relação com o serviço público"
            },
            "numero_expediente": {
              "type": "string",
              "description": "Número do expediente de nomeação ou posse"
            },
            "data_inicio_gestao": {
              "format": "date-time",
              "type": "string",
              "description": "Data de início da gestao"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento"
          ]
        },
        "UnidadeFederacaoDTO": {
          "type": "object",
          "properties": {
            "codigo_unidade_federacao": {
              "type": "string",
              "description": "Código da Unidade da Federação"
            },
            "sigla_unidade_federacao": {
              "type": "string",
              "description": "Sigla da Unidade da Federação"
            },
            "nome_unidade_federacao": {
              "type": "string",
              "description": "Nome da Unidade de Federação"
            }
          }
        },
        "DadosOrcamentoDto": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string",
              "description": "Código do Município"
            },
            "exercicio_orcamento": {
              "type": "string",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006. adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano."
            },
            "nu_lei_orcamento": {
              "type": "string",
              "description": "Número da Lei do Orçamento"
            },
            "valor_total_fixado_orcamento": {
              "type": "number",
              "description": "Valor Total Fixado no Orçamento"
            },
            "numero_perc_sup_orcamento": {
              "type": "number",
              "description": "Número do Percentual de Suplementação do Orçamento"
            },
            "valor_total_supl_orcamento": {
              "type": "string",
              "description": "Valor Total para Suplementações do Orçamento"
            },
            "data_envio_loa": {
              "format": "date-time",
              "type": "string",
              "description": "Data de envio do projeto LOA"
            },
            "data_aprov_loa": {
              "format": "date-time",
              "type": "string",
              "description": "Data de aprovação do projeto LOA"
            },
            "data_public_loa": {
              "format": "date-time",
              "type": "string",
              "description": "Data de Publicação da LOA"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento"
          ]
        },
        "ContasBancariasDTO": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string",
              "description": "Código do Município"
            },
            "exercicio_orcamento": {
              "type": "number",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão enviada no SIM ao final do ano. "
            },
            "codigo_orgao": {
              "type": "string",
              "description": "Código do Órgão"
            },
            "codigo_unidade": {
              "type": "string",
              "description": "Código na Unidade Orçamentária"
            },
            "numero_banco": {
              "type": "string",
              "description": "Número do Banco"
            },
            "numero_agencia": {
              "type": "string",
              "description": "Número da Agência"
            },
            "data_referencia": {
              "type": "string",
              "description": "Data de Referência da Documentação"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento"
          ]
        },
        "OrgaoDto": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string",
              "description": "Código do Município"
            },
            "exercicio_orcamento": {
              "type": "number",
              "description": "Ano do Exercício do Orçamento. Atenção: A partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano."
            },
            "codigo_orgao": {
              "type": "string",
              "description": "Código do Órgão"
            },
            "nome_orgao": {
              "type": "string",
              "description": "Nome do Órgão"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento"
          ]
        },
        "UnidadeOrcamentariaDto": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string",
              "description": "Código do Município"
            },
            "exercicio_orcamento": {
              "type": "string",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00’ ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano."
            },
            "quantidade": {
              "type": "number",
              "description": "Quantidade de dados desejados(Count). Máximo 100"
            },
            "deslocamento": {
              "type": "number",
              "description": "Quantidade de dados pulados(Offset). "
            },
            "codigo_orgao": {
              "type": "string",
              "description": "Código do Órgão"
            },
            "codigo_unidade": {
              "type": "string",
              "description": "Código da Unidade Orçamentária"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "quantidade",
            "deslocamento"
          ]
        },
        "TipoUnidadeAdmDto": {
          "type": "object",
          "properties": {
            "codigo_tipo_unidade_administrativa": {
              "type": "string",
              "description": "Código do Tipo de Unidade Administrativa"
            },
            "nome_tipo_unidade_administrativa": {
              "type": "string",
              "description": "Nome do Tipo de Unidade Administrativa"
            }
          }
        },
        "Ordenador": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_unidade_gestora": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "data_referencia_ordenador": {
              "type": "number"
            },
            "nome_ordenador": {
              "type": "string"
            },
            "data_inclusao_unidade_orcamentaria": {
              "format": "date-time",
              "type": "string"
            },
            "cpf_servidor": {
              "type": "string"
            },
            "codigo_ingresso": {
              "type": "string"
            },
            "codigo_vinculo": {
              "type": "number"
            },
            "numero_expediente_nomeacao": {
              "type": "string"
            },
            "data_inicio_gestao_ordenador": {
              "format": "date-time",
              "type": "string"
            },
            "data_fim_gestao_ordenador": {
              "format": "date-time",
              "type": "string"
            },
            "tipo_cargo": {
              "type": "string"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_unidade_gestora",
            "codigo_orgao",
            "codigo_unidade",
            "data_referencia_ordenador",
            "nome_ordenador",
            "data_inclusao_unidade_orcamentaria",
            "cpf_servidor",
            "codigo_ingresso",
            "codigo_vinculo",
            "numero_expediente_nomeacao",
            "data_inicio_gestao_ordenador",
            "data_fim_gestao_ordenador",
            "tipo_cargo"
          ]
        },
        "ContasExtraOrcamentaria": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_conta_extra_orc": {
              "type": "number"
            },
            "data_referencia_doc": {
              "type": "number"
            },
            "desc_conta_extra_orc": {
              "type": "string"
            },
            "vl_saldo_ini": {
              "type": "number"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento"
          ]
        },
        "Programa": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "string"
            },
            "codigo_programa": {
              "type": "string"
            },
            "nome_programa": {
              "type": "string"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_programa",
            "nome_programa"
          ]
        },
        "BalanceteRecOrc": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "codigo_rubrica": {
              "type": "string"
            },
            "data_referencia": {
              "type": "number"
            },
            "tipo_balancete": {
              "type": "string"
            },
            "valor_previsto_orcamento": {
              "type": "number"
            },
            "valor_anulacoes_no_mes": {
              "type": "number"
            },
            "valor_arrecadacao_no_mes": {
              "type": "number"
            },
            "valor_arrecadacao_ate_mes": {
              "type": "number"
            },
            "valor_anulacoes_ate_mes": {
              "type": "number"
            },
            "tipo_fonte": {
              "type": "string"
            },
            "codigo_fonte": {
              "type": "string"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_orgao",
            "codigo_unidade",
            "codigo_rubrica",
            "data_referencia",
            "tipo_balancete",
            "valor_previsto_orcamento",
            "valor_anulacoes_no_mes",
            "valor_arrecadacao_no_mes",
            "valor_arrecadacao_ate_mes",
            "valor_anulacoes_ate_mes",
            "tipo_fonte",
            "codigo_fonte"
          ]
        },
        "BalanceteDespOrc": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "codigo_funcao": {
              "type": "string"
            },
            "codigo_subfuncao": {
              "type": "string"
            },
            "codigo_programa": {
              "type": "string"
            },
            "codigo_projeto_atividade": {
              "type": "string"
            },
            "numero_projeto_atividade": {
              "type": "string"
            },
            "numero_subprojeto_atividade": {
              "type": "string"
            },
            "codigo_elemento_despesa": {
              "type": "string"
            },
            "data_referencia": {
              "type": "string"
            },
            "tipo_balancete": {
              "type": "string"
            },
            "valor_fixado_orcamento_bal_despesa": {
              "type": "number"
            },
            "valor_supl_no_mes": {
              "type": "number"
            },
            "valor_supl_ate_mes": {
              "type": "number"
            },
            "valor_nulacoes_dotacao_no_mes": {
              "type": "number"
            },
            "valor_empenhado_no_mes": {
              "type": "number"
            },
            "valor_empenhado_ate_mes": {
              "type": "number"
            },
            "valor_saldo_dotacao": {
              "type": "number"
            },
            "valor_pago_no_mes": {
              "type": "number"
            },
            "valor_pago_ate_mes": {
              "type": "number"
            },
            "valor_empenhado_pagar": {
              "type": "number"
            },
            "valor_nulacoes_dotacao_ate_mes": {
              "type": "number"
            },
            "valor_anulacoes_empenhos_no_mes": {
              "type": "number"
            },
            "valor_anulacoes_empenhos_ate_mes": {
              "type": "number"
            },
            "valor_liquidado_no_mes": {
              "type": "number"
            },
            "valor_liquidado_ate_mes": {
              "type": "number"
            },
            "valor_estornos_liquidacao_no_mes": {
              "type": "number"
            },
            "valor_estornos_liquidacao_ate_mes": {
              "type": "number"
            },
            "valor_estornos_pagos_no_mes": {
              "type": "number"
            },
            "valor_estornos_pagos_ate_mes": {
              "type": "number"
            },
            "tipo_fonte": {
              "type": "string"
            },
            "codigo_fonte": {
              "type": "string"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "data_referencia"
          ]
        },
        "CreateBalanceteDespExtOrcDto": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string",
              "description": "Código do Município"
            },
            "exercicio_orcamento": {
              "type": "string",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano."
            },
            "data_referencia": {
              "type": "number",
              "description": "Data de Referência da Documentação. Utilize o formato “yyyymm”. Exemplo: 201001."
            },
            "codigo_orgao": {
              "type": "number",
              "description": "Código do Órgão"
            },
            "codigo_unidade": {
              "type": "number",
              "description": "Código da Unidade Orçamentária"
            },
            "codigo_conta_extraorcamentaria": {
              "type": "number",
              "description": "Código da Conta Extra-orçamentária "
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "data_referencia"
          ]
        },
        "BalanceteRecExtOrcDto": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string",
              "description": "Código do Município"
            },
            "exercicio_orcamento": {
              "type": "number",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano."
            },
            "quantidade": {
              "type": "number",
              "description": "Quantidade de dados desejados(Count). Máximo 100"
            },
            "deslocamento": {
              "type": "number",
              "description": "Quantidade de dados pulados(Offset). "
            },
            "data_referencia": {
              "format": "date-time",
              "type": "string",
              "description": "Data de Referência da Documentação. Utilize o formato “yyyymm”. Exemplo: 201001."
            },
            "codigo_orgao": {
              "type": "number",
              "description": "Código do Órgão"
            },
            "codigo_unidade": {
              "type": "number",
              "description": "Código da Unidade Orçamentária"
            },
            "codigo_conta_extraorcamentaria": {
              "type": "number",
              "description": "Código da Conta Extra-orçamentária"
            },
            "tipo_balancete": {
              "type": "string",
              "description": "Tipo do Balancete"
            },
            "valor_anulacoes_empenhos_no_mes": {
              "type": "number",
              "description": "Valor das anulações de empenhos no mês"
            },
            "valor_nulacoes_dotacao_ate_mes": {
              "type": "number",
              "description": "Valor das anulacoes de dotação ate mês"
            },
            "valor_arrecadacao_empenhos_no_mes": {
              "type": "number",
              "description": "Valor da arrecadação no mês"
            },
            "valor_arrecadacao_dotacao_ate_mes": {
              "type": "number",
              "description": "Valor da arrecadação ate mês"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "quantidade",
            "deslocamento",
            "data_referencia"
          ]
        },
        "DespesaCategoriaEconomia": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "codigo_elemento_despesa": {
              "type": "string"
            },
            "nome_elemento_despesa": {
              "type": "string"
            },
            "valor_total_fixado": {
              "type": "number"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_orgao",
            "codigo_unidade",
            "codigo_elemento_despesa",
            "nome_elemento_despesa",
            "valor_total_fixado"
          ]
        },
        "TaloesExtra": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "number"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "number"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "cd_conta_ctx": {
              "type": "number"
            },
            "nu_talao_receita_tx": {
              "type": "string"
            },
            "dt_talao_receita_tx": {
              "format": "date-time",
              "type": "string"
            },
            "dt_ref_tx": {
              "format": "date-time",
              "type": "string"
            },
            "vl_receita_tx": {
              "type": "number"
            },
            "de_hist_receita_tx": {
              "type": "string"
            },
            "tp_doc_contrib_tx": {
              "type": "string"
            },
            "nu_doc_contrib_tx": {
              "type": "string"
            },
            "nm_razao_social_contrib_tx": {
              "type": "string"
            },
            "nu_banco_tx": {
              "type": "string"
            },
            "nu_agencia_bancaria_tx": {
              "type": "string"
            },
            "nu_conta_corrente_tx": {
              "type": "string"
            },
            "nu_doc_credito_tx": {
              "type": "string"
            },
            "dt_credito_tx": {
              "format": "date-time",
              "type": "string"
            },
            "tp_doc_credito_tx": {
              "type": "number"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_orgao",
            "codigo_unidade",
            "cd_conta_ctx",
            "nu_talao_receita_tx",
            "dt_talao_receita_tx",
            "dt_ref_tx",
            "vl_receita_tx",
            "de_hist_receita_tx",
            "tp_doc_contrib_tx",
            "nu_doc_contrib_tx",
            "nm_razao_social_contrib_tx",
            "nu_banco_tx",
            "nu_agencia_bancaria_tx",
            "nu_conta_corrente_tx",
            "nu_doc_credito_tx",
            "dt_credito_tx",
            "tp_doc_credito_tx"
          ]
        },
        "DespesaElementoProjeto": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "codigo_funcao": {
              "type": "string"
            },
            "codigo_subfuncao": {
              "type": "string"
            },
            "codigo_programa": {
              "type": "string"
            },
            "codigo_projeto_atividade": {
              "type": "string"
            },
            "numero_projeto_atividade": {
              "type": "string"
            },
            "numero_subprojeto_atividade": {
              "type": "string"
            },
            "codigo_elemento_despesa": {
              "type": "string"
            },
            "tipo_fonte": {
              "type": "string"
            },
            "codigo_fonte": {
              "type": "string"
            },
            "valor_atual_categoria_economica": {
              "type": "number"
            },
            "valor_orcado_categoria_economica": {
              "type": "number"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_orgao",
            "codigo_unidade",
            "codigo_funcao",
            "codigo_subfuncao",
            "codigo_programa",
            "codigo_projeto_atividade",
            "numero_projeto_atividade",
            "numero_subprojeto_atividade",
            "codigo_elemento_despesa",
            "tipo_fonte",
            "codigo_fonte",
            "valor_atual_categoria_economica",
            "valor_orcado_categoria_economica"
          ]
        },
        "OrcamentoReceita": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "codigo_rubrica": {
              "type": "string"
            },
            "tipo_fonte": {
              "type": "string"
            },
            "codigo_fonte": {
              "type": "string"
            },
            "descricao_rubrica": {
              "type": "string"
            },
            "valor_previsto": {
              "type": "number"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_orgao",
            "codigo_unidade",
            "codigo_rubrica",
            "tipo_fonte",
            "codigo_fonte",
            "descricao_rubrica",
            "valor_previsto"
          ]
        },
        "DespesaProjetoAtividade": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "codigo_funcao": {
              "type": "string"
            },
            "codigo_subfuncao": {
              "type": "string"
            },
            "codigo_programa": {
              "type": "string"
            },
            "codigo_projeto_atividade": {
              "type": "string"
            },
            "numero_projeto_atividade": {
              "type": "string"
            },
            "numero_subprojeto_atividade": {
              "type": "string"
            },
            "codigo_tipo_orcamento": {
              "type": "string"
            },
            "nome_projeto_atividade": {
              "type": "string"
            },
            "descricao_projeto_atividade": {
              "type": "string"
            },
            "valor_total_fixado_projeto_atividade": {
              "type": "number"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_orgao",
            "codigo_unidade",
            "codigo_funcao",
            "codigo_subfuncao",
            "codigo_programa",
            "codigo_projeto_atividade",
            "numero_projeto_atividade",
            "numero_subprojeto_atividade",
            "codigo_tipo_orcamento",
            "nome_projeto_atividade",
            "descricao_projeto_atividade",
            "valor_total_fixado_projeto_atividade"
          ]
        },
        "TaloesReceita": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "codigo_rubrica": {
              "type": "string"
            },
            "tipo_fonte": {
              "type": "string"
            },
            "codigo_fonte": {
              "type": "string"
            },
            "numero_talao_receita": {
              "type": "string"
            },
            "data_talao_receita": {
              "format": "date-time",
              "type": "string"
            },
            "data_referencia": {
              "type": "number"
            },
            "valor_receita": {
              "type": "number"
            },
            "historico_receita": {
              "type": "string"
            },
            "tipo_doc_contribuinte": {
              "type": "string"
            },
            "numero_doc_contribuinte": {
              "type": "string"
            },
            "nome_razao_social_contribuinte": {
              "type": "string"
            },
            "numero_banco": {
              "type": "string"
            },
            "numero_agencia_bancaria": {
              "type": "string"
            },
            "numero_conta_corrente": {
              "type": "string"
            },
            "numero_doc_credito": {
              "type": "string"
            },
            "dt_credito_tr": {
              "format": "date-time",
              "type": "string"
            },
            "tipo_doc_credito": {
              "type": "number"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_orgao",
            "codigo_unidade",
            "codigo_rubrica",
            "tipo_fonte",
            "codigo_fonte",
            "numero_talao_receita",
            "data_talao_receita",
            "data_referencia",
            "valor_receita",
            "historico_receita",
            "tipo_doc_contribuinte",
            "numero_doc_contribuinte",
            "nome_razao_social_contribuinte",
            "numero_banco",
            "numero_agencia_bancaria",
            "numero_conta_corrente",
            "numero_doc_credito",
            "dt_credito_tr",
            "tipo_doc_credito"
          ]
        },
        "AnulacoesTaloesRec": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "codigo_rubrica": {
              "type": "string"
            },
            "tipo_fonte": {
              "type": "string"
            },
            "codigo_fonte": {
              "type": "string"
            },
            "numero_talao_receita": {
              "type": "string"
            },
            "data_talao_receita": {
              "format": "date-time",
              "type": "string"
            },
            "data_anulacao": {
              "format": "date-time",
              "type": "string"
            },
            "data_referencia": {
              "format": "date-time",
              "type": "string"
            },
            "md_anul_atr": {
              "type": "string"
            },
            "valor_anulacao": {
              "type": "number"
            },
            "historico_anulacao": {
              "type": "string"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_orgao",
            "codigo_unidade",
            "codigo_rubrica",
            "tipo_fonte",
            "codigo_fonte",
            "numero_talao_receita",
            "data_talao_receita",
            "data_anulacao",
            "data_referencia",
            "md_anul_atr",
            "valor_anulacao",
            "historico_anulacao"
          ]
        },
        "AnulacoesTaloesExt": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "codigo_conta": {
              "type": "number"
            },
            "numero_talao_receita": {
              "type": "string"
            },
            "data_talao_receita": {
              "format": "date-time",
              "type": "string"
            },
            "data_anulacao": {
              "format": "date-time",
              "type": "string"
            },
            "data_referencia": {
              "type": "number"
            },
            "modalidade_anulacao": {
              "type": "string"
            },
            "valor_anulacao": {
              "type": "number"
            },
            "historico_anulacao": {
              "type": "string"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_orgao",
            "codigo_unidade",
            "codigo_conta",
            "numero_talao_receita",
            "data_talao_receita",
            "data_anulacao",
            "data_referencia",
            "modalidade_anulacao",
            "valor_anulacao",
            "historico_anulacao"
          ]
        },
        "PublicEditaisLicitacoe": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "data_realizacao_licitacao": {
              "type": "string"
            },
            "numero_licitacao": {
              "type": "number"
            },
            "numero_sequencial_publicacao_edital": {
              "type": "string"
            },
            "codigo_publicacao_edital": {
              "type": "string"
            },
            "descricao_publicacao_edital": {
              "type": "string"
            },
            "data_publicacao_edital": {
              "format": "date-time",
              "type": "string"
            }
          },
          "required": [
            "codigo_municipio",
            "data_realizacao_licitacao",
            "numero_licitacao",
            "numero_sequencial_publicacao_edital",
            "codigo_publicacao_edital",
            "descricao_publicacao_edital",
            "data_publicacao_edital"
          ]
        },
        "Contratado": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "data_contrato": {
              "format": "date-time",
              "type": "string"
            },
            "numero_contrato": {
              "type": "string"
            },
            "numero_documento_negociante": {
              "type": "string"
            },
            "codigo_tipo_negociante": {
              "type": "string"
            },
            "nome_negociante": {
              "type": "string"
            },
            "endereco_negociante": {
              "type": "string"
            },
            "fone_negociante": {
              "type": "string"
            },
            "cep_negociante": {
              "type": "string"
            },
            "nome_municipio_negociante": {
              "type": "string"
            },
            "codigo_uf": {
              "type": "string"
            }
          },
          "required": [
            "codigo_municipio",
            "data_contrato",
            "numero_contrato",
            "numero_documento_negociante",
            "codigo_tipo_negociante",
            "nome_negociante",
            "endereco_negociante",
            "fone_negociante",
            "cep_negociante",
            "nome_municipio_negociante",
            "codigo_uf"
          ]
        },
        "ItensLicitacao": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "data_realizacao_licitacao": {
              "format": "date-time",
              "type": "string"
            },
            "numero_licitacao": {
              "type": "string"
            },
            "numero_sequencial_item_licitacao": {
              "type": "number"
            },
            "numero_documento_negociante": {
              "type": "string"
            },
            "descricao_item_licitacao": {
              "type": "string"
            },
            "valor_vencedor_item_licitacao": {
              "type": "number"
            },
            "codigo_tipo_negociante": {
              "type": "string"
            },
            "descricao_unidade_item_licitacao": {
              "type": "string"
            },
            "numero_quantidade_item_licitacao": {
              "type": "string"
            },
            "valor_unitario_item_licitacao": {
              "type": "number"
            }
          },
          "required": [
            "codigo_municipio",
            "data_realizacao_licitacao",
            "numero_licitacao",
            "numero_sequencial_item_licitacao",
            "numero_documento_negociante",
            "descricao_item_licitacao",
            "valor_vencedor_item_licitacao",
            "codigo_tipo_negociante",
            "descricao_unidade_item_licitacao",
            "numero_quantidade_item_licitacao",
            "valor_unitario_item_licitacao"
          ]
        },
        "LicitacaoDto": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string",
              "description": "Código do Município"
            },
            "data_realizacao_autuacao_licitacao": {
              "type": "string",
              "description": "Data da Realização da Licitação até 2009 e Data da Autuação a partir de 2010. Utilize o seguinte formato: yyyy-mm-dd. Para pesquisar intervalos yyyy-mm-dd_yyyy-mm-dd. EX: 2010-01-01 e intervalos 2010-01-01_2010-01-31"
            },
            "numero_licitacao": {
              "type": "string",
              "description": "Número da Licitação"
            },
            "modalidade_licitacao": {
              "type": "string",
              "description": "Modalidade da licitação"
            },
            "tp_licitacao_li": {
              "type": "string",
              "description": "Tipo de licitação"
            },
            "modalidade_processo_administrativo": {
              "type": "string",
              "description": "Modalidade da licitação"
            }
          },
          "required": [
            "codigo_municipio",
            "data_realizacao_autuacao_licitacao"
          ]
        },
        "Licitante": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "data_realizacao_licitacao": {
              "format": "date-time",
              "type": "string"
            },
            "numero_licitacao": {
              "type": "string"
            },
            "numero_documento_negociante": {
              "type": "string"
            },
            "codigo_tipo_negociante": {
              "type": "string"
            },
            "nome_negociante": {
              "type": "string"
            },
            "endereco_negociante": {
              "type": "string"
            },
            "fone_negociante": {
              "type": "string"
            },
            "cep_negociante": {
              "type": "string"
            },
            "nome_municipio_negociante": {
              "type": "string"
            },
            "codigo_uf": {
              "type": "string"
            }
          },
          "required": [
            "codigo_municipio",
            "data_realizacao_licitacao",
            "numero_licitacao",
            "numero_documento_negociante",
            "codigo_tipo_negociante",
            "nome_negociante",
            "endereco_negociante",
            "fone_negociante",
            "cep_negociante",
            "nome_municipio_negociante",
            "codigo_uf"
          ]
        },
        "ComissoesLicitacao": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "data_criacao_comissao": {
              "format": "date-time",
              "type": "string"
            },
            "numero_comissao": {
              "type": "string"
            },
            "numero_portaria_criacao": {
              "type": "string"
            },
            "tipo_comissao": {
              "type": "string"
            },
            "data_extincao_comissao": {
              "format": "date-time",
              "type": "string"
            },
            "numero_portaria_extincao": {
              "type": "string"
            }
          },
          "required": [
            "codigo_municipio",
            "data_criacao_comissao",
            "numero_comissao",
            "numero_portaria_criacao",
            "tipo_comissao",
            "data_extincao_comissao",
            "numero_portaria_extincao"
          ]
        },
        "DotacoesLicitacao": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "data_realizacao_licitacao": {
              "format": "date-time",
              "type": "string"
            },
            "numero_licitacao": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "codigo_funcao": {
              "type": "string"
            },
            "codigo_subfuncao": {
              "type": "string"
            },
            "codigo_programa": {
              "type": "string"
            },
            "codigo_projeto_atividade": {
              "type": "string"
            },
            "numero_projeto_atividade": {
              "type": "string"
            },
            "numero_subprojeto_atividade": {
              "type": "string"
            },
            "codigo_elemento_despesa": {
              "type": "string"
            },
            "valor_dotacao": {
              "type": "number"
            },
            "codigo_fonte": {
              "type": "string"
            },
            "tipo_fonte": {
              "type": "string"
            }
          },
          "required": [
            "codigo_municipio",
            "data_realizacao_licitacao",
            "numero_licitacao",
            "exercicio_orcamento",
            "codigo_orgao",
            "codigo_unidade",
            "codigo_funcao",
            "codigo_subfuncao",
            "codigo_programa",
            "codigo_projeto_atividade",
            "numero_projeto_atividade",
            "numero_subprojeto_atividade",
            "codigo_elemento_despesa",
            "valor_dotacao",
            "codigo_fonte",
            "tipo_fonte"
          ]
        },
        "Contrato": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "data_contrato": {
              "format": "date-time",
              "type": "string"
            },
            "numero_contrato": {
              "type": "string"
            },
            "tipo_contrato": {
              "type": "string"
            },
            "modalidade_contrato": {
              "type": "string"
            },
            "numero_contrato_original": {
              "type": "string"
            },
            "data_contrato_original": {
              "format": "date-time",
              "type": "string"
            },
            "data_inicio_vigencia_contrato": {
              "format": "date-time",
              "type": "string"
            },
            "data_fim_vigencia_contrato": {
              "format": "date-time",
              "type": "string"
            },
            "descricao_objeto_contrato": {
              "type": "string"
            },
            "valor_total_contrato": {
              "type": "number"
            }
          },
          "required": [
            "codigo_municipio",
            "data_contrato",
            "numero_contrato",
            "tipo_contrato",
            "modalidade_contrato",
            "numero_contrato_original",
            "data_contrato_original",
            "data_inicio_vigencia_contrato",
            "data_fim_vigencia_contrato",
            "descricao_objeto_contrato",
            "valor_total_contrato"
          ]
        },
        "DespesasExtOrc": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "codigo_conta_extraorcamentaria": {
              "type": "number"
            },
            "numero_banco": {
              "type": "string"
            },
            "numero_agencia": {
              "type": "string"
            },
            "numero_conta": {
              "type": "string"
            },
            "numero_documento_despesa_extra": {
              "type": "string"
            },
            "data_referencia_documentacao": {
              "type": "number"
            },
            "numero_documento_caixa": {
              "type": "string"
            },
            "data_emissao_despesa_extra": {
              "format": "date-time",
              "type": "string"
            },
            "valor_documento_despesa_extra": {
              "type": "number"
            },
            "valor_deducao_despesa_extra": {
              "type": "number"
            },
            "tipo_documento_despesa_extra": {
              "type": "number"
            },
            "status_estorno_despesa_extra": {
              "type": "number"
            },
            "nome_credor_despesa_extra": {
              "type": "string"
            },
            "dt_compet_xd": {
              "type": "number"
            },
            "vl_pago_principal_xd": {
              "type": "number"
            },
            "vl_pago_multa_juros_xd": {
              "type": "number"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_orgao",
            "codigo_unidade",
            "codigo_conta_extraorcamentaria",
            "numero_banco",
            "numero_agencia",
            "numero_conta",
            "numero_documento_despesa_extra",
            "data_referencia_documentacao",
            "numero_documento_caixa",
            "data_emissao_despesa_extra",
            "valor_documento_despesa_extra",
            "valor_deducao_despesa_extra",
            "tipo_documento_despesa_extra",
            "status_estorno_despesa_extra",
            "nome_credor_despesa_extra",
            "dt_compet_xd",
            "vl_pago_principal_xd",
            "vl_pago_multa_juros_xd"
          ]
        },
        "NfLiquidadasController": {
          "type": "object",
          "properties": {}
        },
        "ItensNf": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "data_emissao": {
              "format": "date-time",
              "type": "string"
            },
            "numero_nota_empenho": {
              "type": "string"
            },
            "data_liquidacao": {
              "format": "date-time",
              "type": "string"
            },
            "tipo_nota_fiscal": {
              "type": "string"
            },
            "numero_nota_fiscal": {
              "type": "string"
            },
            "numero_item_sequencial": {
              "type": "string"
            },
            "descricao1_item": {
              "type": "string"
            },
            "descricao2_item": {
              "type": "string"
            },
            "unidade_compra": {
              "type": "string"
            },
            "numero_quantidade_comprada": {
              "type": "number"
            },
            "valor_unitario_item": {
              "type": "number"
            },
            "valor_total_item": {
              "type": "number"
            },
            "codigo_ncm": {
              "type": "string"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_orgao",
            "codigo_unidade",
            "data_emissao",
            "numero_nota_empenho",
            "data_liquidacao",
            "tipo_nota_fiscal",
            "numero_nota_fiscal",
            "numero_item_sequencial",
            "descricao1_item",
            "descricao2_item",
            "unidade_compra",
            "numero_quantidade_comprada",
            "valor_unitario_item",
            "valor_total_item",
            "codigo_ncm"
          ]
        },
        "EstornosPag": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "data_emissao_empenho": {
              "format": "date-time",
              "type": "string"
            },
            "numero_empenho": {
              "type": "string"
            },
            "numero_sub_empenho_nota_pagamento": {
              "type": "string"
            },
            "numero_pagamento": {
              "type": "string"
            },
            "data_estorno_pagamento": {
              "format": "date-time",
              "type": "string"
            },
            "data_referencia_estorno_pagamento": {
              "type": "number"
            },
            "nome_assessor": {
              "type": "string"
            },
            "descricao_justificativa": {
              "type": "string"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_orgao",
            "codigo_unidade",
            "data_emissao_empenho",
            "numero_empenho",
            "numero_sub_empenho_nota_pagamento",
            "numero_pagamento",
            "data_estorno_pagamento",
            "data_referencia_estorno_pagamento",
            "nome_assessor",
            "descricao_justificativa"
          ]
        },
        "Liquidacao": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "data_emissao_empenho": {
              "format": "date-time",
              "type": "string"
            },
            "numero_empenho": {
              "type": "string"
            },
            "data_liquidacao": {
              "format": "date-time",
              "type": "string"
            },
            "data_referencia_liquidacao": {
              "type": "number"
            },
            "nome_responsavel_liquidacao": {
              "type": "string"
            },
            "numero_sub_empenho_liquidacao": {
              "type": "string"
            },
            "valor_liquidado": {
              "format": "date-time",
              "type": "string"
            },
            "estado_de_estorno": {
              "type": "number"
            },
            "estado_folha": {
              "type": "number"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_orgao",
            "codigo_unidade",
            "data_emissao_empenho",
            "numero_empenho",
            "data_liquidacao",
            "data_referencia_liquidacao",
            "nome_responsavel_liquidacao",
            "numero_sub_empenho_liquidacao",
            "valor_liquidado",
            "estado_de_estorno",
            "estado_folha"
          ]
        },
        "NotasPagamento": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "data_emissao_empenho": {
              "format": "date-time",
              "type": "string"
            },
            "numero_empenho": {
              "type": "string"
            },
            "numero_sub_empenho": {
              "type": "string"
            },
            "numero_nota_pagamento": {
              "type": "string"
            },
            "data_referencia": {
              "type": "number"
            },
            "nu_documento_caixa": {
              "type": "string"
            },
            "data_nota_pagamento": {
              "format": "date-time",
              "type": "string"
            },
            "valor_nota_pagamento": {
              "type": "number"
            },
            "valor_empenhado_a_pagar": {
              "type": "number"
            },
            "estado_de_estornado": {
              "type": "string"
            },
            "cpf_pagador": {
              "type": "string"
            },
            "nome_pagador": {
              "type": "string"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_orgao",
            "codigo_unidade",
            "data_emissao_empenho",
            "numero_empenho",
            "numero_sub_empenho",
            "numero_nota_pagamento",
            "data_referencia",
            "nu_documento_caixa",
            "data_nota_pagamento",
            "valor_nota_pagamento",
            "valor_empenhado_a_pagar",
            "estado_de_estornado",
            "cpf_pagador",
            "nome_pagador"
          ]
        },
        "NotasFiscai": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "format": "date-time",
              "type": "string"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "data_emissao_empenho": {
              "format": "date-time",
              "type": "string"
            },
            "numero_empenho": {
              "type": "string"
            },
            "data_liquidacao": {
              "format": "date-time",
              "type": "string"
            },
            "tipo_nota_fiscal": {
              "type": "string"
            },
            "numero_nota_fiscal": {
              "type": "number"
            },
            "data_referencia": {
              "type": "string"
            },
            "numero_serie_selo_transito": {
              "type": "string"
            },
            "numero_selo_transito": {
              "type": "string"
            },
            "numero_serie": {
              "type": "string"
            },
            "numero_formulario": {
              "type": "string"
            },
            "data_limite": {
              "format": "date-time",
              "type": "string"
            },
            "cgf_emitente": {
              "type": "string"
            },
            "data_emissao": {
              "format": "date-time",
              "type": "string"
            },
            "valor_liquido": {
              "type": "number"
            },
            "valor_desconto": {
              "type": "number"
            },
            "valor_bruto": {
              "type": "number"
            },
            "valor_aliquota_iss": {
              "type": "number"
            },
            "valor_base_calculo_iss": {
              "type": "number"
            },
            "tipo_emissao": {
              "type": "number"
            },
            "numero_protocolo_autenticacao": {
              "type": "number"
            },
            "cd_verifica_nfe_fpn_nf": {
              "type": "string"
            },
            "nu_doc_emitente_nf": {
              "type": "string"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_orgao",
            "codigo_unidade",
            "data_emissao_empenho",
            "numero_empenho",
            "data_liquidacao",
            "tipo_nota_fiscal",
            "numero_nota_fiscal",
            "data_referencia",
            "numero_serie_selo_transito",
            "numero_selo_transito",
            "numero_serie",
            "numero_formulario",
            "data_limite",
            "cgf_emitente",
            "data_emissao",
            "valor_liquido",
            "valor_desconto",
            "valor_bruto",
            "valor_aliquota_iss",
            "valor_base_calculo_iss",
            "tipo_emissao",
            "numero_protocolo_autenticacao",
            "cd_verifica_nfe_fpn_nf",
            "nu_doc_emitente_nf"
          ]
        },
        "Negociante": {
          "type": "object",
          "properties": {
            "numero_documento_negociante": {
              "type": "string"
            },
            "codigo_tipo_negociante": {
              "type": "string"
            },
            "nome_negociante": {
              "type": "string"
            },
            "endereco_negociante": {
              "type": "string"
            },
            "fone_negociante": {
              "type": "string"
            },
            "cep_negociante": {
              "type": "string"
            },
            "nome_municipio_negociante": {
              "type": "string"
            },
            "uf_negociante": {
              "type": "string"
            }
          },
          "required": [
            "numero_documento_negociante",
            "codigo_tipo_negociante",
            "nome_negociante",
            "endereco_negociante",
            "fone_negociante",
            "cep_negociante",
            "nome_municipio_negociante",
            "uf_negociante"
          ]
        },
        "AnulacoesEmpenhoDto": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string",
              "description": "Código do Município"
            },
            "exercicio_orcamento": {
              "type": "number",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: para o ano 2010 use 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano."
            },
            "quantidade": {
              "type": "number",
              "description": "Quantidade de dados desejados (Count). Máximo: 100."
            },
            "deslocamento": {
              "type": "number",
              "description": "Quantidade de dados pulados(Offset). "
            },
            "codigo_orgao": {
              "type": "string",
              "description": "Código do órgão"
            },
            "codigo_unidade": {
              "type": "string",
              "description": "Código da unidade orçamentária"
            },
            "data_referencia_anulacao": {
              "type": "number",
              "description": "Data de Referência da Documentação da Anulação"
            },
            "data_anulacao": {
              "type": "string",
              "description": "Data da Anulacao da Nota de Empenho. Utilize o formto “yyyymmdd”,  e para pesquisar intervalos “yyyymmdd_yyyymmdd”. Exemplo: 20100101 e intervalos 20100101_20100131"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "quantidade",
            "deslocamento"
          ]
        },
        "RecursosEmpenho": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "data_emissao_empenho": {
              "format": "date-time",
              "type": "string"
            },
            "numero_empenho": {
              "type": "string"
            },
            "tipo_recurso_empenho": {
              "type": "string"
            },
            "numero_sequencial_recurso": {
              "type": "string"
            },
            "data_celebracao_convenio": {
              "format": "date-time",
              "type": "string"
            },
            "numero_sequencial_convenio": {
              "type": "number"
            },
            "valor_recurso_empenho": {
              "type": "string"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_orgao",
            "codigo_unidade",
            "data_emissao_empenho",
            "numero_empenho",
            "tipo_recurso_empenho",
            "numero_sequencial_recurso",
            "data_celebracao_convenio",
            "numero_sequencial_convenio",
            "valor_recurso_empenho"
          ]
        },
        "NotasEmpenho": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "number"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "data_emissao_empenho": {
              "format": "date-time",
              "type": "string"
            },
            "numero_empenho": {
              "type": "string"
            },
            "data_referencia_empenho": {
              "type": "number"
            },
            "codigo_funcao": {
              "type": "string"
            },
            "codigo_subfuncao": {
              "type": "string"
            },
            "codigo_programa": {
              "type": "string"
            },
            "codigo_projeto_atividade": {
              "type": "string"
            },
            "numero_projeto_atividade": {
              "type": "string"
            },
            "numero_subprojeto_atividade": {
              "type": "string"
            },
            "codigo_elemento_despesa": {
              "type": "string"
            },
            "modalidade_empenho": {
              "type": "string"
            },
            "descricao_empenho": {
              "type": "string"
            },
            "valor_anterior_saldo_dotacao": {
              "type": "string"
            },
            "valor_empenhado": {
              "type": "string"
            },
            "valor_atual_saldo_dotacao": {
              "type": "string"
            },
            "tipo_processo_licitatorio": {
              "type": "string"
            },
            "numero_documento_negociante": {
              "type": "string"
            },
            "estado_empenho": {
              "type": "string"
            },
            "numero_nota_anulacao": {
              "type": "string"
            },
            "data_emissao_empenho_substituto": {
              "format": "date-time",
              "type": "string"
            },
            "numero_empenho_substituto": {
              "type": "string"
            },
            "cd_cpf_gestor": {
              "type": "string"
            },
            "cpf_gestor_contrato": {
              "type": "string"
            },
            "codigo_tipo_negociante": {
              "type": "string"
            },
            "nome_negociante": {
              "type": "string"
            },
            "endereco_negociante": {
              "type": "string"
            },
            "fone_negociante": {
              "type": "string"
            },
            "cep_negociante": {
              "type": "string"
            },
            "nome_municipio_negociante": {
              "type": "string"
            },
            "codigo_uf": {
              "type": "string"
            },
            "tipo_fonte": {
              "type": "string"
            },
            "codigo_fonte": {
              "type": "string"
            },
            "dadosEmpenho": {
              "$ref": "#/components/schemas/DadosEmpenho"
            },
            "codigo_contrato": {
              "type": "string"
            },
            "data_contrato": {
              "format": "date-time",
              "type": "string"
            },
            "numero_licitacao": {
              "type": "string"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_orgao",
            "codigo_unidade",
            "data_emissao_empenho",
            "numero_empenho",
            "data_referencia_empenho",
            "codigo_funcao",
            "codigo_subfuncao",
            "codigo_programa",
            "codigo_projeto_atividade",
            "numero_projeto_atividade",
            "numero_subprojeto_atividade",
            "codigo_elemento_despesa",
            "modalidade_empenho",
            "descricao_empenho",
            "valor_anterior_saldo_dotacao",
            "valor_empenhado",
            "valor_atual_saldo_dotacao",
            "tipo_processo_licitatorio",
            "numero_documento_negociante",
            "estado_empenho",
            "numero_nota_anulacao",
            "data_emissao_empenho_substituto",
            "numero_empenho_substituto",
            "cd_cpf_gestor",
            "cpf_gestor_contrato",
            "codigo_tipo_negociante",
            "nome_negociante",
            "endereco_negociante",
            "fone_negociante",
            "cep_negociante",
            "nome_municipio_negociante",
            "codigo_uf",
            "tipo_fonte",
            "codigo_fonte",
            "dadosEmpenho",
            "codigo_contrato",
            "data_contrato",
            "numero_licitacao"
          ]
        },
        "DadosEmpenho": {
          "type": "object",
          "properties": {
            "numero_empenho": {
              "type": "string"
            },
            "codigo_municipio": {
              "type": "number"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "data_emissao_empenho": {
              "format": "date-time",
              "type": "string"
            },
            "cd_cpf_gestor": {
              "type": "string"
            },
            "data_contrato": {
              "format": "date-time",
              "type": "string"
            },
            "codigo_contrato": {
              "type": "string"
            },
            "data_realizacao_licitacao": {
              "format": "date-time",
              "type": "string"
            },
            "numero_licitacao": {
              "type": "string"
            },
            "nota_empenho": {
              "$ref": "#/components/schemas/NotasEmpenho"
            }
          },
          "required": [
            "numero_empenho",
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_orgao",
            "codigo_unidade",
            "data_emissao_empenho",
            "cd_cpf_gestor",
            "data_contrato",
            "codigo_contrato",
            "data_realizacao_licitacao",
            "numero_licitacao",
            "nota_empenho"
          ]
        },
        "EstornosLiquidacao": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "data_emissao_empenho": {
              "format": "date-time",
              "type": "string"
            },
            "numero_empenho": {
              "type": "string"
            },
            "tp_nf_liq": {
              "type": "string"
            },
            "nu_nf_liq": {
              "type": "string"
            },
            "data_estorno_liquidacao": {
              "format": "date-time",
              "type": "string"
            },
            "data_referencia_estorno_liquidacao": {
              "type": "number"
            },
            "nome_assessor": {
              "type": "string"
            },
            "descricao_justificativa": {
              "type": "string"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_orgao",
            "codigo_unidade",
            "data_emissao_empenho",
            "numero_empenho",
            "tp_nf_liq",
            "nu_nf_liq",
            "data_estorno_liquidacao",
            "data_referencia_estorno_liquidacao",
            "nome_assessor",
            "descricao_justificativa"
          ]
        },
        "CheqNotasPag": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "data_emissao_empenho": {
              "format": "date-time",
              "type": "string"
            },
            "numero_empenho": {
              "type": "string"
            },
            "numero_pagamento": {
              "type": "string"
            },
            "numero_banco": {
              "type": "string"
            },
            "numero_agencia": {
              "type": "string"
            },
            "numero_conta": {
              "type": "string"
            },
            "numero_cheque": {
              "type": "string"
            },
            "data_referencia_cheque": {
              "type": "number"
            },
            "data_emissao_cheque": {
              "format": "date-time",
              "type": "string"
            },
            "valor_cheque": {
              "type": "string"
            },
            "tipo_documento_bancario": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "string"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_unidade",
            "data_emissao_empenho",
            "numero_empenho",
            "numero_pagamento",
            "numero_banco",
            "numero_agencia",
            "numero_conta",
            "numero_cheque",
            "data_referencia_cheque",
            "data_emissao_cheque",
            "valor_cheque",
            "tipo_documento_bancario",
            "codigo_orgao"
          ]
        },
        "ItemRemuneratorio": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "codigo_item": {
              "type": "number"
            },
            "tipo_item": {
              "type": "string"
            },
            "descricao_item": {
              "type": "string"
            },
            "codigo_amparo_legal": {
              "type": "string"
            },
            "numeto_amparo_legal": {
              "type": "string"
            },
            "data_amparo_legal": {
              "format": "date-time",
              "type": "string"
            },
            "data_publicacao": {
              "format": "date-time",
              "type": "string"
            },
            "numero_decreto": {
              "type": "string"
            },
            "data_decreto": {
              "format": "date-time",
              "type": "string"
            },
            "data_publicacao_decreto": {
              "format": "date-time",
              "type": "string"
            },
            "tipo_classificacao": {
              "type": "string"
            },
            "st_extinto_ir": {
              "type": "number"
            },
            "data_referencia": {
              "type": "number"
            }
          },
          "required": [
            "codigo_municipio",
            "codigo_item",
            "tipo_item",
            "descricao_item",
            "codigo_amparo_legal",
            "numeto_amparo_legal",
            "data_amparo_legal",
            "data_publicacao",
            "numero_decreto",
            "data_decreto",
            "data_publicacao_decreto",
            "tipo_classificacao",
            "st_extinto_ir",
            "data_referencia"
          ]
        },
        "Desligamento": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "codigo_ingresso": {
              "type": "string"
            },
            "codigo_vinculo": {
              "type": "string"
            },
            "numero_expediente_nomeacao": {
              "type": "string"
            },
            "numero_expediente_desligamento": {
              "type": "string"
            },
            "codigo_desligamento": {
              "type": "string"
            },
            "codigo_expediente": {
              "type": "string"
            },
            "data_expediente_desligamento": {
              "format": "date-time",
              "type": "string"
            },
            "data_publicacao_desligamento": {
              "format": "date-time",
              "type": "string"
            },
            "status_reingresso": {
              "type": "string"
            },
            "data_referencia": {
              "type": "number"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_orgao",
            "codigo_unidade",
            "codigo_ingresso",
            "codigo_vinculo",
            "numero_expediente_nomeacao",
            "numero_expediente_desligamento",
            "codigo_desligamento",
            "codigo_expediente",
            "data_expediente_desligamento",
            "data_publicacao_desligamento",
            "status_reingresso",
            "data_referencia"
          ]
        },
        "AgentesPublico": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "cpf_servidor": {
              "type": "string"
            },
            "codigo_ingresso": {
              "type": "string"
            },
            "codigo_vinculo": {
              "type": "string"
            },
            "numero_expediente_nomeacao": {
              "type": "string"
            },
            "codigo_expediente": {
              "type": "string"
            },
            "data_expediente": {
              "format": "date-time",
              "type": "string"
            },
            "codigo_amparo_legal": {
              "type": "string"
            },
            "numero_amparo_legal": {
              "type": "string"
            },
            "data_amparo_legal": {
              "format": "date-time",
              "type": "string"
            },
            "data_publicacao_amparo_legal": {
              "format": "date-time",
              "type": "string"
            },
            "data_posse": {
              "format": "date-time",
              "type": "string"
            },
            "numero_matricula": {
              "type": "string"
            },
            "situacao_funcional": {
              "type": "string"
            },
            "codigo_regime_juridico": {
              "type": "string"
            },
            "codigo_regime_previdencia": {
              "type": "string"
            },
            "codigo_ocupacao_cbo": {
              "type": "string"
            },
            "tipo_cargo": {
              "type": "string"
            },
            "nm_tipo_cargo": {
              "type": "string"
            },
            "valor_carga_horaria": {
              "type": "number"
            },
            "numero_dependentes": {
              "type": "number"
            },
            "data_referencia_agente_publico": {
              "type": "string"
            },
            "nome_servidor": {
              "type": "string"
            },
            "tipo_programa_social": {
              "type": "string"
            },
            "codigo_programa_social": {
              "type": "string"
            },
            "cargo": {
              "$ref": "#/components/schemas/TipoCargo"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "codigo_orgao",
            "codigo_unidade",
            "cpf_servidor",
            "codigo_ingresso",
            "codigo_vinculo",
            "numero_expediente_nomeacao",
            "codigo_expediente",
            "data_expediente",
            "codigo_amparo_legal",
            "numero_amparo_legal",
            "data_amparo_legal",
            "data_publicacao_amparo_legal",
            "data_posse",
            "numero_matricula",
            "situacao_funcional",
            "codigo_regime_juridico",
            "codigo_regime_previdencia",
            "codigo_ocupacao_cbo",
            "tipo_cargo",
            "nm_tipo_cargo",
            "valor_carga_horaria",
            "numero_dependentes",
            "data_referencia_agente_publico",
            "nome_servidor",
            "tipo_programa_social",
            "codigo_programa_social"
          ]
        },
        "TipoCargo": {
          "type": "object",
          "properties": {
            "cd_tipo_cargo": {
              "type": "string"
            },
            "nm_tipo_cargo": {
              "type": "string"
            },
            "agente": {
              "type": "array",
              "items": {
                "$ref": "#/components/schemas/AgentesPublico"
              }
            }
          },
          "required": [
            "cd_tipo_cargo",
            "nm_tipo_cargo",
            "agente"
          ]
        },
        "ReavalBaixasBensController": {
          "type": "object",
          "properties": {}
        },
        "UndOrcamentariaBenDto": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string",
              "description": "Código do Município"
            },
            "data_referencia": {
              "type": "string",
              "description": "Data da referência, YYYYMM. Ex: 201201"
            },
            "quantidade": {
              "type": "number",
              "description": "Quantidade de dados desejados(Count). Máximo 100"
            },
            "deslocamento": {
              "type": "number",
              "description": "Quantidade de dados pulados(Offset). "
            },
            "numero_registro_bem": {
              "type": "string",
              "description": "Número do registro do Bem"
            },
            "data_disponibilizacao": {
              "type": "string",
              "description": "Data da disponibilização. Utilize o formato “yyyy-mm-dd\" ou para intervalos “yyyy-mm-dd_yyyy-mm-dd\"."
            },
            "codigo_orgao": {
              "type": "string",
              "description": "Código do órgão"
            },
            "codigo_unidade": {
              "type": "string",
              "description": "Código da unidade orçamentária"
            }
          },
          "required": [
            "codigo_municipio",
            "data_referencia",
            "quantidade",
            "deslocamento"
          ]
        },
        "CreateBensMunicipioDto": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string",
              "description": "Código do Município"
            },
            "data_aquisicao_bem": {
              "type": "string",
              "description": "Data de Aquisicao do Bem.. Utilize o seguinte formato yyyy-mm-dd e para pesquisar intervalos yyyy-mm-dd_yyyy-mm-dd. Exemplo 20100101 e intervalos 2010-01-01_2010-01-31."
            },
            "quantidade": {
              "type": "number",
              "description": "Quantidade de dados desejados(Count). Máximo 100"
            },
            "deslocamento": {
              "type": "number",
              "description": "Quantidade de dados pulados(Offset). "
            },
            "numero_registro_bem": {
              "type": "number",
              "description": "Número do Registro do Bem"
            },
            "data_referencia_bem": {
              "type": "number",
              "description": "Data de Referência do Bem, YYYYMM. Ex: 201201."
            }
          },
          "required": [
            "codigo_municipio",
            "data_aquisicao_bem",
            "quantidade",
            "deslocamento"
          ]
        },
        "EmpenhosBensController": {
          "type": "object",
          "properties": {}
        },
        "FontesAnulacaoController": {
          "type": "object",
          "properties": {}
        },
        "GestoresUoDto": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string",
              "description": "Código do Município"
            },
            "exercicio_orcamento": {
              "type": "number",
              "description": "Ano do Exercício do Orçamento. Atenção: a partir do ano de 2007, adicione “00” ao final do ano. Exemplo: 2010 → 201000. Já nos anos de 2003 a 2006, adicione o mês do exercício de acordo com a versão do orçamento enviada no SIM ao final do ano."
            },
            "codigo_orgao": {
              "type": "string",
              "description": "Código do orgão"
            },
            "codigo_unidade": {
              "type": "string",
              "description": "Código da unidade orçamentária"
            },
            "cpf_servidor": {
              "type": "string",
              "description": "Numero do CPF do gestor"
            },
            "data_fim_gestao": {
              "type": "string",
              "description": "Data de Inicio da Gestao. Utilize o seguinte formato yyyy-mm-dd e para pesquisar intervalos yyyy-mm-dd_yyyy-mm-dd. Exemplo 2010-01-01 e intervalos 2010-01-01_2010-01-31"
            },
            "data_referencia_gestor": {
              "type": "string",
              "description": "Data de Referencia da Documentacao"
            }
          },
          "required": [
            "codigo_municipio"
          ]
        },
        "RealocOrcamentariasController": {
          "type": "object",
          "properties": {}
        },
        "DestinoRealocOrcController": {
          "type": "object",
          "properties": {}
        },
        "CreditosAdicionaisController": {
          "type": "object",
          "properties": {}
        },
        "MovimentacoesFontes": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string"
            },
            "exercicio_orcamento": {
              "type": "number"
            },
            "data_modif_fonte_mf": {
              "format": "date-time",
              "type": "string"
            },
            "nu_seq_no_dia_mf": {
              "type": "number"
            },
            "tipo_movimentacao_mf": {
              "type": "string"
            },
            "codigo_orgao": {
              "type": "string"
            },
            "codigo_unidade": {
              "type": "string"
            },
            "codigo_funcao": {
              "type": "string"
            },
            "codigo_subfuncao": {
              "type": "string"
            },
            "codigo_programa": {
              "type": "string"
            },
            "codigo_projeto_atividade": {
              "type": "string"
            },
            "numero_projeto_atividade": {
              "type": "string"
            },
            "numero_subprojeto_atividade": {
              "type": "string"
            },
            "codigo_elemento_despesa": {
              "type": "string"
            },
            "tipo_fonte": {
              "type": "string"
            },
            "codigo_fonte": {
              "type": "string"
            },
            "tipo_fonte_destino": {
              "type": "string"
            },
            "codigo_fonte_destino": {
              "type": "string"
            },
            "valor_movimentacao_mf": {
              "type": "number"
            },
            "data_ref_mf": {
              "type": "number"
            }
          },
          "required": [
            "codigo_municipio",
            "exercicio_orcamento",
            "data_modif_fonte_mf",
            "nu_seq_no_dia_mf",
            "tipo_movimentacao_mf",
            "codigo_orgao",
            "codigo_unidade",
            "codigo_funcao",
            "codigo_subfuncao",
            "codigo_programa",
            "codigo_projeto_atividade",
            "numero_projeto_atividade",
            "numero_subprojeto_atividade",
            "codigo_elemento_despesa",
            "tipo_fonte",
            "codigo_fonte",
            "tipo_fonte_destino",
            "codigo_fonte_destino",
            "valor_movimentacao_mf",
            "data_ref_mf"
          ]
        },
        "SituacaoRemessaDto": {
          "type": "object",
          "properties": {
            "codigo_municipio": {
              "type": "string",
              "description": "Código do Município"
            },
            "data_referencia": {
              "type": "number",
              "description": "Data de Referência da Remessa: utilize o formato “yyyymm”. Exemplo: 201001"
            },
            "codigo_orgao": {
              "type": "string",
              "description": "Código do Órgão"
            }
          },
          "required": [
            "codigo_municipio"
          ]
        }
      }
    }
  },
  "customOptions": {
    "ignoreGlobalPrefix": true
  },
  "swaggerUrl": {}
};
  url = options.swaggerUrl || url
  var urls = options.swaggerUrls
  var customOptions = options.customOptions
  var spec1 = options.swaggerDoc
  var swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (var attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  var ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.oauth) {
    ui.initOAuth(customOptions.oauth)
  }

  if (customOptions.preauthorizeApiKey) {
    const key = customOptions.preauthorizeApiKey.authDefinitionKey;
    const value = customOptions.preauthorizeApiKey.apiKeyValue;
    if (!!key && !!value) {
      const pid = setInterval(() => {
        const authorized = ui.preauthorizeApiKey(key, value);
        if(!!authorized) clearInterval(pid);
      }, 500)

    }
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }

  window.ui = ui
}
