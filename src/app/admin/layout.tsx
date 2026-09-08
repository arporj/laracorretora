import { requireAuth } from "@/lib/auth/require-auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { MockModeBanner } from "@/components/MockModeBanner";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();

  return (
    <div className="min-h-full bg-cream">
      <MockModeBanner />
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
