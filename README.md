# API-TCE-CE

Aplicação full stack para consulta dos dados abertos do TCE-CE com proxy em ASP.NET Core e interface web em Next.js.

## Visão geral

O projeto simplifica a consulta aos dados públicos do Tribunal de Contas do Estado do Ceará. A API descobre dinamicamente os recursos e parâmetros expostos pelo Swagger oficial, normaliza as respostas e entrega uma experiência de consumo mais amigável no frontend.

## Preview

![Preview da aplicação](./Grupo-SS.png)

## Principais funcionalidades

- Consumo da API oficial de dados abertos do TCE-CE
- Descoberta dinâmica de endpoints e parâmetros obrigatórios
- Proxy local com paginação e tratamento de erros
- Interface para seleção de recurso, município e filtros dinâmicos
- Validação de formatos de data antes da consulta
- Exibição dos dados em JSON legível e organizado

## Arquitetura

- `src/TceCeProxy.Api`: backend em ASP.NET Core Minimal API
- `frontend`: aplicação web em Next.js
- `tests/TceCeProxy.Api.Tests`: testes do backend

## Stack

- ASP.NET Core
- .NET 10
- Next.js
- TypeScript
- Tailwind CSS
- Docker
- Render

## Como executar localmente

### 1. Clonar o repositório

```powershell
git clone https://github.com/jvyctor/API-TCE-CE.git
cd API-TCE-CE
```

### 2. Iniciar a API

```powershell
dotnet restore .\src\TceCeProxy.Api\TceCeProxy.Api.csproj
dotnet run --project .\src\TceCeProxy.Api\TceCeProxy.Api.csproj -- --urls http://localhost:8080
```

### 3. Iniciar o frontend

```powershell
cd .\frontend
npm install
npm run dev
```

## Endpoints locais

- Frontend: `http://localhost:3000`
- API: `http://localhost:8080`
- Health check: `http://localhost:8080/health`
- Catálogo de recursos: `http://localhost:8080/api/resources`

## Testes e build

### Backend

```powershell
dotnet test .\tests\TceCeProxy.Api.Tests\TceCeProxy.Api.Tests.csproj
dotnet build .\src\TceCeProxy.Api\TceCeProxy.Api.csproj
```

### Frontend

```powershell
cd .\frontend
npm run test
npm run build
```

## Exemplo de consulta

```text
http://localhost:8080/api/resources/orgaos?page=1&pageSize=25&codigo_municipio=002&exercicio_orcamento=202400
```

## Diferenciais técnicos

- Leitura dinâmica da documentação oficial do TCE-CE
- Cache em memória para reduzir chamadas repetidas
- Paginação local para navegação mais fluida
- Mapeamento amigável de filtros obrigatórios e opcionais
- Seleção assistida de município com preenchimento de `codigo_municipio`
- Tratamento visual de erros no frontend

## Deploy

O repositório já está preparado para deploy com Render por meio do arquivo `render.yaml`.

Serviços previstos:

- `tcece-proxy-api`: backend ASP.NET Core
- `tcece-proxy-web`: frontend Next.js

Variáveis importantes:

- `API_INTERNAL_URL`: comunicação interna entre serviços no Render
- `NEXT_PUBLIC_API_URL`: URL pública do backend
- `TceCeApi__ApiKey`: opcional
- `TceCeApi__ApiKeyHeaderName`: opcional

## Referências oficiais

- Documentação: `https://api-dados-abertos.tce.ce.gov.br/docs/`
- API base: `https://api-dados-abertos.tce.ce.gov.br/`
