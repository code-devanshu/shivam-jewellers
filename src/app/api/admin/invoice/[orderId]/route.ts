import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { generateInvoicePDF, type InvoiceData } from "@/lib/invoice-pdf";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (!verifyAdminSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await params;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: { orderBy: { createdAt: "asc" } },
      address: true,
      customer: true,
      invoice: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!order.invoice) {
    return NextResponse.json({ error: "Invoice not available" }, { status: 404 });
  }

  const deliveryAddress = order.address
    ? {
        name: order.address.name,
        phone: order.address.phone,
        line1: order.address.line1,
        line2: order.address.line2 ?? undefined,
        city: order.address.city,
        state: order.address.state,
        pincode: order.address.pincode,
      }
    : null;

  const invoiceData: InvoiceData = {
    invoiceNumber: order.invoice.invoiceNumber,
    orderNumber: order.orderNumber,
    orderDate: order.createdAt,
    customer: order.customer,
    deliveryAddress,
    deliveryType: order.deliveryType as "HOME_DELIVERY" | "STORE_PICKUP",
    items: order.items.map((item) => ({
      productName: item.productName,
      variantLabel: item.variantLabel,
      metalName: item.metalName,
      purity: item.purity,
      weightGrams: Number(item.weightGrams),
      metalRate: item.metalRate ? Number(item.metalRate) : null,
      makingCharge: item.makingCharge ? Number(item.makingCharge) : null,
      makingChargeType: item.makingChargeType as "PERCENT" | "FIXED" | null,
      gstPercent: item.gstPercent ? Number(item.gstPercent) : null,
      additionalPrice: item.additionalPrice ? Number(item.additionalPrice) : null,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
    })),
    subtotal: Number(order.subtotal),
    gstAmount: Number(order.gstAmount),
    totalAmount: Number(order.totalAmount),
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    notes: order.notes,
  };

  const pdfBuffer = await generateInvoicePDF(invoiceData);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
