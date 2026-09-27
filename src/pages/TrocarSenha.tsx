import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError, logout, mensagemDeErro, trocarSenha } from "@/lib/api";
import { validarSenha } from "@/lib/conta";

function validar(senhaAtual: string, novaSenha: string, confirmacao: string): string | null {
  const erroTamanho = validarSenha(novaSenha);
  if (erroTamanho) return erroTamanho;
  if (novaSenha === senhaAtual) return "A senha nova deve ser diferente da atual.";
  if (novaSenha !== confirmacao) return "A confirmação não é igual à senha nova.";
  return null;
}

export default function TrocarSenha() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Senha provisória: sem navegação até trocar (a API também devolve 403 em qualquer outra rota).
  const obrigatorio = auth?.deveTrocarSenha ?? false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const erroValidacao = validar(senhaAtual, novaSenha, confirmacao);
    setErro(erroValidacao);
    if (erroValidacao) return;

    setEnviando(true);
    try {
      // trocarSenha() já chama setAuthToken com o token novo; o AuthContext recarrega o /me.
      const res = await trocarSenha({ senhaAtual, novaSenha });
      toast.success("Senha alterada.");
      navigate(res.role === "ESTAGIARIO" ? "/convites" : "/", { replace: true });
    } catch (err) {
      // 429: limite por IP em PUT /api/auth/senha. Mesma mensagem do login.
      if (err instanceof ApiError && err.status === 429) {
        toast.error("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
      } else {
        toast.error(mensagemDeErro(err));
      }
      setEnviando(false);
    }
  };

  const form = (
    <Card className="w-full max-w-sm p-6">
      <h1 className="mb-4 text-xl font-semibold text-foreground">Trocar senha</h1>
      {obrigatorio && (
        <p className="mb-4 rounded-md bg-muted p-3 text-sm text-foreground">
          Sua senha é provisória. Defina uma senha nova para continuar.
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="senha-atual">Senha atual</Label>
          <Input
            id="senha-atual"
            type="password"
            autoComplete="current-password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nova-senha">Senha nova</Label>
          <Input
            id="nova-senha"
            type="password"
            autoComplete="new-password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">De 8 a 72 caracteres.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirmacao-senha">Confirme a senha nova</Label>
          <Input
            id="confirmacao-senha"
            type="password"
            autoComplete="new-password"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            required
          />
        </div>
        {erro && (
          <p role="alert" className="text-sm text-destructive">
            {erro}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={enviando}>
          {enviando ? "Salvando..." : "Salvar senha"}
        </Button>
        {obrigatorio && (
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Sair
          </Button>
        )}
      </form>
    </Card>
  );

  if (obrigatorio) {
    return <div className="flex min-h-screen items-center justify-center bg-muted px-4">{form}</div>;
  }

  return (
    <Layout>
      <div className="container flex justify-center py-8 animate-fade-in">{form}</div>
    </Layout>
  );
}
