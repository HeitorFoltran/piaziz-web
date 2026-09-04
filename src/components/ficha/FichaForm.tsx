import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { YesNoRadio } from "@/components/ficha/YesNoRadio";
import { RadioOptionList } from "@/components/ficha/RadioOptionList";
import { CheckboxOptionList } from "@/components/ficha/CheckboxOptionList";
import {
  type FichaFormState,
  type AvaliacaoFormState,
  type AcolhimentoFormState,
  type HistoricoFormState,
  emptyFichaForm,
  emptyAvaliacaoForm,
  emptyAcolhimentoForm,
  emptyHistoricoForm,
  fichaFormToRequest,
  avaliacaoFormToRequest,
  acolhimentoFormToRequest,
  historicoFormToRequest,
} from "@/components/ficha/ficha-form-state";
import type { AcolhimentoEquipeRequest, AvaliacaoSocioeconomicaRequest, FichaRequest, HistoricoAtendimentoRequest } from "@/types/api";

const NIVEIS_SEGURANCA = [
  { v: "0", l: "0 – Não me sinto segura de forma alguma" },
  { v: "1", l: "1 – Me sinto muito pouco segura" },
  { v: "2", l: "2 – Me sinto um pouco segura em alguns momentos" },
  { v: "3", l: "3 – Me sinto segura em vários momentos" },
  { v: "4", l: "4 – Segura" },
  { v: "5", l: "5 – Muito segura" },
];

const TIPOS_MORADIA = [
  { v: "CASA_PROPRIA", l: "Casa própria" },
  { v: "ALUGADA", l: "Casa alugada" },
  { v: "CEDIDA", l: "Casa cedida (emprestada)" },
  { v: "ABRIGO", l: "Abrigo temporário" },
  { v: "OUTRO", l: "Outro" },
];

const ONDE_MORAM_FILHOS = [
  { v: "COMIGO", l: "Comigo" },
  { v: "COM_FAMILIARES_AMIGOS", l: "Com familiares/amigos" },
  { v: "ABRIGO_INSTITUCIONAL", l: "Em abrigo institucional/família acolhedora" },
  { v: "SOZINHO_CONJUGE", l: "Sozinho/cônjuge" },
  { v: "NAO_TEM_FILHOS", l: "Não tenho filhos" },
];

const SUPERVISAO_FILHOS = [
  { v: "SIM", l: "Sim" },
  { v: "NAO", l: "Não" },
  { v: "NAO_PRECISA", l: "Eles não precisam de supervisão" },
];

const VAGAS_NECESSARIAS = [
  { v: "CRECHE", l: "Creche" },
  { v: "ESCOLA", l: "Escola" },
  { v: "ATENDIMENTO_PSICOSSOCIAL", l: "Atendimento Psicossocial" },
  { v: "NAO_PRECISA", l: "Não precisa" },
];

const PERIODOS_TRABALHO = [
  { v: "DIA", l: "Durante o dia" },
  { v: "NOITE", l: "Durante a noite" },
  { v: "MEIO_PERIODO", l: "Meio período" },
];

const NIVEIS_ESCRITA = [
  { v: "NAO", l: "Não" },
  { v: "SO_NOME", l: "Sei escrever meu nome" },
  { v: "SIM", l: "Sim" },
];

const NIVEIS_ESCOLARIDADE = [
  { v: "NAO_ESTUDOU", l: "Não estudei" },
  { v: "FUNDAMENTAL", l: "Ensino Fundamental" },
  { v: "MEDIO", l: "Ensino Médio" },
  { v: "TECNICO", l: "Ensino Técnico" },
  { v: "FACULDADE", l: "Faculdade" },
];

const NECESSIDADES_IMEDIATAS = [
  { v: "INFORMACOES_DIREITOS", l: "Informações sobre meus direitos" },
  { v: "ATENDIMENTO_SAUDE", l: "Atendimento de saúde" },
  { v: "APOIO_PSICOLOGICO", l: "Apoio psicológico" },
  { v: "ATENDIMENTO_ASSISTENCIA_SOCIAL", l: "Atendimento da assistência social" },
  { v: "APOIO_MORADIA", l: "Apoio para moradia" },
  { v: "APOIO_TRABALHO", l: "Apoio para trabalho/emprego" },
];

