import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isMockMode } from "@/lib/mock/config";
import { clearMockSession } from "@/lib/mock/auth";

export async function POST(request: Request) {
  if (isMockMode()) {
    await clearMockSession();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url));
}
