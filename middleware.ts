import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  const isConfigured =
    supabaseUrl &&
    supabaseUrl.startsWith("http") &&
    supabaseUrl !== "xxx" &&
    supabaseUrl !== "undefined" &&
    supabaseUrl !== "null" &&
    supabaseAnonKey &&
    supabaseAnonKey !== "xxx" &&
    supabaseAnonKey !== "undefined" &&
    supabaseAnonKey !== "null";

  const useMockDemo = request.cookies.get("use_mock_demo")?.value === "true";

  if (!isConfigured || useMockDemo) {
    // Se não estiver configurado ou modo de demonstração ativo, permite o teste off-line sem redirecionamentos de login ou chamadas de rede
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    isConfigured ? supabaseUrl : "https://placeholder-url.supabase.co",
    isConfigured
      ? supabaseAnonKey
      : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder",
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const pathname = request.nextUrl.pathname;

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/planner") ||
    pathname.startsWith("/setup");

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  // Bypass Supabase queries entirely for public landing pages or assets
  if (!isProtectedRoute && !isAuthPage) {
    return response;
  }

  let user = null;
  try {
    // 1.5s timeout to prevent server-side block if Supabase is offline/paused
    const userPromise = supabase.auth.getUser().then(({ data }) => data.user);
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 1500)
    );
    user = await Promise.race([userPromise, timeoutPromise]);
  } catch (err) {
    console.error("Middleware auth timeout/error:", err);
  }

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
