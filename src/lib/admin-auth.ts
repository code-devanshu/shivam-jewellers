import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_MSG = "shivam-admin-v1";

export function deriveAdminToken(secret: string): string {
  return createHmac("sha256", secret).update(TOKEN_MSG).digest("hex");
}

export function verifyAdminSession(cookieValue: string | undefined): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !cookieValue) return false;
  const expected = deriveAdminToken(secret);
  if (cookieValue.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(cookieValue), Buffer.from(expected));
  } catch {
    return false;
  }
}
