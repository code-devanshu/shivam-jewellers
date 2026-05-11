"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { deriveAdminToken } from "@/lib/admin-auth";

export type LoginFormState =
  | { status: "idle" }
  | { status: "error"; message: string };

// ── In-memory rate limiter ────────────────────────────────────────────────────
type RateEntry = { failures: number; windowStart: number; lockedUntil: number };
const rateMap = new Map<string, RateEntry>();
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;

function isLocked(ip: string): string | null {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry) return null;
  if (entry.lockedUntil > now) {
    const mins = Math.ceil((entry.lockedUntil - now) / 60000);
    return `Too many failed attempts. Try again in ${mins} minute${mins !== 1 ? "s" : ""}.`;
  }
  if (now - entry.windowStart > WINDOW_MS) {
    rateMap.delete(ip);
    return null;
  }
  return null;
}

function recordFailure(ip: string): void {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateMap.set(ip, { failures: 1, windowStart: now, lockedUntil: 0 });
    return;
  }
  entry.failures++;
  if (entry.failures >= MAX_FAILURES) {
    entry.lockedUntil = now + LOCKOUT_MS;
  }
  rateMap.set(ip, entry);
}

function clearFailures(ip: string): void {
  rateMap.delete(ip);
}

// ── Actions ───────────────────────────────────────────────────────────────────
export async function adminLogin(
  _prev: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    "unknown";

  const locked = isLocked(ip);
  if (locked) return { status: "error", message: locked };

  const username = (formData.get("username") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!adminUsername || !adminPassword || !sessionSecret) {
    return { status: "error", message: "Admin credentials are not configured on the server." };
  }

  if (username !== adminUsername || password !== adminPassword) {
    recordFailure(ip);
    return { status: "error", message: "Invalid credentials." };
  }

  clearFailures(ip);

  const cookieStore = await cookies();
  cookieStore.set("admin_session", deriveAdminToken(sessionSecret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/admin/login");
}
