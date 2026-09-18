import { STATUS_LABELS, LEAD_STATUS_LABELS, type StatusImovel, type StatusLead } from "@/lib/domain/types";

const IMOVEL_COLORS: Record<StatusImovel, string> = {
  disponivel: "bg-success/15 text-success",
  reservado: "bg-warning/15 text-warning",
  alugado: "bg-charcoal/10 text-charcoal",
  vendido: "bg-charcoal/10 text-charcoal",
};

const LEAD_COLORS: Record<StatusLead, string> = {
  novo: "bg-orange/15 text-orange-dark",
  contatado: "bg-success/15 text-success",
  descartado: "bg-charcoal/10 text-muted",
};

export function StatusImovelBadge({ status }: { status: StatusImovel }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${IMOVEL_COLORS[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function StatusLeadBadge({ status }: { status: StatusLead }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${LEAD_COLORS[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}
