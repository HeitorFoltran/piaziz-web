import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FichaPublica from "./FichaPublica";
import { getFichaPublicaStatus, submitFichaPublica } from "@/lib/api";

vi.mock("@/lib/api");

function renderPagina() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/ficha-publica/tok123"]}>
        <Routes>
          <Route path="/ficha-publica/:token" element={<FichaPublica />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("FichaPublica", () => {
  it("mostra mensagem de link expirado sem formulário", async () => {
    vi.mocked(getFichaPublicaStatus).mockResolvedValue({ valido: false, motivo: "expirado" });
    renderPagina();
    expect(await screen.findByText(/este link expirou/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Enviar" })).not.toBeInTheDocument();
  });

  it("não envia com CPF inválido", async () => {
    vi.mocked(getFichaPublicaStatus).mockResolvedValue({ valido: true, motivo: null });
    renderPagina();
    fireEvent.change(await screen.findByLabelText("Nome *"), { target: { value: "Maria" } });
    fireEvent.change(screen.getByLabelText("CPF *"), { target: { value: "11111111111" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/cpf/i);
    expect(submitFichaPublica).not.toHaveBeenCalled();
  });

  it("envia os campos preenchidos e mostra a confirmação", async () => {
    vi.mocked(getFichaPublicaStatus).mockResolvedValue({ valido: true, motivo: null });
    vi.mocked(submitFichaPublica).mockResolvedValue(undefined);
    renderPagina();
    fireEvent.change(await screen.findByLabelText("Nome *"), { target: { value: "Maria" } });
    fireEvent.change(screen.getByLabelText("CPF *"), { target: { value: "52998224725" } });
    fireEvent.change(screen.getByLabelText("Idade"), { target: { value: "34" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByText(/recebemos suas informações/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(submitFichaPublica).toHaveBeenCalledWith("tok123", {
        nome: "Maria",
        cpf: "529.982.247-25",
        telefone: undefined,
        idade: 34,
        situacaoRelatada: undefined,
      }),
    );
  });
});
