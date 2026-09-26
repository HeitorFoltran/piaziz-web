import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "sonner";
import Login from "./Login";
import { ApiError, login } from "@/lib/api";

// ApiError real (automock não roda o construtor, então `status` ficaria undefined).
vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  login: vi.fn(),
}));

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Login", () => {
  it("renderiza os campos de e-mail/senha e o botão Entrar", () => {
    renderLogin();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });

  it("submete o form chamando login com os valores digitados", async () => {
    vi.mocked(login).mockResolvedValueOnce({
      token: "t",
      profissionalId: 1,
      nome: "Fulana",
      email: "fulana@exemplo.com",
      role: "GESTOR",
    });
    renderLogin();

    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "fulana@exemplo.com" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith("fulana@exemplo.com", "123456");
    });
  });

  it("navega para / quando login resolve com sucesso", async () => {
    vi.mocked(login).mockResolvedValueOnce({
      token: "t",
      profissionalId: 1,
      nome: "Fulana",
      email: "fulana@exemplo.com",
      role: "GESTOR",
    });
    renderLogin();

    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "fulana@exemplo.com" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/");
    });
  });

  it("mostra toast de erro e não navega quando login rejeita", async () => {
    vi.mocked(login).mockRejectedValueOnce(new Error("credenciais inválidas"));
    renderLogin();

    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "fulana@exemplo.com" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "errada" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("E-mail ou senha inválidos.");
    });
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("mostra mensagem de muitas tentativas quando login responde 429", async () => {
    vi.mocked(login).mockRejectedValueOnce(new ApiError("Erro 429 ao acessar /api/auth/login", 429));
    renderLogin();

    fireEvent.change(screen.getByLabelText("E-mail"), { target: { value: "fulana@exemplo.com" } });
    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
    });
    expect(toast.error).not.toHaveBeenCalledWith("E-mail ou senha inválidos.");
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
