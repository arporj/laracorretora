"use server";

import { criarLead, type NovoLeadResultado } from "@/lib/leads";

export async function enviarContatoImovel(
  imovelId: string,
  formData: FormData,
): Promise<NovoLeadResultado> {
  return criarLead({
    imovelId,
    nome: String(formData.get("nome") ?? ""),
    telefone: String(formData.get("telefone") ?? ""),
    email: String(formData.get("email") ?? ""),
    mensagem: String(formData.get("mensagem") ?? ""),
    origem: "form_imovel",
    honeypot: String(formData.get("website") ?? ""),
  });
}
