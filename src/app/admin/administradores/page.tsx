import { Lock } from "lucide-react";
import { requireAuth } from "@/lib/auth/require-auth";
import { listAdmins } from "@/lib/domain/admins-repo";
import { AdministradoresPanel } from "./AdministradoresPanel";

export default async function AdministradoresPage() {
  const admin = await requireAuth();

  if (!admin.isSuperAdmin) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-white p-6 text-sm text-muted">
        <Lock size={18} strokeWidth={1.75} className="shrink-0 text-gold" aria-hidden="true" />
        Só o super-admin pode gerenciar outros administradores.
      </div>
    );
  }

  const admins = await listAdmins();

  return (
    <div>
      <span className="eyebrow text-orange">Acesso</span>
      <h1 className="font-display mt-1 mb-8 text-3xl font-semibold text-ink">Administradores</h1>
      <AdministradoresPanel admins={admins} currentUserId={admin.id} />
    </div>
  );
}
