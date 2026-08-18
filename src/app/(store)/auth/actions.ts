"use server";

import { randomInt, timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { setCustomerSession, clearCustomerSession } from "@/lib/customer-auth";
import { isValidIndianPhone, normalizePhone } from "@/lib/phone";
import { sendPhoneOtp } from "@/lib/otp-dispatch";

const MAX_ATTEMPTS = 5;

function codesMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

// Dev-only escape hatch while WhatsApp/MSG91 template approvals are pending — see
// tech_phone_otp_migration memory. Requires an explicit opt-in env var AND non-production
// so it can never activate accidentally in prod.
const OTP_DEV_BYPASS =
  process.env.NODE_ENV !== "production" && process.env.OTP_DEV_BYPASS === "true";

export async function sendOtp(
  rawPhone: string,
): Promise<{ error: string } | { ok: true; devCode?: string }> {
  if (!isValidIndianPhone(rawPhone)) {
    return { error: "Enter a valid 10-digit phone number." };
  }
  const phone = normalizePhone(rawPhone);

  // 60-second cooldown to prevent abuse
  const recent = await db.customerOtp.findFirst({
    where: { phone, createdAt: { gt: new Date(Date.now() - 60_000) } },
  });
  if (recent) return { error: "Please wait 60 seconds before requesting another OTP." };

  const code = String(randomInt(100000, 999999));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.customerOtp.deleteMany({ where: { phone } });
  await db.customerOtp.create({ data: { phone, code, expiresAt } });

  if (OTP_DEV_BYPASS) {
    console.log(`[otp-dev-bypass] ${phone} -> ${code}`);
    return { ok: true, devCode: code };
  }

  try {
    await sendPhoneOtp(phone, code);
  } catch (err) {
    console.error("[sendOtp] failed to dispatch OTP:", err);
    await db.customerOtp.deleteMany({ where: { phone } });
    return { error: "Couldn't send OTP. Please try again." };
  }

  return { ok: true };
}

export async function verifyOtp(
  rawPhone: string,
  code: string,
  next = "/",
): Promise<{ error: string } | never> {
  if (!isValidIndianPhone(rawPhone)) {
    return { error: "Invalid phone number." };
  }
  const phone = normalizePhone(rawPhone);

  const record = await db.customerOtp.findFirst({
    where: { phone },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return { error: "No OTP found. Please request a new one." };
  if (new Date() > record.expiresAt) {
    await db.customerOtp.delete({ where: { id: record.id } });
    return { error: "OTP has expired. Please request a new one." };
  }

  if (!codesMatch(record.code, code)) {
    const attempts = record.attempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      await db.customerOtp.delete({ where: { id: record.id } });
      return { error: "Too many incorrect attempts. Please request a new OTP." };
    }
    await db.customerOtp.update({ where: { id: record.id }, data: { attempts } });
    return { error: "Incorrect OTP. Please try again." };
  }

  await db.customerOtp.delete({ where: { id: record.id } });

  const customer = await db.customer.upsert({
    where: { phone },
    update: {},
    create: { phone },
  });

  await setCustomerSession(customer.id);
  redirect(next);
}

export async function signOutCustomer(): Promise<void> {
  await clearCustomerSession();
  redirect("/");
}
