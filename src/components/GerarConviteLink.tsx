import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LinkConvite } from "@/components/LinkConvite";
import { criarConviteFicha } from "@/lib/api";

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
        {gerar.isPending ? "Gerando..." : "Gerar link de preenchimento"}
      </Button>
    );
  }

  return <LinkConvite link={convite.linkCompleto} dataExpiracao={convite.dataExpiracao} avisoLista />;
}
