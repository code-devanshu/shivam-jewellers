import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SECRET = process.env.CUSTOMER_SESSION_SECRET ?? "fallback-secret";
const COOKIE = "cust_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function sign(id: string): string {
  const mac = createHmac("sha256", SECRET).update(id).digest("hex");
  return `${id}:${mac}`;
}

function verifyAndExtract(value: string): string | null {
  const sep = value.lastIndexOf(":");
  if (sep === -1) return null;
  const id = value.slice(0, sep);
  const mac = value.slice(sep + 1);
  const expected = createHmac("sha256", SECRET).update(id).digest("hex");
  try {
    const a = Buffer.from(mac, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return id;
}

export async function getCustomerSession(): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  return verifyAndExtract(raw);
}

export async function setCustomerSession(customerId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, sign(customerId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearCustomerSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function requireCustomer(next?: string): Promise<string> {
  const id = await getCustomerSession();
  if (!id) {
    const param = next ? `?next=${encodeURIComponent(next)}` : "";
    redirect(`/auth${param}`);
  }
  return id;
}
