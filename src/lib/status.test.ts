import { describe, it, expect } from "vitest";
import { STATUS_LABEL, STATUS_BADGE_CLASS, type StatusFicha } from "./status";

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
