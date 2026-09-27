import { describe, it, expect } from "vitest";
import { formatDate, formatDateTime, mesAbreviado } from "./format";

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

describe("formatDateTime", () => {
  it("formata LocalDateTime sem fuso como dd/MM/yyyy HH:mm", () => {
    expect(formatDateTime("2026-09-27T14:05:33.123")).toBe("27/09/2026 14:05");
  });

  it("retorna '-' para null", () => {
    expect(formatDateTime(null)).toBe("-");
  });

  it("retorna a string original para ISO inválido", () => {
    expect(formatDateTime("não-é-uma-data")).toBe("não-é-uma-data");
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
