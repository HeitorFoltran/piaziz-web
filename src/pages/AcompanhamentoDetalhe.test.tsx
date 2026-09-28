import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AcompanhamentoDetalhe from "./AcompanhamentoDetalhe";
import { getAlteracoesFicha, getFicha, getTiposAcompanhamento } from "@/lib/api";
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
    acao: "EDITOU",
    detalhe: null,
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

async function abrirHistorico() {
  fireEvent.click(await screen.findByText("Histórico de alterações"));
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getFicha).mockResolvedValue(ficha);
  vi.mocked(getTiposAcompanhamento).mockResolvedValue([]);
});

describe("AcompanhamentoDetalhe - histórico de alterações", () => {
  it("não busca o histórico enquanto a seção está fechada", async () => {
    renderPagina();
    expect(await screen.findByText("Histórico de alterações")).toBeInTheDocument();
    expect(getAlteracoesFicha).not.toHaveBeenCalled();
  });

  it("ao abrir, mostra uma frase por ação, com data e hora, e a criação por último", async () => {
    vi.mocked(getAlteracoesFicha).mockResolvedValue([
      alteracao({
        id: 5,
        tipoEntidade: "StatusFicha",
        acao: "MUDOU_STATUS",
        detalhe: "Ativo -> Arquivado",
        editorNome: "Ana",
        timestamp: "2026-09-28T14:03:00",
      }),
      alteracao({ id: 4, tipoEntidade: "AvaliacaoSocioeconomica", acao: "EDITOU", editorNome: "Carlos" }),
      alteracao({ id: 3, tipoEntidade: "HistoricoAtendimento", acao: "PREENCHEU", editorNome: "Carla" }),
      alteracao({ id: 2, tipoEntidade: "TiposAcompanhamento", acao: "ALTEROU_TIPOS", editorNome: "Ana" }),
      alteracao({ id: null, tipoEntidade: "Ficha", acao: "CRIOU", editorNome: "Beatriz", timestamp: "2026-09-20T09:00:00" }),
    ]);
    renderPagina();
    await abrirHistorico();

    await screen.findByText("Beatriz");
    // Cada linha do histórico é um div com a frase no primeiro span e a data no segundo.
    const card = screen.getByText("Histórico de alterações").closest(".rounded-lg") as HTMLElement;
    const linhas = Array.from(card.querySelectorAll("div.justify-between > span:first-child")).map((el) => el.textContent);
    expect(linhas).toEqual([
      "Ana mudou o status: Ativo -> Arquivado",
      "Carlos editou a avaliação socioeconômica",
      "Carla preencheu o histórico de atendimento",
      "Ana alterou os tipos de acompanhamento",
      "Beatriz criou o caso",
    ]);
    expect(screen.getByText("28/09/2026 14:03")).toBeInTheDocument();
    expect(screen.getByText("20/09/2026 09:00")).toBeInTheDocument();
    expect(screen.queryByText(/registro criado por/)).not.toBeInTheDocument();
    expect(getAlteracoesFicha).toHaveBeenCalledWith("7");
  });

  it("mostra 'Caso criado' sem nome e 'Um usuário removido' para editor que não existe mais", async () => {
    vi.mocked(getAlteracoesFicha).mockResolvedValue([
      alteracao({ id: 2, acao: "EDITOU", editorNome: null }),
      alteracao({ id: null, acao: "CRIOU", editorNome: null }),
    ]);
    renderPagina();
    await abrirHistorico();

    expect(await screen.findByText("Um usuário removido editou os dados da ficha")).toBeInTheDocument();
    expect(screen.getByText("Caso criado")).toBeInTheDocument();
  });

  it("ao abrir, com lista vazia, mostra o texto de vazio", async () => {
    vi.mocked(getAlteracoesFicha).mockResolvedValue([]);
    renderPagina();
    await abrirHistorico();

    expect(await screen.findByText("Nenhuma alteração registrada.")).toBeInTheDocument();
  });

  it("mostra 'este caso' para um tipoEntidade desconhecido", async () => {
    vi.mocked(getAlteracoesFicha).mockResolvedValue([
      alteracao({ tipoEntidade: "Desconhecido" as AlteracaoFicha["tipoEntidade"] }),
    ]);
    renderPagina();
    await abrirHistorico();

    expect(await screen.findByText(/editou este caso/)).toBeInTheDocument();
  });

  it("mostra mensagem genérica quando a busca falha", async () => {
    vi.mocked(getAlteracoesFicha).mockRejectedValue(new Error("Erro 404 ao acessar /api/fichas/7/alteracoes"));
    renderPagina();
    await abrirHistorico();

    await waitFor(() => {
      expect(screen.getByText("Não foi possível carregar as alterações.")).toBeInTheDocument();
    });
    expect(screen.queryByText(/Erro 404/)).not.toBeInTheDocument();
  });
});

describe("AcompanhamentoDetalhe - cards removidos", () => {
  it("não mostra os cards de visualizações e de dados do PIA", async () => {
    renderPagina();
    expect(await screen.findByText("F-007")).toBeInTheDocument();
    expect(screen.queryByText("Visualizações")).not.toBeInTheDocument();
    expect(screen.queryByText("Dados do PIA preenchidos")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar/Visualizar ficha" })).toBeInTheDocument();
  });
});
