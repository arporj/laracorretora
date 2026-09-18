"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { StatusLeadBadge } from "@/components/admin/StatusBadge";
import { LEAD_STATUS_LABELS, type Lead, type StatusLead } from "@/lib/domain/types";
import { buildWhatsAppLinkPara } from "@/lib/whatsapp";
import { updateLeadStatus } from "./actions";

interface LeadComImovel extends Lead {
  imoveis: { titulo: string; codigo: string; slug: string } | null;
}

function buildWhatsAppNumero(telefone: string): string {
  const digitos = telefone.replace(/\D/g, "");
  if (digitos.startsWith("55")) return digitos;
  return `55${digitos}`;
}

export function LeadsTable({ leads }: { leads: LeadComImovel[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleStatusChange(leadId: string, status: StatusLead) {
    startTransition(async () => {
      await updateLeadStatus(leadId, status);
      router.refresh();
    });
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3">Data</th>
            <th className="px-4 py-3">Nome</th>
            <th className="px-4 py-3">Contato</th>
            <th className="px-4 py-3">Imóvel</th>
            <th className="px-4 py-3">Mensagem</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b border-border align-top last:border-0">
              <td className="whitespace-nowrap px-4 py-3 text-muted">
                {new Date(lead.created_at).toLocaleDateString("pt-BR")}
              </td>
              <td className="px-4 py-3 font-medium text-ink">{lead.nome}</td>
              <td className="px-4 py-3">
                <a
                  href={buildWhatsAppLinkPara(
                    buildWhatsAppNumero(lead.telefone),
                    `Olá ${lead.nome}! Aqui é da LARA Negócios Imobiliários.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-success hover:underline"
                >
                  {lead.telefone}
                </a>
                {lead.email && <div className="text-xs text-muted">{lead.email}</div>}
              </td>
              <td className="px-4 py-3">
                {lead.imoveis ? (
                  <a href={`/imoveis/${lead.imoveis.slug}`} className="text-orange hover:underline">
                    {lead.imoveis.codigo}
                  </a>
                ) : (
                  <span className="text-muted">Contato geral</span>
                )}
              </td>
              <td className="max-w-xs px-4 py-3 text-muted">{lead.mensagem || "—"}</td>
              <td className="px-4 py-3">
                <select
                  value={lead.status}
                  disabled={pending}
                  onChange={(e) => handleStatusChange(lead.id, e.target.value as StatusLead)}
                  className="rounded-lg border border-border px-2 py-1 text-xs"
                >
                  {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <div className="mt-1">
                  <StatusLeadBadge status={lead.status} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
