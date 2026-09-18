import { requireAuth } from "@/lib/auth/require-auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { MockModeBanner } from "@/components/MockModeBanner";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAuth();

  return (
    <div className="min-h-full bg-cream">
      <MockModeBanner />
      <AdminNav isSuperAdmin={admin.isSuperAdmin} />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
