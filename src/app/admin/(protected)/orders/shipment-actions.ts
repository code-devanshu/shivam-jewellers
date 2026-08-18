"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { verifyAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { createShipment, cancelShipment, trackShipment, mapDelhiveryStatus } from "@/lib/delhivery";
import { sendWhatsAppOrderUpdate } from "@/lib/whatsapp";
import { applyShipmentStatus } from "@/lib/shipment-sync";

async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  return verifyAdminSession(session);
}

export async function createShipmentAction(
  orderId: string
): Promise<{ error?: string; waybill?: string }> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true, address: true, customer: true, shipment: true },
  });
  if (!order) return { error: "Order not found." };
  if (order.deliveryType !== "HOME_DELIVERY") {
    return { error: "Shipment creation only applies to home delivery orders." };
  }
  if (!order.address) return { error: "Order has no delivery address." };
  if (order.shipment) return { error: "A shipment already exists for this order." };
  if (!["CONFIRMED", "PROCESSING"].includes(order.status)) {
    return { error: "Order must be Confirmed or Processing before creating a shipment." };
  }

  const weightGrams = Math.max(
    Math.round(order.items.reduce((sum, i) => sum + Number(i.weightGrams) * i.quantity, 0)),
    Number(process.env.DELHIVERY_MIN_PACKAGE_WEIGHT_GRAMS ?? 100)
  );
  const [l, w, h] = (process.env.DELHIVERY_PACKAGE_DIMS_CM ?? "15x10x8")
    .split("x")
    .map(Number);

  let result;
  try {
    result = await createShipment({
      orderNumber: order.orderNumber,
      paymentMode: order.paymentMethod === "COD" ? "COD" : "Prepaid",
      codAmount: order.paymentMethod === "COD" ? Number(order.totalAmount) : 0,
      totalAmount: Number(order.totalAmount),
      weightGrams,
      dimensionsCm: { l, w, h },
      consignee: {
        name: order.address.name,
        phone: order.address.phone,
        line1: order.address.line1,
        line2: order.address.line2 ?? undefined,
        city: order.address.city,
        state: order.address.state,
        pincode: order.address.pincode,
      },
      productsDescription: "Jewellery",
    });
  } catch (err) {
    // Surfaced to the admin — this is an actionable button result, not a fire-and-forget notification.
    return { error: err instanceof Error ? err.message : "Delhivery shipment creation failed." };
  }

  await db.$transaction([
    db.shipment.create({
      data: {
        orderId: order.id,
        waybill: result.waybill,
        trackingUrl: result.trackingUrl,
        pickupLocation: process.env.DELHIVERY_PICKUP_LOCATION,
        weightGrams,
        dimensionsCm: `${l}x${w}x${h}`,
        rawCreateResponse: result.raw as object,
      },
    }),
    db.order.update({ where: { id: order.id }, data: { status: "SHIPPED" } }),
    db.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: "SHIPPED",
        note: `Shipment created via Delhivery — AWB ${result.waybill}`,
      },
    }),
  ]);

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");

  try {
    if (order.customer?.phone) {
      await sendWhatsAppOrderUpdate(order.customer.phone, order.orderNumber, "SHIPPED");
    }
  } catch (err) {
    // Notification failure should never block the shipment creation
    console.error("[whatsapp] Order notification failed:", err);
  }

  return { waybill: result.waybill };
}

// Manual backup to the webhook — pulls the latest status straight from Delhivery and
// applies it through the same applyShipmentStatus() path the webhook uses.
export async function refreshTrackingAction(shipmentId: string): Promise<{ error?: string }> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };

  const shipment = await db.shipment.findUnique({ where: { id: shipmentId } });
  if (!shipment) return { error: "Shipment not found." };

  let result;
  try {
    result = await trackShipment(shipment.waybill);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to fetch tracking." };
  }

  for (const scan of result.scans) {
    const scannedAt = new Date(scan.scannedAt);
    await db.shipmentEvent.upsert({
      where: {
        shipmentId_status_scannedAt: {
          shipmentId: shipment.id,
          status: mapDelhiveryStatus(scan.status),
          scannedAt,
        },
      },
      update: {},
      create: {
        shipmentId: shipment.id,
        status: mapDelhiveryStatus(scan.status),
        statusType: scan.statusType,
        instructions: scan.instructions,
        location: scan.location,
        scannedAt,
        rawPayload: result as unknown as object,
      },
    });
  }

  const latestScanAt = result.scans.length
    ? new Date(Math.max(...result.scans.map((s) => new Date(s.scannedAt).getTime())))
    : new Date();
  await applyShipmentStatus(
    shipment.id,
    mapDelhiveryStatus(result.currentStatus),
    result.currentStatus,
    latestScanAt,
  );

  revalidatePath(`/admin/orders/${shipment.orderId}`);
  revalidatePath("/admin/orders");

  return {};
}

export async function cancelShipmentAction(shipmentId: string): Promise<{ error?: string }> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };

  const shipment = await db.shipment.findUnique({ where: { id: shipmentId } });
  if (!shipment) return { error: "Shipment not found." };
  if (shipment.status === "CANCELLED" || shipment.status === "DELIVERED") {
    return { error: `Shipment is already ${shipment.status.toLowerCase()} — cannot cancel.` };
  }

  try {
    await cancelShipment(shipment.waybill);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Delhivery shipment cancellation failed." };
  }

  await db.$transaction([
    db.shipment.update({ where: { id: shipment.id }, data: { status: "CANCELLED" } }),
    db.order.update({ where: { id: shipment.orderId }, data: { status: "CANCELLED" } }),
    db.orderStatusHistory.create({
      data: {
        orderId: shipment.orderId,
        status: "CANCELLED",
        note: `Shipment cancelled via Delhivery — AWB ${shipment.waybill}`,
      },
    }),
  ]);

  revalidatePath(`/admin/orders/${shipment.orderId}`);
  revalidatePath("/admin/orders");

  return {};
}
