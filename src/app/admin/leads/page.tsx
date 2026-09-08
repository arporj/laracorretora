import { getLeadsComImovel } from "@/lib/leads";
import { LeadsTable } from "./LeadsTable";

export default async function AdminLeadsPage() {
  const leads = await getLeadsComImovel();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">Leads</h1>
      {leads.length === 0 ? (
        <p className="text-muted">Nenhum contato recebido ainda.</p>
      ) : (
        <LeadsTable leads={leads} />
      )}
    </div>
  );
}
