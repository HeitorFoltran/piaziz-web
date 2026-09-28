import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { GerarConviteLink } from "@/components/GerarConviteLink";
import { LinkConvite } from "@/components/LinkConvite";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cancelarConviteFicha, listarConvitesFicha } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { CONVITE_STATUS_BADGE_CLASS, CONVITE_STATUS_LABEL, statusConviteExibido } from "@/lib/status";
import type { StatusConvite } from "@/types/api";

// Por que o link não aparece. ATIVO sem link é convite criado antes do token passar a ser
// guardado cifrado: só existe o hash, então não tem como remontar o link.
const MOTIVO_SEM_LINK: Record<StatusConvite, string> = {
  ATIVO: "Link gerado antes da atualização, não pode ser exibido",
  USADO: "Link já utilizado",
  EXPIRADO: "Link expirado",
  CANCELADO: "Link cancelado",
};

export default function Convites() {
  const queryClient = useQueryClient();
  const { auth } = useAuth();

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
          <h2 className="text-sm font-semibold text-foreground">Links gerados pela equipe</h2>

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
            const geradoPorMim = c.criadoPorId === auth?.id;
            // Cancelar é só de quem gerou ou DEV (a API devolve 403 para os outros).
            const podeCancelar = status === "ATIVO" && (geradoPorMim || auth?.role === "DEV");
            return (
              <Card key={c.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground">
                      Gerado por {geradoPorMim ? "você" : (c.criadoPorNome ?? "-")} · em {formatDate(c.dataCriacao)} ·{" "}
                      {c.usadoEm ? `usado em ${formatDate(c.usadoEm)}` : `expira em ${formatDate(c.dataExpiracao)}`}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={CONVITE_STATUS_BADGE_CLASS[status]}>{CONVITE_STATUS_LABEL[status]}</Badge>
                      {podeCancelar && (
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
                  </div>
                  {c.linkCompleto && status === "ATIVO" ? (
                    <LinkConvite link={c.linkCompleto} dataExpiracao={c.dataExpiracao} />
                  ) : (
                    <p className="text-sm text-muted-foreground">{MOTIVO_SEM_LINK[status]}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
