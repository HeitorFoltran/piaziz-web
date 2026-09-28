import type { StatusFicha } from "@/lib/status";

export type CampoData = "dataAtualizacao" | "dataCriacao";

// "all" = sem filtro, como o value "Todos ..." dos selects.
export interface FiltrosAcompanhamentos {
  meus: boolean;
  status: StatusFicha | "all";
  servico: string;
  tipo: string;
  campoData: CampoData;
  de: string;
  ate: string;
}

export const FILTROS_PADRAO: FiltrosAcompanhamentos = {
  meus: false,
  status: "all",
  servico: "all",
  tipo: "all",
  campoData: "dataAtualizacao",
  de: "",
  ate: "",
};

const STATUS_VALIDOS: StatusFicha[] = ["ATIVO", "PAUSADO", "ARQUIVADO"];
const DIA = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^\d+$/;

// A URL pode vir editada à mão: valor que não se reconhece vira o padrão.
export function lerFiltros(params: URLSearchParams): FiltrosAcompanhamentos {
  const status = params.get("status");
  const servico = params.get("servico") ?? "";
  const tipo = params.get("tipo") ?? "";
  const de = params.get("de") ?? "";
  const ate = params.get("ate") ?? "";
  return {
    meus: params.get("meus") === "1",
    status: STATUS_VALIDOS.includes(status as StatusFicha) ? (status as StatusFicha) : "all",
    servico: ID.test(servico) ? servico : "all",
    tipo: ID.test(tipo) ? tipo : "all",
    campoData: params.get("campoData") === "dataCriacao" ? "dataCriacao" : "dataAtualizacao",
    de: DIA.test(de) ? de : "",
    ate: DIA.test(ate) ? ate : "",
  };
}

// Só vai para a URL o que não é padrão.
export function paramsDosFiltros(q: string, f: FiltrosAcompanhamentos): URLSearchParams {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (f.meus) params.set("meus", "1");
  if (f.status !== "all") params.set("status", f.status);
  if (f.servico !== "all") params.set("servico", f.servico);
  if (f.tipo !== "all") params.set("tipo", f.tipo);
  if (f.campoData !== FILTROS_PADRAO.campoData) params.set("campoData", f.campoData);
  if (f.de) params.set("de", f.de);
  if (f.ate) params.set("ate", f.ate);
  return params;
}

// Quantos filtros estão ligados, para o "Filtros (n)" do celular. De e Até contam como um só,
// e o campo de data sozinho não filtra nada.
export function contarFiltrosAtivos(f: FiltrosAcompanhamentos): number {
  return [f.meus, f.status !== "all", f.servico !== "all", f.tipo !== "all", f.de !== "" || f.ate !== ""].filter(Boolean)
    .length;
}
