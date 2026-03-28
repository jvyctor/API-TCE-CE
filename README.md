# API TCE-CE

Aplicação full stack para consulta dos dados abertos do TCE-CE com uma API ASP.NET Core e uma interface web em Next.js.

## O que o projeto faz

- Consome a API oficial de dados abertos do TCE-CE
- Descobre dinamicamente os parâmetros obrigatórios a partir da documentação Swagger
- Expõe um proxy local com paginação
- Permite selecionar endpoint, município e filtros dinâmicos no frontend
- Valida formatos de data antes da consulta
- Exibe os registros retornados em JSON legível

## Arquitetura

- `src/TceCeProxy.Api`: API ASP.NET Core Minimal API
- `frontend`: aplicação Next.js

## Requisitos

- .NET SDK 10
- Node.js 20 ou superior
- npm

## Como executar localmente

### 1. Clonar o repositório

```powershell
git clone https://github.com/jvyctor/API-TCE-CE.git
cd API-TCE-CE
```

### 2. Subir a API

```powershell
dotnet restore .\src\TceCeProxy.Api\TceCeProxy.Api.csproj
dotnet run --project .\src\TceCeProxy.Api\TceCeProxy.Api.csproj -- --urls http://localhost:8080
```

API disponível em:

- `http://localhost:8080`
- `http://localhost:8080/health`
- `http://localhost:8080/api/resources`

### 3. Subir o frontend

Em outro terminal:

```powershell
cd .\frontend
npm install
npm run dev
```

Frontend disponível em:

- `http://localhost:3000`

## Como gerar build

### API

```powershell
dotnet build .\src\TceCeProxy.Api\TceCeProxy.Api.csproj
```

### Frontend

```powershell
cd .\frontend
npm run build
```

## Exemplo de consulta

Exemplo usando o proxy local:

```text
http://localhost:8080/api/resources/orgaos?page=1&pageSize=25&codigo_municipio=002&exercicio_orcamento=202400
```

## Pontos fortes da aplicação

- Leitura dinâmica dos endpoints e parâmetros a partir da documentação oficial do TCE-CE
- Cache em memória para reduzir chamadas repetidas
- Paginação local para facilitar navegação no frontend
- Seleção de município com preenchimento automático de `codigo_municipio`
- Campos obrigatórios e opcionais renderizados dinamicamente
- Validação visual e funcional para datas como `yyyy-mm-dd`, `yyyy-mm-dd_yyyy-mm-dd` e `yyyymm`
- Resultado em JSON com leitura mais confortável e opção de expandir ou recolher registros

## Estrutura do projeto

```text
.
├── frontend
├── src
│   └── TceCeProxy.Api
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Docker

Se quiser rodar com Docker:

```powershell
docker compose up --build
```

## Referências oficiais

- Documentação: `https://api-dados-abertos.tce.ce.gov.br/docs/`
- API base: `https://api-dados-abertos.tce.ce.gov.br/`
