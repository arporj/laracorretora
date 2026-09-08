import "server-only";
import { cookies } from "next/headers";
import { MOCK_SESSION_COOKIE } from "./config";

export async function hasMockSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(MOCK_SESSION_COOKIE)?.value === "1";
}

export async function setMockSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(MOCK_SESSION_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function clearMockSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(MOCK_SESSION_COOKIE);
}
