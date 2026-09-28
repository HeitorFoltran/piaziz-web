export type TipoMoradia =
  | "CASA_PROPRIA"
  | "ALUGADA"
  | "CEDIDA"
  | "ABRIGO"
  | "OUTRO";

export type OndeMoramFilhos =
  | "COMIGO"
  | "COM_FAMILIARES_AMIGOS"
  | "ABRIGO_INSTITUCIONAL"
  | "SOZINHO_CONJUGE"
  | "NAO_TEM_FILHOS";

export type SupervisaoFilhos = "SIM" | "NAO" | "NAO_PRECISA";

export type VagaNecessaria = "CRECHE" | "ESCOLA" | "ATENDIMENTO_PSICOSSOCIAL" | "NAO_PRECISA";

export type NecessidadeImediata =
  | "INFORMACOES_DIREITOS"
  | "ATENDIMENTO_SAUDE"
  | "APOIO_PSICOLOGICO"
  | "ATENDIMENTO_ASSISTENCIA_SOCIAL"
  | "APOIO_MORADIA"
  | "APOIO_TRABALHO"
  | "OUTRO";

export type PeriodoTrabalho = "DIA" | "NOITE" | "MEIO_PERIODO";

export type NivelEscrita = "NAO" | "SO_NOME" | "SIM";

export type NivelEscolaridade = "NAO_ESTUDOU" | "FUNDAMENTAL" | "MEDIO" | "TECNICO" | "FACULDADE";

export type TipoViolencia = "FISICA" | "PSICOLOGICA" | "MORAL" | "PATRIMONIAL" | "OUTRA";

export type FrequenciaViolencia = "EPISODIO_UNICO" | "RECORRENTE";

export type CategoriaClassificacao = "CATEGORIA_1" | "CATEGORIA_2" | "CATEGORIA_3" | "CATEGORIA_4";

export type TipoEncaminhamento =
  | "SAUDE_GERAL"
  | "SAUDE_MENTAL"
  | "HABITACAO"
  | "TRABALHO_EMPREGO"
  | "ASSISTENCIA_SOCIAL"
  | "ASSISTENCIA_EDUCACIONAL"
  | "OUTRO";

export interface EncaminhamentoPorTipo {
  tipo: string;
  label: string;
  total: number;
}

export interface FichaPorMes {
  mes: string;
  ano: number;
  total: number;
}

export interface DashboardStats {
  totalFichasAtivas: number;
  totalEncaminhamentos: number;
  fichasAguardandoRetorno: number;
  fichasSemAtualizacao30Dias: number;
  encaminhamentosPorTipo: EncaminhamentoPorTipo[];
  fichasPorMes: FichaPorMes[];
}

export interface PontoSerie {
  periodo: string;
  total: number;
}

export interface RelatorioAnalitico {
  totalCadastros: number;
  totalEncaminhamentos: number;
  percentualCadastrosEncaminhados: number;
  taxaConversaoEncaminhamentoAtendimento: number;
  tempoMedioCadastroAtendimentoDias: number | null;
  mediaCadastrosPorMes: number;
  mediaCadastrosPorSemana: number;
  mediaCadastrosPorDia: number;
  mediaEncaminhamentosPorMes: number;
  mediaEncaminhamentosPorSemana: number;
  mediaEncaminhamentosPorDia: number;
  progressaoCadastros: PontoSerie[];
  progressaoEncaminhamentos: PontoSerie[];
  progressaoAtendimentos: PontoSerie[];
}

export interface Acompanhamento {
  id: number;
  numeroCaso: string;
  codigoFicha: string;
  nome: string;
  cpf: string;
  encaminhamento: string | null;
  tipoEncaminhamento: string | null;
  status: string;
  dataAtualizacao: string;
  dataCriacao: string;
  /** null em fichas antigas, sem registro de quem criou. */
  criadoPorId: number | null;
  tiposAcompanhamento: TipoAcompanhamento[];
}

export interface Encaminhamento {
  id: number;
  fichaId: number;
  servicoId: number | null;
  servicoNome: string | null;
  categoria: TipoEncaminhamento | null;
  profissional: string | null;
  dataEncaminhamento: string | null;
  dataRetorno: string | null;
  descricao: string | null;
}

export interface EncaminhamentoRequest {
  servicoId: number;
  categoria?: TipoEncaminhamento;
  profissional?: string;
  dataEncaminhamento?: string;
  dataRetorno?: string;
  descricao?: string;
}

export interface Interacao {
  id: number;
  fichaId: number;
  autor: string;
  dataInteracao: string;
  texto: string;
}

