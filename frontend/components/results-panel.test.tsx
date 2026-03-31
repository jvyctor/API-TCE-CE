import { render, screen } from "@testing-library/react";
import { ResultsPanel } from "@/components/results-panel";

class IntersectionObserverMock {
  observe() {}
  disconnect() {}
  unobserve() {}
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  value: IntersectionObserverMock,
});

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
      exercicio_orcamento: "202600",
    },
    {
      nome_servidor: "Joao Souza",
      cargo: "Tecnico",
      ativo: false,
      exercicio_orcamento: "202600",
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
    expect(screen.getAllByText("Nome").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Maria Silva").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sim").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Nao").length).toBeGreaterThan(0);
    expect(screen.queryByText("Exercicio orcamentario")).not.toBeInTheDocument();
    expect(screen.queryAllByText("202600")).toHaveLength(0);
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

  it("renders the automatic pagination hint when another page exists", () => {
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

    expect(
      screen.getByText(/Role ate o fim da grade para carregar mais registros automaticamente\.|Carregando mais registros\.\.\./)
    ).toBeInTheDocument();
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
