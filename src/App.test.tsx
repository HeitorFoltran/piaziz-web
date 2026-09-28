import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import App from "./App";

// Só interessa o roteamento: sessão e páginas viram marcadores.
vi.mock("@/contexts/AuthContext", () => ({ AuthProvider: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock("@/components/RequireAuth", () => ({ RequireAuth: ({ children }: { children: ReactNode }) => <>{children}</> }));
vi.mock("./pages/Index.tsx", () => ({ default: () => <p>página inicial</p> }));

describe("App - rotas", () => {
  it("/relatorios redireciona para a Home", async () => {
    window.history.pushState({}, "", "/relatorios");
    render(<App />);

    expect(await screen.findByText("página inicial")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");
  });
});
