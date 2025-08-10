import { type NextRequest, NextResponse } from "next/server";
import { authenticatedUser } from "./utils/amplify-server-utils";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  try {
    const user = await authenticatedUser({ request, response });

    const isOnDashboard = request.nextUrl.pathname.startsWith("/dashboard");
    const isOnAdminArea =
      request.nextUrl.pathname.startsWith("/dashboard/admins");
    const isOnLoginPage = request.nextUrl.pathname === "/login";

    if (isOnDashboard) {
      if (!user)
        return NextResponse.redirect(new URL("/login", request.nextUrl));
      if (isOnAdminArea && !user.isAdmin)
        return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
      return response;
    } else if (user && isOnLoginPage) {
      // If user is authenticated and trying to access login page, redirect to dashboard
      console.log("Middleware: User already authenticated, redirecting to dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }
  } catch (error) {
    console.error("Middleware authentication error:", error);
    // If authentication fails, allow the request to proceed
    return response;
  }
}

export const config = {
  /*
   * Match all request paths except for the ones starting with
   */
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|auth).*)"],
};