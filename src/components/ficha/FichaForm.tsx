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
import { FichaFormParteA } from "@/components/ficha/FichaFormParteA";
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

const TIPOS_VIOLENCIA = [
  { v: "FISICA", l: "Física" },
  { v: "PSICOLOGICA", l: "Psicológica" },
  { v: "MORAL", l: "Moral" },
  { v: "PATRIMONIAL", l: "Patrimonial" },
  { v: "OUTRA", l: "Outra" },
];

const CATEGORIAS_CLASSIFICACAO = [
  { v: "CATEGORIA_1", l: "Categoria 1 - Mulheres com trabalho adequado: apenas informações necessárias." },
  {
    v: "CATEGORIA_2",
    l: "Categoria 2 - Mulheres sem trabalho adequado, mas com condições de trabalhar: informações + encaminhamento para rede de trabalho + encaminhamento à assistência social.",
  },
  {
    v: "CATEGORIA_3",
    l: "Categoria 3 - Mulheres sem trabalho adequado e sem condições de trabalhar: informações + encaminhamento prioritário à assistência social.",
  },
  { v: "CATEGORIA_4", l: "Categoria 4 - Mulheres vítimas de crimes sexuais" },
];

// Chaves de AcolhimentoFormState cujo valor é string (todas menos tiposViolencia).
type CampoTexto = { [K in keyof AcolhimentoFormState]: AcolhimentoFormState[K] extends string ? K : never }[keyof AcolhimentoFormState];

const ENCAMINHAMENTOS_SUGERIDOS: { label: string; campo: CampoTexto; campoQual: CampoTexto }[] = [
  { label: "Serviços de saúde em geral", campo: "sugereSaudeGeral", campoQual: "sugereSaudeGeralQual" },
  { label: "Serviço de saúde mental", campo: "sugereSaudeMental", campoQual: "sugereSaudeMentalQual" },
  { label: "Habitação", campo: "sugereHabitacao", campoQual: "sugereHabitacaoQual" },
  { label: "Trabalho/emprego", campo: "sugereTrabalhoEmprego", campoQual: "sugereTrabalhoEmpregoQual" },
  { label: "Assistência social (CRAS/CREAS)", campo: "sugereAssistenciaSocial", campoQual: "sugereAssistenciaSocialQual" },
  { label: "Assistência educacional", campo: "sugereAssistenciaEducacional", campoQual: "sugereAssistenciaEducacionalQual" },
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
      <FichaFormParteA ficha={ficha} avaliacao={avaliacao} historico={historico} setF={setF} setA={setA} setH={setH} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-aziz-blue">Parte B - Preenchida pela Equipe (após acolhimento)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-foreground mb-4">1. Registro Processual</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label htmlFor="n_processo">Nº do processo MPU</Label><Input id="n_processo" maxLength={40} value={acolhimento.numeroProcessoMpu} onChange={(e) => setE("numeroProcessoMpu", e.target.value)} /></div>
              <div><Label htmlFor="data_acolhimento">Data da reunião de acolhimento</Label><Input id="data_acolhimento" type="date" value={acolhimento.dataReuniaoAcolhimento} onChange={(e) => setE("dataReuniaoAcolhimento", e.target.value)} /></div>
              <div className="md:col-span-2"><Label htmlFor="servidor">Servidor(a) responsável</Label><Input id="servidor" maxLength={150} value={acolhimento.servidorResponsavel} onChange={(e) => setE("servidorResponsavel", e.target.value)} /></div>
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
                <div><Label htmlFor="viol_outra">Outra, qual?</Label><Input id="viol_outra" maxLength={200} value={acolhimento.tipoViolenciaOutraDescricao} onChange={(e) => setE("tipoViolenciaOutraDescricao", e.target.value)} /></div>
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
              <div><Label htmlFor="ameacas">Ameaças relatadas</Label><Textarea id="ameacas" maxLength={1000} value={acolhimento.ameacasRelatadas} onChange={(e) => setE("ameacasRelatadas", e.target.value)} /></div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-foreground mb-4">3. Situação de Saúde</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label className="mb-2 block">Necessidade de atendimento médico imediato?</Label><YesNoRadio idPrefix="atend-medico-imediato" value={acolhimento.necessidadeAtendimentoMedicoImediato} onValueChange={(v) => setE("necessidadeAtendimentoMedicoImediato", v)} /></div>
              <div><Label className="mb-2 block">Acompanhamento de saúde mental em curso?</Label><YesNoRadio idPrefix="saude-mental" value={acolhimento.acompanhamentoSaudeMentalEmCurso} onValueChange={(v) => setE("acompanhamentoSaudeMentalEmCurso", v)} /></div>
              <div className="md:col-span-2"><Label htmlFor="saude_mental_local">Local do acompanhamento de saúde mental</Label><Input id="saude_mental_local" maxLength={150} value={acolhimento.acompanhamentoSaudeMentalLocal} onChange={(e) => setE("acompanhamentoSaudeMentalLocal", e.target.value)} /></div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-foreground mb-4">4. Filhos/Dependentes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label className="mb-2 block">Algum dependente também sofreu violência?</Label><YesNoRadio idPrefix="dependente-violencia" value={acolhimento.dependenteSofreuViolencia} onValueChange={(v) => setE("dependenteSofreuViolencia", v)} /></div>
              <div><Label className="mb-2 block">Algum dependente precisa de auxílio médico?</Label><YesNoRadio idPrefix="dependente-medico" value={acolhimento.dependentePrecisaAuxilioMedico} onValueChange={(v) => setE("dependentePrecisaAuxilioMedico", v)} /></div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-foreground mb-4">5. Classificação</h3>
            <RadioOptionList idPrefix="cat" options={CATEGORIAS_CLASSIFICACAO} value={acolhimento.categoriaClassificacao} onValueChange={(v) => setE("categoriaClassificacao", v)} className="space-y-3" />
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-foreground mb-4">6. Encaminhamentos sugeridos</h3>
            <div className="space-y-4">
              {ENCAMINHAMENTOS_SUGERIDOS.map(({ label, campo, campoQual }) => (
                <div key={campo} className="space-y-2">
                  <Label className="block">{label}</Label>
                  <YesNoRadio idPrefix={campo} value={acolhimento[campo]} onValueChange={(v) => setE(campo, v)} />
                  {(acolhimento[campo] === "sim" || acolhimento[campoQual]) && (
                    <div><Label htmlFor={campoQual}>Qual?</Label><Input id={campoQual} maxLength={200} value={acolhimento[campoQual]} onChange={(e) => setE(campoQual, e.target.value)} /></div>
                  )}
                </div>
              ))}
              <div><Label htmlFor="sugere_outro">Outro encaminhamento</Label><Input id="sugere_outro" maxLength={300} value={acolhimento.sugereOutro} onChange={(e) => setE("sugereOutro", e.target.value)} /></div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-foreground mb-4">7. Observações Relevantes</h3>
            <Textarea placeholder="Observações..." maxLength={2000} className="min-h-[100px]" value={acolhimento.observacoesRelevantes} onChange={(e) => setE("observacoesRelevantes", e.target.value)} />
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold text-foreground mb-4">8. Responsável pelo acolhimento jurídico</h3>
            <Label htmlFor="resp_juridico">Nome do responsável pelo acolhimento jurídico</Label>
            <Input id="resp_juridico" maxLength={150} value={acolhimento.responsavelAcolhimentoJuridico} onChange={(e) => setE("responsavelAcolhimentoJuridico", e.target.value)} />
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
