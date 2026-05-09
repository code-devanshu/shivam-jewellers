"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { db } from "@/lib/db";
import { setCustomerSession, clearCustomerSession } from "@/lib/customer-auth";

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

  await db.customer.upsert({
    where: { id: user.id },
    update: { email: user.email ?? null },
    create: { id: user.id, email: user.email ?? null },
  });

  await setCustomerSession(user.id);
  redirect(next);
}

export async function signOutCustomer(): Promise<void> {
  await clearCustomerSession();
  redirect("/");
}
