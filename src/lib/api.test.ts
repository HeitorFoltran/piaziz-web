import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getFichaPublicaStatus, setAuthToken, submitFichaPublica } from "./api";

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
    await submitFichaPublica("abc", { nome: "Maria", cpf: "52998224725" });
    expect(headersDaChamada().has("Authorization")).toBe(false);
  });

  it("erro não expõe o token nem o corpo da resposta", async () => {
    fetchMock.mockResolvedValue(new Response("detalhe interno", { status: 404 }));
    const erro = await submitFichaPublica("token-secreto", { nome: "Maria", cpf: "52998224725" }).catch((e) => e);
    expect(erro.message).not.toContain("token-secreto");
    expect(erro.message).not.toContain("detalhe interno");
  });
});
