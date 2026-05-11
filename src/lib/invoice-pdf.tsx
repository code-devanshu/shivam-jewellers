import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

const C = {
  roseGold: "#b5724a",
  brown: "#5c3d2e",
  brownLight: "#7a5140",
  cream: "#fdf6f0",
  blush: "#f0ddd4",
  gray: "#6b7280",
  grayLight: "#e5e7eb",
  black: "#111827",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: C.black,
    backgroundColor: "#ffffff",
    paddingHorizontal: 40,
    paddingVertical: 36,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: C.roseGold,
  },
  storeName: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: C.roseGold,
    letterSpacing: 1,
  },
  storeTagline: {
    fontSize: 8,
    color: C.brownLight,
    marginTop: 2,
  },
  storeContact: {
    fontSize: 8,
    color: C.gray,
    marginTop: 1,
  },
  invoiceLabel: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: C.brown,
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 10,
    color: C.gray,
    textAlign: "right",
    marginTop: 2,
  },

  // ── Meta grid (billing + order info) ────────────────────────────────────────
  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  metaBox: {
    flex: 1,
    backgroundColor: C.cream,
    borderRadius: 4,
    padding: 10,
    borderWidth: 1,
    borderColor: C.blush,
  },
  metaBoxTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: C.roseGold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  metaLine: {
    fontSize: 8.5,
    color: C.brown,
    marginBottom: 2,
  },
  metaLineGray: {
    fontSize: 8,
    color: C.gray,
    marginBottom: 2,
  },

  // ── Table ────────────────────────────────────────────────────────────────────
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.roseGold,
    borderRadius: 3,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.grayLight,
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  tableCell: {
    fontSize: 8.5,
    color: C.brown,
  },
  tableCellGray: {
    fontSize: 7.5,
    color: C.gray,
    marginTop: 1,
  },

  colItem: { flex: 4 },
  colQty: { flex: 1, textAlign: "center" },
  colRate: { flex: 2, textAlign: "right" },
  colAmount: { flex: 2, textAlign: "right" },

  // ── Totals ───────────────────────────────────────────────────────────────────
  totalsSection: {
    marginTop: 12,
    alignItems: "flex-end",
  },
  totalsBox: {
    width: 220,
    borderWidth: 1,
    borderColor: C.blush,
    borderRadius: 4,
    overflow: "hidden",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.grayLight,
  },
  totalsRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: C.cream,
  },
  totalsLabel: { fontSize: 8.5, color: C.gray },
  totalsValue: { fontSize: 8.5, color: C.brown, fontFamily: "Helvetica-Bold" },
  totalsFinalLabel: { fontSize: 10, color: C.brown, fontFamily: "Helvetica-Bold" },
  totalsFinalValue: { fontSize: 10, color: C.roseGold, fontFamily: "Helvetica-Bold" },

  // ── Payment + Notes ──────────────────────────────────────────────────────────
  infoRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 16,
  },
  infoBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.blush,
    borderRadius: 4,
    padding: 9,
  },
  infoTitle: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: C.roseGold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  infoText: { fontSize: 8.5, color: C.brown },
  infoTextGray: { fontSize: 8, color: C.gray, marginTop: 1 },

  // ── Footer ───────────────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: C.blush,
    paddingTop: 8,
  },
  footerText: { fontSize: 7.5, color: C.gray },
  footerBrand: { fontSize: 7.5, color: C.roseGold, fontFamily: "Helvetica-Bold" },
});

