import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getMe, setAuthToken, setOnTokenChange } from "@/lib/api";
import type { RoleProfissional } from "@/types/api";

// A sessão vem de GET /api/auth/me (lido do banco), não das claims do JWT: a flag de
// gerenciador e o deveTrocarSenha podem mudar sem o token mudar.
export interface Perfil {
  id: number;
  nome: string;
  username: string;
  role: RoleProfissional;
  podeGerenciarProfissionais: boolean;
  deveTrocarSenha: boolean;
}

interface AuthContextValue {
  auth: Perfil | null;
  /** true entre um token novo e a resposta do /me — não redirecionar nesse intervalo. */
  carregando: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthContextValue>({ auth: null, carregando: false });

  useEffect(() => {
    // Descarta a resposta de um /me antigo se o token mudou de novo no meio (ex.: troca de senha).
    let geracao = 0;
    setOnTokenChange((token) => {
      const atual = ++geracao;
      if (!token) {
        setState({ auth: null, carregando: false });
        return;
      }
      setState((s) => ({ ...s, carregando: true }));
      getMe()
        .then((me) => {
          if (atual !== geracao) return;
          setState({
            auth: {
              id: me.id,
              nome: me.nome,
              username: me.username,
              role: me.role,
              podeGerenciarProfissionais: me.podeGerenciarProfissionais,
              deveTrocarSenha: me.deveTrocarSenha,
            },
            carregando: false,
          });
        })
        .catch(() => {
          // 401 já limpa o token em request(). Qualquer outra falha também encerra a
          // sessão: sem perfil não há como saber o que a pessoa pode ver.
          if (atual !== geracao) return;
          setAuthToken(null);
        });
    });
    return () => setOnTokenChange(null);
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
