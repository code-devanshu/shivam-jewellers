"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { storeSetRateOverride, storeClearRateOverride } from "@/lib/admin-store";

export type RateFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function overrideRates(
  _prev: RateFormState,
  formData: FormData
): Promise<RateFormState> {
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
  await storeClearRateOverride("metal-gold");
  await storeClearRateOverride("metal-silver");
  revalidateTag("rates", "max");
  revalidatePath("/admin");
  revalidatePath("/admin/rates");
  revalidatePath("/");
}
