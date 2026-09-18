import { getLeadsComImovel } from "@/lib/leads";
import { LeadsTable } from "./LeadsTable";

export default async function AdminLeadsPage() {
  const leads = await getLeadsComImovel();

  return (
    <div>
      <span className="eyebrow text-orange">Relacionamento</span>
      <h1 className="font-display mt-1 mb-8 text-3xl font-semibold text-ink">Leads</h1>
      {leads.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-white p-10 text-center text-muted">
          Nenhum contato recebido ainda.
        </p>
      ) : (
        <LeadsTable leads={leads} />
      )}
    </div>
  );
}