export interface InteracaoRequest {
  texto: string;
}

export type AcaoAlteracao = "CRIOU" | "EDITOU" | "PREENCHEU" | "MUDOU_STATUS" | "ALTEROU_TIPOS";

// Histórico do caso, do mais recente para o mais antigo. A última linha é sempre a criação
// (acao CRIOU, id null), montada pela API a partir da ficha. Nunca traz valor de campo:
// detalhe só vem em MUDOU_STATUS ("Ativo -> Arquivado"). editorNome é null se a conta não existe mais.
export interface AlteracaoFicha {
  id: number | null;
  tipoEntidade:
    | "Ficha"
    | "AvaliacaoSocioeconomica"
    | "HistoricoAtendimento"
    | "AcolhimentoEquipe"
    | "StatusFicha"
    | "TiposAcompanhamento";
  acao: AcaoAlteracao;
  detalhe: string | null;
  editorId: number;
  editorNome: string | null;
  donoId: number;
  donoNome: string;
  timestamp: string;
}

export interface Ficha {
  id: number;
  codigoFicha: string;
  numeroCaso: string;
  nome: string;
  cpf: string;
  idade: number | null;
  telefone: string | null;
  estadoCivil: string | null;
  pessoasDependentes: number | null;
  idadeFilhos: string | null;
  nivelSeguranca: number | null;
  tipoMoradia: TipoMoradia | null;
  tipoMoradiaOutraDescricao: string | null;
  qtdMoradores: number | null;
  qtdFilhos: number | null;
  ondeMoramFilhos: OndeMoramFilhos | null;
  supervisaoFilhos: SupervisaoFilhos | null;
  vagasNecessarias: VagaNecessaria[];
  necessidadesImediatas: NecessidadeImediata[];
  necessidadeOutraDescricao: string | null;
  dataCriacao: string;
  dataAtualizacao: string;
  status: string;
  encaminhamentos: Encaminhamento[];
  interacoes: Interacao[];
  avaliacaoSocioeconomica: AvaliacaoSocioeconomica | null;
  historicoAtendimento: HistoricoAtendimento | null;
  acolhimentoEquipe: AcolhimentoEquipe | null;
  tiposAcompanhamento: TipoAcompanhamento[];
}

export interface FichaRequest {
  nome: string;
  cpf: string;
  numeroCaso?: string;
  idade?: number | null;
  telefone?: string;
  estadoCivil?: string;
  pessoasDependentes?: number | null;
  idadeFilhos?: string;
  nivelSeguranca?: number | null;
  tipoMoradia?: TipoMoradia | null;
  tipoMoradiaOutraDescricao?: string;
  qtdMoradores?: number | null;
  qtdFilhos?: number | null;
  ondeMoramFilhos?: OndeMoramFilhos | null;
  supervisaoFilhos?: SupervisaoFilhos | null;
  vagasNecessarias?: VagaNecessaria[];
  necessidadesImediatas?: NecessidadeImediata[];
  necessidadeOutraDescricao?: string;
  status?: string;
}

export interface AvaliacaoSocioeconomica {
  id: number;
  fichaId: number;
  temRenda: boolean | null;
  valorRenda: number | null;
  pessoasDependemRenda: number | null;
  origemRenda: string | null;
  trabalhoFormal: boolean | null;
  rendaSuficiente: boolean | null;
  trabalhandoAtualmente: boolean | null;
  ondeTrabalha: string | null;
  problemaSaudeAtrapalhaTrabalho: boolean | null;
  problemaSaudeQual: string | null;
  situacaoFamiliarAtrapalhaTrabalho: boolean | null;
  situacaoFamiliarQual: string | null;
  desejaTrabalhar: boolean | null;
  periodoDesejado: PeriodoTrabalho | null;
  sabeLer: boolean | null;
  nivelEscrita: NivelEscrita | null;
  nivelEscolaridade: NivelEscolaridade | null;
  escolaridadeDetalhe: string | null;
  fezCursoProfissionalizante: boolean | null;
  cursoProfissionalizanteQual: string | null;
  desejaAuxilioCeebja: boolean | null;
  desejaCursoSenai: boolean | null;
  areaCursoSenai: string | null;
  temRedeApoio: boolean | null;
  precisaAjudaMoradia: boolean | null;
  temOQueComer: boolean | null;
  acompanhamentoMedico: boolean | null;
  precisaAjudaTratamentoMedico: boolean | null;
  usoContinuoMedicamento: boolean | null;
  medicamentoQuais: string | null;
  acessoMedicamentos: boolean | null;
}

