import { format, parseISO } from "date-fns";

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  try {
    return format(parseISO(iso), "dd/MM/yyyy");
  } catch {
    return iso;
  }
}

const MESES_ABREV = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function mesAbreviado(mes: number): string {
  return MESES_ABREV[mes - 1] ?? String(mes);
}
