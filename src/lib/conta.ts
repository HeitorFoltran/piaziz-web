import type { RoleProfissional } from "@/types/api";

// Espelham as regras do backend (ProfissionalService / AuthService), só para feedback
// imediato no formulário. Quem garante é a API.
export const USERNAME_REGEX = /^[a-z0-9._-]{3,30}$/;
export const SENHA_MIN = 8;
// O BCrypt ignora o que passa de 72 bytes; a API recusa acima disso.
export const SENHA_MAX = 72;

export const ROLE_LABEL: Record<RoleProfissional, string> = {
  DEV: "Desenvolvedor",
  PADRAO: "Profissional",
  ESTAGIARIO: "Estagiário(a)",
};

export function normalizarUsername(valor: string): string {
  return valor.toLowerCase().replace(/\s/g, "");
}

export function validarSenha(senha: string): string | null {
  if (senha.length < SENHA_MIN || senha.length > SENHA_MAX) {
    return `A senha deve ter entre ${SENHA_MIN} e ${SENHA_MAX} caracteres.`;
  }
  return null;
}

// Sem caracteres que se confundem ao ditar ou copiar à mão: 0/O, 1/l/I.
export const ALFABETO_SENHA = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
const TAMANHO_SENHA = 12;

// crypto.getRandomValues, nunca Math.random. Descarta os bytes acima do maior múltiplo
// do tamanho do alfabeto para não enviesar a distribuição.
export function gerarSenhaProvisoria(): string {
  const limite = 256 - (256 % ALFABETO_SENHA.length);
  let senha = "";
  const bytes = new Uint8Array(TAMANHO_SENHA * 2);
  while (senha.length < TAMANHO_SENHA) {
    crypto.getRandomValues(bytes);
    for (const b of bytes) {
      if (b < limite && senha.length < TAMANHO_SENHA) senha += ALFABETO_SENHA[b % ALFABETO_SENHA.length];
    }
  }
  return senha;
}
