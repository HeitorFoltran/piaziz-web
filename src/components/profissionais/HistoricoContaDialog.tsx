import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getHistoricoConta, mensagemDeErro } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { AcaoConta, Profissional } from "@/types/api";

const ACAO_LABEL: Record<AcaoConta, string> = {
  CRIAR: "Conta criada",
  EDITAR: "Dados alterados",
  RESETAR_SENHA: "Senha resetada",
  TROCAR_PROPRIA_SENHA: "Senha trocada pela própria pessoa",
};

export function HistoricoContaDialog({
  profissional,
  onClose,
}: {
  profissional: Profissional | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={profissional !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {/* Montado só enquanto aberto: a busca acontece ao abrir, não para cada linha da lista. */}
        {profissional && <ListaHistorico profissional={profissional} />}
      </DialogContent>
    </Dialog>
  );
}

function ListaHistorico({ profissional }: { profissional: Profissional }) {
  const historicoQuery = useQuery({
    queryKey: ["profissional-historico", profissional.id],
    queryFn: () => getHistoricoConta(profissional.id),
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Histórico da conta</DialogTitle>
        <DialogDescription>
          {profissional.nome} (@{profissional.username})
        </DialogDescription>
      </DialogHeader>
      <div className="max-h-[60vh] space-y-3 overflow-y-auto text-sm">
        {historicoQuery.isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        {historicoQuery.isError && (
          <p className="text-destructive">Erro ao carregar o histórico: {mensagemDeErro(historicoQuery.error)}</p>
        )}
        {historicoQuery.data?.length === 0 && (
          <p className="text-muted-foreground">Nenhuma ação registrada para esta conta.</p>
        )}
        {historicoQuery.data?.map((h) => (
          <div key={h.id}>
            <div className="flex items-center justify-between gap-4">
              <span>
                <span className="font-medium">{ACAO_LABEL[h.acao] ?? h.acao}</span>{" "}
                {h.autorNome ? `por ${h.autorNome}` : "por um usuário removido"}
              </span>
              <span className="text-xs text-muted-foreground shrink-0">{formatDateTime(h.timestamp)}</span>
            </div>
            {h.detalhe && <p className="text-xs text-muted-foreground">{h.detalhe}</p>}
          </div>
        ))}
      </div>
    </>
  );
}
