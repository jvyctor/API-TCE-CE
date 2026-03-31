import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryForm } from "@/components/query-form";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
  usePathname: () => "/",
}));

const resources = [
  {
    key: "municipios",
    queryParameters: [],
    requiredQueryParameters: [],
    optionalQueryParameters: [],
  },
  {
    key: "funcoes",
    requiredQueryParameters: [],
    optionalQueryParameters: ["codigo_funcao", "nome_funcao"],
    queryParameters: [
      { name: "codigo_funcao", required: false, type: "string" },
      { name: "nome_funcao", required: false, type: "string" },
    ],
  },
  {
    key: "contrato",
    requiredQueryParameters: ["codigo_municipio", "data_contrato", "quantidade", "deslocamento"],
    optionalQueryParameters: ["numero_contrato"],
    queryParameters: [
      { name: "codigo_municipio", required: true, type: "string" },
      { name: "data_contrato", required: true, type: "string" },
      { name: "quantidade", required: true, type: "number" },
      { name: "deslocamento", required: true, type: "number" },
      { name: "numero_contrato", required: false, type: "string" },
    ],
  },
  {
    key: "agentes_publicos",
    requiredQueryParameters: ["codigo_municipio", "exercicio_orcamento", "quantidade", "deslocamento"],
    optionalQueryParameters: [],
    queryParameters: [
      { name: "codigo_municipio", required: true, type: "string" },
      { name: "exercicio_orcamento", required: true, type: "string", description: "Descricao longa que nao deve aparecer." },
      { name: "quantidade", required: true, type: "number" },
      { name: "deslocamento", required: true, type: "number" },
    ],
  },
];

const municipalities = [
  { codigo_municipio: "013", nome_municipio: "AQUIRAZ" },
];

describe("QueryForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
  });

  it("navigates with required source pagination params when endpoint changes", async () => {
    const user = userEvent.setup();

    render(
      <QueryForm
        initialFilters={[]}
        municipalities={municipalities}
        page={1}
        pageSize={25}
        resources={resources}
        selectedMunicipalityCode="013"
        selectedResource="municipios"
      />
    );

    await user.selectOptions(screen.getByLabelText("Endpoint"), "contrato");

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        "/?resource=contrato&page=1&pageSize=100&codigo_municipio=013"
      );
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("renders required endpoint fields for contrato", () => {
    render(
      <QueryForm
        initialFilters={[]}
        municipalities={municipalities}
        page={1}
        pageSize={25}
        resources={resources}
        selectedMunicipalityCode="013"
        selectedResource="contrato"
      />
    );

    expect(screen.getByText("Campos obrigatorios (4)")).toBeInTheDocument();
    expect(screen.getByText("Data")).toBeInTheDocument();
    expect(screen.getByLabelText("Municipio")).toHaveValue("013");
    expect(screen.queryByText("quantidade")).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/deslocamento/i)).not.toBeInTheDocument();
  });

  it("updates visible required fields when the endpoint selection changes", async () => {
    const user = userEvent.setup();

    render(
      <QueryForm
        initialFilters={[]}
        municipalities={municipalities}
        page={1}
        pageSize={25}
        resources={resources}
        selectedMunicipalityCode="013"
        selectedResource="municipios"
      />
    );

    expect(screen.queryByText("Campos obrigatorios (4)")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Endpoint"), "contrato");

    expect(screen.getByText("Campos obrigatorios (4)")).toBeInTheDocument();
    expect(screen.getByText("Data")).toBeInTheDocument();
    expect(screen.getByLabelText("Municipio")).toHaveValue("013");
  });

  it("does not navigate immediately when only the municipality changes", async () => {
    const user = userEvent.setup();

    render(
      <QueryForm
        initialFilters={[]}
        municipalities={[
          ...municipalities,
          { codigo_municipio: "003", nome_municipio: "ACARAPE" },
        ]}
        page={1}
        pageSize={25}
        resources={resources}
        selectedMunicipalityCode="013"
        selectedResource="contrato"
      />
    );

    await user.selectOptions(screen.getByLabelText("Municipio"), "003");

    expect(screen.getByLabelText("Municipio")).toHaveValue("003");
    expect(pushMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it("shows funcoes fields without municipality selection", () => {
    render(
      <QueryForm
        initialFilters={[]}
        municipalities={municipalities}
        page={1}
        pageSize={25}
        resources={resources}
        selectedMunicipalityCode=""
        selectedResource="funcoes"
      />
    );

    expect(screen.queryByLabelText("Municipio")).not.toBeInTheDocument();
    expect(screen.getByText("Campos opcionais (2)")).toBeInTheDocument();
    expect(screen.getByLabelText("Codigo da funcao")).toBeInTheDocument();
    expect(screen.getByLabelText("Nome da funcao")).toBeInTheDocument();
  });

  it("renders exercicio orcamentario as a year select with concise help text", () => {
    render(
      <QueryForm
        initialFilters={[]}
        municipalities={municipalities}
        page={1}
        pageSize={25}
        resources={resources}
        selectedMunicipalityCode="013"
        selectedResource="agentes_publicos"
      />
    );

    const exercicioSelect = screen.getByRole("combobox", { name: /Exercicio orcamentario/i });
    expect(exercicioSelect.tagName).toBe("SELECT");
    expect(screen.getByRole("option", { name: "2008" })).toHaveValue("200800");
    expect(screen.getByRole("option", { name: String(new Date().getFullYear()) })).toHaveValue(
      `${new Date().getFullYear()}00`
    );
    expect(screen.getByText("Selecione o exercicio.")).toBeInTheDocument();
    expect(screen.queryByText("Descricao longa que nao deve aparecer.")).not.toBeInTheDocument();
  });

  it("submits full fetch params without exposing quantidade", async () => {
    const user = userEvent.setup();

    render(
      <QueryForm
        initialFilters={[
          { key: "data_contrato", value: "2025-01-01_2025-12-31" },
          { key: "quantidade", value: "25" },
          { key: "deslocamento", value: "0" },
        ]}
        municipalities={municipalities}
        page={1}
        pageSize={25}
        resources={resources}
        selectedMunicipalityCode="013"
        selectedResource="contrato"
      />
    );

    await user.click(screen.getByRole("button", { name: "Consultar" }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        "/?resource=contrato&page=1&pageSize=100&codigo_municipio=013&data_contrato=2025-01-01_2025-12-31"
      );
    });
  });

  it("highlights required fields in red when submitting with missing values", async () => {
    const user = userEvent.setup();

    render(
      <QueryForm
        initialFilters={[]}
        municipalities={municipalities}
        page={1}
        pageSize={25}
        resources={resources}
        selectedMunicipalityCode="013"
        selectedResource="contrato"
      />
    );

    expect(screen.getByText("Campos obrigatorios (4)").closest("fieldset")).not.toHaveClass("border-destructive");

    await user.click(screen.getByRole("button", { name: "Consultar" }));

    expect(pushMock).not.toHaveBeenCalled();
    expect(screen.getByText("Preencha este campo obrigatorio para consultar.")).toBeInTheDocument();
    expect(screen.getByText("Campos obrigatorios (4)").closest("fieldset")).toHaveClass("border-destructive");
  });
});
