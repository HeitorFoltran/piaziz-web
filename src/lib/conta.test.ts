import { describe, it, expect, vi, afterEach } from "vitest";
import { ALFABETO_SENHA, USERNAME_REGEX, gerarSenhaProvisoria, normalizarUsername, validarSenha } from "./conta";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("gerarSenhaProvisoria", () => {
  it("gera 12 caracteres, só do alfabeto permitido", () => {
    for (let i = 0; i < 50; i++) {
      const senha = gerarSenhaProvisoria();
      expect(senha).toHaveLength(12);
      for (const c of senha) expect(ALFABETO_SENHA).toContain(c);
    }
  });

  it("o alfabeto não tem caracteres ambíguos", () => {
    for (const c of "0O1lI") expect(ALFABETO_SENHA).not.toContain(c);
  });

  it("usa crypto.getRandomValues, não Math.random", () => {
    const random = vi.spyOn(Math, "random");
    const getRandomValues = vi.spyOn(crypto, "getRandomValues");
    gerarSenhaProvisoria();
    expect(getRandomValues).toHaveBeenCalled();
    expect(random).not.toHaveBeenCalled();
  });
});

describe("validarSenha", () => {
  it("aceita de 8 a 72 caracteres", () => {
    expect(validarSenha("a".repeat(8))).toBeNull();
    expect(validarSenha("a".repeat(72))).toBeNull();
  });

  it("recusa menos de 8 ou mais de 72", () => {
    expect(validarSenha("a".repeat(7))).not.toBeNull();
    expect(validarSenha("a".repeat(73))).not.toBeNull();
  });
});

describe("username", () => {
  it("normaliza para minúsculas e sem espaços", () => {
    expect(normalizarUsername("Ana Beatriz")).toBe("anabeatriz");
  });

  it("valida o formato", () => {
    expect(USERNAME_REGEX.test("ana.beatriz")).toBe(true);
    expect(USERNAME_REGEX.test("ab")).toBe(false);
    expect(USERNAME_REGEX.test("ana@x")).toBe(false);
  });
});
