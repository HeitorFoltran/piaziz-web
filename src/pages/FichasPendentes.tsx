import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { aprovarFichaPendente, listarFichasPendentes, rejeitarFichaPendente } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { FICHA_PENDENTE_STATUS_LABEL } from "@/lib/status";
import { cn } from "@/lib/utils";
import { FichaFormParteA } from "@/components/ficha/FichaFormParteA";
import { avaliacaoToFormState, fichaToFormState, historicoToFormState } from "@/components/ficha/ficha-form-state";
import type { FichaPendente, StatusFichaPendente } from "@/types/api";

const filtros: StatusFichaPendente[] = ["PENDENTE", "APROVADA", "REJEITADA"];

export default function FichasPendentes() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<StatusFichaPendente>("PENDENTE");
  const [revisando, setRevisando] = useState<FichaPendente | null>(null);
  const [rejeitando, setRejeitando] = useState<FichaPendente | null>(null);
  const [motivo, setMotivo] = useState("");

  const pendentesQuery = useQuery({
    queryKey: ["fichas-pendentes", filtro],
    queryFn: () => listarFichasPendentes(filtro),
  });

  const aprovar = useMutation({
    mutationFn: aprovarFichaPendente,
    onSuccess: (revisada) => {
      setRevisando(null);
      queryClient.invalidateQueries({ queryKey: ["fichas-pendentes"] });
      queryClient.invalidateQueries({ queryKey: ["fichas"] });
      toast.success("Ficha aprovada. Complete o restante do PIA.");
      if (revisada.fichaId) navigate(`/acompanhamentos/${revisada.fichaId}/editar`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const rejeitar = useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) => rejeitarFichaPendente(id, motivo.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fichas-pendentes"] });
      toast.success("Ficha rejeitada.");
      fecharRejeicao();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function fecharRejeicao() {
    setRejeitando(null);
    setMotivo("");
  }

  const fichas = pendentesQuery.data ?? [];
  const ocupado = aprovar.isPending || rejeitar.isPending;

  function abrirRejeicao(f: FichaPendente) {
    setRevisando(null);
    setRejeitando(f);
  }

  return (
    <Layout>
      <div className="container max-w-4xl py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fichas pendentes</h1>
          <p className="text-sm text-muted-foreground">
            Envios recebidos pelo link de preenchimento.
          </p>
        </div>

        <div className="flex gap-1 border-b border-border">
          {filtros.map((s) => (
            <button
              key={s}
              onClick={() => setFiltro(s)}
              className={cn(
                "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                filtro === s
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {FICHA_PENDENTE_STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        {pendentesQuery.isLoading && <Skeleton className="h-24 w-full" />}
        {pendentesQuery.isError && (
          <Card className="border-destructive/40">
            <CardContent className="p-4 text-sm text-destructive">
              Erro ao carregar fichas: {(pendentesQuery.error as Error).message}
            </CardContent>
          </Card>
        )}
        {pendentesQuery.isSuccess && fichas.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhuma ficha {FICHA_PENDENTE_STATUS_LABEL[filtro].toLowerCase()}.
          </p>
        )}

        <div className="space-y-3">
          {fichas.map((f) => (
            <Card key={f.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">{f.nome}</p>
                    <p className="text-muted-foreground">
                      CPF {f.cpf}
                      {f.idade != null && ` · ${f.idade} anos`}
                      {f.telefone && ` · ${f.telefone}`}
                    </p>
                    <p className="text-xs text-muted-foreground">Enviada em {formatDate(f.dataSubmissao)}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Button size="sm" variant={f.status === "PENDENTE" ? "default" : "outline"} onClick={() => setRevisando(f)}>
                      {f.status === "PENDENTE" ? "Revisar" : "Ver envio"}
                    </Button>
                    {f.status === "APROVADA" && f.fichaId && (
                      <Link to={`/acompanhamentos/${f.fichaId}`} className="text-sm font-medium text-primary hover:underline">
                        Ver acompanhamento
                      </Link>
                    )}
                  </div>
                </div>

                {f.situacaoRelatada && (
                  <p className="line-clamp-3 whitespace-pre-wrap rounded-md bg-muted p-3 text-sm text-foreground">
                    {f.situacaoRelatada}
                  </p>
                )}
                {f.status === "REJEITADA" && (
                  <p className="text-xs text-muted-foreground">
                    Rejeitada em {formatDate(f.dataRevisao)}
                    {f.motivoRejeicao && ` — ${f.motivoRejeicao}`}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={revisando !== null} onOpenChange={(open) => !open && setRevisando(null)}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Envio de {revisando?.nome}</DialogTitle>
            </DialogHeader>
            {revisando && (
              <div className="space-y-4">
                <FichaFormParteA
                  readOnly
                  ficha={{
                    ...fichaToFormState(revisando.ficha ?? {}),
                    // fichaToFormState assume "0" quando vem vazio; aqui isso pareceria resposta dela.
                    nivelSeguranca: revisando.ficha?.nivelSeguranca != null ? String(revisando.ficha.nivelSeguranca) : "",
                  }}
                  avaliacao={avaliacaoToFormState(revisando.avaliacao)}
                  historico={historicoToFormState(revisando.historico)}
                />
                {revisando.situacaoRelatada && (
                  <div>
                    <p className="mb-1 text-sm font-semibold text-foreground">Relato com as próprias palavras</p>
                    <p className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm text-foreground">
                      {revisando.situacaoRelatada}
                    </p>
                  </div>
                )}
              </div>
            )}
            {revisando?.status === "PENDENTE" && (
              <DialogFooter>
                <Button variant="outline" disabled={ocupado} onClick={() => abrirRejeicao(revisando)}>
                  Rejeitar
                </Button>
                <Button disabled={ocupado} onClick={() => aprovar.mutate(revisando.id)}>
                  {aprovar.isPending ? "Aprovando..." : "Aprovar e criar ficha"}
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={rejeitando !== null} onOpenChange={(open) => !open && fecharRejeicao()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Rejeitar ficha de {rejeitando?.nome}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo (opcional)</Label>
              <Textarea
                id="motivo"
                maxLength={300}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={fecharRejeicao}>
                Voltar
              </Button>
              <Button
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={rejeitar.isPending}
                onClick={() => rejeitando && rejeitar.mutate({ id: rejeitando.id, motivo })}
              >
                Rejeitar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
