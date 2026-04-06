import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
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

Object.defineProperty(navigator, "clipboard", {
  writable: true,
  value: {
    writeText: vi.fn(),
  },
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
    expect(screen.getByRole("searchbox", { name: "Pesquisar na tabela" })).toBeInTheDocument();
    expect(screen.getAllByText("Nome").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Maria Silva").length).toBeGreaterThan(0);
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
    expect(screen.getByText("Leitura consolidada do controle `Contrato`.")).toBeInTheDocument();
  });

  it("renders contrato with a curated primary column set", () => {
    render(
      <ResultsPanel
        payload={{
          ...basePayload,
          resource: "contrato",
          items: [
            {
              modalidade_contrato: "OR",
              numero_contrato: "456",
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
    expect(headers).toEqual(["Numero", "Modalidade", "Valor total", "Inicio da vigencia", "Objeto"]);
    expect(screen.getAllByText("17-01-2025").length).toBeGreaterThan(0);
  });

  it("orders contrato records by ascending inicio da vigencia", () => {
    render(
      <ResultsPanel
        payload={{
          ...basePayload,
          resource: "contrato",
          items: [
            {
              numero_contrato: "900",
              data_inicio_vigencia_contrato: "2025-03-10",
              modalidade_contrato: "OR",
              valor_total_contrato: 2000,
            },
            {
              numero_contrato: "100",
              data_inicio_vigencia_contrato: "2025-01-08",
              modalidade_contrato: "PP",
              valor_total_contrato: 500,
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

    const numberCells = screen.getAllByRole("gridcell").filter((cell) =>
      cell.textContent === "100" || cell.textContent === "900"
    );

    expect(numberCells[0]).toHaveTextContent("100");
    expect(numberCells[1]).toHaveTextContent("900");
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

    expect(screen.getByRole("button", { name: "Exportar CSV" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Baixar TXT" })).not.toBeInTheDocument();
  });

  it("opens a modal with organized record details when a row is clicked", () => {
    render(
      <ResultsPanel
        payload={{
          ...basePayload,
          items: [
            {
              nome_servidor: "Maria Silva",
              cargo: "Analista",
              cpf: "12345678900",
              ingresso: "Efetivo",
              data_expediente: "2025-03-03T03:00:00.000Z",
              ativo: true,
              matricula: "7788",
            },
          ],
        }}
        filters={[]}
        selectedResource="agentes_publicos"
        resourceCategory="Pessoal"
        municipality={{ codigo_municipio: "013", nome_municipio: "Aquiraz" }}
        selectedMunicipalityCode="013"
        requestPageSize={25}
      />
    );

    fireEvent.click(screen.getByRole("gridcell", { name: "Maria Silva" }));

    expect(screen.getByText("Detalhamento do registro")).toBeInTheDocument();
    expect(screen.getByText("Informacoes principais")).toBeInTheDocument();
    expect(screen.getByText("Campos complementares")).toBeInTheDocument();
    expect(screen.getAllByText("Sim").length).toBeGreaterThan(0);
  });

  it("navigates to the next record from inside the modal", () => {
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

    fireEvent.click(screen.getByRole("gridcell", { name: "Maria Silva" }));
    fireEvent.click(screen.getByRole("button", { name: /Proximo registro/i }));

    expect(screen.getAllByText("Joao Souza").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Tecnico").length).toBeGreaterThan(0);
  });

  it("filters the loaded rows with the local table search", () => {
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

    fireEvent.change(screen.getByRole("searchbox", { name: "Pesquisar na tabela" }), {
      target: { value: "Joao" },
    });

    expect(screen.queryByText("Maria Silva")).not.toBeInTheDocument();
    expect(screen.getAllByText("Joao Souza").length).toBeGreaterThan(0);
  });

  it("shows the custom empty state when the local table search finds nothing", () => {
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

    fireEvent.change(screen.getByRole("searchbox", { name: "Pesquisar na tabela" }), {
      target: { value: "registro-inexistente" },
    });

    expect(screen.getByText("Sem registros encontrados")).toBeInTheDocument();
  });

  it("copies the selected record from inside the modal", async () => {
    vi.mocked(navigator.clipboard.writeText).mockClear();

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

    fireEvent.click(screen.getByRole("gridcell", { name: "Maria Silva" }));
    fireEvent.click(screen.getByRole("button", { name: /Copiar registro/i }));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    });
    expect(vi.mocked(navigator.clipboard.writeText).mock.calls[0]?.[0]).toContain('"nome_servidor": "Maria Silva"');
  });
});
