import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 1. Create a response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Create the Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // 3. Get user (this will also refresh the session cookie)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // --- FIX: Skip all redirect logic for API routes ---
  // The getUser() call above has already refreshed the auth cookie,
  // so we can now safely return the response.
  if (pathname.startsWith('/api')) {
    return response;
  }
  // --- End of Fix ---

  // 4. Define public routes
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/auth/callback", // Allow auth callback to process
    "/images/hero.jpg",
    "/images/features/analytics.png",
    "/images/features/evaluation.png",
    "/images/features/faculty.png",
    "/images/features/student_dashboard.png",
    "/email/invite.html",
    "/email/password-reset.html",
    "/terms-and-conditions"
  ];

  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/blog") ||
    pathname.startsWith("/legal");

  // 5. Redirect unauthenticated users
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  // 6. Handle password recovery redirect
  if (
    pathname === "/login" &&
    request.nextUrl.searchParams.get("type") === "recovery"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/reset-password";
    return NextResponse.redirect(url);
  }

  // 7. Prevent logged-in users from visiting auth pages
  if (user && ["/login", "/register"].includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // 8. Role-based access control
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? "student";

    if (pathname !== "/" && !pathname.startsWith("/blog") && !pathname.startsWith("/legal")) {
      if (role === "student" && !pathname.startsWith("/student")) {
        const url = request.nextUrl.clone();
        url.pathname = "/student";
        return NextResponse.redirect(url);
      }

      if (role === "faculty" && !pathname.startsWith("/faculty")) {
        const url = request.nextUrl.clone();
        url.pathname = "/faculty";
        return NextResponse.redirect(url);
      }

      if (role === "admin" && !pathname.startsWith("/admin")) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.redirect(url);
      }
    }
  }

  // 9. Return the response (which now contains the updated auth cookie)
  return response;
}

// I've also made your matcher slightly more specific by adding a trailing slash
// to prevent matching files that might start with 'api' (e.g., 'apirules.txt')
export const config = {
  matcher: [
    "/((?!api/|_next/static/|_next/image/|favicon.ico|images/).*)",
  ],
};