export interface AvaliacaoSocioeconomicaRequest {
  temRenda?: boolean | null;
  valorRenda?: number | null;
  pessoasDependemRenda?: number | null;
  origemRenda?: string;
  trabalhoFormal?: boolean | null;
  rendaSuficiente?: boolean | null;
  trabalhandoAtualmente?: boolean | null;
  ondeTrabalha?: string;
  problemaSaudeAtrapalhaTrabalho?: boolean | null;
  problemaSaudeQual?: string;
  situacaoFamiliarAtrapalhaTrabalho?: boolean | null;
  situacaoFamiliarQual?: string;
  desejaTrabalhar?: boolean | null;
  periodoDesejado?: PeriodoTrabalho | null;
  sabeLer?: boolean | null;
  nivelEscrita?: NivelEscrita | null;
  nivelEscolaridade?: NivelEscolaridade | null;
  escolaridadeDetalhe?: string;
  fezCursoProfissionalizante?: boolean | null;
  cursoProfissionalizanteQual?: string;
  desejaAuxilioCeebja?: boolean | null;
  desejaCursoSenai?: boolean | null;
  areaCursoSenai?: string;
  temRedeApoio?: boolean | null;
  precisaAjudaMoradia?: boolean | null;
  temOQueComer?: boolean | null;
  acompanhamentoMedico?: boolean | null;
  precisaAjudaTratamentoMedico?: boolean | null;
  usoContinuoMedicamento?: boolean | null;
  medicamentoQuais?: string;
  acessoMedicamentos?: boolean | null;
}

export interface AcolhimentoEquipe {
  id: number;
  fichaId: number;
  numeroProcessoMpu: string | null;
  dataReuniaoAcolhimento: string | null;
  servidorResponsavel: string | null;
  tiposViolencia: TipoViolencia[];
  tipoViolenciaOutraDescricao: string | null;
  frequenciaViolencia: FrequenciaViolencia | null;
  medidasProtetivasAnteriores: boolean | null;
  ameacasRelatadas: string | null;
  necessidadeAtendimentoMedicoImediato: boolean | null;
  acompanhamentoSaudeMentalEmCurso: boolean | null;
  acompanhamentoSaudeMentalLocal: string | null;
  dependenteSofreuViolencia: boolean | null;
  dependentePrecisaAuxilioMedico: boolean | null;
  categoriaClassificacao: CategoriaClassificacao | null;
  observacoesRelevantes: string | null;
  responsavelAcolhimentoJuridico: string | null;
}

export interface AcolhimentoEquipeRequest {
  numeroProcessoMpu?: string;
  dataReuniaoAcolhimento?: string;
  servidorResponsavel?: string;
  tiposViolencia?: TipoViolencia[];
  tipoViolenciaOutraDescricao?: string;
  frequenciaViolencia?: FrequenciaViolencia | null;
  medidasProtetivasAnteriores?: boolean | null;
  ameacasRelatadas?: string;
  necessidadeAtendimentoMedicoImediato?: boolean | null;
  acompanhamentoSaudeMentalEmCurso?: boolean | null;
  acompanhamentoSaudeMentalLocal?: string;
  dependenteSofreuViolencia?: boolean | null;
  dependentePrecisaAuxilioMedico?: boolean | null;
  categoriaClassificacao?: CategoriaClassificacao | null;
  observacoesRelevantes?: string;
  responsavelAcolhimentoJuridico?: string;
}

export interface HistoricoAtendimento {
  id: number;
  fichaId: number;
  jaProcurouServico: boolean | null;
  servicoProcuradoQualOnde: string | null;
  emFilaEspera: boolean | null;
  filaEsperaQual: string | null;
  jaPediuAjudaJusticaPolicia: boolean | null;
  justicaPoliciaQual: string | null;
  comoFoiAtendimento: string | null;
  resolveuSituacao: boolean | null;
  reacaoAgressor: string | null;
}

export interface HistoricoAtendimentoRequest {
  jaProcurouServico?: boolean | null;
  servicoProcuradoQualOnde?: string;
  emFilaEspera?: boolean | null;
  filaEsperaQual?: string;
  jaPediuAjudaJusticaPolicia?: boolean | null;
  justicaPoliciaQual?: string;
  comoFoiAtendimento?: string;
  resolveuSituacao?: boolean | null;
  reacaoAgressor?: string;
}

export interface Servico {
  id: number;
  nome: string;
  /** Só na listagem do catálogo: tem encaminhamento ou profissional ligado e não pode ser excluído. */
  emUso?: boolean;
}

export interface ServicoRequest {
  nome: string;
}

