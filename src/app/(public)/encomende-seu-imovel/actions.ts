"use server";

import { criarLead, type NovoLeadResultado } from "@/lib/leads";
import { formatCentsToBRL, reaisToCents } from "@/lib/domain/format";
import { FINALIDADE_LABELS, TIPO_LABELS, type Finalidade, type TipoImovel } from "@/lib/domain/types";

export async function enviarEncomendaImovel(formData: FormData): Promise<NovoLeadResultado> {
  const finalidade = String(formData.get("finalidade") ?? "") as Finalidade | "";
  const tipo = String(formData.get("tipo") ?? "") as TipoImovel | "";
  const regiao = String(formData.get("regiao") ?? "").trim();
  const orcamentoCents = reaisToCents(String(formData.get("orcamento") ?? ""));
  const quartos = String(formData.get("quartos") ?? "").trim();
  const observacoes = String(formData.get("observacoes") ?? "").trim();

  const linhas = [
    finalidade && `Pretensão: ${FINALIDADE_LABELS[finalidade]}`,
    tipo && `Tipo de imóvel: ${TIPO_LABELS[tipo]}`,
    regiao && `Região desejada: ${regiao}`,
    orcamentoCents != null && `Orçamento aproximado: até ${formatCentsToBRL(orcamentoCents)}`,
    quartos && `Quartos: ${quartos}`,
    observacoes && `Observações: ${observacoes}`,
  ].filter(Boolean);

  return criarLead({
    nome: String(formData.get("nome") ?? ""),
    telefone: String(formData.get("telefone") ?? ""),
    email: String(formData.get("email") ?? ""),
    mensagem: linhas.join("\n"),
    origem: "encomenda_imovel",
    honeypot: String(formData.get("website") ?? ""),
  });
}