const TIPOS_VIOLENCIA = [
  { v: "FISICA", l: "Física" },
  { v: "PSICOLOGICA", l: "Psicológica" },
  { v: "MORAL", l: "Moral" },
  { v: "PATRIMONIAL", l: "Patrimonial" },
  { v: "OUTRA", l: "Outra" },
];

const CATEGORIAS_CLASSIFICACAO = [
  { v: "CATEGORIA_1", l: "Categoria 1 – Mulheres com trabalho adequado" },
  { v: "CATEGORIA_2", l: "Categoria 2 – Sem trabalho adequado, com condições de trabalhar" },
  { v: "CATEGORIA_3", l: "Categoria 3 – Sem trabalho adequado e sem condições de trabalhar" },
  { v: "CATEGORIA_4", l: "Categoria 4 – Vítimas de crimes sexuais" },
];

export interface FichaFormSubmitData {
  ficha: FichaRequest;
  avaliacao: AvaliacaoSocioeconomicaRequest;
  acolhimento: AcolhimentoEquipeRequest;
  historico: HistoricoAtendimentoRequest;
}

interface FichaFormProps {
  initialFicha?: FichaFormState;
  initialAvaliacao?: AvaliacaoFormState;
  initialAcolhimento?: AcolhimentoFormState;
  initialHistorico?: HistoricoFormState;
  status: string;
  onSubmit: (data: FichaFormSubmitData) => void;
  submitting: boolean;
  submitLabel: string;
  cancelHref: string;
}

