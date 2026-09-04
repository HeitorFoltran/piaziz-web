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
  autor?: string;
  texto: string;
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
}

export interface ServicoRequest {
  nome: string;
}

export interface TipoAcompanhamento {
  id: number;
  nome: string;
}

export interface TipoAcompanhamentoRequest {
  nome: string;
}

export interface Profissional {
  id: number;
  nome: string;
  cpf: string;
  carteiraProfissional: string | null;
  servicoId: number | null;
  servicoNome: string | null;
}

export interface ProfissionalRequest {
  nome: string;
  cpf: string;
  carteiraProfissional?: string;
  servicoId?: number | null;
}