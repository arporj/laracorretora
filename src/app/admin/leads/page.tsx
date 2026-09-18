import { Inbox } from "lucide-react";
import { getLeadsComImovel } from "@/lib/leads";
import { LeadsTable } from "./LeadsTable";

export default async function AdminLeadsPage() {
  const leads = await getLeadsComImovel();

  return (
    <div>
      <span className="eyebrow text-orange">Relacionamento</span>
      <h1 className="font-display mt-1 mb-8 text-3xl font-semibold text-ink">Leads</h1>
      {leads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-16 text-center">
          <Inbox size={32} strokeWidth={1.5} className="mx-auto mb-3 text-gold" aria-hidden="true" />
          <p className="text-muted">Nenhum contato recebido ainda.</p>
        </div>
      ) : (
        <LeadsTable leads={leads} />
      )}
    </div>
  );
}
