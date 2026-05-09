"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-auth";
import {
  upsertCartItem,
  deleteCartItem,
  setCartItemQty,
} from "@/lib/customer-store";

export async function addToCart(
  productId: string,
  variantId: string | null
): Promise<void> {
  const customerId = await getCustomerSession();
  if (!customerId) redirect("/auth");
  await upsertCartItem(customerId, productId, variantId, 1);
  revalidatePath("/cart");
}

export async function removeFromCart(itemId: string): Promise<void> {
  const customerId = await getCustomerSession();
  if (!customerId) return;
  await deleteCartItem(customerId, itemId);
  revalidatePath("/cart");
}

export async function updateCartQty(itemId: string, qty: number): Promise<void> {
  const customerId = await getCustomerSession();
  if (!customerId) return;
  await setCartItemQty(customerId, itemId, qty);
  revalidatePath("/cart");
}
