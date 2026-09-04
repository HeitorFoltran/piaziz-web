import type {
  AcolhimentoEquipe,
  AcolhimentoEquipeRequest,
  AvaliacaoSocioeconomica,
  AvaliacaoSocioeconomicaRequest,
  Ficha,
  FichaRequest,
  HistoricoAtendimento,
  HistoricoAtendimentoRequest,
} from "@/types/api";

export type FichaFormState = {
  nome: string;
  cpf: string;
  numeroCaso: string;
  idade: string;
  telefone: string;
  estadoCivil: string;
  pessoasDependentes: string;
  idadeFilhos: string;
  nivelSeguranca: string;
  tipoMoradia: string;
  tipoMoradiaOutraDescricao: string;
  qtdMoradores: string;
  qtdFilhos: string;
  ondeMoramFilhos: string;
  supervisaoFilhos: string;
  vagasNecessarias: string[];
  necessidadesImediatas: string[];
  necessidadeOutraDescricao: string;
};

export const emptyFichaForm: FichaFormState = {
  nome: "",
  cpf: "",
  numeroCaso: "",
  idade: "",
  telefone: "",
  estadoCivil: "",
  pessoasDependentes: "",
  idadeFilhos: "",
  nivelSeguranca: "0",
  tipoMoradia: "",
  tipoMoradiaOutraDescricao: "",
  qtdMoradores: "",
  qtdFilhos: "",
  ondeMoramFilhos: "",
  supervisaoFilhos: "",
  vagasNecessarias: [],
  necessidadesImediatas: [],
  necessidadeOutraDescricao: "",
};

export type AvaliacaoFormState = {
  temRenda: string;
  valorRenda: string;
  pessoasDependemRenda: string;
  origemRenda: string;
  trabalhoFormal: string;
  rendaSuficiente: string;
  trabalhandoAtualmente: string;
  ondeTrabalha: string;
  problemaSaudeAtrapalhaTrabalho: string;
  problemaSaudeQual: string;
  situacaoFamiliarAtrapalhaTrabalho: string;
  situacaoFamiliarQual: string;
  desejaTrabalhar: string;
  periodoDesejado: string;
  sabeLer: string;
  nivelEscrita: string;
  nivelEscolaridade: string;
  escolaridadeDetalhe: string;
  fezCursoProfissionalizante: string;
  cursoProfissionalizanteQual: string;
  desejaAuxilioCeebja: string;
  desejaCursoSenai: string;
  areaCursoSenai: string;
  temRedeApoio: string;
  precisaAjudaMoradia: string;
  temOQueComer: string;
  acompanhamentoMedico: string;
  precisaAjudaTratamentoMedico: string;
  usoContinuoMedicamento: string;
  medicamentoQuais: string;
  acessoMedicamentos: string;
};

export const emptyAvaliacaoForm: AvaliacaoFormState = {
  temRenda: "",
  valorRenda: "",
  pessoasDependemRenda: "",
  origemRenda: "",
  trabalhoFormal: "",
  rendaSuficiente: "",
  trabalhandoAtualmente: "",
  ondeTrabalha: "",
  problemaSaudeAtrapalhaTrabalho: "",
  problemaSaudeQual: "",
  situacaoFamiliarAtrapalhaTrabalho: "",
  situacaoFamiliarQual: "",
  desejaTrabalhar: "",
  periodoDesejado: "",
  sabeLer: "",
  nivelEscrita: "",
  nivelEscolaridade: "",
  escolaridadeDetalhe: "",
  fezCursoProfissionalizante: "",
  cursoProfissionalizanteQual: "",
  desejaAuxilioCeebja: "",
  desejaCursoSenai: "",
  areaCursoSenai: "",
  temRedeApoio: "",
  precisaAjudaMoradia: "",
  temOQueComer: "",
  acompanhamentoMedico: "",
  precisaAjudaTratamentoMedico: "",
  usoContinuoMedicamento: "",
  medicamentoQuais: "",
  acessoMedicamentos: "",
};

