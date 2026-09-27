import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SenhaProvisoriaField } from "@/components/profissionais/SenhaProvisoriaField";
import { mensagemDeErro, resetarSenhaProfissional } from "@/lib/api";
import { validarSenha } from "@/lib/conta";
import type { Profissional } from "@/types/api";

export function ResetarSenhaDialog({
  profissional,
  onClose,
}: {
  profissional: Profissional | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={profissional !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {/* O conteúdo desmonta ao fechar, e a senha digitada vai junto. */}
        {profissional && <FormularioReset profissional={profissional} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function FormularioReset({ profissional, onClose }: { profissional: Profissional; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | undefined>();

  const mutation = useMutation({
    mutationFn: (senhaProvisoria: string) => resetarSenhaProfissional(profissional.id, senhaProvisoria),
    // As variables (a senha) não ficam no cache de mutations depois que o dialog fecha.
    gcTime: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profissionais"] });
      toast.success("Senha resetada.");
      onClose();
    },
    onError: (err) => toast.error(mensagemDeErro(err)),
  });

  const confirmar = () => {
    const erroSenha = validarSenha(senha) ?? undefined;
    setErro(erroSenha);
    if (!erroSenha) mutation.mutate(senha);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Resetar senha</DialogTitle>
        <DialogDescription>
          {profissional.nome} (@{profissional.username})
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <SenhaProvisoriaField id="reset-senha" value={senha} onChange={setSenha} erro={erro} />
        <p className="rounded-md bg-muted p-3 text-sm text-foreground">
          A pessoa será desconectada e terá que trocar a senha no próximo acesso.
        </p>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          onClick={confirmar}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Resetando..." : "Resetar senha"}
        </Button>
      </DialogFooter>
    </>
  );
}
