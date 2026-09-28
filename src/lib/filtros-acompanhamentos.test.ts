import { describe, it, expect } from "vitest";
import { FILTROS_PADRAO, lerPagina, paramsDosFiltros } from "./filtros-acompanhamentos";

describe("lerPagina", () => {
  it("lê a página da URL, base 1", () => {
    expect(lerPagina(new URLSearchParams("pagina=3"))).toBe(3);
  });

  it.each(["", "pagina=0", "pagina=-2", "pagina=1.5", "pagina=abc", "pagina=2x"])("%s vira 1", (qs) => {
    expect(lerPagina(new URLSearchParams(qs))).toBe(1);
  });
});

describe("paramsDosFiltros - pagina", () => {
  it("só põe a página na URL quando for maior que 1", () => {
    expect(paramsDosFiltros("silva", FILTROS_PADRAO).toString()).toBe("q=silva");
    expect(paramsDosFiltros("silva", FILTROS_PADRAO, 1).toString()).toBe("q=silva");
    expect(paramsDosFiltros("silva", { ...FILTROS_PADRAO, meus: true }, 2).toString()).toBe("q=silva&meus=1&pagina=2");
  });
});