export type AcolhimentoFormState = {
  numeroProcessoMpu: string;
  dataReuniaoAcolhimento: string;
  servidorResponsavel: string;
  tiposViolencia: string[];
  tipoViolenciaOutraDescricao: string;
  frequenciaViolencia: string;
  medidasProtetivasAnteriores: string;
  ameacasRelatadas: string;
  necessidadeAtendimentoMedicoImediato: string;
  acompanhamentoSaudeMentalEmCurso: string;
  acompanhamentoSaudeMentalLocal: string;
  dependenteSofreuViolencia: string;
  dependentePrecisaAuxilioMedico: string;
  categoriaClassificacao: string;
  observacoesRelevantes: string;
  responsavelAcolhimentoJuridico: string;
};

export const emptyAcolhimentoForm: AcolhimentoFormState = {
  numeroProcessoMpu: "",
  dataReuniaoAcolhimento: "",
  servidorResponsavel: "",
  tiposViolencia: [],
  tipoViolenciaOutraDescricao: "",
  frequenciaViolencia: "",
  medidasProtetivasAnteriores: "",
  ameacasRelatadas: "",
  necessidadeAtendimentoMedicoImediato: "",
  acompanhamentoSaudeMentalEmCurso: "",
  acompanhamentoSaudeMentalLocal: "",
  dependenteSofreuViolencia: "",
  dependentePrecisaAuxilioMedico: "",
  categoriaClassificacao: "",
  observacoesRelevantes: "",
  responsavelAcolhimentoJuridico: "",
};

export type HistoricoFormState = {
  jaProcurouServico: string;
  servicoProcuradoQualOnde: string;
  emFilaEspera: string;
  filaEsperaQual: string;
  jaPediuAjudaJusticaPolicia: string;
  justicaPoliciaQual: string;
  comoFoiAtendimento: string;
  resolveuSituacao: string;
  reacaoAgressor: string;
};

export const emptyHistoricoForm: HistoricoFormState = {
  jaProcurouServico: "",
  servicoProcuradoQualOnde: "",
  emFilaEspera: "",
  filaEsperaQual: "",
  jaPediuAjudaJusticaPolicia: "",
  justicaPoliciaQual: "",
  comoFoiAtendimento: "",
  resolveuSituacao: "",
  reacaoAgressor: "",
};

const toBool = (v: string): boolean | undefined => (v === "sim" ? true : v === "nao" ? false : undefined);
const fromBool = (v: boolean | null | undefined): string => (v === true ? "sim" : v === false ? "nao" : "");
const toNum = (v: string): number | undefined => (v === "" ? undefined : Number(v));
const fromNum = (v: number | null | undefined): string => (v == null ? "" : String(v));
const fromStr = (v: string | null | undefined): string => v ?? "";

export function fichaToFormState(f: Ficha): FichaFormState {
  return {
    nome: f.nome ?? "",
    cpf: f.cpf ?? "",
    numeroCaso: f.numeroCaso ?? "",
    idade: fromNum(f.idade),
    telefone: fromStr(f.telefone),
    estadoCivil: fromStr(f.estadoCivil),
    pessoasDependentes: fromNum(f.pessoasDependentes),
    idadeFilhos: fromStr(f.idadeFilhos),
    nivelSeguranca: f.nivelSeguranca != null ? String(f.nivelSeguranca) : "0",
    tipoMoradia: f.tipoMoradia ?? "",
    tipoMoradiaOutraDescricao: fromStr(f.tipoMoradiaOutraDescricao),
    qtdMoradores: fromNum(f.qtdMoradores),
    qtdFilhos: fromNum(f.qtdFilhos),
    ondeMoramFilhos: f.ondeMoramFilhos ?? "",
    supervisaoFilhos: f.supervisaoFilhos ?? "",
    vagasNecessarias: f.vagasNecessarias ?? [],
    necessidadesImediatas: f.necessidadesImediatas ?? [],
    necessidadeOutraDescricao: fromStr(f.necessidadeOutraDescricao),
  };
}

