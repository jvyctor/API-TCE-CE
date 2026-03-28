import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryForm } from "@/components/query-form";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
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
];

const municipalities = [
  { codigo_municipio: "013", nome_municipio: "AQUIRAZ" },
];

describe("QueryForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
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
        "/?resource=contrato&page=1&pageSize=25&codigo_municipio=013&quantidade=25&deslocamento=0"
      );
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
    expect(screen.getByText("data_contrato")).toBeInTheDocument();
    expect(screen.getByDisplayValue("013")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "25" })).not.toHaveLength(0);
    expect(screen.getByLabelText(/deslocamento/i)).toHaveValue(0);
  });

  it("uses quantidade as the effective page size when submitting", async () => {
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

    await user.click(screen.getAllByRole("button", { name: "100" })[0]);
    await user.click(screen.getByRole("button", { name: "Consultar" }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        "/?resource=contrato&page=1&pageSize=100&codigo_municipio=013&data_contrato=2025-01-01_2025-12-31&quantidade=100&deslocamento=0"
      );
    });
  });
});
