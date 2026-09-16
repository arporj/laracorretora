import { requireAuth } from "@/lib/auth/require-auth";
import { listAdmins } from "@/lib/domain/admins-repo";
import { AdministradoresPanel } from "./AdministradoresPanel";

export default async function AdministradoresPage() {
  const admin = await requireAuth();

  if (!admin.isSuperAdmin) {
    return (
      <div className="rounded-2xl border border-border bg-white p-6 text-sm text-muted">
        Só o super-admin pode gerenciar outros administradores.
      </div>
    );
  }

  const admins = await listAdmins();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">Administradores</h1>
      <AdministradoresPanel admins={admins} currentUserId={admin.id} />
    </div>
  );
}
