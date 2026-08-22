import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";
import { confirmRazorpayPayment } from "@/app/(store)/checkout/actions";

// Reconciliation safety net for the client-side verifyAndConfirmPayment action:
// if the browser closes or loses network right after a successful charge, this
// webhook still confirms the order server-side. confirmRazorpayPayment() is
// idempotent, so it's a no-op if the client already confirmed the order.
const HANDLED_EVENTS = new Set(["payment.captured", "order.paid"]);

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature || !verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event?: string; payload?: { payment?: { entity?: { order_id?: string; id?: string } } } };
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    console.error("[razorpay-webhook] Invalid JSON body:", err);
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!HANDLED_EVENTS.has(event.event ?? "")) {
    return NextResponse.json({ ok: true });
  }

  const payment = event.payload?.payment?.entity;
  if (!payment?.order_id || !payment?.id) {
    return NextResponse.json({ ok: true });
  }

  const order = await db.order.findFirst({
    where: { razorpayOrderId: payment.order_id },
    select: { id: true },
  });

  if (!order) {
    console.warn("[razorpay-webhook] Unknown razorpayOrderId:", payment.order_id);
    return NextResponse.json({ ok: true });
  }

  await confirmRazorpayPayment({ orderId: order.id, paymentId: payment.id });

  return NextResponse.json({ ok: true });
}
