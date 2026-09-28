import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GerarConviteLink } from "./GerarConviteLink";
import { criarConviteFicha } from "@/lib/api";

vi.mock("@/lib/api");

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const TITULO_QR = "QR Code do link de preenchimento";

function renderComponente() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <GerarConviteLink />
    </QueryClientProvider>,
  );
}

async function gerarLink() {
  fireEvent.click(screen.getByRole("button", { name: /Gerar link de preenchimento/ }));
  await screen.findByDisplayValue("https://exemplo.test/ficha-publica/abc123");
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(criarConviteFicha).mockResolvedValue({
    id: 1,
    linkCompleto: "https://exemplo.test/ficha-publica/abc123",
    dataCriacao: "2026-09-27T10:00:00",
    dataExpiracao: "2026-10-04T10:00:00",
    status: "ATIVO",
    usadoEm: null,
  });
});

describe("GerarConviteLink - QR Code", () => {
  it("não mostra o QR antes do clique", async () => {
    renderComponente();
    await gerarLink();

    expect(screen.queryByTitle(TITULO_QR)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Mostrar QR Code/ })).toBeInTheDocument();
  });

  it("mostra o QR ao clicar e esconde no segundo clique", async () => {
    renderComponente();
    await gerarLink();

    fireEvent.click(screen.getByRole("button", { name: /Mostrar QR Code/ }));
    expect(screen.getByTitle(TITULO_QR)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Esconder QR Code/ }));
    expect(screen.queryByTitle(TITULO_QR)).not.toBeInTheDocument();
  });
});
