import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Acompanhamentos from "./Acompanhamentos";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getAcompanhamentos, getServicos, getTiposAcompanhamento } from "@/lib/api";
import { useAuth, type Perfil } from "@/contexts/AuthContext";
import type { Acompanhamento, Pagina } from "@/types/api";

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

// Os filtros rodam na API: o mock devolve o que for pedido, e os testes conferem os parâmetros da chamada.
function pagina(lista: Acompanhamento[], extra: Partial<Pagina<Acompanhamento>> = {}): Pagina<Acompanhamento> {
  return { itens: lista, pagina: 0, tamanho: 20, totalItens: lista.length, totalPaginas: lista.length > 0 ? 1 : 0, ...extra };
}

// Parâmetros esperados em getAcompanhamentos. O matcher trata undefined como ausente,
// então o que não está aqui não pode ter ido na chamada.
function chamada(extra: Record<string, unknown> = {}) {
  return { campoData: "dataAtualizacao", page: 0, ...extra };
}

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
  vi.mocked(getAcompanhamentos).mockResolvedValue(pagina(itens));
  vi.mocked(getServicos).mockResolvedValue([]);
  vi.mocked(getTiposAcompanhamento).mockResolvedValue([VIOLENCIA, MORADIA]);
  vi.mocked(useAuth).mockReturnValue({ auth: perfil(), carregando: false });
});

describe("Acompanhamentos - filtro por data", () => {
  it("manda o campo de criação e o intervalo para a API", async () => {
    renderPagina();
    await screen.findByText("Maria");
    expect(getAcompanhamentos).toHaveBeenLastCalledWith(chamada());

    escolherCampo("Data de criação");
    setData("De", "2026-09-10");
    setData("Até", "2026-09-20");

    await waitFor(() =>
      expect(getAcompanhamentos).toHaveBeenLastCalledWith(
        chamada({ campoData: "dataCriacao", de: "2026-09-10", ate: "2026-09-20" }),
      ),
    );
    expect(screen.getAllByText(/^Criado:/)).toHaveLength(3);
  });

  it("De depois de Até mostra o aviso e não manda o intervalo", async () => {
    renderPagina();
    await screen.findByText("Maria");

    setData("De", "2026-09-20");
    setData("Até", "2026-09-10");

    expect(await screen.findByText("A data inicial é depois da final.")).toBeInTheDocument();
    expect(getAcompanhamentos).toHaveBeenLastCalledWith(chamada());
    expect(nomesVisiveis()).toEqual(["Maria", "Joana", "Lúcia"]);
  });
});

describe("Acompanhamentos - filtros", () => {
  it("Criados por mim manda meus: true", async () => {
    renderPagina();
    await screen.findByText("Maria");

    fireEvent.click(screen.getByRole("checkbox", { name: "Criados por mim" }));

    await waitFor(() => expect(getAcompanhamentos).toHaveBeenLastCalledWith(chamada({ meus: true })));
    expect(url()).toBe("?meus=1");
  });

  it("tipo manda tipoId, e Todos os tipos tira o filtro", async () => {
    renderPagina();
    await screen.findByText("Maria");

    escolher("Tipo de acompanhamento", "Moradia");
    await waitFor(() => expect(getAcompanhamentos).toHaveBeenLastCalledWith(chamada({ tipoId: "11" })));
    expect(url()).toBe("?tipo=11");

    escolher("Tipo de acompanhamento", "Todos os tipos");
    await waitFor(() => expect(getAcompanhamentos).toHaveBeenLastCalledWith(chamada()));
    expect(url()).toBe("");
  });

  it("status manda o status escolhido", async () => {
    renderPagina();
    await screen.findByText("Maria");

    escolher("Status", "Pausado");

    await waitFor(() => expect(getAcompanhamentos).toHaveBeenLastCalledWith(chamada({ status: "PAUSADO" })));
    expect(url()).toBe("?status=PAUSADO");
  });

  it("abre já filtrado pelos parâmetros da URL e mostra exatamente o que a API devolveu", async () => {
    renderPagina("/acompanhamentos?status=PAUSADO&meus=1");

    await screen.findByText("Maria");
    expect(getAcompanhamentos).toHaveBeenLastCalledWith(chamada({ status: "PAUSADO", meus: true }));
    // Nada é filtrado no cliente.
    expect(nomesVisiveis()).toEqual(["Maria", "Joana", "Lúcia"]);
    expect(screen.getByRole("checkbox", { name: "Criados por mim" })).toBeChecked();
    expect(screen.getByRole("combobox", { name: "Status" })).toHaveTextContent("Pausado");
  });

  it("a contagem mostra o total da API, não o tamanho da página", async () => {
    vi.mocked(getAcompanhamentos).mockResolvedValue(pagina(itens, { totalItens: 45, totalPaginas: 3 }));
    renderPagina();

    expect((await screen.findAllByText("45 acompanhamentos")).length).toBeGreaterThan(0);
  });

  it("Limpar zera todos os filtros e mantém a busca", async () => {
    vi.mocked(getAcompanhamentos).mockImplementation(async (params) => pagina(params.status ? [] : itens));
    renderPagina("/acompanhamentos?q=silva&meus=1&status=PAUSADO&tipo=10&campoData=dataCriacao&de=2026-09-01&ate=2026-09-30");
    expect(await screen.findByText("Nenhum acompanhamento encontrado.")).toBeInTheDocument();
    expect(getAcompanhamentos).toHaveBeenLastCalledWith(
      chamada({
        q: "silva",
        meus: true,
        status: "PAUSADO",
        tipoId: "10",
        campoData: "dataCriacao",
        de: "2026-09-01",
        ate: "2026-09-30",
      }),
    );
    expect(screen.getByRole("textbox", { name: "Buscar" })).toHaveValue("silva");

    fireEvent.click(screen.getByRole("button", { name: "Limpar" }));

    await waitFor(() => expect(nomesVisiveis()).toEqual(["Maria", "Joana", "Lúcia"]));
    expect(getAcompanhamentos).toHaveBeenLastCalledWith(chamada({ q: "silva" }));
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
    expect(getAcompanhamentos).toHaveBeenLastCalledWith(chamada({ q: "joana" }));
  });
});

describe("Acompanhamentos - painel de filtros no celular", () => {
  it("fechado, não monta nada; aberto, mostra os filtros e o total da API", async () => {
    vi.mocked(getAcompanhamentos).mockImplementation(async (params) =>
      params.meus ? pagina([itens[2]], { totalItens: 1 }) : pagina(itens.slice(1), { totalItens: 30, totalPaginas: 2 }),
    );
    renderPagina("/acompanhamentos?status=PAUSADO");
    await screen.findByText("Joana");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Filtros (1)" }));

    const painel = await screen.findByRole("dialog");
    expect(within(painel).getByRole("button", { name: "Ver 30 resultados" })).toBeInTheDocument();
    fireEvent.click(within(painel).getByRole("checkbox", { name: "Criados por mim" }));
    await waitFor(() => expect(within(painel).getByRole("button", { name: "Ver 1 resultado" })).toBeInTheDocument());

    fireEvent.click(within(painel).getByRole("button", { name: "Ver 1 resultado" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(nomesVisiveis()).toEqual(["Lúcia"]);
  });
});
