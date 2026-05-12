"use server";

import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { OrderStatus } from "@prisma/client";
import { sendWhatsAppOrderUpdate } from "@/lib/whatsapp";

// Statuses that warrant a customer WhatsApp notification
const NOTIFY_STATUSES = new Set<OrderStatus>([
  "CONFIRMED",
  "PROCESSING",
  "READY_FOR_PICKUP",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string
): Promise<{ error?: string }> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (!verifyAdminSession(session)) return { error: "Unauthorized" };

  await db.$transaction([
    db.order.update({ where: { id: orderId }, data: { status } }),
    db.orderStatusHistory.create({
      data: { orderId, status, note: note?.trim() || undefined },
    }),
  ]);

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");

  if (NOTIFY_STATUSES.has(status)) {
    try {
      const order = await db.order.findUnique({
        where: { id: orderId },
        select: { orderNumber: true, customer: { select: { phone: true } } },
      });
      if (order?.customer?.phone) {
        await sendWhatsAppOrderUpdate(order.customer.phone, order.orderNumber, status);
      }
    } catch (err) {
      // Notification failure should never block the status update
      console.error("[whatsapp] Order notification failed:", err);
    }
  }

  return {};
}
