import { describe, it, expect } from "vitest";
import { formatDate, mesAbreviado } from "./format";

describe("formatDate", () => {
  it("formata ISO válido como dd/MM/yyyy", () => {
    expect(formatDate("2024-03-15T10:00:00Z")).toBe("15/03/2024");
  });

  it("retorna '-' para null", () => {
    expect(formatDate(null)).toBe("-");
  });

  it("retorna '-' para undefined", () => {
    expect(formatDate(undefined)).toBe("-");
  });

  it("retorna a string original para ISO inválido", () => {
    expect(formatDate("não-é-uma-data")).toBe("não-é-uma-data");
  });
});

describe("mesAbreviado", () => {
  it("retorna 'Jan' para 1", () => {
    expect(mesAbreviado(1)).toBe("Jan");
  });

  it("retorna 'Dez' para 12", () => {
    expect(mesAbreviado(12)).toBe("Dez");
  });
});
