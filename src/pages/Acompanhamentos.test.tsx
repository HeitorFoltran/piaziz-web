import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Acompanhamentos from "./Acompanhamentos";
import { getAcompanhamentos, getServicos } from "@/lib/api";
import type { Acompanhamento } from "@/types/api";

vi.mock("@/lib/api");

// Layout depende do AuthContext; aqui só interessa o conteúdo da página.
vi.mock("@/components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function acompanhamento(overrides: Partial<Acompanhamento>): Acompanhamento {
  return {
    id: 1,
    numeroCaso: "C-001",
    codigoFicha: "F-001",
    nome: "Maria",
    cpf: "***.316.248-**",
    encaminhamento: null,
    tipoEncaminhamento: null,
    status: "ATIVO",
    dataCriacao: "2026-09-01T10:00:00",
    dataAtualizacao: "2026-09-01T10:00:00",
    tiposAcompanhamento: [],
    ...overrides,
  };
}

// Criação e atualização em ordens diferentes, para a troca de campo mudar o resultado.
const itens = [
  acompanhamento({ id: 1, nome: "Maria", dataCriacao: "2026-09-01T08:00:00", dataAtualizacao: "2026-09-25T23:30:00" }),
  acompanhamento({ id: 2, nome: "Joana", dataCriacao: "2026-09-10T23:59:00", dataAtualizacao: "2026-09-12T09:00:00" }),
  acompanhamento({ id: 3, nome: "Lúcia", dataCriacao: "2026-09-20T00:00:00", dataAtualizacao: "2026-09-20T00:00:00" }),
];

function renderPagina() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Acompanhamentos />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function setData(rotulo: "De" | "Até", valor: string) {
  fireEvent.change(screen.getByLabelText(rotulo), { target: { value: valor } });
}

function escolherCampo(opcao: "Data de criação" | "Última atualização") {
  fireEvent.keyDown(screen.getByRole("combobox", { name: "Campo de data" }), { key: "Enter" });
  fireEvent.click(screen.getByRole("option", { name: opcao }));
}

function nomesVisiveis() {
  return ["Maria", "Joana", "Lúcia"].filter((nome) => screen.queryByText(nome) !== null);
}

beforeAll(() => {
  // O Select do Radix usa APIs que o jsdom não implementa.
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAcompanhamentos).mockResolvedValue(itens);
  vi.mocked(getServicos).mockResolvedValue([]);
});

describe("Acompanhamentos — filtro por data", () => {
  it("filtra por data de criação com intervalo inclusivo nas bordas", async () => {
    renderPagina();
    await screen.findByText("Maria");

    escolherCampo("Data de criação");
    setData("De", "2026-09-10");
    setData("Até", "2026-09-20");

    await waitFor(() => expect(nomesVisiveis()).toEqual(["Joana", "Lúcia"]));
  });

  it("trocar para última atualização muda o resultado", async () => {
    renderPagina();
    await screen.findByText("Maria");

    escolherCampo("Data de criação");
    setData("De", "2026-09-15");
    await waitFor(() => expect(nomesVisiveis()).toEqual(["Lúcia"]));

    escolherCampo("Última atualização");
    await waitFor(() => expect(nomesVisiveis()).toEqual(["Maria", "Lúcia"]));
    expect(screen.getAllByText(/^Atualizado:/)).toHaveLength(2);
  });

  it("Limpar datas volta a lista inteira", async () => {
    renderPagina();
    await screen.findByText("Maria");
    expect(screen.queryByRole("button", { name: /Limpar datas/ })).not.toBeInTheDocument();

    setData("Até", "2026-09-12");
    await waitFor(() => expect(nomesVisiveis()).toEqual(["Joana"]));

    fireEvent.click(screen.getByRole("button", { name: /Limpar datas/ }));
    await waitFor(() => expect(nomesVisiveis()).toEqual(["Maria", "Joana", "Lúcia"]));
    expect(screen.queryByRole("button", { name: /Limpar datas/ })).not.toBeInTheDocument();
  });

  it("De depois de Até mostra o aviso e não esconde nada", async () => {
    renderPagina();
    await screen.findByText("Maria");

    setData("De", "2026-09-20");
    setData("Até", "2026-09-10");

    expect(await screen.findByText("A data inicial é depois da final.")).toBeInTheDocument();
    expect(nomesVisiveis()).toEqual(["Maria", "Joana", "Lúcia"]);
  });
});
