import type {
  Acompanhamento,
  AcolhimentoEquipe,
  AcolhimentoEquipeRequest,
  AvaliacaoSocioeconomica,
  AvaliacaoSocioeconomicaRequest,
  DashboardStats,
  Encaminhamento,
  EncaminhamentoRequest,
  Ficha,
  FichaRequest,
  HistoricoAtendimento,
  HistoricoAtendimentoRequest,
  Interacao,
  InteracaoRequest,
  Profissional,
  ProfissionalRequest,
  Servico,
  ServicoRequest,
} from "@/types/api";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";

function buildQuery(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.append(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

let authToken: string | null = null;

let onTokenChange: ((token: string | null) => void) | null = null;

export function setOnTokenChange(callback: ((token: string | null) => void) | null) {
  onTokenChange = callback;
}

export function setAuthToken(token: string | null) {
  authToken = token;
  onTokenChange?.(token);
}

export async function login(email: string, senha: string) {
  const res = await request<{
    token: string;
    profissionalId: number;
    nome: string;
    email: string;
    role: string;
  }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, senha }) });
  setAuthToken(res.token);
  return res;
}

export function logout() {
  setAuthToken(null);
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(options?.headers ?? {}),
      },
      ...options,
    });
  } catch {
    throw new Error(
      "Não foi possível conectar à API. Verifique se o backend está em execução.",
    );
  }

  if (response.status === 401) {
    setAuthToken(null);
  }

  if (!response.ok) {
    let detail = "";
    try { detail = await response.text(); } catch {
      // corpo da resposta não é texto legível — segue sem detalhe
    }
    throw new Error(
      `Erro ${response.status} ao acessar ${path}` + (detail ? `: ${detail}` : ""),
    );
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function getDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>("/api/dashboard/stats");
}

export function getAcompanhamentos(params?: {
  q?: string;
  servicoId?: number | string;
}): Promise<Acompanhamento[]> {
  return request<Acompanhamento[]>(
    `/api/acompanhamentos${buildQuery({ q: params?.q, servicoId: params?.servicoId })}`,
  );
}

export function getFichas(params?: { q?: string }): Promise<Ficha[]> {
  return request<Ficha[]>(`/api/fichas${buildQuery({ q: params?.q })}`);
}

export function getFicha(id: number | string): Promise<Ficha> {
  return request<Ficha>(`/api/fichas/${id}`);
}

export function createFicha(body: FichaRequest): Promise<Ficha> {
  return request<Ficha>("/api/fichas", { method: "POST", body: JSON.stringify(body) });
}

export function atualizarStatusFicha(
  id: number | string,
  status: "ATIVO" | "PAUSADO" | "ENCERRADO",
): Promise<Ficha> {
  return request<Ficha>(`/api/fichas/${id}/status?status=${status}`, { method: "PATCH" });
}

export function getEncaminhamentos(fichaId: number | string): Promise<Encaminhamento[]> {
  return request<Encaminhamento[]>(`/api/fichas/${fichaId}/encaminhamentos`);
}

export function createEncaminhamento(
  fichaId: number | string,
  body: EncaminhamentoRequest,
): Promise<Encaminhamento> {
  return request<Encaminhamento>(`/api/fichas/${fichaId}/encaminhamentos`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getInteracoes(fichaId: number | string): Promise<Interacao[]> {
  return request<Interacao[]>(`/api/fichas/${fichaId}/interacoes`);
}

export function createInteracao(
  fichaId: number | string,
  body: InteracaoRequest,
): Promise<Interacao> {
  return request<Interacao>(`/api/fichas/${fichaId}/interacoes`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getServicos(): Promise<Servico[]> {
  return request<Servico[]>("/api/servicos");
}

export function createServico(body: ServicoRequest): Promise<Servico> {
  return request<Servico>("/api/servicos", { method: "POST", body: JSON.stringify(body) });
}

export function atualizarServico(id: number, body: ServicoRequest): Promise<Servico> {
  return request<Servico>(`/api/servicos/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export function getProfissionais(params?: {
  q?: string;
  servicoId?: number | string;
}): Promise<Profissional[]> {
  return request<Profissional[]>(
    `/api/profissionais${buildQuery({ q: params?.q, servicoId: params?.servicoId })}`,
  );
}

export function createProfissional(body: ProfissionalRequest): Promise<Profissional> {
  return request<Profissional>("/api/profissionais", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function atualizarFicha(
  id: number | string,
  body: FichaRequest,
): Promise<Ficha> {
  return request<Ficha>(`/api/fichas/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function getAvaliacaoSocioeconomica(fichaId: number | string): Promise<AvaliacaoSocioeconomica> {
  return request<AvaliacaoSocioeconomica>(`/api/fichas/${fichaId}/avaliacao-socioeconomica`);
}

export function salvarAvaliacaoSocioeconomica(
  fichaId: number | string,
  body: AvaliacaoSocioeconomicaRequest,
): Promise<AvaliacaoSocioeconomica> {
  return request<AvaliacaoSocioeconomica>(`/api/fichas/${fichaId}/avaliacao-socioeconomica`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function getAcolhimentoEquipe(fichaId: number | string): Promise<AcolhimentoEquipe> {
  return request<AcolhimentoEquipe>(`/api/fichas/${fichaId}/acolhimento-equipe`);
}

export function salvarAcolhimentoEquipe(
  fichaId: number | string,
  body: AcolhimentoEquipeRequest,
): Promise<AcolhimentoEquipe> {
  return request<AcolhimentoEquipe>(`/api/fichas/${fichaId}/acolhimento-equipe`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function getHistoricoAtendimento(fichaId: number | string): Promise<HistoricoAtendimento> {
  return request<HistoricoAtendimento>(`/api/fichas/${fichaId}/historico-atendimento`);
}

export function salvarHistoricoAtendimento(
  fichaId: number | string,
  body: HistoricoAtendimentoRequest,
): Promise<HistoricoAtendimento> {
  return request<HistoricoAtendimento>(`/api/fichas/${fichaId}/historico-atendimento`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}