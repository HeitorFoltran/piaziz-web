import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Acompanhamentos from "./Acompanhamentos";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getAcompanhamentos, getServicos, getTiposAcompanhamento } from "@/lib/api";
import { useAuth, type Perfil } from "@/contexts/AuthContext";
import type { Acompanhamento } from "@/types/api";

vi.mock("@/lib/api");

vi.mock("@/contexts/AuthContext", () => ({ useAuth: vi.fn() }));

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
    criadoPorId: null,
    tiposAcompanhamento: [],
    ...overrides,
  };
}

const VIOLENCIA = { id: 10, nome: "Violência doméstica" };
const MORADIA = { id: 11, nome: "Moradia" };

// Criação e atualização em ordens diferentes, para a troca de campo mudar o resultado.
// O usuário logado é o id 1: só Maria e Lúcia foram criadas por ele.
const itens = [
  acompanhamento({
    id: 1,
    nome: "Maria",
    criadoPorId: 1,
    dataCriacao: "2026-09-01T08:00:00",
    dataAtualizacao: "2026-09-25T23:30:00",
    tiposAcompanhamento: [VIOLENCIA],
  }),
  acompanhamento({
    id: 2,
    nome: "Joana",
    criadoPorId: 2,
    status: "PAUSADO",
    dataCriacao: "2026-09-10T23:59:00",
    dataAtualizacao: "2026-09-12T09:00:00",
    tiposAcompanhamento: [VIOLENCIA, MORADIA],
  }),
  acompanhamento({
    id: 3,
    nome: "Lúcia",
    criadoPorId: 1,
    status: "PAUSADO",
    dataCriacao: "2026-09-20T00:00:00",
    dataAtualizacao: "2026-09-20T00:00:00",
  }),
];

function perfil(): Perfil {
  return { id: 1, nome: "Ana", username: "ana", role: "PADRAO", podeGerenciarProfissionais: false, deveTrocarSenha: false };
}

// Mostra a query string atual, para conferir o que foi para a URL.
function UrlAtual() {
  return <output data-testid="url">{useLocation().search}</output>;
}

function renderPagina(url = "/acompanhamentos") {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MemoryRouter initialEntries={[url]}>
          <Acompanhamentos />
          <UrlAtual />
        </MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

function escolher(combobox: string, opcao: string) {
  fireEvent.keyDown(screen.getByRole("combobox", { name: combobox }), { key: "Enter" });
  fireEvent.click(screen.getByRole("option", { name: opcao }));
}

function url() {
  return screen.getByTestId("url").textContent;
}

function setData(rotulo: "De" | "Até", valor: string) {
  fireEvent.change(screen.getByLabelText(rotulo), { target: { value: valor } });
}

function escolherCampo(opcao: "Data de criação" | "Última atualização") {
  escolher("Campo de data", opcao);
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
  vi.mocked(getTiposAcompanhamento).mockResolvedValue([VIOLENCIA, MORADIA]);
  vi.mocked(useAuth).mockReturnValue({ auth: perfil(), carregando: false });
});

describe("Acompanhamentos - filtro por data", () => {
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

  it("De depois de Até mostra o aviso e não esconde nada", async () => {
    renderPagina();
    await screen.findByText("Maria");

    setData("De", "2026-09-20");
    setData("Até", "2026-09-10");

    expect(await screen.findByText("A data inicial é depois da final.")).toBeInTheDocument();
    expect(nomesVisiveis()).toEqual(["Maria", "Joana", "Lúcia"]);
  });
});

describe("Acompanhamentos - filtros novos", () => {
  it("Criados por mim mostra só os casos do usuário logado", async () => {
    renderPagina();
    await screen.findByText("Maria");

    fireEvent.click(screen.getByRole("checkbox", { name: "Criados por mim" }));

    await waitFor(() => expect(nomesVisiveis()).toEqual(["Maria", "Lúcia"]));
    expect(url()).toBe("?meus=1");
  });

  it("tipo de acompanhamento mostra só quem tem o tipo, e Todos os tipos volta a lista", async () => {
    renderPagina();
    await screen.findByText("Maria");

    escolher("Tipo de acompanhamento", "Moradia");
    await waitFor(() => expect(nomesVisiveis()).toEqual(["Joana"]));
    expect(url()).toBe("?tipo=11");

    escolher("Tipo de acompanhamento", "Todos os tipos");
    await waitFor(() => expect(nomesVisiveis()).toEqual(["Maria", "Joana", "Lúcia"]));
    expect(url()).toBe("");
  });

  it("abre já filtrado pelos parâmetros da URL", async () => {
    renderPagina("/acompanhamentos?status=PAUSADO&meus=1");

    expect(await screen.findByText("Lúcia")).toBeInTheDocument();
    expect(nomesVisiveis()).toEqual(["Lúcia"]);
    expect(screen.getByRole("checkbox", { name: "Criados por mim" })).toBeChecked();
    expect(screen.getByRole("combobox", { name: "Status" })).toHaveTextContent("Pausado");
  });

  it("Limpar zera todos os filtros e mantém a busca", async () => {
    renderPagina("/acompanhamentos?q=silva&meus=1&status=PAUSADO&tipo=10&campoData=dataCriacao&de=2026-09-01&ate=2026-09-30");
    // Nenhum caso passa em todos os filtros juntos.
    expect(await screen.findByText("Nenhum acompanhamento encontrado.")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Buscar" })).toHaveValue("silva");

    fireEvent.click(screen.getByRole("button", { name: "Limpar" }));

    await waitFor(() => expect(nomesVisiveis()).toEqual(["Maria", "Joana", "Lúcia"]));
    expect(url()).toBe("?q=silva");
    expect(screen.getByRole("textbox", { name: "Buscar" })).toHaveValue("silva");
    expect(screen.getByRole("checkbox", { name: "Criados por mim" })).not.toBeChecked();
    expect(screen.getByLabelText("De")).toHaveValue("");
    expect(screen.queryByRole("button", { name: "Limpar" })).not.toBeInTheDocument();
  });

  it("a busca vai para a URL e para a API depois do debounce", async () => {
    renderPagina();
    await screen.findByText("Maria");

    fireEvent.change(screen.getByRole("textbox", { name: "Buscar" }), { target: { value: "joana" } });
    expect(url()).toBe("");

    await waitFor(() => expect(url()).toBe("?q=joana"));
    expect(getAcompanhamentos).toHaveBeenLastCalledWith({ q: "joana", servicoId: undefined });
  });
});

describe("Acompanhamentos - painel de filtros no celular", () => {
  it("fechado, não monta nada; aberto, mostra os filtros e o total", async () => {
    renderPagina("/acompanhamentos?status=PAUSADO");
    await screen.findByText("Joana");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Filtros (1)" }));

    const painel = await screen.findByRole("dialog");
    fireEvent.click(within(painel).getByRole("checkbox", { name: "Criados por mim" }));
    await waitFor(() => expect(within(painel).getByRole("button", { name: "Ver 1 resultado" })).toBeInTheDocument());

    fireEvent.click(within(painel).getByRole("button", { name: "Ver 1 resultado" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(nomesVisiveis()).toEqual(["Lúcia"]);
  });
});
