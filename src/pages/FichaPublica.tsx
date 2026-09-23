import { useState, type FormEvent, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { FichaFormParteA } from "@/components/ficha/FichaFormParteA";
import {
  type AvaliacaoFormState,
  type FichaFormState,
  type HistoricoFormState,
  avaliacaoFormToRequest,
  emptyAvaliacaoForm,
  emptyFichaForm,
  emptyHistoricoForm,
  fichaFormToRequest,
  historicoFormToRequest,
} from "@/components/ficha/ficha-form-state";
import { getFichaPublicaStatus, submitFichaPublica } from "@/lib/api";
import { formatarCpfDigitado, isCpfValido } from "@/lib/cpf";
import { cn } from "@/lib/utils";
import type { FichaPublicaStatus } from "@/types/api";

// Página aberta por quem recebeu o link de preenchimento, sem conta no sistema. Não usa Layout
// (nav/menu do app autenticado) nem toast — tudo que aparece aqui é só desta página.

const MENSAGEM_LINK_INVALIDO: Record<NonNullable<FichaPublicaStatus["motivo"]>, string> = {
  expirado: "Este link expirou. Se ainda precisar de atendimento, peça um novo link a quem enviou este.",
  usado: "Este link já foi utilizado. Suas informações já foram recebidas pela equipe.",
  invalido: "Este link não é válido. Confira se ele foi copiado por inteiro.",
};

// `largo` é pro formulário, que já vem dentro do próprio Card da Parte A.
function Moldura({ children, largo = false }: { children: ReactNode; largo?: boolean }) {
  return (
    <div className="min-h-screen bg-muted px-4 py-10">
      <div className={cn("mx-auto", largo ? "max-w-3xl" : "max-w-lg")}>
        <div className="mb-6 flex items-center justify-center gap-1">
          <span className="font-logo text-2xl font-black tracking-tight text-primary">AZIZ</span>
          <span className="text-xs font-medium text-muted-foreground">defensoria</span>
        </div>
        {largo ? children : <div className="rounded-lg border border-border bg-card p-6 shadow-sm">{children}</div>}
      </div>
    </div>
  );
}

// Nível de segurança sem valor inicial aqui (no formulário interno o default é "0"):
// quem preenche sozinha não pode ter "não me sinto segura de forma alguma" marcado
// por ela sem ter respondido.
const fichaVazia: FichaFormState = { ...emptyFichaForm, nivelSeguranca: "" };

export default function FichaPublica() {
  const { token = "" } = useParams();
  const [ficha, setFicha] = useState<FichaFormState>(fichaVazia);
  const [avaliacao, setAvaliacao] = useState<AvaliacaoFormState>(emptyAvaliacaoForm);
  const [historico, setHistorico] = useState<HistoricoFormState>(emptyHistoricoForm);
  const [situacaoRelatada, setSituacaoRelatada] = useState("");
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);

  const statusQuery = useQuery({
    queryKey: ["ficha-publica-status", token],
    queryFn: () => getFichaPublicaStatus(token),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const envio = useMutation({
    mutationFn: () => {
      return submitFichaPublica(token, {
        // numeroCaso/status são da equipe — ficam fora do payload (o backend zera de qualquer jeito).
        ficha: { ...fichaFormToRequest(ficha, ""), numeroCaso: undefined, status: undefined },
        avaliacao: avaliacaoFormToRequest(avaliacao),
        historico: historicoFormToRequest(historico),
        situacaoRelatada: situacaoRelatada.trim() || undefined,
      });
    },
  });

  const setF = <K extends keyof FichaFormState>(key: K, value: FichaFormState[K]) =>
    setFicha((f) => ({ ...f, [key]: key === "cpf" ? formatarCpfDigitado(value as string) : value }));
  const setA = <K extends keyof AvaliacaoFormState>(key: K, value: AvaliacaoFormState[K]) =>
    setAvaliacao((f) => ({ ...f, [key]: value }));
  const setH = <K extends keyof HistoricoFormState>(key: K, value: HistoricoFormState[K]) =>
    setHistorico((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!ficha.nome.trim()) return setErroValidacao("Informe seu nome.");
    if (!isCpfValido(ficha.cpf)) return setErroValidacao("Confira o CPF informado.");
    const idade = ficha.idade ? Number(ficha.idade) : null;
    if (idade !== null && (!Number.isInteger(idade) || idade < 0 || idade > 120)) {
      return setErroValidacao("Confira a idade informada.");
    }
    setErroValidacao(null);
    envio.mutate();
  };

  if (statusQuery.isLoading) {
    return (
      <Moldura>
        <Skeleton className="mb-3 h-6 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </Moldura>
    );
  }

  if (statusQuery.isError) {
    return (
      <Moldura>
        <p className="text-sm text-muted-foreground">
          Não foi possível carregar esta página agora. Tente novamente em alguns instantes.
        </p>
      </Moldura>
    );
  }

  const status = statusQuery.data;
  if (!status?.valido) {
    return (
      <Moldura>
        <h1 className="mb-2 text-lg font-semibold text-foreground">Link indisponível</h1>
        <p className="text-sm text-muted-foreground">
          {MENSAGEM_LINK_INVALIDO[status?.motivo ?? "invalido"]}
        </p>
      </Moldura>
    );
  }

  if (envio.isSuccess) {
    return (
      <Moldura>
        <h1 className="mb-2 text-lg font-semibold text-foreground">Recebemos suas informações</h1>
        <p className="text-sm text-muted-foreground">
          Alguém da nossa equipe vai entrar em contato em breve. Você já pode fechar esta página.
        </p>
      </Moldura>
    );
  }

  return (
    <Moldura largo>
      <h1 className="mb-1 text-center text-xl font-semibold text-foreground">Solicitar atendimento</h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Só nome e CPF são obrigatórios — responda o que se sentir à vontade. Só a equipe de
        atendimento terá acesso a essas informações.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <FichaFormParteA ficha={ficha} avaliacao={avaliacao} historico={historico} setF={setF} setA={setA} setH={setH}>
          <Separator />
          <div>
            <Label htmlFor="situacaoRelatada" className="font-semibold text-foreground">
              Se quiser, conte com suas palavras o que está acontecendo
            </Label>
            <Textarea
              id="situacaoRelatada"
              rows={5}
              maxLength={2000}
              className="mt-2"
              value={situacaoRelatada}
              onChange={(e) => setSituacaoRelatada(e.target.value)}
            />
          </div>
        </FichaFormParteA>

        {(erroValidacao || envio.isError) && (
          <p role="alert" className="text-sm text-destructive">
            {erroValidacao ?? "Não foi possível enviar agora. Tente novamente em alguns instantes."}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={envio.isPending}>
          {envio.isPending ? "Enviando..." : "Enviar"}
        </Button>
      </form>
    </Moldura>
  );
}
