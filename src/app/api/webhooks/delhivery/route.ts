import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mapDelhiveryStatus, parseDelhiveryWebhookPayload } from "@/lib/delhivery";
import { applyShipmentStatus } from "@/lib/shipment-sync";

// NOTE: Auth uses a shared-secret query param since Delhivery has no publicly
// documented HMAC signing scheme comparable to Razorpay's. Confirm with Delhivery's
// partner dashboard/account manager whether a header-based scheme or source-IP
// allowlisting is available, and get a real sample payload to verify
// parseDelhiveryWebhookPayload() against before going live.
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.DELHIVERY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = body ? parseDelhiveryWebhookPayload(body) : null;
  if (!parsed) {
    // Ack anyway — an unparsable payload shouldn't trigger Delhivery retry storms.
    return NextResponse.json({ ok: true });
  }

  const shipment = await db.shipment.findUnique({ where: { waybill: parsed.waybill } });
  if (!shipment) {
    console.warn("[delhivery-webhook] Unknown waybill:", parsed.waybill);
    return NextResponse.json({ ok: true });
  }

  const status = mapDelhiveryStatus(parsed.rawStatus);

  // Idempotent against Delhivery retries via the @@unique([shipmentId, status, scannedAt]) constraint.
  await db.shipmentEvent.upsert({
    where: {
      shipmentId_status_scannedAt: {
        shipmentId: shipment.id,
        status,
        scannedAt: parsed.scannedAt,
      },
    },
    update: {},
    create: {
      shipmentId: shipment.id,
      status,
      statusType: parsed.statusType,
      instructions: parsed.instructions,
      location: parsed.location,
      scannedAt: parsed.scannedAt,
      rawPayload: body as object,
    },
  });

  await applyShipmentStatus(shipment.id, status, parsed.rawStatus, parsed.scannedAt);

  return NextResponse.json({ ok: true });
}
