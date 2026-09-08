import { createClient } from "@/lib/supabase/server";
import { LeadsTable } from "./LeadsTable";

export default async function AdminLeadsPage() {
  const supabase = await createClient();
  const { data: leads, error } = await supabase
    .from("leads")
    .select("*, imoveis(titulo, codigo, slug)")
    .order("created_at", { ascending: false });

  if (error) throw error;

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
