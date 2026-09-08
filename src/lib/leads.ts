import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface NovoLeadInput {
  imovelId?: string | null;
  nome: string;
  telefone: string;
  email?: string;
  mensagem?: string;
  origem: string;
  honeypot?: string;
}

export type NovoLeadResultado =
  | { ok: true }
  | { ok: false; erro: string };

const TELEFONE_PATTERN = /^\+?[0-9()\-\s]{8,20}$/;

/**
 * Insere um lead vindo do formulário público de contato. O campo honeypot,
 * se preenchido, indica um bot — retornamos sucesso "falso" sem gravar nada,
 * em vez de expor o mecanismo anti-spam para quem estiver testando o form.
 */
export async function criarLead(input: NovoLeadInput): Promise<NovoLeadResultado> {
  if (input.honeypot) {
    return { ok: true };
  }

  const nome = input.nome.trim();
  const telefone = input.telefone.trim();

  if (nome.length < 2) {
    return { ok: false, erro: "Informe seu nome." };
  }
  if (!TELEFONE_PATTERN.test(telefone)) {
    return { ok: false, erro: "Informe um telefone válido." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    imovel_id: input.imovelId ?? null,
    nome,
    telefone,
    email: input.email?.trim() || null,
    mensagem: input.mensagem?.trim() || null,
    origem: input.origem,
    status: "novo",
  });

  if (error) {
    console.error("Erro ao criar lead:", error);
    return { ok: false, erro: "Não foi possível enviar. Tente novamente em instantes." };
  }

  return { ok: true };
}