export function fichaFormToRequest(form: FichaFormState, status: string): FichaRequest {
  return {
    nome: form.nome.trim(),
    cpf: form.cpf.trim(),
    numeroCaso: form.numeroCaso || undefined,
    idade: toNum(form.idade),
    telefone: form.telefone || undefined,
    estadoCivil: form.estadoCivil || undefined,
    pessoasDependentes: toNum(form.pessoasDependentes),
    idadeFilhos: form.idadeFilhos || undefined,
    nivelSeguranca: toNum(form.nivelSeguranca),
    tipoMoradia: (form.tipoMoradia || undefined) as FichaRequest["tipoMoradia"],
    tipoMoradiaOutraDescricao: form.tipoMoradiaOutraDescricao || undefined,
    qtdMoradores: toNum(form.qtdMoradores),
    qtdFilhos: toNum(form.qtdFilhos),
    ondeMoramFilhos: (form.ondeMoramFilhos || undefined) as FichaRequest["ondeMoramFilhos"],
    supervisaoFilhos: (form.supervisaoFilhos || undefined) as FichaRequest["supervisaoFilhos"],
    vagasNecessarias: form.vagasNecessarias as FichaRequest["vagasNecessarias"],
    necessidadesImediatas: form.necessidadesImediatas as FichaRequest["necessidadesImediatas"],
    necessidadeOutraDescricao: form.necessidadeOutraDescricao || undefined,
    status,
  };
}

export function avaliacaoToFormState(a: AvaliacaoSocioeconomica | null | undefined): AvaliacaoFormState {
  if (!a) return emptyAvaliacaoForm;
  return {
    temRenda: fromBool(a.temRenda),
    valorRenda: fromNum(a.valorRenda),
    pessoasDependemRenda: fromNum(a.pessoasDependemRenda),
    origemRenda: fromStr(a.origemRenda),
    trabalhoFormal: fromBool(a.trabalhoFormal),
    rendaSuficiente: fromBool(a.rendaSuficiente),
    trabalhandoAtualmente: fromBool(a.trabalhandoAtualmente),
    ondeTrabalha: fromStr(a.ondeTrabalha),
    problemaSaudeAtrapalhaTrabalho: fromBool(a.problemaSaudeAtrapalhaTrabalho),
    problemaSaudeQual: fromStr(a.problemaSaudeQual),
    situacaoFamiliarAtrapalhaTrabalho: fromBool(a.situacaoFamiliarAtrapalhaTrabalho),
    situacaoFamiliarQual: fromStr(a.situacaoFamiliarQual),
    desejaTrabalhar: fromBool(a.desejaTrabalhar),
    periodoDesejado: a.periodoDesejado ?? "",
    sabeLer: fromBool(a.sabeLer),
    nivelEscrita: a.nivelEscrita ?? "",
    nivelEscolaridade: a.nivelEscolaridade ?? "",
    escolaridadeDetalhe: fromStr(a.escolaridadeDetalhe),
    fezCursoProfissionalizante: fromBool(a.fezCursoProfissionalizante),
    cursoProfissionalizanteQual: fromStr(a.cursoProfissionalizanteQual),
    desejaAuxilioCeebja: fromBool(a.desejaAuxilioCeebja),
    desejaCursoSenai: fromBool(a.desejaCursoSenai),
    areaCursoSenai: fromStr(a.areaCursoSenai),
    temRedeApoio: fromBool(a.temRedeApoio),
    precisaAjudaMoradia: fromBool(a.precisaAjudaMoradia),
    temOQueComer: fromBool(a.temOQueComer),
    acompanhamentoMedico: fromBool(a.acompanhamentoMedico),
    precisaAjudaTratamentoMedico: fromBool(a.precisaAjudaTratamentoMedico),
    usoContinuoMedicamento: fromBool(a.usoContinuoMedicamento),
    medicamentoQuais: fromStr(a.medicamentoQuais),
    acessoMedicamentos: fromBool(a.acessoMedicamentos),
  };
}

