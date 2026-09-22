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
import type { FichaPendente, StatusFichaPendente } from "@/types/api";

const filtros: StatusFichaPendente[] = ["PENDENTE", "APROVADA", "REJEITADA"];

export default function FichasPendentes() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState<StatusFichaPendente>("PENDENTE");
  const [rejeitando, setRejeitando] = useState<FichaPendente | null>(null);
  const [motivo, setMotivo] = useState("");

  const pendentesQuery = useQuery({
    queryKey: ["fichas-pendentes", filtro],
    queryFn: () => listarFichasPendentes(filtro),
  });

  const aprovar = useMutation({
    mutationFn: aprovarFichaPendente,
    onSuccess: (revisada) => {
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
  const revisando = aprovar.isPending || rejeitar.isPending;

  return (
    <Layout>
      <div className="container max-w-4xl py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fichas pendentes</h1>
          <p className="text-sm text-muted-foreground">
            Envios recebidos pelo link de convite. Aprovar cria a ficha de acompanhamento; o restante do
            PIA é completado depois.
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

                  {f.status === "PENDENTE" && (
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" disabled={revisando} onClick={() => setRejeitando(f)}>
                        Rejeitar
                      </Button>
                      <Button size="sm" disabled={revisando} onClick={() => aprovar.mutate(f.id)}>
                        Aprovar
                      </Button>
                    </div>
                  )}
                  {f.status === "APROVADA" && f.fichaId && (
                    <Link
                      to={`/acompanhamentos/${f.fichaId}`}
                      className="text-sm font-medium text-primary hover:underline shrink-0"
                    >
                      Ver acompanhamento
                    </Link>
                  )}
                </div>

                {f.situacaoRelatada && (
                  <p className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm text-foreground">
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
