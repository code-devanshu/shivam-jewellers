import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSession } from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { generateBillInvoicePDF, type BillInvoiceData } from "@/lib/invoice-pdf";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ billId: string }> }
) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (!verifyAdminSession(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { billId } = await params;

  const [bill, storeSettings] = await Promise.all([
    db.bill.findUnique({
      where: { id: billId },
      include: {
        customer: true,
        items: { orderBy: { createdAt: "asc" } },
        payments: { orderBy: { paidAt: "asc" } },
      },
    }),
    db.storeSettings.findUnique({ where: { id: "singleton" } }),
  ]);

  if (!bill) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const invoiceData: BillInvoiceData = {
    storeSettings: storeSettings
      ? {
          storeName: storeSettings.storeName,
          storeAddress: storeSettings.storeAddress,
          gstin: storeSettings.gstin,
        }
      : null,
    billNumber: bill.billNumber,
    billDate: bill.createdAt,
    customerName: bill.customer?.name ?? bill.customerName,
    customerPhone: bill.customer?.phone ?? bill.customerPhone,
    customerEmail: bill.customer?.email ?? bill.customerEmail,
    items: bill.items.map((item) => ({
      productName: item.productName,
      variantLabel: item.variantLabel,
      metalName: item.metalName,
      purity: item.purity,
      weightGrams: item.weightGrams ? Number(item.weightGrams) : null,
      metalRate: item.metalRate ? Number(item.metalRate) : null,
      hsnCode: item.hsnCode,
      gstPercent: item.gstPercent ? Number(item.gstPercent) : null,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
    })),
    subtotal: Number(bill.subtotal),
    gstAmount: Number(bill.gstAmount),
    totalAmount: Number(bill.totalAmount),
    amountPaid: Number(bill.amountPaid),
    balanceDue: Number(bill.balanceDue),
    payments: bill.payments.map((p) => ({
      amount: Number(p.amount),
      method: p.method,
      paidAt: p.paidAt,
      note: p.note,
    })),
    notes: bill.notes,
  };

  const pdfBuffer = await generateBillInvoicePDF(invoiceData);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="bill-${bill.billNumber}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
