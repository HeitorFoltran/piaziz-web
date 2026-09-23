import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { GerarConviteLink } from "@/components/GerarConviteLink";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cancelarConviteFicha, listarConvitesFicha } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { CONVITE_STATUS_BADGE_CLASS, CONVITE_STATUS_LABEL, statusConviteExibido } from "@/lib/status";

export default function Convites() {
  const queryClient = useQueryClient();

  const convitesQuery = useQuery({
    queryKey: ["convites-ficha"],
    queryFn: listarConvitesFicha,
  });

  const cancelar = useMutation({
    mutationFn: cancelarConviteFicha,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["convites-ficha"] });
      toast.success("Link cancelado.");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const convites = [...(convitesQuery.data ?? [])].sort((a, b) => b.dataCriacao.localeCompare(a.dataCriacao));

  return (
    <Layout>
      <div className="container max-w-3xl py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Links de preenchimento de ficha</h1>
          <p className="text-sm text-muted-foreground">
            Gere um link de uso único para a pessoa atendida preencher os dados iniciais. O envio vai
            para a fila de revisão da equipe.
          </p>
        </div>

        <Card>
          <CardContent className="p-4">
            <GerarConviteLink />
          </CardContent>
        </Card>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Links gerados por você</h2>

          {convitesQuery.isLoading && <Skeleton className="h-16 w-full" />}
          {convitesQuery.isError && (
            <Card className="border-destructive/40">
              <CardContent className="p-4 text-sm text-destructive">
                Erro ao carregar links: {(convitesQuery.error as Error).message}
              </CardContent>
            </Card>
          )}
          {convitesQuery.isSuccess && convites.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum link gerado ainda.</p>
          )}

          {convites.map((c) => {
            const status = statusConviteExibido(c);
            return (
              <Card key={c.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Link #{c.id}</p>
                    <p className="text-muted-foreground">
                      Criado em {formatDate(c.dataCriacao)} ·{" "}
                      {c.usadoEm ? `usado em ${formatDate(c.usadoEm)}` : `expira em ${formatDate(c.dataExpiracao)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={CONVITE_STATUS_BADGE_CLASS[status]}>{CONVITE_STATUS_LABEL[status]}</Badge>
                    {status === "ATIVO" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={cancelar.isPending && cancelar.variables === c.id}
                        onClick={() => cancelar.mutate(c.id)}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
