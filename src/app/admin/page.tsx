import Link from "next/link";
import { Building2, CheckCircle2, Inbox, Plus, ArrowRight } from "lucide-react";
import { StatusImovelBadge, StatusLeadBadge } from "@/components/admin/StatusBadge";
import { getStats, getAllImoveisAdmin } from "@/lib/domain/imoveis-repo";
import { getLeadsComImovel } from "@/lib/leads";
import { formatCentsToBRL } from "@/lib/domain/format";

export default async function AdminDashboardPage() {
  const [stats, imoveis, leads] = await Promise.all([
    getStats(),
    getAllImoveisAdmin(),
    getLeadsComImovel(),
  ]);

  const cards = [
    {
      label: "Imóveis cadastrados",
      value: stats.totalImoveis,
      href: "/admin/imoveis",
      icon: Building2,
    },
    {
      label: "Disponíveis",
      value: stats.disponiveis,
      href: "/admin/imoveis",
      icon: CheckCircle2,
    },
    {
      label: "Leads novos",
      value: stats.leadsNovos,
      href: "/admin/leads",
      icon: Inbox,
    },
  ];

  const ultimosImoveis = imoveis.slice(0, 5);
  const ultimosLeads = leads.slice(0, 5);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="eyebrow text-orange">Visão geral</span>
          <h1 className="font-display mt-1 text-3xl font-semibold text-ink">Painel</h1>
        </div>
        <Link
          href="/admin/imoveis/novo"
          className="inline-flex items-center gap-2 rounded-full bg-orange px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-dark"
        >
          <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
          Novo imóvel
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="flex items-center gap-4 rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange/10 text-orange">
                <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div>
                <div className="font-display text-2xl font-semibold text-ink">{card.value}</div>
                <div className="text-sm text-muted">{card.label}</div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-display text-lg text-ink">Últimos imóveis</h2>
            <Link
              href="/admin/imoveis"
              className="inline-flex items-center gap-1 text-sm font-semibold text-orange hover:underline"
            >
              Ver todos
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          {ultimosImoveis.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted">Nenhum imóvel cadastrado ainda.</p>
          ) : (
            <ul>
              {ultimosImoveis.map((imovel) => (
                <li key={imovel.id} className="border-b border-border px-6 py-4 last:border-0">
                  <Link
                    href={`/admin/imoveis/${imovel.id}/editar`}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium text-ink">{imovel.titulo}</div>
                      <div className="mt-0.5 text-xs text-muted">
                        {imovel.codigo} ·{" "}
                        {imovel.finalidade !== "aluguel"
                          ? formatCentsToBRL(imovel.preco_venda_cents)
                          : formatCentsToBRL(imovel.preco_aluguel_cents)}
                      </div>
                    </div>
                    <StatusImovelBadge status={imovel.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-display text-lg text-ink">Últimos leads</h2>
            <Link
              href="/admin/leads"
              className="inline-flex items-center gap-1 text-sm font-semibold text-orange hover:underline"
            >
              Ver todos
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
          {ultimosLeads.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted">Nenhum contato recebido ainda.</p>
          ) : (
            <ul>
              {ultimosLeads.map((lead) => (
                <li key={lead.id} className="flex items-center justify-between gap-4 border-b border-border px-6 py-4 last:border-0">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-ink">{lead.nome}</div>
                    <div className="mt-0.5 text-xs text-muted">
                      {lead.imoveis ? lead.imoveis.codigo : "Contato geral"} ·{" "}
                      {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  <StatusLeadBadge status={lead.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
