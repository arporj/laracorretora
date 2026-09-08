import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isMockMode, MOCK_SESSION_COOKIE } from "@/lib/mock/config";

/**
 * Checagem otimista de sessão, chamada pelo proxy.ts (equivalente ao
 * middleware.ts no Next 16) em toda rota que não seja asset estático.
 * Só confirma que existe um usuário logado e redireciona /admin/** para
 * /login quando não há — a checagem real (pertencer à tabela `admins`)
 * acontece em requireAuth(), chamado nas Server Components/Actions.
 */
export async function updateSession(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  if (isMockMode()) {
    const logado = request.cookies.get(MOCK_SESSION_COOKIE)?.value === "1";
    if (isAdminRoute && !logado) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAdminRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
