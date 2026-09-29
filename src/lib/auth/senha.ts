export const SENHA_TAMANHO_MINIMO = 10;

export const REQUISITOS_SENHA = [
  `Pelo menos ${SENHA_TAMANHO_MINIMO} caracteres`,
  "Uma letra maiúscula e uma minúscula",
  "Um número",
  "Um símbolo (ex: ! @ # $ %)",
];

/**
 * Valida a força de uma senha nova. Retorna a mensagem do primeiro requisito
 * não atendido, ou `null` se a senha for aceitável.
 */
export function validarSenhaForte(senha: string): string | null {
  if (senha.length < SENHA_TAMANHO_MINIMO) {
    return `A senha precisa ter pelo menos ${SENHA_TAMANHO_MINIMO} caracteres.`;
  }
  if (!/[a-z]/.test(senha) || !/[A-Z]/.test(senha)) {
    return "A senha precisa ter letras maiúsculas e minúsculas.";
  }
  if (!/[0-9]/.test(senha)) {
    return "A senha precisa ter pelo menos um número.";
  }
  if (!/[^A-Za-z0-9]/.test(senha)) {
    return "A senha precisa ter pelo menos um símbolo.";
  }
  return null;
}
