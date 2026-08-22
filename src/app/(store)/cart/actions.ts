"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/customer-auth";
import {
  upsertCartItem,
  deleteCartItem,
  setCartItemQty,
  clearCart,
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

// Re-adds a just-removed item for the cart's "Undo" toast. Uses the same
// upsert as addToCart, so it merges back into an item that was re-added in
// the meantime instead of creating a duplicate row.
export async function restoreCartItem(
  productId: string,
  variantId: string | null,
  quantity: number
): Promise<void> {
  const customerId = await getCustomerSession();
  if (!customerId) return;
  await upsertCartItem(customerId, productId, variantId, quantity);
  revalidatePath("/cart");
}

export async function updateCartQty(itemId: string, qty: number): Promise<void> {
  const customerId = await getCustomerSession();
  if (!customerId) return;
  await setCartItemQty(customerId, itemId, qty);
  revalidatePath("/cart");
}

export async function clearCartAction(): Promise<void> {
  const customerId = await getCustomerSession();
  if (!customerId) return;
  await clearCart(customerId);
  revalidatePath("/cart");
}