export function avaliacaoFormToRequest(form: AvaliacaoFormState): AvaliacaoSocioeconomicaRequest {
  return {
    temRenda: toBool(form.temRenda),
    valorRenda: toNum(form.valorRenda),
    pessoasDependemRenda: toNum(form.pessoasDependemRenda),
    origemRenda: form.origemRenda || undefined,
    trabalhoFormal: toBool(form.trabalhoFormal),
    rendaSuficiente: toBool(form.rendaSuficiente),
    trabalhandoAtualmente: toBool(form.trabalhandoAtualmente),
    ondeTrabalha: form.ondeTrabalha || undefined,
    problemaSaudeAtrapalhaTrabalho: toBool(form.problemaSaudeAtrapalhaTrabalho),
    problemaSaudeQual: form.problemaSaudeQual || undefined,
    situacaoFamiliarAtrapalhaTrabalho: toBool(form.situacaoFamiliarAtrapalhaTrabalho),
    situacaoFamiliarQual: form.situacaoFamiliarQual || undefined,
    desejaTrabalhar: toBool(form.desejaTrabalhar),
    periodoDesejado: (form.periodoDesejado || undefined) as AvaliacaoSocioeconomicaRequest["periodoDesejado"],
    sabeLer: toBool(form.sabeLer),
    nivelEscrita: (form.nivelEscrita || undefined) as AvaliacaoSocioeconomicaRequest["nivelEscrita"],
    nivelEscolaridade: (form.nivelEscolaridade || undefined) as AvaliacaoSocioeconomicaRequest["nivelEscolaridade"],
    escolaridadeDetalhe: form.escolaridadeDetalhe || undefined,
    fezCursoProfissionalizante: toBool(form.fezCursoProfissionalizante),
    cursoProfissionalizanteQual: form.cursoProfissionalizanteQual || undefined,
    desejaAuxilioCeebja: toBool(form.desejaAuxilioCeebja),
    desejaCursoSenai: toBool(form.desejaCursoSenai),
    areaCursoSenai: form.areaCursoSenai || undefined,
    temRedeApoio: toBool(form.temRedeApoio),
    precisaAjudaMoradia: toBool(form.precisaAjudaMoradia),
    temOQueComer: toBool(form.temOQueComer),
    acompanhamentoMedico: toBool(form.acompanhamentoMedico),
    precisaAjudaTratamentoMedico: toBool(form.precisaAjudaTratamentoMedico),
    usoContinuoMedicamento: toBool(form.usoContinuoMedicamento),
    medicamentoQuais: form.medicamentoQuais || undefined,
    acessoMedicamentos: toBool(form.acessoMedicamentos),
  };
}

export function acolhimentoToFormState(a: AcolhimentoEquipe | null | undefined): AcolhimentoFormState {
  if (!a) return emptyAcolhimentoForm;
  return {
    numeroProcessoMpu: fromStr(a.numeroProcessoMpu),
    dataReuniaoAcolhimento: fromStr(a.dataReuniaoAcolhimento),
    servidorResponsavel: fromStr(a.servidorResponsavel),
    tiposViolencia: a.tiposViolencia ?? [],
    tipoViolenciaOutraDescricao: fromStr(a.tipoViolenciaOutraDescricao),
    frequenciaViolencia: a.frequenciaViolencia ?? "",
    medidasProtetivasAnteriores: fromBool(a.medidasProtetivasAnteriores),
    ameacasRelatadas: fromStr(a.ameacasRelatadas),
    necessidadeAtendimentoMedicoImediato: fromBool(a.necessidadeAtendimentoMedicoImediato),
    acompanhamentoSaudeMentalEmCurso: fromBool(a.acompanhamentoSaudeMentalEmCurso),
    acompanhamentoSaudeMentalLocal: fromStr(a.acompanhamentoSaudeMentalLocal),
    dependenteSofreuViolencia: fromBool(a.dependenteSofreuViolencia),
    dependentePrecisaAuxilioMedico: fromBool(a.dependentePrecisaAuxilioMedico),
    categoriaClassificacao: a.categoriaClassificacao ?? "",
    observacoesRelevantes: fromStr(a.observacoesRelevantes),
    responsavelAcolhimentoJuridico: fromStr(a.responsavelAcolhimentoJuridico),
  };
}

