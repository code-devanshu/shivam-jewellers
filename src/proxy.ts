import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

function verifyToken(cookieValue: string): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !cookieValue) return false;
  const expected = createHmac("sha256", secret).update("shivam-admin-v1").digest("hex");
  if (cookieValue.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(cookieValue), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (!path.startsWith("/admin")) return NextResponse.next();
  if (path === "/admin/login") return NextResponse.next();

  const session = request.cookies.get("admin_session")?.value ?? "";
  if (!verifyToken(session)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
