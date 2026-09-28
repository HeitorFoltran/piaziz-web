import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FichasPendentes from "./FichasPendentes";
import { listarFichasPendentes } from "@/lib/api";

vi.mock("@/lib/api");

// Layout depende do AuthContext; aqui só interessa o conteúdo da página.
vi.mock("@/components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const AVISO_APROVADA = /aprovados são apagados 30 dias após a revisão/;
const AVISO_REJEITADA = /rejeitados são apagados 90 dias após a revisão/;

function renderPagina() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <FichasPendentes />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listarFichasPendentes).mockResolvedValue([]);
});

describe("FichasPendentes - aviso de retenção", () => {
  it("não mostra aviso na aba Pendente", async () => {
    renderPagina();
    await screen.findByText("Nenhuma ficha pendente.");

    expect(screen.queryByText(AVISO_APROVADA)).toBeNull();
    expect(screen.queryByText(AVISO_REJEITADA)).toBeNull();
  });

  it("mostra o prazo de 30 dias na aba Aprovada", async () => {
    renderPagina();
    fireEvent.click(screen.getByRole("button", { name: "Aprovada" }));

    expect(await screen.findByText(AVISO_APROVADA)).toBeInTheDocument();
    expect(screen.queryByText(AVISO_REJEITADA)).toBeNull();
  });

  it("mostra o prazo de 90 dias na aba Rejeitada", async () => {
    renderPagina();
    fireEvent.click(screen.getByRole("button", { name: "Rejeitada" }));

    expect(await screen.findByText(AVISO_REJEITADA)).toBeInTheDocument();
    expect(screen.queryByText(AVISO_APROVADA)).toBeNull();
  });

  it("some ao voltar para a aba Pendente", async () => {
    renderPagina();
    fireEvent.click(screen.getByRole("button", { name: "Aprovada" }));
    await screen.findByText(AVISO_APROVADA);

    fireEvent.click(screen.getByRole("button", { name: "Pendente" }));

    expect(screen.queryByText(AVISO_APROVADA)).toBeNull();
    expect(screen.queryByText(AVISO_REJEITADA)).toBeNull();
  });
});
