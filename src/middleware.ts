import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  // Get user authentication token
  const token = await getToken({
    req: req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = req.nextUrl;

  // If the user is logged in (token exists)
  if (token) {
    // Redirect from /admin to /admin/dashboard
    if (pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }

    // Allow access to all other /admin/* routes
    if (pathname.startsWith("/admin")) {
      return NextResponse.next();
    }
  }

  // If the user is not logged in
  if (!token) {
    // Allow access to /admin/login
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    // Redirect all other /admin/* routes to /admin/login
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // Allow all other routes to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
