"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isMockMode, MOCK_ADMIN_EMAIL, MOCK_ADMIN_PASSWORD } from "@/lib/mock/config";
import { setMockSession } from "@/lib/mock/auth";

export type SignInResultado = { ok: true } | { ok: false; erro: string };

export async function signIn(
  next: string,
  formData: FormData,
): Promise<SignInResultado> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, erro: "Informe email e senha." };
  }

  if (isMockMode()) {
    if (email.toLowerCase() !== MOCK_ADMIN_EMAIL || password !== MOCK_ADMIN_PASSWORD) {
      return { ok: false, erro: "Email ou senha inválidos (modo demonstração)." };
    }
    await setMockSession();
    redirect(next || "/admin");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, erro: "Email ou senha inválidos." };
  }

  redirect(next || "/admin");
}
