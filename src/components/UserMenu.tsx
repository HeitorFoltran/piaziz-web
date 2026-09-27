import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, KeyRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/lib/api";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { auth } = useAuth();

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={auth ? `Menu de ${auth.nome}` : "Menu do usuário"}
        className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
      >
        <User className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-md border border-border bg-card shadow-lg py-1 text-sm">
          {auth && (
            <div className="border-b border-border px-3 py-2">
              <p className="truncate font-medium text-foreground">{auth.nome}</p>
              <p className="truncate text-xs text-muted-foreground">@{auth.username}</p>
            </div>
          )}
          <button
            onClick={() => {
              setOpen(false);
              navigate("/trocar-senha");
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-foreground hover:bg-muted"
          >
            <KeyRound className="w-4 h-4" /> Trocar senha
          </button>
          <button
            onClick={() => {
              logout();
              setOpen(false);
              navigate("/login");
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-foreground hover:bg-muted"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      )}
    </div>
  );
}
