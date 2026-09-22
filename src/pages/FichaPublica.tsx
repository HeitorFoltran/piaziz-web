import { useState, type FormEvent, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getFichaPublicaStatus, submitFichaPublica } from "@/lib/api";
import { formatarCpfDigitado, isCpfValido } from "@/lib/cpf";
import type { FichaPublicaStatus } from "@/types/api";

// Página aberta por quem recebeu o convite, sem conta no sistema. Não usa Layout
// (nav/menu do app autenticado) nem toast — tudo que aparece aqui é só desta página.

const MENSAGEM_LINK_INVALIDO: Record<NonNullable<FichaPublicaStatus["motivo"]>, string> = {
  expirado: "Este link expirou. Se ainda precisar de atendimento, peça um novo link a quem enviou este.",
  usado: "Este link já foi utilizado. Suas informações já foram recebidas pela equipe.",
  invalido: "Este link não é válido. Confira se ele foi copiado por inteiro.",
};

function Moldura({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted px-4 py-10">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center justify-center gap-1">
          <span className="font-logo text-2xl font-black tracking-tight text-primary">AZIZ</span>
          <span className="text-xs font-medium text-muted-foreground">defensoria</span>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">{children}</div>
      </div>
    </div>
  );
}

const formVazio = { nome: "", cpf: "", telefone: "", idade: "", situacaoRelatada: "" };

export default function FichaPublica() {
  const { token = "" } = useParams();
  const [form, setForm] = useState(formVazio);
  const [erroValidacao, setErroValidacao] = useState<string | null>(null);

  const statusQuery = useQuery({
    queryKey: ["ficha-publica-status", token],
    queryFn: () => getFichaPublicaStatus(token),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const envio = useMutation({
    mutationFn: () =>
      submitFichaPublica(token, {
        nome: form.nome.trim(),
        cpf: form.cpf,
        telefone: form.telefone.trim() || undefined,
        idade: form.idade ? Number(form.idade) : undefined,
        situacaoRelatada: form.situacaoRelatada.trim() || undefined,
      }),
  });

  const set = (campo: keyof typeof formVazio) => (valor: string) =>
    setForm((f) => ({ ...f, [campo]: valor }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) return setErroValidacao("Informe seu nome.");
    if (!isCpfValido(form.cpf)) return setErroValidacao("Confira o CPF informado.");
    const idade = form.idade ? Number(form.idade) : null;
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
    <Moldura>
      <h1 className="mb-1 text-lg font-semibold text-foreground">Solicitar atendimento</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Preencha os dados abaixo. Só a equipe de atendimento terá acesso a essas informações.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="nome">Nome *</Label>
          <Input id="nome" maxLength={150} value={form.nome} onChange={(e) => set("nome")(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="cpf">CPF *</Label>
          <Input
            id="cpf"
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={form.cpf}
            onChange={(e) => set("cpf")(formatarCpfDigitado(e.target.value))}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              type="tel"
              maxLength={20}
              value={form.telefone}
              onChange={(e) => set("telefone")(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="idade">Idade</Label>
            <Input
              id="idade"
              type="number"
              min={0}
              max={120}
              value={form.idade}
              onChange={(e) => set("idade")(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="situacaoRelatada">Conte, se quiser, o que está acontecendo</Label>
          <Textarea
            id="situacaoRelatada"
            rows={5}
            maxLength={2000}
            value={form.situacaoRelatada}
            onChange={(e) => set("situacaoRelatada")(e.target.value)}
          />
        </div>

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
