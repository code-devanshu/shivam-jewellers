"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { verifyAdminSession } from "@/lib/admin-auth";
import { storeSetRateOverride, storeClearRateOverride } from "@/lib/admin-store";

export type RateFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  return verifyAdminSession(session);
}

export async function overrideRates(
  _prev: RateFormState,
  formData: FormData
): Promise<RateFormState> {
  if (!(await requireAdmin())) return { status: "error", message: "Unauthorized" };

  const goldStr = formData.get("gold") as string;
  const silverStr = formData.get("silver") as string;

  const gold = parseFloat(goldStr);
  const silver = parseFloat(silverStr);

  if (goldStr && isNaN(gold)) return { status: "error", message: "Invalid gold rate." };
  if (silverStr && isNaN(silver)) return { status: "error", message: "Invalid silver rate." };

  if (goldStr) await storeSetRateOverride("metal-gold", gold / 10);
  if (silverStr) await storeSetRateOverride("metal-silver", silver / 10);

  revalidateTag("rates", "max");
  revalidatePath("/admin");
  revalidatePath("/admin/rates");
  revalidatePath("/");

  return { status: "success", message: "Rates updated. The banner will reflect the new rates." };
}

export async function clearRateOverrides(): Promise<void> {
  if (!(await requireAdmin())) return;
  await storeClearRateOverride("metal-gold");
  await storeClearRateOverride("metal-silver");
  revalidateTag("rates", "max");
  revalidatePath("/admin");
  revalidatePath("/admin/rates");
  revalidatePath("/");
}
