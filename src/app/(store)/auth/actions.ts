"use server";

import { createHash } from "crypto";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { db } from "@/lib/db";
import { setCustomerSession, clearCustomerSession } from "@/lib/customer-auth";

const BYPASS_EMAILS = [
  "admin.devanshu@shivamjewellers.com",
  "admin.vaibhav@shivamjewellers.com",
];

function emailToId(email: string): string {
  const h = createHash("sha256").update(email).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
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

export async function createCustomerSession(
  accessToken: string,
  next = "/"
): Promise<{ error: string } | never> {
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (error || !user) {
    return { error: "Could not verify your session. Please try again." };
  }

  let customerId = user.id;

  try {
    await db.customer.upsert({
      where: { id: user.id },
      update: {
        phone: user.phone || null,
        email: user.email || null,
      },
      create: {
        id: user.id,
        phone: user.phone || null,
        email: user.email || null,
      },
    });
  } catch (e: any) {
    // Phone already claimed by a different Supabase identity — find that customer
    // and use their record so the same person doesn't get two accounts.
    if (e.code === "P2002" && e.meta?.target?.includes("phone") && user.phone) {
      const existing = await db.customer.findUnique({
        where: { phone: user.phone },
      });
      if (!existing) throw e;
      await db.customer.update({
        where: { id: existing.id },
        data: { email: user.email ?? null },
      });
      customerId = existing.id;
    } else {
      throw e;
    }
  }

  await setCustomerSession(customerId);
  redirect(next);
}

export async function signOutCustomer(): Promise<void> {
  await clearCustomerSession();
  redirect("/");
}
