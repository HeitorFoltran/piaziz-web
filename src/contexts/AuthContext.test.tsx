import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import { ApiError, getMe, setAuthToken } from "@/lib/api";
import type { UsuarioAtual } from "@/types/api";

vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  getMe: vi.fn(),
}));

const me: UsuarioAtual = {
  id: 1,
  nome: "Ana",
  username: "ana.beatriz",
  email: null,
  role: "PADRAO",
  podeGerenciarProfissionais: true,
  deveTrocarSenha: false,
};

function Sonda() {
  const { auth, carregando } = useAuth();
  return <p>{carregando ? "carregando" : auth ? `${auth.username}:${auth.podeGerenciarProfissionais}` : "anonimo"}</p>;
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  act(() => setAuthToken(null));
});

describe("AuthProvider", () => {
  it("monta a sessão a partir do /me quando o token muda", async () => {
    let resolver: (u: UsuarioAtual) => void = () => {};
    vi.mocked(getMe).mockReturnValue(new Promise((r) => (resolver = r)));
    render(<AuthProvider><Sonda /></AuthProvider>);
    expect(screen.getByText("anonimo")).toBeInTheDocument();

    act(() => setAuthToken("t"));
    expect(screen.getByText("carregando")).toBeInTheDocument();

    await act(async () => resolver(me));
    expect(screen.getByText("ana.beatriz:true")).toBeInTheDocument();
  });

  it("se o /me falhar, limpa o token e fica sem sessão", async () => {
    vi.mocked(getMe).mockRejectedValue(new ApiError("Erro 401", 401));
    render(<AuthProvider><Sonda /></AuthProvider>);
    await act(async () => setAuthToken("t"));
    expect(screen.getByText("anonimo")).toBeInTheDocument();
  });

  it("ignora a resposta de um /me antigo quando o token muda de novo", async () => {
    let resolverAntigo: (u: UsuarioAtual) => void = () => {};
    vi.mocked(getMe)
      .mockReturnValueOnce(new Promise((r) => (resolverAntigo = r)))
      .mockResolvedValueOnce({ ...me, username: "novo" });
    render(<AuthProvider><Sonda /></AuthProvider>);

    act(() => setAuthToken("antigo"));
    await act(async () => setAuthToken("novo"));
    await act(async () => resolverAntigo({ ...me, username: "antigo" }));
    expect(screen.getByText("novo:true")).toBeInTheDocument();
  });
});
