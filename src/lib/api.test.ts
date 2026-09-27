import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ApiError, getDashboardStats, getFichaPublicaStatus, login, mensagemDeErro, setAuthToken, submitFichaPublica } from "./api";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ valido: true, motivo: null }), { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  setAuthToken("token-do-profissional");
});

afterEach(() => {
  setAuthToken(null);
  vi.unstubAllGlobals();
});

function headersDaChamada() {
  const init = fetchMock.mock.calls[0][1] as RequestInit;
  return new Headers(init.headers);
}

describe("rotas públicas do link de intake", () => {
  it("getFichaPublicaStatus não envia Authorization mesmo com profissional logado", async () => {
    await getFichaPublicaStatus("abc");
    expect(headersDaChamada().has("Authorization")).toBe(false);
  });

  it("submitFichaPublica não envia Authorization mesmo com profissional logado", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ mensagem: "ok" }), { status: 201 }));
    await submitFichaPublica("abc", { ficha: { nome: "Maria", cpf: "52998224725" } });
    expect(headersDaChamada().has("Authorization")).toBe(false);
  });

  it("erro não expõe o token nem o corpo da resposta", async () => {
    fetchMock.mockResolvedValue(new Response("detalhe interno", { status: 404 }));
    const erro = await submitFichaPublica("token-secreto", { ficha: { nome: "Maria", cpf: "52998224725" } }).catch((e) => e);
    expect(erro.message).not.toContain("token-secreto");
    expect(erro.message).not.toContain("detalhe interno");
  });
});

describe("request()", () => {
  it("resposta não-ok gera ApiError com o status e a mesma mensagem de antes", async () => {
    fetchMock.mockResolvedValue(new Response("muitas tentativas", { status: 429 }));
    const erro = await getDashboardStats().catch((e) => e);
    expect(erro).toBeInstanceOf(ApiError);
    expect(erro.status).toBe(429);
    expect(erro.message).toBe("Erro 429 ao acessar /api/dashboard/stats: muitas tentativas");
  });

  it("guarda o campo message do corpo JSON de erro em mensagemApi", async () => {
    const corpo = { status: 400, error: "Bad Request", message: "username já em uso" };
    fetchMock.mockResolvedValue(new Response(JSON.stringify(corpo), { status: 400 }));
    const erro = await getDashboardStats().catch((e) => e);
    expect(erro.mensagemApi).toBe("username já em uso");
    expect(mensagemDeErro(erro)).toBe("username já em uso");
  });

  it("sem corpo JSON, mensagemDeErro cai na mensagem do erro", async () => {
    fetchMock.mockResolvedValue(new Response("texto", { status: 500 }));
    const erro = await getDashboardStats().catch((e) => e);
    expect(erro.mensagemApi).toBeUndefined();
    expect(mensagemDeErro(erro)).toBe("Erro 500 ao acessar /api/dashboard/stats: texto");
  });
});

describe("login()", () => {
  it("envia o identificador, não mais o campo email", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ token: "t" }), { status: 200 }));
    await login("ana.beatriz", "segredo123");
    const init = fetchMock.mock.lastCall![1] as RequestInit;
    expect(JSON.parse(init.body as string)).toEqual({ identificador: "ana.beatriz", senha: "segredo123" });
  });
});
