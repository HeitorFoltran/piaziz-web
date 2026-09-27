import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Cadastros from "./Cadastros";
import { createProfissional, getFichas, getHistoricoConta, getProfissionais, getServicos } from "@/lib/api";
import { useAuth, type Perfil } from "@/contexts/AuthContext";
import type { Profissional } from "@/types/api";

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    getFichas: vi.fn(),
    getServicos: vi.fn(),
    getProfissionais: vi.fn(),
    createProfissional: vi.fn(),
    getHistoricoConta: vi.fn(),
  };
});

vi.mock("@/contexts/AuthContext", () => ({ useAuth: vi.fn() }));

vi.mock("@/components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

function perfil(overrides: Partial<Perfil> = {}): Perfil {
  return {
    id: 1,
    nome: "Ana",
    username: "ana.beatriz",
    role: "PADRAO",
    podeGerenciarProfissionais: true,
    deveTrocarSenha: false,
    ...overrides,
  };
}

function profissional(overrides: Partial<Profissional>): Profissional {
  return {
    id: 2,
    nome: "Carlos",
    username: "carlos.mendes",
    email: null,
    cpf: "***.316.248-**",
    carteiraProfissional: null,
    servicoId: null,
    servicoNome: null,
    role: "PADRAO",
    ativo: true,
    podeGerenciarProfissionais: false,
    deveTrocarSenha: false,
    ...overrides,
  };
}

function renderEm(caminho: string, p: Perfil) {
  vi.mocked(useAuth).mockReturnValue({ auth: p, carregando: false });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[caminho]}>
        <Cadastros />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

async function abrirNovo(p: Perfil) {
  renderEm("/cadastros?tab=profissionais", p);
  fireEvent.click(await screen.findByRole("button", { name: /Novo profissional/ }));
  return screen.findByRole("dialog");
}

function preencherValido(dialog: HTMLElement) {
  const d = within(dialog);
  fireEvent.change(d.getByLabelText("Nome *"), { target: { value: " Fernanda Costa " } });
  fireEvent.change(d.getByLabelText("Usuário *"), { target: { value: "Fernanda.Costa" } });
  fireEvent.change(d.getByLabelText("CPF *"), { target: { value: "63740285117" } });
  fireEvent.change(d.getByLabelText("Senha provisória *"), { target: { value: "Provisoria23" } });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getFichas).mockResolvedValue([]);
  vi.mocked(getServicos).mockResolvedValue([]);
  vi.mocked(getProfissionais).mockResolvedValue([]);
  vi.mocked(createProfissional).mockResolvedValue(profissional({}));
});

