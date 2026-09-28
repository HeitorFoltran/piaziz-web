import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import { useAuth } from "@/contexts/AuthContext";

vi.mock("@/contexts/AuthContext");
vi.mock("@/components/UserMenu", () => ({ UserMenu: () => null }));

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<Layout>home</Layout>} />
        <Route path="/acompanhamentos" element={<Layout>lista de acompanhamentos</Layout>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.mocked(useAuth).mockReturnValue({ auth: { role: "PADRAO" } } as ReturnType<typeof useAuth>);
});

describe("Layout - menu no celular", () => {
  it("abre e fecha pelo botão", () => {
    renderLayout();
    const botao = screen.getByRole("button", { name: "Abrir menu" });
    expect(botao).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("menu-celular")).toBeNull();

    fireEvent.click(botao);
    expect(botao).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById("menu-celular")).not.toBeNull();

    fireEvent.click(botao);
    expect(botao).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("menu-celular")).toBeNull();
  });

  it("navega e fecha ao clicar num link", () => {
    renderLayout();
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));

    const menu = document.getElementById("menu-celular")!;
    fireEvent.click(within(menu).getByRole("link", { name: "Acompanhamentos" }));

    expect(screen.getByText("lista de acompanhamentos")).toBeInTheDocument();
    expect(document.getElementById("menu-celular")).toBeNull();
    expect(screen.getByRole("button", { name: "Abrir menu" })).toHaveAttribute("aria-expanded", "false");
  });

  it("ESTAGIARIO só vê o link de preenchimento no menu", () => {
    vi.mocked(useAuth).mockReturnValue({ auth: { role: "ESTAGIARIO" } } as ReturnType<typeof useAuth>);
    renderLayout();
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));

    const links = within(document.getElementById("menu-celular")!).getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual(["Links de preenchimento"]);
  });
});
