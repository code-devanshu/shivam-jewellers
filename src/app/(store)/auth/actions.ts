"use server";

import { createHash, randomInt } from "crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { setCustomerSession, clearCustomerSession } from "@/lib/customer-auth";
import { sendOtpEmail } from "@/lib/resend";

const BYPASS_EMAILS = [
  "admin.devanshu@shivamjewellers.com",
  "admin.vaibhav@shivamjewellers.com",
];

function emailToId(email: string): string {
  const h = createHash("sha256").update(email).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim());
}

export async function bypassLogin(
  email: string,
  next = "/"
): Promise<{ error: string } | never> {
  const normalized = email.toLowerCase().trim();
  if (!BYPASS_EMAILS.includes(normalized)) {
    return { error: "Not authorized." };
  }
  const customerId = emailToId(normalized);
  await db.customer.upsert({
    where: { id: customerId },
    update: { email: normalized },
    create: { id: customerId, email: normalized },
  });
  await setCustomerSession(customerId);
  redirect(next);
}

export async function sendOtp(
  rawEmail: string,
): Promise<{ error: string } | { ok: true }> {
  const email = rawEmail.trim().toLowerCase();
  if (!isValidEmail(email)) return { error: "Enter a valid email address." };

  // 60-second cooldown to prevent abuse
  const recent = await db.customerOtp.findFirst({
    where: { email, createdAt: { gt: new Date(Date.now() - 60_000) } },
  });
  if (recent) return { error: "Please wait 60 seconds before requesting another OTP." };

  const code = String(randomInt(100000, 999999));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.customerOtp.deleteMany({ where: { email } });
  await db.customerOtp.create({ data: { email, code, expiresAt } });
  await sendOtpEmail(email, code);

  return { ok: true };
}

export async function verifyOtp(
  rawEmail: string,
  code: string,
  next = "/",
): Promise<{ error: string } | never> {
  const email = rawEmail.trim().toLowerCase();
  if (!isValidEmail(email)) return { error: "Invalid email address." };

  const record = await db.customerOtp.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return { error: "No OTP found. Please request a new one." };
  if (new Date() > record.expiresAt) {
    await db.customerOtp.delete({ where: { id: record.id } });
    return { error: "OTP has expired. Please request a new one." };
  }
  if (record.code !== code) return { error: "Incorrect OTP. Please try again." };

  await db.customerOtp.delete({ where: { id: record.id } });

  const customer = await db.customer.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  await setCustomerSession(customer.id);
  redirect(next);
}

export async function signOutCustomer(): Promise<void> {
  await clearCustomerSession();
  redirect("/");
}