describe("Cadastros — aba Profissionais", () => {
  it("não aparece sem a permissão, nem abrindo ?tab=profissionais direto", async () => {
    renderEm("/cadastros?tab=profissionais", perfil({ podeGerenciarProfissionais: false }));
    expect(screen.queryByRole("button", { name: "Profissionais" })).not.toBeInTheDocument();
    expect(await screen.findByPlaceholderText("Buscar fichas...")).toBeInTheDocument();
    expect(getProfissionais).not.toHaveBeenCalled();
  });

  it("aparece com a permissão", async () => {
    renderEm("/cadastros?tab=profissionais", perfil());
    expect(screen.getByRole("button", { name: "Profissionais" })).toBeInTheDocument();
    await waitFor(() => expect(getProfissionais).toHaveBeenCalled());
  });

  it("lista username, email e badges", async () => {
    vi.mocked(getProfissionais).mockResolvedValue([
      profissional({ ativo: false, podeGerenciarProfissionais: true, deveTrocarSenha: true }),
    ]);
    renderEm("/cadastros?tab=profissionais", perfil());
    expect(await screen.findByText(/@carlos\.mendes · —/)).toBeInTheDocument();
    expect(screen.getByText("Inativa")).toBeInTheDocument();
    expect(screen.getByText("Gerencia profissionais")).toBeInTheDocument();
    expect(screen.getByText("Senha provisória pendente")).toBeInTheDocument();
  });

  const linhas = () => [
    profissional({ id: 1, nome: "Ana", podeGerenciarProfissionais: true }),
    profissional({ id: 2, nome: "Carlos" }),
    profissional({ id: 3, nome: "Dev", role: "DEV" }),
    profissional({ id: 4, nome: "Gerente", podeGerenciarProfissionais: true }),
  ];

  it("para gerenciador não DEV, esconde editar/resetar em conta DEV e de gerenciador, e resetar na própria", async () => {
    vi.mocked(getProfissionais).mockResolvedValue(linhas());
    renderEm("/cadastros?tab=profissionais", perfil());
    expect(await screen.findByRole("button", { name: "Editar Ana" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Resetar senha de Ana" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar Carlos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resetar senha de Carlos" })).toBeInTheDocument();
    for (const nome of ["Dev", "Gerente"]) {
      expect(screen.queryByRole("button", { name: `Editar ${nome}` })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: `Resetar senha de ${nome}` })).not.toBeInTheDocument();
    }
  });

  it("para DEV, mostra editar/resetar em todas as contas menos resetar na própria", async () => {
    vi.mocked(getProfissionais).mockResolvedValue(linhas());
    renderEm("/cadastros?tab=profissionais", perfil({ id: 3, role: "DEV" }));
    for (const nome of ["Ana", "Carlos", "Dev", "Gerente"]) {
      expect(await screen.findByRole("button", { name: `Editar ${nome}` })).toBeInTheDocument();
    }
    for (const nome of ["Ana", "Carlos", "Gerente"]) {
      expect(screen.getByRole("button", { name: `Resetar senha de ${nome}` })).toBeInTheDocument();
    }
    expect(screen.queryByRole("button", { name: "Resetar senha de Dev" })).not.toBeInTheDocument();
  });

  it("o dialog de criar valida username, CPF e senha", async () => {
    const dialog = await abrirNovo(perfil());
    const d = within(dialog);
    fireEvent.change(d.getByLabelText("Nome *"), { target: { value: "Fernanda" } });
    fireEvent.change(d.getByLabelText("Usuário *"), { target: { value: "fe" } });
    fireEvent.change(d.getByLabelText("CPF *"), { target: { value: "11111111111" } });
    fireEvent.change(d.getByLabelText("Senha provisória *"), { target: { value: "curta" } });
    fireEvent.click(d.getByRole("button", { name: "Salvar" }));

    expect(d.getByText(/De 3 a 30 caracteres/)).toBeInTheDocument();
    expect(d.getByText("CPF inválido.")).toBeInTheDocument();
    expect(d.getByText(/entre 8 e 72/)).toBeInTheDocument();
    expect(createProfissional).not.toHaveBeenCalled();
  });

  it("converte o username para minúsculas enquanto digita", async () => {
    const dialog = await abrirNovo(perfil());
    const campo = within(dialog).getByLabelText("Usuário *");
    fireEvent.change(campo, { target: { value: "Fernanda.Costa" } });
    expect(campo).toHaveValue("fernanda.costa");
  });

  it("a checkbox de gerenciar só aparece para DEV", async () => {
    const dialog = await abrirNovo(perfil());
    expect(within(dialog).queryByLabelText("Pode gerenciar profissionais")).not.toBeInTheDocument();
  });

  it("para DEV, a checkbox aparece com papel PADRAO e some com ESTAGIARIO", async () => {
    const dialog = await abrirNovo(perfil({ role: "DEV" }));
    const d = within(dialog);
    expect(d.getByLabelText("Pode gerenciar profissionais")).toBeInTheDocument();
    fireEvent.click(d.getByLabelText("Estagiário(a)"));
    expect(d.queryByLabelText("Pode gerenciar profissionais")).not.toBeInTheDocument();
  });

  it("envia o payload certo", async () => {
    const dialog = await abrirNovo(perfil({ role: "DEV" }));
    const d = within(dialog);
    preencherValido(dialog);
    fireEvent.click(d.getByLabelText("Pode gerenciar profissionais"));
    fireEvent.click(d.getByRole("button", { name: "Salvar" }));

    await waitFor(() => expect(createProfissional).toHaveBeenCalled());
    expect(vi.mocked(createProfissional).mock.calls[0][0]).toEqual({
      nome: "Fernanda Costa",
      username: "fernanda.costa",
      email: null,
      cpf: "637.402.851-17",
      carteiraProfissional: null,
      servicoId: null,
      senhaProvisoria: "Provisoria23",
      role: "PADRAO",
      podeGerenciarProfissionais: true,
    });
  });

  it("o botão Gerar preenche uma senha de 12 caracteres", async () => {
    const dialog = await abrirNovo(perfil());
    const d = within(dialog);
    fireEvent.click(d.getByRole("button", { name: /Gerar/ }));
    expect((d.getByLabelText("Senha provisória *") as HTMLInputElement).value).toHaveLength(12);
  });
});

describe("Cadastros — histórico de uma conta", () => {
  async function abrirHistorico() {
    vi.mocked(getProfissionais).mockResolvedValue([profissional({ id: 2, nome: "Carlos", role: "DEV" })]);
    renderEm("/cadastros?tab=profissionais", perfil());
    // Só leitura: aparece até em conta DEV, onde o gerenciador não DEV não pode editar.
    fireEvent.click(await screen.findByRole("button", { name: "Histórico de Carlos" }));
    return screen.findByRole("dialog");
  }

  it("mostra rótulo da ação, autor, data e detalhe", async () => {
    vi.mocked(getHistoricoConta).mockResolvedValue([
      { id: 3, acao: "RESETAR_SENHA", detalhe: null, autorId: 1, autorNome: "Ana", timestamp: "2026-09-27T15:40:00" },
      { id: 2, acao: "EDITAR", detalhe: "campos: nome, ativo", autorId: 1, autorNome: "Ana", timestamp: "2026-09-27T15:30:00" },
      { id: 1, acao: "CRIAR", detalhe: null, autorId: 9, autorNome: null, timestamp: "2026-09-27T09:05:00" },
    ]);
    const dialog = within(await abrirHistorico());

    expect(await dialog.findByText("Senha resetada")).toBeInTheDocument();
    expect(dialog.getByText("Dados alterados")).toBeInTheDocument();
    expect(dialog.getByText("Conta criada")).toBeInTheDocument();
    expect(dialog.getAllByText("por Ana")).toHaveLength(2);
    expect(dialog.getByText("por um usuário removido")).toBeInTheDocument();
    expect(dialog.getByText("campos: nome, ativo")).toBeInTheDocument();
    expect(dialog.getByText("27/09/2026 15:30")).toBeInTheDocument();
    expect(getHistoricoConta).toHaveBeenCalledWith(2);
  });

  it("lista vazia mostra a mensagem de vazio", async () => {
    vi.mocked(getHistoricoConta).mockResolvedValue([]);
    const dialog = within(await abrirHistorico());
    expect(await dialog.findByText("Nenhuma ação registrada para esta conta.")).toBeInTheDocument();
  });

  it("não busca o histórico antes de abrir", async () => {
    vi.mocked(getProfissionais).mockResolvedValue([profissional({})]);
    renderEm("/cadastros?tab=profissionais", perfil());
    await screen.findByRole("button", { name: "Histórico de Carlos" });
    expect(getHistoricoConta).not.toHaveBeenCalled();
  });
});
