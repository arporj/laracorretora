import { describe, it, expect, vi, beforeEach } from "vitest";

const { isMockMode } = vi.hoisted(() => ({ isMockMode: vi.fn() }));
const { hasMockSession } = vi.hoisted(() => ({ hasMockSession: vi.fn() }));
const { createClient } = vi.hoisted(() => ({ createClient: vi.fn() }));
const { redirect } = vi.hoisted(() => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("@/lib/mock/config", () => ({ isMockMode }));
vi.mock("@/lib/mock/auth", () => ({ hasMockSession }));
vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("next/navigation", () => ({ redirect }));

function fakeSupabase({
  user,
  adminRow,
}: {
  user: { id: string } | null;
  adminRow: { user_id: string; is_super_admin: boolean } | null;
}) {
  return {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: adminRow }),
        })),
      })),
    })),
  };
}

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("modo mock: sem sessão redireciona pro login", async () => {
    isMockMode.mockReturnValue(true);
    hasMockSession.mockResolvedValue(false);

    const { requireAuth } = await import("./require-auth");
    await expect(requireAuth()).rejects.toThrow("REDIRECT:/login");
  });

  it("modo mock: com sessão retorna admin fictício como super-admin", async () => {
    isMockMode.mockReturnValue(true);
    hasMockSession.mockResolvedValue(true);

    const { requireAuth } = await import("./require-auth");
    const admin = await requireAuth();
    expect(admin).toEqual({ id: "mock-admin", isSuperAdmin: true });
  });

  it("modo real: sem usuário logado redireciona pro login", async () => {
    isMockMode.mockReturnValue(false);
    createClient.mockResolvedValue(fakeSupabase({ user: null, adminRow: null }));

    const { requireAuth } = await import("./require-auth");
    await expect(requireAuth()).rejects.toThrow("REDIRECT:/login");
  });

  it("modo real: usuário logado mas fora da allow-list `admins` redireciona pro login", async () => {
    isMockMode.mockReturnValue(false);
    createClient.mockResolvedValue(fakeSupabase({ user: { id: "u1" }, adminRow: null }));

    const { requireAuth } = await import("./require-auth");
    await expect(requireAuth()).rejects.toThrow("REDIRECT:/login");
  });

  it("modo real: retorna isSuperAdmin conforme a linha em `admins`", async () => {
    isMockMode.mockReturnValue(false);
    createClient.mockResolvedValue(
      fakeSupabase({ user: { id: "u1" }, adminRow: { user_id: "u1", is_super_admin: false } }),
    );

    const { requireAuth } = await import("./require-auth");
    const admin = await requireAuth();
    expect(admin.isSuperAdmin).toBe(false);
  });
});

describe("requireSuperAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lança erro quando o admin logado não é super-admin", async () => {
    isMockMode.mockReturnValue(false);
    createClient.mockResolvedValue(
      fakeSupabase({ user: { id: "u1" }, adminRow: { user_id: "u1", is_super_admin: false } }),
    );

    const { requireSuperAdmin } = await import("./require-auth");
    await expect(requireSuperAdmin()).rejects.toThrow(
      "Só o super-admin pode gerenciar outros administradores.",
    );
  });

  it("retorna o admin quando ele é super-admin", async () => {
    isMockMode.mockReturnValue(false);
    createClient.mockResolvedValue(
      fakeSupabase({ user: { id: "u1" }, adminRow: { user_id: "u1", is_super_admin: true } }),
    );

    const { requireSuperAdmin } = await import("./require-auth");
    const admin = await requireSuperAdmin();
    expect(admin.isSuperAdmin).toBe(true);
  });
});
