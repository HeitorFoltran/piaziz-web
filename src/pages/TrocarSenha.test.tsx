import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "sonner";
import TrocarSenha from "./TrocarSenha";
import { ApiError, setAuthToken, setOnTokenChange, trocarSenha } from "@/lib/api";
import { useAuth, type Perfil } from "@/contexts/AuthContext";
import type { LoginResponse } from "@/types/api";

// trocarSenha real, com fetch stubado: é ele quem chama setAuthToken com o token novo,
// o que se observa pelo callback de setOnTokenChange (o mesmo que o AuthContext usa).
vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return { ...actual, trocarSenha: vi.fn(actual.trocarSenha) };
});

vi.mock("@/contexts/AuthContext", () => ({ useAuth: vi.fn() }));

vi.mock("@/components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const perfil: Perfil = {
  id: 1,
  nome: "Ana",
  username: "ana",
  role: "PADRAO",
  podeGerenciarProfissionais: false,
  deveTrocarSenha: true,
};

const respostaTroca: LoginResponse = {
  token: "token-novo",
  profissionalId: 1,
  nome: "Ana",
  username: "ana",
  email: null,
  role: "PADRAO",
  deveTrocarSenha: false,
};

const fetchMock = vi.fn();
const tokenChange = vi.fn();

function renderPagina() {
  return render(
    <MemoryRouter>
      <TrocarSenha />
    </MemoryRouter>,
  );
}

function preencher(atual: string, nova: string, confirmacao: string) {
  fireEvent.change(screen.getByLabelText(/^Senha (atual|provisória)$/), { target: { value: atual } });
  fireEvent.change(screen.getByLabelText("Senha nova"), { target: { value: nova } });
  fireEvent.change(screen.getByLabelText("Confirme a senha nova"), { target: { value: confirmacao } });
  fireEvent.click(screen.getByRole("button", { name: "Salvar senha" }));
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useAuth).mockReturnValue({ auth: perfil, carregando: false });
  fetchMock.mockResolvedValue(new Response(JSON.stringify(respostaTroca), { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  setOnTokenChange(tokenChange);
});

afterEach(() => {
  setOnTokenChange(null);
  setAuthToken(null);
  vi.unstubAllGlobals();
});

describe("TrocarSenha", () => {
  it("no modo obrigatório, mostra o aviso de senha provisória", () => {
    renderPagina();
    expect(screen.getByText("Sua senha é provisória. Defina uma senha nova para continuar.")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha provisória")).toBeInTheDocument();
    expect(screen.queryByLabelText("Senha atual")).not.toBeInTheDocument();
  });

  it("fora do modo obrigatório, o primeiro campo é a senha atual", () => {
    vi.mocked(useAuth).mockReturnValue({ auth: { ...perfil, deveTrocarSenha: false }, carregando: false });
    renderPagina();
    expect(screen.getByLabelText("Senha atual")).toBeInTheDocument();
    expect(screen.queryByLabelText("Senha provisória")).not.toBeInTheDocument();
  });

  it("recusa senha nova com menos de 8 caracteres", () => {
    renderPagina();
    preencher("provisoria1", "curta", "curta");
    expect(screen.getByRole("alert")).toHaveTextContent("entre 8 e 72");
    expect(trocarSenha).not.toHaveBeenCalled();
  });

  it("recusa senha nova igual à atual", () => {
    renderPagina();
    preencher("provisoria1", "provisoria1", "provisoria1");
    expect(screen.getByRole("alert")).toHaveTextContent("diferente da atual");
    expect(trocarSenha).not.toHaveBeenCalled();
  });

  it("recusa confirmação diferente da senha nova", () => {
    renderPagina();
    preencher("provisoria1", "senhanova123", "senhanova124");
    expect(screen.getByRole("alert")).toHaveTextContent("confirmação");
    expect(trocarSenha).not.toHaveBeenCalled();
  });

  it("no sucesso, guarda o token novo e vai para /", async () => {
    renderPagina();
    preencher("provisoria1", "senhanova123", "senhanova123");

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/", { replace: true }));
    expect(trocarSenha).toHaveBeenCalledWith({ senhaAtual: "provisoria1", novaSenha: "senhanova123" });
    expect(tokenChange).toHaveBeenCalledWith("token-novo");
    expect(toast.success).toHaveBeenCalled();
  });

  it("ESTAGIARIO vai para /convites depois de trocar", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ...respostaTroca, role: "ESTAGIARIO" }), { status: 200 }));
    renderPagina();
    preencher("provisoria1", "senhanova123", "senhanova123");
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/convites", { replace: true }));
  });

  it("429 mostra a mensagem de muitas tentativas", async () => {
    vi.mocked(trocarSenha).mockRejectedValueOnce(new ApiError("Erro 429 ao acessar /api/auth/senha", 429));
    renderPagina();
    preencher("provisoria1", "senhanova123", "senhanova123");
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Muitas tentativas. Aguarde alguns minutos e tente novamente."),
    );
  });

  it("erro 400 mostra a mensagem que a API devolveu", async () => {
    vi.mocked(trocarSenha).mockRejectedValueOnce(
      new ApiError("Erro 400 ao acessar /api/auth/senha", 400, "Senha atual incorreta"),
    );
    renderPagina();
    preencher("errada123", "senhanova123", "senhanova123");
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Senha atual incorreta"));
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
