export type StatusFicha = "ATIVO" | "PAUSADO" | "ENCERRADO";

export const STATUS_LABEL: Record<StatusFicha, string> = {
  ATIVO: "Ativo",
  PAUSADO: "Pausado",
  ENCERRADO: "Encerrado",
};

export const STATUS_BADGE_CLASS: Record<StatusFicha, string> = {
  ATIVO: "bg-aziz-green/10 text-aziz-green border-aziz-green/20",
  PAUSADO: "bg-aziz-yellow/10 text-aziz-yellow border-aziz-yellow/20",
  ENCERRADO: "bg-destructive/10 text-destructive border-destructive/20",
};