export function FichaForm({
  initialFicha = emptyFichaForm,
  initialAvaliacao = emptyAvaliacaoForm,
  initialAcolhimento = emptyAcolhimentoForm,
  initialHistorico = emptyHistoricoForm,
  status,
  onSubmit,
  submitting,
  submitLabel,
  cancelHref,
}: FichaFormProps) {
  const [ficha, setFicha] = useState<FichaFormState>(initialFicha);
  const [avaliacao, setAvaliacao] = useState<AvaliacaoFormState>(initialAvaliacao);
  const [acolhimento, setAcolhimento] = useState<AcolhimentoFormState>(initialAcolhimento);
  const [historico, setHistorico] = useState<HistoricoFormState>(initialHistorico);

  const setF = <K extends keyof FichaFormState>(key: K, value: FichaFormState[K]) =>
    setFicha((f) => ({ ...f, [key]: value }));
  const setA = <K extends keyof AvaliacaoFormState>(key: K, value: AvaliacaoFormState[K]) =>
    setAvaliacao((f) => ({ ...f, [key]: value }));
  const setE = <K extends keyof AcolhimentoFormState>(key: K, value: AcolhimentoFormState[K]) =>
    setAcolhimento((f) => ({ ...f, [key]: value }));
  const setH = <K extends keyof HistoricoFormState>(key: K, value: HistoricoFormState[K]) =>
    setHistorico((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ficha: fichaFormToRequest(ficha, status),
      avaliacao: avaliacaoFormToRequest(avaliacao),
      acolhimento: acolhimentoFormToRequest(acolhimento),
      historico: historicoFormToRequest(historico),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-aziz-blue">Parte A – Preenchida pela Mulher</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-foreground mb-4">1. Meus Dados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="nome">Nome</Label><Input id="nome" placeholder="Nome completo" value={ficha.nome} onChange={(e) => setF("nome", e.target.value)} /></div>
              <div><Label htmlFor="cpf">CPF</Label><Input id="cpf" placeholder="000.000.000-00" value={ficha.cpf} onChange={(e) => setF("cpf", e.target.value)} /></div>
              <div><Label htmlFor="idade">Idade</Label><Input id="idade" type="number" placeholder="Idade" value={ficha.idade} onChange={(e) => setF("idade", e.target.value)} /></div>
              <div><Label htmlFor="telefone">Telefone</Label><Input id="telefone" placeholder="(00) 00000-0000" value={ficha.telefone} onChange={(e) => setF("telefone", e.target.value)} /></div>
              <div><Label htmlFor="estado_civil">Estado civil</Label><Input id="estado_civil" placeholder="Estado civil" value={ficha.estadoCivil} onChange={(e) => setF("estadoCivil", e.target.value)} /></div>
              <div><Label htmlFor="dependentes">Pessoas dependentes</Label><Input id="dependentes" type="number" placeholder="Quantidade" value={ficha.pessoasDependentes} onChange={(e) => setF("pessoasDependentes", e.target.value)} /></div>
              <div className="md:col-span-2"><Label htmlFor="idade_filhos">Idade dos filhos/dependentes</Label><Input id="idade_filhos" placeholder="Ex: 3, 7, 12" value={ficha.idadeFilhos} onChange={(e) => setF("idadeFilhos", e.target.value)} /></div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-foreground mb-4">2. Minha Segurança</h3>
            <Label className="mb-3 block">No dia de hoje, de 0 a 5, quanto me sinto segura:</Label>
            <RadioOptionList idPrefix="seg" options={NIVEIS_SEGURANCA} value={ficha.nivelSeguranca} onValueChange={(v) => setF("nivelSeguranca", v)} />
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-foreground mb-4">3. Minha Situação de Vida</h3>
            <Label className="mb-3 block">Atualmente moro em:</Label>
            <div className="mb-4">
              <RadioOptionList idPrefix="moradia" options={TIPOS_MORADIA} value={ficha.tipoMoradia} onValueChange={(v) => setF("tipoMoradia", v)} />
            </div>
            {ficha.tipoMoradia === "OUTRO" && (
              <div className="mb-4">
                <Label htmlFor="moradia_outra">Outro, qual?</Label>
                <Input id="moradia_outra" value={ficha.tipoMoradiaOutraDescricao} onChange={(e) => setF("tipoMoradiaOutraDescricao", e.target.value)} />
              </div>
            )}
            <Label htmlFor="qtd_moradores">Quantidade de pessoas que moram comigo</Label>
            <Input id="qtd_moradores" type="number" className="max-w-[200px]" value={ficha.qtdMoradores} onChange={(e) => setF("qtdMoradores", e.target.value)} />
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-foreground mb-4">4. Sobre meus filhos</h3>
            <div className="space-y-4">
              <div><Label htmlFor="qtd_filhos">Quantidade de filhos</Label><Input id="qtd_filhos" type="number" className="max-w-[200px]" value={ficha.qtdFilhos} onChange={(e) => setF("qtdFilhos", e.target.value)} /></div>
              <Label className="block">Meus filhos moram:</Label>
              <RadioOptionList idPrefix="filhos" options={ONDE_MORAM_FILHOS} value={ficha.ondeMoramFilhos} onValueChange={(v) => setF("ondeMoramFilhos", v)} />
              <Label className="block">Meus filhos precisam de supervisão?</Label>
              <RadioOptionList idPrefix="supervisao" options={SUPERVISAO_FILHOS} value={ficha.supervisaoFilhos} onValueChange={(v) => setF("supervisaoFilhos", v)} />
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-foreground mb-4">5. Minha Renda</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label className="mb-2 block">Tenho renda hoje?</Label><YesNoRadio idPrefix="renda" value={avaliacao.temRenda} onValueChange={(v) => setA("temRenda", v)} /></div>
              <div><Label htmlFor="renda_valor">Quanto ganho mais ou menos?</Label><Input id="renda_valor" type="number" placeholder="R$" value={avaliacao.valorRenda} onChange={(e) => setA("valorRenda", e.target.value)} /></div>
              <div><Label htmlFor="renda_dependentes">Pessoas que dependem da minha renda</Label><Input id="renda_dependentes" type="number" value={avaliacao.pessoasDependemRenda} onChange={(e) => setA("pessoasDependemRenda", e.target.value)} /></div>
              <div><Label htmlFor="renda_origem">De onde vem minha renda?</Label><Input id="renda_origem" value={avaliacao.origemRenda} onChange={(e) => setA("origemRenda", e.target.value)} /></div>
              <div><Label className="mb-2 block">Trabalho formal?</Label><YesNoRadio idPrefix="formal" value={avaliacao.trabalhoFormal} onValueChange={(v) => setA("trabalhoFormal", v)} /></div>
              <div><Label className="mb-2 block">Renda suficiente?</Label><YesNoRadio idPrefix="suficiente" value={avaliacao.rendaSuficiente} onValueChange={(v) => setA("rendaSuficiente", v)} /></div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-foreground mb-4">6. Minha Situação de Trabalho</h3>
            <div className="space-y-4">
              <div><Label className="mb-2 block">Estou trabalhando hoje?</Label><YesNoRadio idPrefix="trab" value={avaliacao.trabalhandoAtualmente} onValueChange={(v) => setA("trabalhandoAtualmente", v)} /></div>
              <div><Label htmlFor="trab_area">Se sim, em que?</Label><Input id="trab_area" value={avaliacao.ondeTrabalha} onChange={(e) => setA("ondeTrabalha", e.target.value)} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label className="mb-2 block">Problema de saúde atrapalha o trabalho?</Label><YesNoRadio idPrefix="prob-saude-trab" value={avaliacao.problemaSaudeAtrapalhaTrabalho} onValueChange={(v) => setA("problemaSaudeAtrapalhaTrabalho", v)} /></div>
                <div><Label htmlFor="prob_saude_qual">Qual?</Label><Input id="prob_saude_qual" value={avaliacao.problemaSaudeQual} onChange={(e) => setA("problemaSaudeQual", e.target.value)} /></div>
                <div><Label className="mb-2 block">Situação familiar atrapalha o trabalho?</Label><YesNoRadio idPrefix="sit-fam-trab" value={avaliacao.situacaoFamiliarAtrapalhaTrabalho} onValueChange={(v) => setA("situacaoFamiliarAtrapalhaTrabalho", v)} /></div>
                <div><Label htmlFor="sit_fam_qual">Qual?</Label><Input id="sit_fam_qual" value={avaliacao.situacaoFamiliarQual} onChange={(e) => setA("situacaoFamiliarQual", e.target.value)} /></div>
              </div>
              <div><Label className="mb-2 block">Gostaria de trabalhar?</Label><YesNoRadio idPrefix="deseja-trab" value={avaliacao.desejaTrabalhar} onValueChange={(v) => setA("desejaTrabalhar", v)} /></div>
              <div>
                <Label className="mb-2 block">Em qual período?</Label>
                <RadioOptionList idPrefix="periodo" options={PERIODOS_TRABALHO} value={avaliacao.periodoDesejado} onValueChange={(v) => setA("periodoDesejado", v)} />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-foreground mb-4">7. Meu Estudo</h3>
            <div className="space-y-4">
              <div><Label className="mb-2 block">Sei ler?</Label><YesNoRadio idPrefix="ler" value={avaliacao.sabeLer} onValueChange={(v) => setA("sabeLer", v)} /></div>
              <div>
                <Label className="mb-2 block">Sei escrever?</Label>
                <RadioOptionList idPrefix="escrita" options={NIVEIS_ESCRITA} value={avaliacao.nivelEscrita} onValueChange={(v) => setA("nivelEscrita", v)} className="flex gap-4" />
              </div>
              <div>
                <Label className="mb-2 block">Estudei até:</Label>
                <RadioOptionList idPrefix="estudo" options={NIVEIS_ESCOLARIDADE} value={avaliacao.nivelEscolaridade} onValueChange={(v) => setA("nivelEscolaridade", v)} />
              </div>
              <div><Label htmlFor="escolaridade_detalhe">Detalhe (ex: série, curso)</Label><Input id="escolaridade_detalhe" value={avaliacao.escolaridadeDetalhe} onChange={(e) => setA("escolaridadeDetalhe", e.target.value)} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label className="mb-2 block">Fez curso profissionalizante?</Label><YesNoRadio idPrefix="curso-prof" value={avaliacao.fezCursoProfissionalizante} onValueChange={(v) => setA("fezCursoProfissionalizante", v)} /></div>
                <div><Label htmlFor="curso_prof_qual">Qual?</Label><Input id="curso_prof_qual" value={avaliacao.cursoProfissionalizanteQual} onChange={(e) => setA("cursoProfissionalizanteQual", e.target.value)} /></div>
                <div><Label className="mb-2 block">Deseja auxílio CEEBJA?</Label><YesNoRadio idPrefix="ceebja" value={avaliacao.desejaAuxilioCeebja} onValueChange={(v) => setA("desejaAuxilioCeebja", v)} /></div>
                <div><Label className="mb-2 block">Deseja curso SENAI?</Label><YesNoRadio idPrefix="senai" value={avaliacao.desejaCursoSenai} onValueChange={(v) => setA("desejaCursoSenai", v)} /></div>
                <div><Label htmlFor="senai_area">Área do curso SENAI</Label><Input id="senai_area" value={avaliacao.areaCursoSenai} onChange={(e) => setA("areaCursoSenai", e.target.value)} /></div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-foreground mb-4">8. Minha Rede de Apoio</h3>
            <div className="space-y-4">
              <div><Label className="mb-2 block">Tenho familiares/amigos de confiança?</Label><YesNoRadio idPrefix="rede" value={avaliacao.temRedeApoio} onValueChange={(v) => setA("temRedeApoio", v)} /></div>
              <div>
                <Label className="mb-2 block">Filhos precisam de vaga em:</Label>
                <CheckboxOptionList idPrefix="vaga" options={VAGAS_NECESSARIAS} value={ficha.vagasNecessarias} onValueChange={(v) => setF("vagasNecessarias", v)} />
              </div>
              <div><Label className="mb-2 block">Preciso de ajuda para moradia?</Label><YesNoRadio idPrefix="ajuda-moradia" value={avaliacao.precisaAjudaMoradia} onValueChange={(v) => setA("precisaAjudaMoradia", v)} /></div>
              <div><Label className="mb-2 block">Tenho o que comer todos os dias?</Label><YesNoRadio idPrefix="comer" value={avaliacao.temOQueComer} onValueChange={(v) => setA("temOQueComer", v)} /></div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-foreground mb-4">9. Minha Saúde</h3>
            <div className="space-y-4">
              <div><Label className="mb-2 block">Realizo acompanhamento médico?</Label><YesNoRadio idPrefix="acomp" value={avaliacao.acompanhamentoMedico} onValueChange={(v) => setA("acompanhamentoMedico", v)} /></div>
              <div><Label className="mb-2 block">Preciso de ajuda para tratamento médico?</Label><YesNoRadio idPrefix="ajuda-trat-medico" value={avaliacao.precisaAjudaTratamentoMedico} onValueChange={(v) => setA("precisaAjudaTratamentoMedico", v)} /></div>
              <div><Label className="mb-2 block">Uso contínuo de medicamento?</Label><YesNoRadio idPrefix="uso-medicamento" value={avaliacao.usoContinuoMedicamento} onValueChange={(v) => setA("usoContinuoMedicamento", v)} /></div>
              <div>
                <Label htmlFor="medicamentos">Medicamentos de uso contínuo</Label>
                <Input id="medicamentos" placeholder="Quais medicamentos?" value={avaliacao.medicamentoQuais} onChange={(e) => setA("medicamentoQuais", e.target.value)} />
              </div>
              <div><Label className="mb-2 block">Tenho acesso aos medicamentos?</Label><YesNoRadio idPrefix="acesso-medicamento" value={avaliacao.acessoMedicamentos} onValueChange={(v) => setA("acessoMedicamentos", v)} /></div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-foreground mb-4">10. Atendimentos que já procurei</h3>
            <div className="space-y-4">
              <div><Label className="mb-2 block">Já procurei serviço de apoio antes?</Label><YesNoRadio idPrefix="apoio" value={historico.jaProcurouServico} onValueChange={(v) => setH("jaProcurouServico", v)} /></div>
              <div><Label htmlFor="apoio_qual">Se sim, qual/onde?</Label><Input id="apoio_qual" value={historico.servicoProcuradoQualOnde} onChange={(e) => setH("servicoProcuradoQualOnde", e.target.value)} /></div>
              <div><Label className="mb-2 block">Está em fila de espera?</Label><YesNoRadio idPrefix="fila-espera" value={historico.emFilaEspera} onValueChange={(v) => setH("emFilaEspera", v)} /></div>
              <div><Label htmlFor="fila_qual">Fila de espera de quê?</Label><Input id="fila_qual" value={historico.filaEsperaQual} onChange={(e) => setH("filaEsperaQual", e.target.value)} /></div>
              <div><Label className="mb-2 block">Já pediu ajuda à justiça/polícia?</Label><YesNoRadio idPrefix="justica-policia" value={historico.jaPediuAjudaJusticaPolicia} onValueChange={(v) => setH("jaPediuAjudaJusticaPolicia", v)} /></div>
              <div><Label htmlFor="justica_qual">Qual?</Label><Input id="justica_qual" value={historico.justicaPoliciaQual} onChange={(e) => setH("justicaPoliciaQual", e.target.value)} /></div>
              <div><Label htmlFor="atendimento_desc">Como foi o atendimento?</Label><Textarea id="atendimento_desc" placeholder="Descreva..." value={historico.comoFoiAtendimento} onChange={(e) => setH("comoFoiAtendimento", e.target.value)} /></div>
              <div><Label className="mb-2 block">Resolveu a situação?</Label><YesNoRadio idPrefix="resolveu" value={historico.resolveuSituacao} onValueChange={(v) => setH("resolveuSituacao", v)} /></div>
              <div><Label htmlFor="reacao_agressor">Reação do agressor</Label><Textarea id="reacao_agressor" value={historico.reacaoAgressor} onChange={(e) => setH("reacaoAgressor", e.target.value)} /></div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-foreground mb-4">11. O que eu preciso agora</h3>
            <div className="space-y-2">
              <CheckboxOptionList idPrefix="preciso" options={NECESSIDADES_IMEDIATAS} value={ficha.necessidadesImediatas} onValueChange={(v) => setF("necessidadesImediatas", v)} />
              <div><Label htmlFor="preciso_outro">Outro</Label><Input id="preciso_outro" value={ficha.necessidadeOutraDescricao} onChange={(e) => setF("necessidadeOutraDescricao", e.target.value)} /></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-aziz-blue">Parte B – Preenchida pela Equipe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-foreground mb-4">1. Registro Processual</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="n_processo">Nº do processo MPU</Label><Input id="n_processo" value={acolhimento.numeroProcessoMpu} onChange={(e) => setE("numeroProcessoMpu", e.target.value)} /></div>
              <div><Label htmlFor="data_acolhimento">Data da reunião de acolhimento</Label><Input id="data_acolhimento" type="date" value={acolhimento.dataReuniaoAcolhimento} onChange={(e) => setE("dataReuniaoAcolhimento", e.target.value)} /></div>
              <div className="md:col-span-2"><Label htmlFor="servidor">Servidor(a) responsável</Label><Input id="servidor" value={acolhimento.servidorResponsavel} onChange={(e) => setE("servidorResponsavel", e.target.value)} /></div>
              <div className="md:col-span-2"><Label htmlFor="resp_juridico">Responsável pelo acolhimento jurídico</Label><Input id="resp_juridico" value={acolhimento.responsavelAcolhimentoJuridico} onChange={(e) => setE("responsavelAcolhimentoJuridico", e.target.value)} /></div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-foreground mb-4">2. Síntese do Caso</h3>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Tipo de violência identificada:</Label>
                <CheckboxOptionList idPrefix="viol" options={TIPOS_VIOLENCIA} value={acolhimento.tiposViolencia} onValueChange={(v) => setE("tiposViolencia", v)} />
              </div>
              {acolhimento.tiposViolencia.includes("OUTRA") && (
                <div><Label htmlFor="viol_outra">Outra, qual?</Label><Input id="viol_outra" value={acolhimento.tipoViolenciaOutraDescricao} onChange={(e) => setE("tipoViolenciaOutraDescricao", e.target.value)} /></div>
              )}
              <div>
                <Label className="mb-2 block">Frequência/Histórico:</Label>
                <RadioOptionList
                  idPrefix="freq"
                  className="flex gap-4"
                  options={[
                    { v: "EPISODIO_UNICO", l: "Episódio único" },
                    { v: "RECORRENTE", l: "Recorrente" },
                  ]}
                  value={acolhimento.frequenciaViolencia}
                  onValueChange={(v) => setE("frequenciaViolencia", v)}
                />
              </div>
              <div><Label className="mb-2 block">Medidas protetivas anteriores?</Label><YesNoRadio idPrefix="medidas-protetivas" value={acolhimento.medidasProtetivasAnteriores} onValueChange={(v) => setE("medidasProtetivasAnteriores", v)} /></div>
              <div><Label htmlFor="ameacas">Ameaças relatadas</Label><Textarea id="ameacas" value={acolhimento.ameacasRelatadas} onChange={(e) => setE("ameacasRelatadas", e.target.value)} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label className="mb-2 block">Necessidade de atendimento médico imediato?</Label><YesNoRadio idPrefix="atend-medico-imediato" value={acolhimento.necessidadeAtendimentoMedicoImediato} onValueChange={(v) => setE("necessidadeAtendimentoMedicoImediato", v)} /></div>
                <div><Label className="mb-2 block">Acompanhamento de saúde mental em curso?</Label><YesNoRadio idPrefix="saude-mental" value={acolhimento.acompanhamentoSaudeMentalEmCurso} onValueChange={(v) => setE("acompanhamentoSaudeMentalEmCurso", v)} /></div>
                <div className="md:col-span-2"><Label htmlFor="saude_mental_local">Local do acompanhamento de saúde mental</Label><Input id="saude_mental_local" value={acolhimento.acompanhamentoSaudeMentalLocal} onChange={(e) => setE("acompanhamentoSaudeMentalLocal", e.target.value)} /></div>
                <div><Label className="mb-2 block">Dependente sofreu violência?</Label><YesNoRadio idPrefix="dependente-violencia" value={acolhimento.dependenteSofreuViolencia} onValueChange={(v) => setE("dependenteSofreuViolencia", v)} /></div>
                <div><Label className="mb-2 block">Dependente precisa de auxílio médico?</Label><YesNoRadio idPrefix="dependente-medico" value={acolhimento.dependentePrecisaAuxilioMedico} onValueChange={(v) => setE("dependentePrecisaAuxilioMedico", v)} /></div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-foreground mb-4">3. Classificação</h3>
            <RadioOptionList idPrefix="cat" options={CATEGORIAS_CLASSIFICACAO} value={acolhimento.categoriaClassificacao} onValueChange={(v) => setE("categoriaClassificacao", v)} className="space-y-3" />
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-foreground mb-4">4. Encaminhamentos sugeridos</h3>
            <CheckboxOptionList
              idPrefix="enc"
              className="space-y-3"
              options={["Serviços de saúde em geral", "Serviço de saúde mental", "Habitação", "Trabalho/emprego", "Assistência social (CRAS/CREAS)", "Assistência educacional"]}
            />
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-foreground mb-4">5. Observações Relevantes</h3>
            <Textarea placeholder="Observações..." className="min-h-[100px]" value={acolhimento.observacoesRelevantes} onChange={(e) => setE("observacoesRelevantes", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Link to={cancelHref}>
          <Button type="button" variant="outline">Cancelar</Button>
        </Link>
        <Button type="submit" disabled={submitting} className="bg-aziz-green hover:bg-aziz-green/90 text-primary-foreground px-8">
          {submitting ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
