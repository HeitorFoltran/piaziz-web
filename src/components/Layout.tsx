import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, User, X } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/contexts/AuthContext";

const navItemsEquipe = [
  { label: "Home", path: "/" },
  { label: "Relatórios", path: "/relatorios" },
  { label: "Acompanhamentos", path: "/acompanhamentos" },
  { label: "Cadastros", path: "/cadastros" },
  { label: "Fichas pendentes", path: "/fichas-pendentes" },
  { label: "Links de preenchimento", path: "/convites" },
];

// ESTAGIARIO não revisa fichas nem vê casos. O nav dele só linka a tela de links de preenchimento.
const navItemsEstagiario = [{ label: "Links de preenchimento", path: "/convites" }];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { auth } = useAuth();
  const navItems = auth?.role === "ESTAGIARIO" ? navItemsEstagiario : navItemsEquipe;
  // Abaixo de sm os links não cabem na largura do celular: viram uma lista aberta por este botão.
  const [menuAberto, setMenuAberto] = useState(false);

  function isActive(path: string) {
    return location.pathname === path || (path !== "/" && location.pathname.startsWith(path));
  }

  function linkClass(path: string) {
    return `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive(path) ? "text-primary bg-muted" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    }`;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <span className="font-logo text-2xl font-black tracking-tight text-primary">PIAZIZ</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className={linkClass(item.path)}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <UserMenu />
            <button
              type="button"
              className="sm:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50"
              aria-label="Abrir menu"
              aria-expanded={menuAberto}
              aria-controls="menu-celular"
              onClick={() => setMenuAberto((aberto) => !aberto)}
            >
              {menuAberto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {menuAberto && (
          <nav id="menu-celular" className="sm:hidden container flex flex-col gap-1 pb-3">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className={linkClass(item.path)} onClick={() => setMenuAberto(false)}>
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-primary text-primary-foreground py-6 mt-auto">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <span className="font-logo text-xl font-black">PIAZIZ</span>
          </div>
          <nav className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-sm opacity-80">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} className="hover:opacity-100 transition-opacity">
                {item.label}
              </Link>
            ))}
          </nav>
          <Link to="/login" className="group">
            <button className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <User className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
