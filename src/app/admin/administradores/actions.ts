"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth/require-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMockMode } from "@/lib/mock/config";
import { enviarEmail } from "@/lib/email/send";
import { adminInviteEmail } from "@/lib/email/templates/admin-invite";
import { montarLinkConfirmacao } from "@/lib/auth/link-confirmacao";

export type AdminActionResultado = { ok: true } | { ok: false; erro: string };

const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function convidarAdmin(formData: FormData): Promise<AdminActionResultado> {
  await requireSuperAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    return { ok: false, erro: "Informe um email válido." };
  }

  if (isMockMode()) {
    return { ok: false, erro: "Convite de admin não está disponível no modo demonstração." };
  }

  const admin = createAdminClient();

  // Geramos o link nós mesmos (em vez de `inviteUserByEmail`) pra poder
  // mandar o e-mail com o layout e o domínio remetente do site, via Resend,
  // em vez do e-mail padrão do Supabase Auth.
  const { data, error } = await admin.auth.admin.generateLink({ type: "invite", email });

  if (error || !data.user) {
    console.error("Erro ao gerar convite de admin:", error);
    const jaExiste = error?.code === "email_exists";
    return {
      ok: false,
      erro: jaExiste
        ? "Já existe um usuário com esse email."
        : "Não foi possível enviar o convite.",
    };
  }

  const { error: insertError } = await admin.from("admins").insert({ user_id: data.user.id });

  if (insertError) {
    console.error("Erro ao cadastrar admin:", insertError);
    // Desfaz o convite pra não deixar um usuário órfão sem acesso nem registro.
    await admin.auth.admin.deleteUser(data.user.id);
    return { ok: false, erro: "Não foi possível cadastrar o admin." };
  }

  const envio = await enviarConvite(email, data.properties.hashed_token);

  if (!envio.ok) {
    console.error("Erro ao enviar email de convite:", envio.erro);
    // O admin já foi cadastrado; desfazemos tudo pra não deixar acesso
    // concedido sem a pessoa ter como saber ou ativar a própria senha.
    await admin.from("admins").delete().eq("user_id", data.user.id);
    await admin.auth.admin.deleteUser(data.user.id);
    return {
      ok: false,
      erro: "Não foi possível enviar o email de convite. Nenhum acesso foi concedido — tente novamente.",
    };
  }

  revalidatePath("/admin/administradores");
  return { ok: true };
}

/** Monta e envia o e-mail de convite. Nunca lança: falhas (inclusive de configuração) viram `{ ok: false }`. */
async function enviarConvite(email: string, tokenHash: string) {
  let conteudo;
  try {
    conteudo = adminInviteEmail({ inviteLink: montarLinkConfirmacao(tokenHash, "invite") });
  } catch (err) {
    return { ok: false as const, erro: err instanceof Error ? err.message : String(err) };
  }
  return enviarEmail({ to: email, ...conteudo });
}

export async function revogarAdmin(userId: string): Promise<AdminActionResultado> {
  const chamador = await requireSuperAdmin();

  if (userId === chamador.id) {
    return { ok: false, erro: "Você não pode revogar seu próprio acesso." };
  }

  if (isMockMode()) {
    return { ok: false, erro: "Revogar admin não está disponível no modo demonstração." };
  }

  const admin = createAdminClient();

  // O guard `is_super_admin = false` impede revogar o super-admin atual por
  // aqui — isso só pode acontecer transferindo o papel primeiro.
  const { error, count } = await admin
    .from("admins")
    .delete({ count: "exact" })
    .eq("user_id", userId)
    .eq("is_super_admin", false);

  if (error) {
    console.error("Erro ao revogar admin:", error);
    return { ok: false, erro: "Não foi possível revogar o acesso." };
  }
  if (!count) {
    return { ok: false, erro: "Não é possível revogar o super-admin atual." };
  }

  revalidatePath("/admin/administradores");
  return { ok: true };
}

export async function transferirSuperAdmin(userId: string): Promise<AdminActionResultado> {
  const chamador = await requireSuperAdmin();

  if (userId === chamador.id) {
    return { ok: true };
  }

  if (isMockMode()) {
    return {
      ok: false,
      erro: "Transferir super-admin não está disponível no modo demonstração.",
    };
  }

  const admin = createAdminClient();
  const { error } = await admin.rpc("transfer_super_admin", { new_admin_user_id: userId });

  if (error) {
    console.error("Erro ao transferir super-admin:", error);
    return { ok: false, erro: "Não foi possível transferir o papel de super-admin." };
  }

  revalidatePath("/admin/administradores");
  return { ok: true };
}
