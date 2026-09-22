import { describe, it, expect } from "vitest";
import { STATUS_LABEL, STATUS_BADGE_CLASS, statusConviteExibido, type StatusFicha } from "./status";

const statuses: StatusFicha[] = ["ATIVO", "PAUSADO", "ENCERRADO"];

describe("STATUS_LABEL", () => {
  it.each(statuses)("tem label definido para %s", (status) => {
    expect(STATUS_LABEL[status]).toBeTruthy();
  });
});

describe("STATUS_BADGE_CLASS", () => {
  it.each(statuses)("tem classe de badge definida para %s", (status) => {
    expect(STATUS_BADGE_CLASS[status]).toBeTruthy();
  });
});

describe("statusConviteExibido", () => {
  const agora = new Date("2026-09-22T12:00:00");

  it("mostra ATIVO vencido como EXPIRADO", () => {
    expect(statusConviteExibido({ status: "ATIVO", dataExpiracao: "2026-09-21T12:00:00" }, agora)).toBe("EXPIRADO");
  });

  it("mantém ATIVO dentro do prazo", () => {
    expect(statusConviteExibido({ status: "ATIVO", dataExpiracao: "2026-09-29T12:00:00" }, agora)).toBe("ATIVO");
  });

  it("não mexe em convite já encerrado", () => {
    expect(statusConviteExibido({ status: "USADO", dataExpiracao: "2026-09-21T12:00:00" }, agora)).toBe("USADO");
  });
});
