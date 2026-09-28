import type {
  Acompanhamento,
  AcolhimentoEquipe,
  AcolhimentoEquipeRequest,
  AlteracaoFicha,
  AvaliacaoSocioeconomica,
  AvaliacaoSocioeconomicaRequest,
  ContaHistorico,
  ConviteFicha,
  DashboardStats,
  Encaminhamento,
  EncaminhamentoRequest,
  Ficha,
  FichaPendente,
  FichaPublicaRequest,
  FichaPublicaStatus,
  FichaRequest,
  HistoricoAtendimento,
  HistoricoAtendimentoRequest,
  Interacao,
  InteracaoRequest,
  LoginResponse,
  Profissional,
  ProfissionalEdicaoRequest,
  ProfissionalRequest,
  RelatorioAnalitico,
  Servico,
  ServicoRequest,
  StatusFichaPendente,
  TipoAcompanhamento,
  TipoAcompanhamentoRequest,
  TrocarSenhaRequest,
  UsuarioAtual,
  VisualizacaoFicha,
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

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** O campo `message` do corpo de erro da API (GlobalExceptionHandler), quando veio. */
    readonly mensagemApi?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Texto para mostrar ao usuário: a mensagem que a API devolveu, se houver.
export function mensagemDeErro(err: unknown): string {
  if (err instanceof ApiError && err.mensagemApi) return err.mensagemApi;
  if (err instanceof Error) return err.message;
  return "Erro inesperado. Tente novamente.";
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

// `identificador` é username ou email; a API decide pela presença de "@".
export async function login(identificador: string, senha: string): Promise<LoginResponse> {
  const res = await request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ identificador, senha }),
  });
  setAuthToken(res.token);
  return res;
}

export function getMe(): Promise<UsuarioAtual> {
  return request<UsuarioAtual>("/api/auth/me");
}

// A API revoga as outras sessões e devolve um token novo para esta continuar.
export async function trocarSenha(body: TrocarSenhaRequest): Promise<LoginResponse> {
  const res = await request<LoginResponse>("/api/auth/senha", {
    method: "PUT",
    body: JSON.stringify(body),
  });
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
    let mensagemApi: string | undefined;
    try {
      const corpo = JSON.parse(detail);
      if (typeof corpo?.message === "string") mensagemApi = corpo.message;
    } catch {
      // corpo não é JSON — fica só o detalhe cru
    }
    throw new ApiError(
      `Erro ${response.status} ao acessar ${path}` + (detail ? `: ${detail}` : ""),
      response.status,
      mensagemApi,
    );
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function getDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>("/api/dashboard/stats");
}

export function getRelatorios(granularidade: "dia" | "semana" | "mes"): Promise<RelatorioAnalitico> {
  return request<RelatorioAnalitico>(`/api/dashboard/relatorios?granularidade=${granularidade}`);
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

export function atribuirTiposAcompanhamento(
  fichaId: number | string,
  tipoIds: number[],
): Promise<Ficha> {
  return request<Ficha>(`/api/fichas/${fichaId}/tipos-acompanhamento`, {
    method: "PUT",
    body: JSON.stringify({ tipoIds }),
  });
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

export function getAlteracoesFicha(fichaId: number | string): Promise<AlteracaoFicha[]> {
  return request<AlteracaoFicha[]>(`/api/fichas/${fichaId}/alteracoes`);
}

export function getVisualizacoesFicha(fichaId: number | string): Promise<VisualizacaoFicha[]> {
  return request<VisualizacaoFicha[]>(`/api/fichas/${fichaId}/visualizacoes`);
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

export function getTiposAcompanhamento(): Promise<TipoAcompanhamento[]> {
  return request<TipoAcompanhamento[]>("/api/tipos-acompanhamento");
}

export function createTipoAcompanhamento(body: TipoAcompanhamentoRequest): Promise<TipoAcompanhamento> {
  return request<TipoAcompanhamento>("/api/tipos-acompanhamento", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function atualizarTipoAcompanhamento(id: number, body: TipoAcompanhamentoRequest): Promise<TipoAcompanhamento> {
  return request<TipoAcompanhamento>(`/api/tipos-acompanhamento/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function getProfissionais(params?: {
  q?: string;
  servicoId?: number | string;
}): Promise<Profissional[]> {
  return request<Profissional[]>(
    `/api/profissionais${buildQuery({ q: params?.q, servicoId: params?.servicoId })}`,
  );
}

export function getProfissional(id: number): Promise<Profissional> {
  return request<Profissional>(`/api/profissionais/${id}`);
}

export function createProfissional(body: ProfissionalRequest): Promise<Profissional> {
  return request<Profissional>("/api/profissionais", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateProfissional(id: number, body: ProfissionalEdicaoRequest): Promise<Profissional> {
  return request<Profissional>(`/api/profissionais/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function resetarSenhaProfissional(id: number, senhaProvisoria: string): Promise<void> {
  return request<void>(`/api/profissionais/${id}/resetar-senha`, {
    method: "POST",
    body: JSON.stringify({ senhaProvisoria }),
  });
}

export function getHistoricoConta(id: number): Promise<ContaHistorico[]> {
  return request<ContaHistorico[]>(`/api/profissionais/${id}/historico`);
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

export function criarConviteFicha(): Promise<ConviteFicha> {
  return request<ConviteFicha>("/api/convites-ficha", { method: "POST" });
}

export function listarConvitesFicha(): Promise<ConviteFicha[]> {
  return request<ConviteFicha[]>("/api/convites-ficha");
}

export function cancelarConviteFicha(id: number): Promise<ConviteFicha> {
  return request<ConviteFicha>(`/api/convites-ficha/${id}/cancelar`, { method: "POST" });
}

export function listarFichasPendentes(status?: StatusFichaPendente): Promise<FichaPendente[]> {
  return request<FichaPendente[]>(`/api/fichas-pendentes${buildQuery({ status })}`);
}

export function aprovarFichaPendente(id: number): Promise<FichaPendente> {
  return request<FichaPendente>(`/api/fichas-pendentes/${id}/aprovar`, { method: "POST" });
}

export function rejeitarFichaPendente(id: number, motivo?: string): Promise<FichaPendente> {
  return request<FichaPendente>(`/api/fichas-pendentes/${id}/rejeitar`, {
    method: "POST",
    body: JSON.stringify({ motivo: motivo || null }),
  });
}

// Rotas públicas do link de intake. Não passam pelo request(): o visitante não tem
// conta, e se houver um token de profissional em memória na mesma aba ele não pode
// ir junto. O erro é sempre genérico — nem o token nem o corpo da resposta vão pra
// mensagem, que é exibida pra quem está do outro lado do link.
async function publicRequest<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json" },
      credentials: "omit",
    });
  } catch {
    throw new Error("Não foi possível conectar. Tente novamente em alguns instantes.");
  }
  if (!response.ok) {
    throw new Error("Não foi possível concluir. Tente novamente mais tarde.");
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function getFichaPublicaStatus(token: string): Promise<FichaPublicaStatus> {
  return publicRequest<FichaPublicaStatus>(
    `/api/ficha-publica/${encodeURIComponent(token)}/status`,
  );
}

export function submitFichaPublica(token: string, body: FichaPublicaRequest): Promise<void> {
  return publicRequest<void>(`/api/ficha-publica/${encodeURIComponent(token)}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
