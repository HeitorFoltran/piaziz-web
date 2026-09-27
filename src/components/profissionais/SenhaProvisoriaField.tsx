import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { gerarSenhaProvisoria } from "@/lib/conta";

// A senha só existe no estado do dialog que usa este campo, e some quando ele fecha.
// Nunca logar, pôr na URL ou em storage (ver security.md).
export function SenhaProvisoriaField({
  id,
  value,
  onChange,
  erro,
}: {
  id: string;
  value: string;
  onChange: (valor: string) => void;
  erro?: string;
}) {
  const copiar = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Senha copiada.");
    } catch {
      toast.error("Não foi possível copiar. Selecione e copie a senha manualmente.");
    }
  };

  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block">Senha provisória *</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type="text"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          className="font-mono"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Button type="button" variant="outline" onClick={() => onChange(gerarSenhaProvisoria())}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Gerar
        </Button>
        <Button type="button" variant="outline" onClick={copiar} disabled={!value} title="Copiar senha" aria-label="Copiar senha">
          <Copy className="w-4 h-4" />
        </Button>
      </div>
      {erro && <p className="mt-1 text-xs text-destructive">{erro}</p>}
      <p className="mt-1 text-xs text-muted-foreground">
        Entregue essa senha pessoalmente. A pessoa vai trocá-la no primeiro acesso.
      </p>
    </div>
  );
}
