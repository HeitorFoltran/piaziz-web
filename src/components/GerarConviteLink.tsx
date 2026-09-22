import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { criarConviteFicha } from "@/lib/api";
import { formatDate } from "@/lib/format";

// O link só existe na resposta da criação (o backend guarda apenas o hash do token),
// então ele é mostrado uma vez aqui e não dá pra recuperar depois pela listagem.
export function GerarConviteLink() {
  const queryClient = useQueryClient();
  const gerar = useMutation({
    mutationFn: criarConviteFicha,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["convites-ficha"] }),
    onError: (err: Error) => toast.error(err.message),
  });

  const convite = gerar.data;

  if (!convite?.linkCompleto) {
    return (
      <Button onClick={() => gerar.mutate()} disabled={gerar.isPending} variant="outline" className="w-full">
        <Link2 className="w-4 h-4 mr-2" />
        {gerar.isPending ? "Gerando..." : "Gerar link de convite"}
      </Button>
    );
  }

  const link = convite.linkCompleto;
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copiado!");
    } catch {
      toast.error("Não foi possível copiar. Selecione o link e copie manualmente.");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={link} readOnly className="text-xs" onFocus={(e) => e.target.select()} />
        <Button variant="outline" size="icon" onClick={copiar} aria-label="Copiar link">
          <Copy className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Vale para um único envio, até {formatDate(convite.dataExpiracao)}. Copie agora — este link não
        pode ser exibido de novo.
      </p>
    </div>
  );
}
