import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

async function getStats() {
  const supabase = await createClient();

  const [{ count: totalImoveis }, { count: disponiveis }, { count: leadsNovos }] =
    await Promise.all([
      supabase.from("imoveis").select("*", { count: "exact", head: true }),
      supabase
        .from("imoveis")
        .select("*", { count: "exact", head: true })
        .eq("status", "disponivel"),
      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("status", "novo"),
    ]);

  return {
    totalImoveis: totalImoveis ?? 0,
    disponiveis: disponiveis ?? 0,
    leadsNovos: leadsNovos ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Imóveis cadastrados", value: stats.totalImoveis, href: "/admin/imoveis" },
    { label: "Disponíveis", value: stats.disponiveis, href: "/admin/imoveis" },
    { label: "Leads novos", value: stats.leadsNovos, href: "/admin/leads" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">Painel</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-border bg-white p-6 hover:shadow-md"
          >
            <div className="text-3xl font-bold text-ink">{card.value}</div>
            <div className="mt-1 text-sm text-muted">{card.label}</div>
          </Link>
        ))}
      </div>
      <Link
        href="/admin/imoveis/novo"
        className="mt-8 inline-block rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-dark"
      >
        + Novo imóvel
      </Link>
    </div>
  );
}
