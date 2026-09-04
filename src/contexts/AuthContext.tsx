import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { setOnTokenChange } from "@/lib/api";

interface TokenClaims {
  sub: string;
  role: string;
  exp: number;
}

function decodeToken(token: string): TokenClaims | null {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

interface AuthState {
  role: string;
  sub: string;
}

interface AuthContextValue {
  auth: AuthState | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toAuthState(token: string | null): AuthState | null {
  if (!token) return null;
  const claims = decodeToken(token);
  if (!claims) return null;
  if (claims.exp * 1000 < Date.now()) return null;
  return { role: claims.role, sub: claims.sub };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => {
    setOnTokenChange((token) => setAuth(toAuthState(token)));
    return () => setOnTokenChange(null);
  }, []);

  return <AuthContext.Provider value={{ auth }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
