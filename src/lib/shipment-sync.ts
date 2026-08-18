import { db } from "@/lib/db";
import { sendWhatsAppOrderUpdate } from "@/lib/whatsapp";
import type { ShipmentStatus } from "@prisma/client";

const SHIPPED_STATES: ShipmentStatus[] = ["IN_TRANSIT", "DISPATCHED", "PICKED_UP"];
const TERMINAL_STATES: ShipmentStatus[] = ["DELIVERED", "RTO_DELIVERED", "LOST"];

// Shared by the Delhivery webhook and the manual "Refresh Tracking" admin action so
// the shipment/order status transition + notification logic can't drift between the two.
export async function applyShipmentStatus(
  shipmentId: string,
  status: ShipmentStatus,
  rawStatus: string,
  scannedAt: Date,
): Promise<void> {
  const shipment = await db.shipment.findUnique({ where: { id: shipmentId } });
  if (!shipment) return;

  await db.shipment.update({
    where: { id: shipmentId },
    data: {
      status,
      ...(status === "DELIVERED" ? { deliveredAt: scannedAt } : {}),
      ...(SHIPPED_STATES.includes(status) && !shipment.shippedAt ? { shippedAt: scannedAt } : {}),
    },
  });

  if (!TERMINAL_STATES.includes(status)) return;

  const newOrderStatus = status === "DELIVERED" ? "DELIVERED" : "CANCELLED";
  const order = await db.order.findUnique({
    where: { id: shipment.orderId },
    select: { id: true, orderNumber: true, status: true, customer: { select: { phone: true } } },
  });
  if (!order || order.status === newOrderStatus) return;

  await db.$transaction([
    db.order.update({ where: { id: order.id }, data: { status: newOrderStatus } }),
    db.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: newOrderStatus,
        note: `Delhivery: ${rawStatus} (AWB ${shipment.waybill})`,
      },
    }),
  ]);

  try {
    if (order.customer?.phone) {
      await sendWhatsAppOrderUpdate(order.customer.phone, order.orderNumber, newOrderStatus);
    }
  } catch (err) {
    console.error("[whatsapp] Delhivery-triggered notification failed:", err);
  }
}
