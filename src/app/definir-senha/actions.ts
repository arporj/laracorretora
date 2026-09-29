"use server";

import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { createClient } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/mock/config";
import { validarSenhaForte } from "@/lib/auth/senha";

export type DefinirSenhaResultado = { ok: false; erro: string };

/**
 * Define a senha de quem chegou por um link de convite ou de recuperação
 * (a sessão foi criada em /auth/confirmar). `requireAuth` garante que só
 * admins cadastrados chegam até aqui.
 */
export async function definirSenha(formData: FormData): Promise<DefinirSenhaResultado> {
  await requireAuth();

  if (isMockMode()) {
    return { ok: false, erro: "Troca de senha não está disponível no modo demonstração." };
  }

  const senha = String(formData.get("senha") ?? "");
  const confirmacao = String(formData.get("confirmacao") ?? "");

  const erroForca = validarSenhaForte(senha);
  if (erroForca) {
    return { ok: false, erro: erroForca };
  }
  if (senha !== confirmacao) {
    return { ok: false, erro: "As senhas não conferem." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: senha });

  if (error) {
    if (error.code === "same_password") {
      return { ok: false, erro: "A nova senha precisa ser diferente da atual." };
    }
    if (error.code === "weak_password") {
      return { ok: false, erro: "Essa senha é fraca ou já apareceu em vazamentos. Escolha outra." };
    }
    console.error("Erro ao definir senha:", error.code ?? error.message);
    return { ok: false, erro: "Não foi possível salvar a senha. Tente novamente." };
  }

  redirect("/admin");
}
