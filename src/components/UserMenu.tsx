import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { logout } from "@/lib/api";

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
        className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
      >
        <User className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-md border border-border bg-card shadow-lg py-1 text-sm">
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
