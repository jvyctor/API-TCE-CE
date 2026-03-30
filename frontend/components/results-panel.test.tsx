import { render, screen } from "@testing-library/react";
import { ResultsPanel } from "@/components/results-panel";

const basePayload = {
  resource: "agentes_publicos",
  sourceUrl: "http://localhost:8080/api/resources/agentes_publicos",
  page: 1,
  pageSize: 25,
  totalItems: 2,
  totalPages: 1,
  items: [
    {
      nome_servidor: "Maria Silva",
      cargo: "Analista",
      ativo: true,
    },
    {
      nome_servidor: "Joao Souza",
      cargo: "Tecnico",
      ativo: false,
    },
  ],
  metadata: {},
  cachedAtUtc: "2026-03-30T00:00:00Z",
  expiresAtUtc: "2026-03-30T01:00:00Z",
};

describe("ResultsPanel", () => {
  it("renders agentes_publicos as a table", () => {
    render(
      <ResultsPanel
        payload={basePayload}
        filters={[]}
        selectedResource="agentes_publicos"
        resourceCategory="Pessoal"
        municipality={{ codigo_municipio: "013", nome_municipio: "Aquiraz" }}
        apiBaseUrl="http://localhost:8080"
        selectedMunicipalityCode="013"
        requestPageSize={25}
      />
    );

    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getByText("Nome")).toBeInTheDocument();
    expect(screen.getByText("Maria Silva")).toBeInTheDocument();
    expect(screen.getByText("Sim")).toBeInTheDocument();
    expect(screen.getByText("Nao")).toBeInTheDocument();
  });

  it("renders other endpoints as a table too", () => {
    render(
      <ResultsPanel
        payload={{ ...basePayload, resource: "contrato" }}
        filters={[]}
        selectedResource="contrato"
        resourceCategory="Aquisicoes e contratos"
        municipality={{ codigo_municipio: "013", nome_municipio: "Aquiraz" }}
        apiBaseUrl="http://localhost:8080"
        selectedMunicipalityCode="013"
        requestPageSize={25}
      />
    );

    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getByText("Visualizacao tabular habilitada para o endpoint `Contrato`.")).toBeInTheDocument();
  });

  it("renders a load more button below the results when another page exists", () => {
    render(
      <ResultsPanel
        payload={{
          ...basePayload,
          pageSize: 100,
          totalItems: 101,
          totalPages: 2,
          metadata: { hasMorePages: true, sourcePagination: true, totalItemsExact: false },
        }}
        filters={[]}
        selectedResource="contrato"
        resourceCategory="Aquisicoes e contratos"
        municipality={{ codigo_municipio: "013", nome_municipio: "Aquiraz" }}
        apiBaseUrl="http://localhost:8080"
        selectedMunicipalityCode="013"
        requestPageSize={100}
      />
    );

    expect(screen.getByRole("button", { name: "Exibir mais 250" })).toBeInTheDocument();
  });

  it("renders the full CSV export button", () => {
    render(
      <ResultsPanel
        payload={basePayload}
        filters={[]}
        selectedResource="agentes_publicos"
        resourceCategory="Pessoal"
        municipality={{ codigo_municipio: "013", nome_municipio: "Aquiraz" }}
        apiBaseUrl="http://localhost:8080"
        selectedMunicipalityCode="013"
        requestPageSize={100}
      />
    );

    expect(screen.getByRole("button", { name: "Exportar CSV completo" })).toBeInTheDocument();
  });
});