function fmt(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export type InvoiceData = {
  invoiceNumber: string;
  orderNumber: string;
  orderDate: Date | string;
  customer: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  deliveryAddress?: {
    name: string;
    phone: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    pincode: string;
  } | null;
  deliveryType: "HOME_DELIVERY" | "STORE_PICKUP";
  items: {
    productName: string;
    variantLabel?: string | null;
    metalName: string;
    purity: string;
    weightGrams: number;
    metalRate?: number | null;
    makingCharge?: number | null;
    makingChargeType?: "PERCENT" | "FIXED" | null;
    gstPercent?: number | null;
    additionalPrice?: number | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  paymentMethod?: string | null;
  paymentStatus: string;
  notes?: string | null;
};

function InvoiceDocument({ data }: { data: InvoiceData }) {
  const addressLines = data.deliveryAddress
    ? [
        data.deliveryAddress.line1,
        data.deliveryAddress.line2,
        `${data.deliveryAddress.city}, ${data.deliveryAddress.state} – ${data.deliveryAddress.pincode}`,
      ].filter(Boolean)
    : [];

  return (
    <Document title={`Invoice ${data.invoiceNumber}`} author="Shivam Jewellers">
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.storeName}>SHIVAM JEWELLERS</Text>
            <Text style={styles.storeTagline}>BIS Hallmark Certified · Est. Since 1985</Text>
            <Text style={styles.storeContact}>
              {process.env.STORE_ADDRESS ?? "Contact us for store address"}
            </Text>
          </View>
          <View>
            <Text style={styles.invoiceLabel}>TAX INVOICE</Text>
            <Text style={styles.invoiceNumber}># {data.invoiceNumber}</Text>
            <Text style={[styles.invoiceNumber, { marginTop: 4 }]}>
              Date: {fmtDate(data.orderDate)}
            </Text>
            <Text style={styles.invoiceNumber}>Order: {data.orderNumber}</Text>
          </View>
        </View>

        {/* ── Meta grid ── */}
        <View style={styles.metaRow}>
          <View style={styles.metaBox}>
            <Text style={styles.metaBoxTitle}>Bill To</Text>
            {data.customer.name ? (
              <Text style={styles.metaLine}>{data.customer.name}</Text>
            ) : null}
            {data.customer.email ? (
              <Text style={styles.metaLineGray}>{data.customer.email}</Text>
            ) : null}
            {data.customer.phone ? (
              <Text style={styles.metaLineGray}>{data.customer.phone}</Text>
            ) : null}
          </View>

          <View style={styles.metaBox}>
            <Text style={styles.metaBoxTitle}>
              {data.deliveryType === "STORE_PICKUP" ? "Store Pickup" : "Ship To"}
            </Text>
            {data.deliveryType === "STORE_PICKUP" ? (
              <Text style={styles.metaLine}>In-store pickup</Text>
            ) : addressLines.length > 0 ? (
              <>
                {data.deliveryAddress?.name ? (
                  <Text style={styles.metaLine}>{data.deliveryAddress.name}</Text>
                ) : null}
                {data.deliveryAddress?.phone ? (
                  <Text style={styles.metaLineGray}>{data.deliveryAddress.phone}</Text>
                ) : null}
                {addressLines.map((line, i) => (
                  <Text key={i} style={styles.metaLineGray}>
                    {line}
                  </Text>
                ))}
              </>
            ) : (
              <Text style={styles.metaLineGray}>—</Text>
            )}
          </View>
        </View>

        {/* ── Items table ── */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.colItem]}>Item</Text>
          <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
          <Text style={[styles.tableHeaderCell, styles.colRate]}>Unit Price</Text>
          <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
        </View>

        {data.items.map((item, i) => {
          const sub: string[] = [];
          if (item.metalRate) {
            sub.push(`${item.metalName} ${item.purity} · ${item.weightGrams}g @ ${fmt(item.metalRate)}/g`);
          }
          if (item.makingCharge) {
            const mc =
              item.makingChargeType === "PERCENT"
                ? `Making ${item.makingCharge}%`
                : `Making ₹${item.makingCharge}`;
            sub.push(mc);
          }
          if (item.gstPercent) sub.push(`GST ${item.gstPercent}%`);
          if (item.variantLabel) sub.unshift(item.variantLabel);

          return (
            <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
              <View style={styles.colItem}>
                <Text style={styles.tableCell}>{item.productName}</Text>
                {sub.map((s, j) => (
                  <Text key={j} style={styles.tableCellGray}>
                    {s}
                  </Text>
                ))}
              </View>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colRate]}>{fmt(item.unitPrice)}</Text>
              <Text style={[styles.tableCell, styles.colAmount]}>{fmt(item.totalPrice)}</Text>
            </View>
          );
        })}

        {/* ── Totals ── */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal (excl. GST)</Text>
              <Text style={styles.totalsValue}>{fmt(data.subtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>GST</Text>
              <Text style={styles.totalsValue}>{fmt(data.gstAmount)}</Text>
            </View>
            <View style={styles.totalsRowFinal}>
              <Text style={styles.totalsFinalLabel}>Total</Text>
              <Text style={styles.totalsFinalValue}>{fmt(data.totalAmount)}</Text>
            </View>
          </View>
        </View>

        {/* ── Payment + Notes ── */}
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Payment</Text>
            <Text style={styles.infoText}>
              {data.paymentMethod === "COD"
                ? "Cash on Delivery"
                : data.paymentMethod === "RAZORPAY"
                ? "Paid Online (Razorpay)"
                : data.paymentMethod ?? "—"}
            </Text>
            <Text style={styles.infoTextGray}>Status: {data.paymentStatus}</Text>
          </View>
          {data.notes ? (
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Notes</Text>
              <Text style={styles.infoText}>{data.notes}</Text>
            </View>
          ) : (
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Terms</Text>
              <Text style={styles.infoTextGray}>
                All sales are final. Exchange/return subject to store policy.
              </Text>
            </View>
          )}
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            This is a computer-generated invoice. No signature required.
          </Text>
          <Text style={styles.footerBrand}>SHIVAM JEWELLERS</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  const buffer = await renderToBuffer(<InvoiceDocument data={data} />);
  return Buffer.from(buffer);
}

// ─── Bill Invoice ─────────────────────────────────────────────────────────────

export type BillInvoiceData = {
  billNumber: string;
  billDate: Date | string;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  storeSettings?: {
    storeName?: string | null;
    storeAddress?: string | null;
    gstin?: string | null;
  } | null;
  items: {
    productName: string;
    variantLabel?: string | null;
    metalName?: string | null;
    purity?: string | null;
    weightGrams?: number | null;
    metalRate?: number | null;
    hsnCode?: string | null;
    gstPercent?: number | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  payments: { amount: number; method: string; paidAt: Date | string; note?: string | null }[];
  notes?: string | null;
};

function BillInvoiceDocument({ data }: { data: BillInvoiceData }) {
  const storeName = data.storeSettings?.storeName ?? "SHIVAM JEWELLERS";
  const storeAddress = data.storeSettings?.storeAddress ?? (process.env.STORE_ADDRESS ?? "");
  const gstin = data.storeSettings?.gstin ?? (process.env.STORE_GSTIN ?? "");

  return (
    <Document title={`Bill ${data.billNumber}`} author={storeName}>
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.storeName}>{storeName.toUpperCase()}</Text>
            <Text style={styles.storeTagline}>BIS Hallmark Certified · Est. Since 1985</Text>
            {storeAddress ? (
              <Text style={styles.storeContact}>{storeAddress}</Text>
            ) : null}
            {gstin ? (
              <Text style={[styles.storeContact, { marginTop: 2 }]}>GSTIN: {gstin}</Text>
            ) : null}
          </View>
          <View>
            <Text style={styles.invoiceLabel}>TAX INVOICE</Text>
            <Text style={styles.invoiceNumber}># {data.billNumber}</Text>
            <Text style={[styles.invoiceNumber, { marginTop: 4 }]}>
              Date: {fmtDate(data.billDate)}
            </Text>
            <Text style={[styles.invoiceNumber, { marginTop: 2 }]}>Walk-in / Counter Sale</Text>
          </View>
        </View>

        {/* ── Customer ── */}
        <View style={styles.metaRow}>
          <View style={styles.metaBox}>
            <Text style={styles.metaBoxTitle}>Bill To</Text>
            {data.customerName ? (
              <Text style={styles.metaLine}>{data.customerName}</Text>
            ) : (
              <Text style={styles.metaLine}>Walk-in Customer</Text>
            )}
            {data.customerPhone ? (
              <Text style={styles.metaLineGray}>{data.customerPhone}</Text>
            ) : null}
            {data.customerEmail ? (
              <Text style={styles.metaLineGray}>{data.customerEmail}</Text>
            ) : null}
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaBoxTitle}>Payment Summary</Text>
            <Text style={styles.metaLine}>Total: {fmt(data.totalAmount)}</Text>
            <Text style={[styles.metaLineGray, { color: "#16a34a" }]}>
              Paid: {fmt(data.amountPaid)}
            </Text>
            {data.balanceDue > 0 ? (
              <Text style={[styles.metaLineGray, { color: "#dc2626" }]}>
                Balance Due: {fmt(data.balanceDue)}
              </Text>
            ) : (
              <Text style={[styles.metaLineGray, { color: "#16a34a" }]}>Fully Paid</Text>
            )}
          </View>
        </View>

        {/* ── Items table ── */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 4 }]}>Item</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: "center" }]}>HSN</Text>
          <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "center" }]}>Qty</Text>
          <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: "right" }]}>Unit Price</Text>
          <Text style={[styles.tableHeaderCell, { flex: 2, textAlign: "right" }]}>Amount</Text>
        </View>

        {data.items.map((item, i) => {
          const sub: string[] = [];
          if (item.metalName) {
            const metalLine = [
              item.metalName,
              item.purity,
              item.weightGrams && `${item.weightGrams}g`,
              item.metalRate && `@ ${fmt(item.metalRate)}/g`,
            ].filter(Boolean).join(" · ");
            sub.push(metalLine);
          }
          if (item.gstPercent) sub.push(`GST ${item.gstPercent}%`);
          if (item.variantLabel) sub.unshift(item.variantLabel);

          return (
            <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
              <View style={{ flex: 4 }}>
                <Text style={styles.tableCell}>{item.productName}</Text>
                {sub.map((s, j) => (
                  <Text key={j} style={styles.tableCellGray}>{s}</Text>
                ))}
              </View>
              <Text style={[styles.tableCell, { flex: 1.5, textAlign: "center" }]}>
                {item.hsnCode ?? "—"}
              </Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: "center" }]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, { flex: 2, textAlign: "right" }]}>{fmt(item.unitPrice)}</Text>
              <Text style={[styles.tableCell, { flex: 2, textAlign: "right" }]}>{fmt(item.totalPrice * item.quantity)}</Text>
            </View>
          );
        })}

        {/* ── Totals ── */}
        <View style={styles.totalsSection}>
          <View style={[styles.totalsBox, { width: 260 }]}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal (excl. GST)</Text>
              <Text style={styles.totalsValue}>{fmt(data.subtotal)}</Text>
            </View>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>GST</Text>
              <Text style={styles.totalsValue}>{fmt(data.gstAmount)}</Text>
            </View>
            <View style={styles.totalsRowFinal}>
              <Text style={styles.totalsFinalLabel}>Total</Text>
              <Text style={styles.totalsFinalValue}>{fmt(data.totalAmount)}</Text>
            </View>
            {data.amountPaid > 0 && (
              <>
                <View style={[styles.totalsRow, { backgroundColor: "#f0fdf4" }]}>
                  <Text style={[styles.totalsLabel, { color: "#16a34a" }]}>Amount Paid</Text>
                  <Text style={[styles.totalsValue, { color: "#16a34a" }]}>{fmt(data.amountPaid)}</Text>
                </View>
                {data.balanceDue > 0 && (
                  <View style={[styles.totalsRow, { backgroundColor: "#fef2f2" }]}>
                    <Text style={[styles.totalsLabel, { color: "#dc2626" }]}>Balance Due</Text>
                    <Text style={[styles.totalsValue, { color: "#dc2626" }]}>{fmt(data.balanceDue)}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* ── Payment history + Notes ── */}
        <View style={styles.infoRow}>
          <View style={[styles.infoBox, { flex: 2 }]}>
            <Text style={styles.infoTitle}>Payment History</Text>
            {data.payments.length === 0 ? (
              <Text style={styles.infoTextGray}>No payments recorded.</Text>
            ) : (
              data.payments.map((p, i) => (
                <Text key={i} style={[styles.infoTextGray, { marginBottom: 2 }]}>
                  {fmt(p.amount)} via {p.method} · {fmtDate(p.paidAt)}
                  {p.note ? ` (${p.note})` : ""}
                </Text>
              ))
            )}
          </View>
          {data.notes ? (
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Notes</Text>
              <Text style={styles.infoText}>{data.notes}</Text>
            </View>
          ) : (
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Terms</Text>
              <Text style={styles.infoTextGray}>
                All sales are final. Exchange/return subject to store policy.
              </Text>
            </View>
          )}
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            This is a computer-generated invoice. No signature required.
          </Text>
          <Text style={styles.footerBrand}>SHIVAM JEWELLERS</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateBillInvoicePDF(data: BillInvoiceData): Promise<Buffer> {
  const buffer = await renderToBuffer(<BillInvoiceDocument data={data} />);
  return Buffer.from(buffer);
}
