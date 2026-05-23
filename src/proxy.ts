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
  // Force HTTPS in production (Vercel sets x-forwarded-proto)
  if (
    process.env.NODE_ENV === "production" &&
    request.headers.get("x-forwarded-proto") === "http"
  ) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    return NextResponse.redirect(url, { status: 301 });
  }

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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
