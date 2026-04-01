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
      data_expediente: "2025-03-03T03:00:00.000Z",
    },
    {
      nome_servidor: "Joao Souza",
      cargo: "Tecnico",
      ativo: false,
      exercicio_orcamento: "202600",
      data_expediente: "2025-03-04 11:22:33",
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
        selectedMunicipalityCode="013"
        requestPageSize={25}
      />
    );

    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getAllByText("Nome").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Maria Silva").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sim").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Nao").length).toBeGreaterThan(0);
    expect(screen.getAllByText("03-03-2025").length).toBeGreaterThan(0);
    expect(screen.getAllByText("04-03-2025").length).toBeGreaterThan(0);
    expect(screen.queryByText("2025-03-03T03:00:00.000Z")).not.toBeInTheDocument();
    expect(screen.queryByText("2025-03-04 11:22:33")).not.toBeInTheDocument();
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
        selectedMunicipalityCode="013"
        requestPageSize={25}
      />
    );

    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(screen.getByText("Visualizacao tabular habilitada para o endpoint `Contrato`.")).toBeInTheDocument();
  });

  it("renders objeto as the last visible contrato column", () => {
    render(
      <ResultsPanel
        payload={{
          ...basePayload,
          resource: "contrato",
          items: [
            {
              modalidade_contrato: "OR",
              numero_contrato_original: "123",
              data_inicio_vigencia_contrato: "2025-01-17",
              descricao_objeto_contrato: "Selecao de melhor proposta",
              valor_total_contrato: 2000,
            },
          ],
        }}
        filters={[]}
        selectedResource="contrato"
        resourceCategory="Aquisicoes e contratos"
        municipality={{ codigo_municipio: "013", nome_municipio: "Aquiraz" }}
        selectedMunicipalityCode="013"
        requestPageSize={25}
      />
    );

    const headers = screen.getAllByRole("columnheader").map((header) => header.textContent?.trim());
    expect(headers.at(-1)).toBe("Objeto");
    expect(screen.getAllByText("17-01-2025").length).toBeGreaterThan(0);
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
        selectedMunicipalityCode="013"
        requestPageSize={100}
      />
    );

    expect(
      screen.getByText(/Role ate o fim da grade para carregar mais registros automaticamente\.|Carregando mais registros\.\.\./)
    ).toBeInTheDocument();
  });

  it("renders the export buttons", () => {
    render(
      <ResultsPanel
        payload={basePayload}
        filters={[]}
        selectedResource="agentes_publicos"
        resourceCategory="Pessoal"
        municipality={{ codigo_municipio: "013", nome_municipio: "Aquiraz" }}
        selectedMunicipalityCode="013"
        requestPageSize={100}
      />
    );

    expect(screen.getByRole("button", { name: "Exportar CSV completo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Baixar TXT" })).toBeInTheDocument();
  });
});
