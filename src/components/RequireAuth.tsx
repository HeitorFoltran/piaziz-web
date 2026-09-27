import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// UX, não controle de acesso: quem barra de verdade é a API (inclusive o 403 de
// "Troca de senha obrigatória"). Ver security.md.
// ESTAGIARIO só tem a tela de links de preenchimento (/convites) e a de trocar senha —
// qualquer outra rota autenticada devolve pra /convites.
export function RequireAuth({ children, permiteEstagiario = false }: { children: ReactNode; permiteEstagiario?: boolean }) {
  const { auth, carregando } = useAuth();
  const location = useLocation();

  // Sem isto, o intervalo entre o login e a resposta do /me "pisca" para /login.
  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-label="Carregando sessão">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!auth) return <Navigate to="/login" replace />;
  if (auth.deveTrocarSenha && location.pathname !== "/trocar-senha") {
    return <Navigate to="/trocar-senha" replace />;
  }
  if (auth.role === "ESTAGIARIO" && !permiteEstagiario) return <Navigate to="/convites" replace />;
  return <>{children}</>;
}
