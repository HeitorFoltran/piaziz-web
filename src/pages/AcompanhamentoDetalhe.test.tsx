import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AcompanhamentoDetalhe from "./AcompanhamentoDetalhe";
import { getAlteracoesFicha, getFicha, getTiposAcompanhamento, getVisualizacoesFicha } from "@/lib/api";
import type { AlteracaoFicha, Ficha } from "@/types/api";

vi.mock("@/lib/api");

// Layout depende do AuthContext; aqui só interessa o conteúdo da página.
vi.mock("@/components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const ficha = {
  id: 7,
  codigoFicha: "F-007",
  nome: "Maria",
  status: "ATIVO",
  encaminhamentos: [],
  interacoes: [],
  tiposAcompanhamento: [],
} as unknown as Ficha;

function alteracao(overrides: Partial<AlteracaoFicha>): AlteracaoFicha {
  return {
    id: 1,
    tipoEntidade: "Ficha",
    editorId: 2,
    editorNome: "Ana",
    donoId: 1,
    donoNome: "Beatriz",
    timestamp: "2026-09-20T10:00:00",
    ...overrides,
  };
}

function renderPagina() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/acompanhamentos/7"]}>
        <Routes>
          <Route path="/acompanhamentos/:id" element={<AcompanhamentoDetalhe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function abrirAlteracoes() {
  fireEvent.click(await screen.findByText("Alterações por outros profissionais"));
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getFicha).mockResolvedValue(ficha);
  vi.mocked(getTiposAcompanhamento).mockResolvedValue([]);
});

describe("AcompanhamentoDetalhe - alterações por outros profissionais", () => {
  it("não busca as alterações enquanto a seção está fechada", async () => {
    renderPagina();
    expect(await screen.findByText("Alterações por outros profissionais")).toBeInTheDocument();
    expect(getAlteracoesFicha).not.toHaveBeenCalled();
  });

  it("ao abrir, lista editores com o rótulo de cada tipo de registro", async () => {
    vi.mocked(getAlteracoesFicha).mockResolvedValue([
      alteracao({ id: 1, tipoEntidade: "AvaliacaoSocioeconomica", editorNome: "Ana" }),
      alteracao({ id: 2, tipoEntidade: "HistoricoAtendimento", editorNome: "Carla" }),
    ]);
    renderPagina();
    await abrirAlteracoes();

    expect(await screen.findByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Carla")).toBeInTheDocument();
    expect(screen.getByText(/editou a avaliação socioeconômica/)).toBeInTheDocument();
    expect(screen.getByText(/editou o histórico de atendimento/)).toBeInTheDocument();
    expect(getAlteracoesFicha).toHaveBeenCalledWith("7");
  });

  it("ao abrir, com lista vazia, mostra o texto de vazio", async () => {
    vi.mocked(getAlteracoesFicha).mockResolvedValue([]);
    renderPagina();
    await abrirAlteracoes();

    expect(await screen.findByText("Nenhuma edição por outros profissionais.")).toBeInTheDocument();
  });

  it("mostra 'este caso' para um tipoEntidade desconhecido", async () => {
    vi.mocked(getAlteracoesFicha).mockResolvedValue([
      alteracao({ tipoEntidade: "Desconhecido" as AlteracaoFicha["tipoEntidade"] }),
    ]);
    renderPagina();
    await abrirAlteracoes();

    expect(await screen.findByText(/editou este caso/)).toBeInTheDocument();
  });

  it("mostra mensagem genérica quando a busca falha", async () => {
    vi.mocked(getAlteracoesFicha).mockRejectedValue(new Error("Erro 404 ao acessar /api/fichas/7/alteracoes"));
    renderPagina();
    await abrirAlteracoes();

    await waitFor(() => {
      expect(screen.getByText("Não foi possível carregar as alterações.")).toBeInTheDocument();
    });
    expect(screen.queryByText(/Erro 404/)).not.toBeInTheDocument();
  });
});

describe("AcompanhamentoDetalhe - visualizações", () => {
  async function abrirVisualizacoes() {
    fireEvent.click(await screen.findByText("Visualizações"));
  }

  it("não busca as visualizações enquanto a seção está fechada", async () => {
    renderPagina();
    expect(await screen.findByText("Visualizações")).toBeInTheDocument();
    expect(getVisualizacoesFicha).not.toHaveBeenCalled();
  });

  it("ao abrir, lista quem abriu o caso e quando", async () => {
    vi.mocked(getVisualizacoesFicha).mockResolvedValue([
      { profissionalId: 2, profissionalNome: "Ana", timestamp: "2026-09-25T14:30:00" },
      { profissionalId: 3, profissionalNome: null, timestamp: "2026-09-20T09:05:00" },
    ]);
    renderPagina();
    await abrirVisualizacoes();

    expect(await screen.findByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("25/09/2026 14:30")).toBeInTheDocument();
    expect(screen.getByText(/Um usuário removido abriu este caso/)).toBeInTheDocument();
    expect(screen.getByText("20/09/2026 09:05")).toBeInTheDocument();
    expect(screen.getByText(/Mostra as 200 mais recentes/)).toBeInTheDocument();
    expect(getVisualizacoesFicha).toHaveBeenCalledWith("7");
  });

  it("ao abrir, com lista vazia, mostra o texto de vazio", async () => {
    vi.mocked(getVisualizacoesFicha).mockResolvedValue([]);
    renderPagina();
    await abrirVisualizacoes();

    expect(await screen.findByText("Nenhuma visualização registrada.")).toBeInTheDocument();
  });
});
