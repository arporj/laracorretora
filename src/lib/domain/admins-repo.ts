import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMockMode } from "@/lib/mock/config";

export interface AdminUser {
  userId: string;
  email: string;
  isSuperAdmin: boolean;
  createdAt: string;
}

export async function listAdmins(): Promise<AdminUser[]> {
  if (isMockMode()) {
    return [
      {
        userId: "mock-admin",
        email: "lara@demo.com",
        isSuperAdmin: true,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  const admin = createAdminClient();

  const { data: rows, error } = await admin
    .from("admins")
    .select("user_id, is_super_admin, created_at")
    .order("created_at", { ascending: true });

  if (error) throw error;
  if (!rows || rows.length === 0) return [];

  const { data: usersPage, error: usersError } = await admin.auth.admin.listUsers({
    perPage: 200,
  });
  if (usersError) throw usersError;

  const emailPorId = new Map(usersPage.users.map((u) => [u.id, u.email ?? "(sem email)"]));

  return rows.map((row) => ({
    userId: row.user_id,
    email: emailPorId.get(row.user_id) ?? "(usuário removido)",
    isSuperAdmin: row.is_super_admin,
    createdAt: row.created_at,
  }));
}
