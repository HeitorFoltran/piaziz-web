import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Convites from "./Convites";
import { listarConvitesFicha } from "@/lib/api";
import { useAuth, type Perfil } from "@/contexts/AuthContext";
import type { ConviteFicha } from "@/types/api";

vi.mock("@/lib/api");

vi.mock("@/contexts/AuthContext", () => ({ useAuth: vi.fn() }));

vi.mock("@/components/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const LINK_MEU = "https://exemplo.test/ficha-publica/meu";
const LINK_OUTRA = "https://exemplo.test/ficha-publica/outra";

function perfil(overrides: Partial<Perfil> = {}): Perfil {
  return {
    id: 1,
    nome: "Ana",
    username: "ana.beatriz",
    role: "PADRAO",
    podeGerenciarProfissionais: false,
    deveTrocarSenha: false,
    ...overrides,
  };
}

function convite(overrides: Partial<ConviteFicha>): ConviteFicha {
  return {
    id: 1,
    criadoPorId: 1,
    criadoPorNome: "Ana",
    linkCompleto: null,
    dataCriacao: "2026-09-27T10:00:00",
    dataExpiracao: "2099-10-04T10:00:00",
    status: "ATIVO",
    usadoEm: null,
    ...overrides,
  };
}

// Ordem na tela é por dataCriacao desc: meu, da Carla, usado.
const CONVITES: ConviteFicha[] = [
  convite({ id: 10, criadoPorId: 1, criadoPorNome: "Ana", linkCompleto: LINK_MEU, dataCriacao: "2026-09-27T12:00:00" }),
  convite({ id: 11, criadoPorId: 2, criadoPorNome: "Carla", linkCompleto: LINK_OUTRA, dataCriacao: "2026-09-27T11:00:00" }),
  convite({
    id: 12,
    criadoPorId: 2,
    criadoPorNome: "Carla",
    status: "USADO",
    usadoEm: "2026-09-26T15:00:00",
    dataCriacao: "2026-09-25T10:00:00",
  }),
];

function renderPagina() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <Convites />
    </QueryClientProvider>,
  );
}

async function cards() {
  await screen.findByDisplayValue(LINK_MEU);
  // Cada card tem a linha "Gerado por ..."; sobe até o card para olhar só dentro dele.
  return screen.getAllByText(/^Gerado por/).map((linha) => linha.closest(".rounded-lg") as HTMLElement);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listarConvitesFicha).mockResolvedValue(CONVITES);
});

describe("Convites - lista da equipe", () => {
  it("mostra o link, 'Gerado por você' e Cancelar no link do próprio usuário", async () => {
    vi.mocked(useAuth).mockReturnValue({ auth: perfil(), carregando: false });
    renderPagina();

    const [meu] = await cards();
    expect(within(meu).getByDisplayValue(LINK_MEU)).toBeInTheDocument();
    expect(within(meu).getByText(/^Gerado por você/)).toBeInTheDocument();
    expect(within(meu).getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });

  it("mostra o link e o nome de quem gerou, sem Cancelar, para ESTAGIARIO no link de outra pessoa", async () => {
    vi.mocked(useAuth).mockReturnValue({ auth: perfil({ role: "ESTAGIARIO" }), carregando: false });
    renderPagina();

    const [, daCarla] = await cards();
    expect(within(daCarla).getByDisplayValue(LINK_OUTRA)).toBeInTheDocument();
    expect(within(daCarla).getByText(/^Gerado por Carla/)).toBeInTheDocument();
    expect(within(daCarla).queryByRole("button", { name: "Cancelar" })).not.toBeInTheDocument();
  });

  it("mostra 'Link já utilizado' e nenhum campo de link no convite usado", async () => {
    vi.mocked(useAuth).mockReturnValue({ auth: perfil(), carregando: false });
    renderPagina();

    const [, , usado] = await cards();
    expect(within(usado).getByText("Link já utilizado")).toBeInTheDocument();
    expect(within(usado).queryByRole("textbox")).not.toBeInTheDocument();
  });
});
