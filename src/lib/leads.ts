import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/mock/config";
import { mockCriarLead, mockUpdateLeadStatus } from "@/lib/mock/mutations";
import { mockGetLeadsComImovel } from "@/lib/mock/queries";
import type { StatusLead } from "@/lib/domain/types";

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

  const dados = {
    imovelId: input.imovelId ?? null,
    nome,
    telefone,
    email: input.email?.trim() || null,
    mensagem: input.mensagem?.trim() || null,
    origem: input.origem,
  };

  if (isMockMode()) {
    mockCriarLead(dados);
    return { ok: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({ ...dados, status: "novo" });

  if (error) {
    console.error("Erro ao criar lead:", error);
    return { ok: false, erro: "Não foi possível enviar. Tente novamente em instantes." };
  }

  return { ok: true };
}

export async function getLeadsComImovel() {
  if (isMockMode()) return mockGetLeadsComImovel();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*, imoveis(titulo, codigo, slug)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateLeadStatus(leadId: string, status: StatusLead): Promise<void> {
  if (isMockMode()) {
    mockUpdateLeadStatus(leadId, status);
    return;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);
  if (error) throw error;
}
