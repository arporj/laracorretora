import { requireAuth } from "@/lib/auth/require-auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MockModeBanner } from "@/components/MockModeBanner";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAuth();
  const email = "email" in admin && admin.email ? admin.email : "Conta de demonstração";

  return (
    <div className="flex min-h-full flex-col bg-cream">
      <MockModeBanner />
      <div className="flex flex-1 flex-col lg:flex-row">
        <AdminSidebar isSuperAdmin={admin.isSuperAdmin} email={email} />
        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
