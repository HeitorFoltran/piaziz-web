import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./RequireAuth";
import { useAuth, type Perfil } from "@/contexts/AuthContext";

vi.mock("@/contexts/AuthContext", () => ({ useAuth: vi.fn() }));

function perfil(overrides: Partial<Perfil> = {}): Perfil {
  return {
    id: 1,
    nome: "Ana",
    username: "ana",
    role: "PADRAO",
    podeGerenciarProfissionais: false,
    deveTrocarSenha: false,
    ...overrides,
  };
}

function renderEm(caminho: string) {
  return render(
    <MemoryRouter initialEntries={[caminho]}>
      <Routes>
        <Route path="/" element={<RequireAuth><p>home</p></RequireAuth>} />
        <Route path="/convites" element={<RequireAuth permiteEstagiario><p>convites</p></RequireAuth>} />
        <Route path="/trocar-senha" element={<RequireAuth permiteEstagiario><p>trocar senha</p></RequireAuth>} />
        <Route path="/login" element={<p>login</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("RequireAuth", () => {
  it("enquanto a sessão carrega, mostra spinner e não redireciona para /login", () => {
    vi.mocked(useAuth).mockReturnValue({ auth: null, carregando: true });
    renderEm("/");
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("login")).not.toBeInTheDocument();
  });

  it("sem sessão, redireciona para /login", () => {
    vi.mocked(useAuth).mockReturnValue({ auth: null, carregando: false });
    renderEm("/");
    expect(screen.getByText("login")).toBeInTheDocument();
  });

  it("com deveTrocarSenha, redireciona qualquer rota para /trocar-senha", () => {
    vi.mocked(useAuth).mockReturnValue({ auth: perfil({ deveTrocarSenha: true }), carregando: false });
    renderEm("/");
    expect(screen.getByText("trocar senha")).toBeInTheDocument();
  });

  it("com deveTrocarSenha, ESTAGIARIO também vai para /trocar-senha", () => {
    vi.mocked(useAuth).mockReturnValue({
      auth: perfil({ role: "ESTAGIARIO", deveTrocarSenha: true }),
      carregando: false,
    });
    renderEm("/convites");
    expect(screen.getByText("trocar senha")).toBeInTheDocument();
  });

  it("ESTAGIARIO continua indo para /convites", () => {
    vi.mocked(useAuth).mockReturnValue({ auth: perfil({ role: "ESTAGIARIO" }), carregando: false });
    renderEm("/");
    expect(screen.getByText("convites")).toBeInTheDocument();
  });

  it("sessão normal renderiza a rota", () => {
    vi.mocked(useAuth).mockReturnValue({ auth: perfil(), carregando: false });
    renderEm("/");
    expect(screen.getByText("home")).toBeInTheDocument();
  });
});
