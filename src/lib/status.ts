import type { ConviteFicha, StatusConvite, StatusFichaPendente } from "@/types/api";

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

export const CONVITE_STATUS_LABEL: Record<StatusConvite, string> = {
  ATIVO: "Ativo",
  USADO: "Usado",
  EXPIRADO: "Expirado",
  CANCELADO: "Cancelado",
};

export const CONVITE_STATUS_BADGE_CLASS: Record<StatusConvite, string> = {
  ATIVO: "bg-aziz-green/10 text-aziz-green border-aziz-green/20",
  USADO: "bg-aziz-blue/10 text-aziz-blue border-aziz-blue/20",
  EXPIRADO: "bg-muted text-muted-foreground border-border",
  CANCELADO: "bg-destructive/10 text-destructive border-destructive/20",
};

// O backend só marca EXPIRADO quando alguém tenta usar o link (expiração preguiçosa),
// então um convite vencido ainda pode chegar aqui como ATIVO.
export function statusConviteExibido(
  convite: Pick<ConviteFicha, "status" | "dataExpiracao">,
  agora: Date = new Date(),
): StatusConvite {
  if (convite.status === "ATIVO" && new Date(convite.dataExpiracao) < agora) return "EXPIRADO";
  return convite.status;
}

export const FICHA_PENDENTE_STATUS_LABEL: Record<StatusFichaPendente, string> = {
  PENDENTE: "Pendente",
  APROVADA: "Aprovada",
  REJEITADA: "Rejeitada",
};