export interface TipoAcompanhamento {
  id: number;
  nome: string;
  /** Só na listagem do catálogo: atribuído a algum caso e não pode ser excluído. */
  emUso?: boolean;
}

export interface TipoAcompanhamentoRequest {
  nome: string;
}

export type RoleProfissional = "DEV" | "PADRAO" | "ESTAGIARIO";

// Pela tela só se cria PADRAO ou ESTAGIARIO. Promover a DEV é só por SQL, de propósito.
export type RoleCriavel = Exclude<RoleProfissional, "DEV">;

export interface Profissional {
  id: number;
  nome: string;
  username: string;
  email: string | null;
  /** Mascarado na listagem; completo em GET /api/profissionais/{id}. */
  cpf: string;
  carteiraProfissional: string | null;
  servicoId: number | null;
  servicoNome: string | null;
  role: RoleProfissional;
  ativo: boolean;
  podeGerenciarProfissionais: boolean;
  deveTrocarSenha: boolean;
}

export type AcaoConta = "CRIAR" | "EDITAR" | "RESETAR_SENHA" | "TROCAR_PROPRIA_SENHA";

export interface ContaHistorico {
  id: number;
  acao: AcaoConta;
  /** Já vem legível da API (ex.: "campos: nome, ativo"). Nunca contém senha nem hash. */
  detalhe: string | null;
  autorId: number;
  /** null se o autor não existir mais. */
  autorNome: string | null;
  timestamp: string;
}

export interface ProfissionalRequest {
  nome: string;
  cpf: string;
  carteiraProfissional?: string | null;
  servicoId?: number | null;
  username: string;
  email?: string | null;
  senhaProvisoria: string;
  role: RoleCriavel;
  podeGerenciarProfissionais?: boolean;
}

// Mesmos campos da criação, menos a senha, mais `ativo`. `role` aceita DEV só para
// reenviar o papel de uma conta DEV sem mudá-lo (a API recusa qualquer mudança de/para DEV).
export interface ProfissionalEdicaoRequest {
  nome: string;
  cpf: string;
  carteiraProfissional?: string | null;
  servicoId?: number | null;
  username: string;
  email?: string | null;
  role: RoleProfissional;
  podeGerenciarProfissionais: boolean;
  ativo: boolean;
}

export interface LoginResponse {
  token: string;
  profissionalId: number;
  nome: string;
  username: string;
  email: string | null;
  role: RoleProfissional;
  deveTrocarSenha: boolean;
}

export interface UsuarioAtual {
  id: number;
  nome: string;
  username: string;
  email: string | null;
  role: RoleProfissional;
  /** Já vem calculado pela API: DEV sempre true. */
  podeGerenciarProfissionais: boolean;
  deveTrocarSenha: boolean;
}

export interface TrocarSenhaRequest {
  senhaAtual: string;
  novaSenha: string;
}
export type StatusConvite = "ATIVO" | "USADO" | "EXPIRADO" | "CANCELADO";

export interface ConviteFicha {
  id: number;
  criadoPorId: number;
  criadoPorNome: string | null;
  /**
   * Vem preenchido na criação e na lista enquanto o convite está ativo e no prazo. Vem null
   * quando o link já foi usado, expirou, foi cancelado ou foi criado antes do lote 4.
   */
  linkCompleto: string | null;
  dataCriacao: string;
  dataExpiracao: string;
  status: StatusConvite;
  usadoEm: string | null;
}

export interface FichaPublicaStatus {
  valido: boolean;
  motivo: "expirado" | "invalido" | "usado" | null;
}

// Formulário público = Parte A do PIA: Ficha (numeroCaso/status são ignorados pelo
// backend) + avaliação socioeconômica + histórico de atendimento.
export interface FichaPublicaRequest {
  ficha: FichaRequest;
  avaliacao?: AvaliacaoSocioeconomicaRequest;
  historico?: HistoricoAtendimentoRequest;
  situacaoRelatada?: string;
}

export type StatusFichaPendente = "PENDENTE" | "APROVADA" | "REJEITADA";

export interface FichaPendente {
  id: number;
  nome: string;
  cpf: string;
  telefone: string | null;
  idade: number | null;
  situacaoRelatada: string | null;
  dataSubmissao: string;
  status: StatusFichaPendente;
  revisadoPorId: number | null;
  dataRevisao: string | null;
  motivoRejeicao: string | null;
  fichaId: number | null;
  ficha: FichaRequest;
  avaliacao: AvaliacaoSocioeconomicaRequest | null;
  historico: HistoricoAtendimentoRequest | null;
}
