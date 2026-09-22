import { describe, it, expect } from "vitest";
import { formatarCpfDigitado, isCpfValido } from "./cpf";

describe("isCpfValido", () => {
  it("aceita CPF válido com ou sem máscara", () => {
    expect(isCpfValido("529.982.247-25")).toBe(true);
    expect(isCpfValido("52998224725")).toBe(true);
  });

  it("rejeita dígito verificador errado", () => {
    expect(isCpfValido("529.982.247-24")).toBe(false);
  });

  it("rejeita tamanho errado e dígitos todos iguais", () => {
    expect(isCpfValido("5299822472")).toBe(false);
    expect(isCpfValido("111.111.111-11")).toBe(false);
    expect(isCpfValido("")).toBe(false);
  });
});

describe("formatarCpfDigitado", () => {
  it("aplica a máscara progressivamente", () => {
    expect(formatarCpfDigitado("529")).toBe("529");
    expect(formatarCpfDigitado("5299")).toBe("529.9");
    expect(formatarCpfDigitado("5299822")).toBe("529.982.2");
    expect(formatarCpfDigitado("52998224725")).toBe("529.982.247-25");
  });

  it("ignora não-dígitos e corta em 11 dígitos", () => {
    expect(formatarCpfDigitado("529.982.247-2599")).toBe("529.982.247-25");
    expect(formatarCpfDigitado("abc")).toBe("");
  });
});