export function acolhimentoFormToRequest(form: AcolhimentoFormState): AcolhimentoEquipeRequest {
  return {
    numeroProcessoMpu: form.numeroProcessoMpu || undefined,
    dataReuniaoAcolhimento: form.dataReuniaoAcolhimento || undefined,
    servidorResponsavel: form.servidorResponsavel || undefined,
    tiposViolencia: form.tiposViolencia as AcolhimentoEquipeRequest["tiposViolencia"],
    tipoViolenciaOutraDescricao: form.tipoViolenciaOutraDescricao || undefined,
    frequenciaViolencia: (form.frequenciaViolencia || undefined) as AcolhimentoEquipeRequest["frequenciaViolencia"],
    medidasProtetivasAnteriores: toBool(form.medidasProtetivasAnteriores),
    ameacasRelatadas: form.ameacasRelatadas || undefined,
    necessidadeAtendimentoMedicoImediato: toBool(form.necessidadeAtendimentoMedicoImediato),
    acompanhamentoSaudeMentalEmCurso: toBool(form.acompanhamentoSaudeMentalEmCurso),
    acompanhamentoSaudeMentalLocal: form.acompanhamentoSaudeMentalLocal || undefined,
    dependenteSofreuViolencia: toBool(form.dependenteSofreuViolencia),
    dependentePrecisaAuxilioMedico: toBool(form.dependentePrecisaAuxilioMedico),
    categoriaClassificacao: (form.categoriaClassificacao || undefined) as AcolhimentoEquipeRequest["categoriaClassificacao"],
    observacoesRelevantes: form.observacoesRelevantes || undefined,
    responsavelAcolhimentoJuridico: form.responsavelAcolhimentoJuridico || undefined,
  };
}

export function historicoToFormState(h: HistoricoAtendimento | null | undefined): HistoricoFormState {
  if (!h) return emptyHistoricoForm;
  return {
    jaProcurouServico: fromBool(h.jaProcurouServico),
    servicoProcuradoQualOnde: fromStr(h.servicoProcuradoQualOnde),
    emFilaEspera: fromBool(h.emFilaEspera),
    filaEsperaQual: fromStr(h.filaEsperaQual),
    jaPediuAjudaJusticaPolicia: fromBool(h.jaPediuAjudaJusticaPolicia),
    justicaPoliciaQual: fromStr(h.justicaPoliciaQual),
    comoFoiAtendimento: fromStr(h.comoFoiAtendimento),
    resolveuSituacao: fromBool(h.resolveuSituacao),
    reacaoAgressor: fromStr(h.reacaoAgressor),
  };
}

export function historicoFormToRequest(form: HistoricoFormState): HistoricoAtendimentoRequest {
  return {
    jaProcurouServico: toBool(form.jaProcurouServico),
    servicoProcuradoQualOnde: form.servicoProcuradoQualOnde || undefined,
    emFilaEspera: toBool(form.emFilaEspera),
    filaEsperaQual: form.filaEsperaQual || undefined,
    jaPediuAjudaJusticaPolicia: toBool(form.jaPediuAjudaJusticaPolicia),
    justicaPoliciaQual: form.justicaPoliciaQual || undefined,
    comoFoiAtendimento: form.comoFoiAtendimento || undefined,
    resolveuSituacao: toBool(form.resolveuSituacao),
    reacaoAgressor: form.reacaoAgressor || undefined,
  };
}
