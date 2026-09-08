"use server";

import { criarLead, type NovoLeadResultado } from "@/lib/leads";

export async function enviarContatoGeral(formData: FormData): Promise<NovoLeadResultado> {
  return criarLead({
    nome: String(formData.get("nome") ?? ""),
    telefone: String(formData.get("telefone") ?? ""),
    email: String(formData.get("email") ?? ""),
    mensagem: String(formData.get("mensagem") ?? ""),
    origem: "form_contato",
    honeypot: String(formData.get("website") ?? ""),
  });
}
