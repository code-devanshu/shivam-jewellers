"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Search,
  User,
  UserSearch,
  Package,
  PenLine,
  Loader2,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatPrice } from "@/lib/price";
import { createBill, searchCustomers, type BillItemInput } from "../actions";
import type { MakingChargeType } from "@prisma/client";

// ─── Constants ───────────────────────────────────────────────────────────────

const METALS = [
  { id: "metal-gold", name: "Gold" },
  { id: "metal-silver", name: "Silver" },
];

const PURITY_OPTIONS: Record<string, { label: string; value: string; purityPercent: number }[]> = {
  "metal-gold": [
    { label: "24K (99.9%)", value: "24K", purityPercent: 0.999 },
    { label: "22K (91.67%)", value: "22K", purityPercent: 0.9167 },
    { label: "18K (75%)", value: "18K", purityPercent: 0.75 },
    { label: "14K (58.5%)", value: "14K", purityPercent: 0.585 },
  ],
  "metal-silver": [
    { label: "999 (99.9%)", value: "999", purityPercent: 0.999 },
    { label: "925 (92.5%)", value: "925", purityPercent: 0.925 },
    { label: "800 (80%)", value: "800", purityPercent: 0.8 },
  ],
};

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman & Nicobar Islands", "Chandigarh",
  "Dadra & Nagar Haveli and Daman & Diu", "Delhi",
  "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

// ─── Types ───────────────────────────────────────────────────────────────────

type StoreSettings = { storeName: string; storeAddress: string; gstin: string } | null;

type CatalogProduct = {
  id: string;
  name: string;
  metalName: string;
  metalId: string;
  purity: string;
  weightGrams: number;
  purityPercent: number;
  makingCharge: number;
  makingChargeType: MakingChargeType;
  gstPercent: number;
  ratePerGram: number;
  basePrice: number;
  imageUrl: string | null;
  variants: {
    id: string;
    size: string | null;
    gemstone: string | null;
    additionalPrice: number;
    price: number;
  }[];
};

// _metalId and _purityPercent are UI-only for custom item auto-calc
type LineItem = BillItemInput & {
  _key: string;
  _metalId?: string;
  _purityPercent?: number;
};

type CustomerMatch = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2);
}

// weightGrams here is pure-metal weight (gross × purity), so no separate purity factor
function computeJewelleryPrice(
  weightGrams: number,
  metalRate: number,
  makingChargeType: MakingChargeType,
  makingCharge: number,
  gstPercent: number
): number {
  const metalValue = metalRate * weightGrams;
  const makingAmount =
    makingChargeType === "PERCENT"
      ? metalValue * (makingCharge / 100)
      : makingCharge;
  const base = metalValue + makingAmount;
  return Math.round(base * (1 + gstPercent / 100));
}

function effectiveUnitPrice(item: LineItem): number {
  const disc = item.discountPercent ?? 0;
  return Math.round(item.unitPrice * (1 - disc / 100));
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-brown-dark focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-colors placeholder-gray-300";

const selectCls =
  "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-brown-dark focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-colors";

// ─── Live preview ─────────────────────────────────────────────────────────────

function BillPreview({
  storeSettings,
  customerName,
  customerPhone,
  customerEmail,
  customerAddress,
  customerState,
  items,
  subtotal,
  gstAmount,
  totalAmount,
  discountAmount,
  exchangeValue,
  exchangeLabel,
  payAmt,
  paymentMethod,
  notes,
}: {
  storeSettings: StoreSettings;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  customerState: string;
  items: LineItem[];
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  discountAmount: number;
  exchangeValue: number;
  exchangeLabel: string;
  payAmt: number;
  paymentMethod: string;
  notes: string;
}) {
  const storeName = storeSettings?.storeName || "";
  const storeAddress = storeSettings?.storeAddress || "";
  const gstin = storeSettings?.gstin || "";
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const effectiveDue = Math.max(0, totalAmount - discountAmount - exchangeValue);
  const balance = Math.max(0, effectiveDue - payAmt);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-xs leading-snug">
      {/* Store header */}
      <div className="px-6 py-5 text-center border-b border-gray-100 bg-linear-to-b from-rose-50/50 to-white">
        {storeName ? (
          <p className="font-bold text-sm tracking-wide uppercase text-brown-dark">{storeName}</p>
        ) : (
          <p className="font-bold text-sm tracking-wide uppercase text-gray-300 italic">Store Name</p>
        )}
        {storeAddress && <p className="text-gray-500 mt-0.5 text-[11px]">{storeAddress}</p>}
        {gstin && <p className="text-gray-500 mt-0.5 text-[11px]">GSTIN: {gstin}</p>}
      </div>

      {/* Invoice label */}
      <div className="px-6 py-2 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Tax Invoice</span>
        <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-semibold">
          Preview
        </span>
      </div>

      {/* Bill meta + customer */}
      <div className="px-6 py-4 flex justify-between gap-4 border-b border-gray-100">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Bill To</p>
          {customerName ? (
            <p className="font-semibold text-brown-dark">{customerName}</p>
          ) : (
            <p className="text-gray-300 italic">Customer name</p>
          )}
          {customerPhone && <p className="text-gray-500 text-[11px]">{customerPhone}</p>}
          {customerEmail && <p className="text-gray-500 text-[11px]">{customerEmail}</p>}
          {customerAddress && <p className="text-gray-500 text-[11px] mt-0.5">{customerAddress}</p>}
          {customerState && <p className="text-gray-500 text-[11px]">{customerState}</p>}
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Details</p>
          <p className="text-gray-400 italic text-[11px]"># auto-assigned</p>
          <p className="text-gray-500 text-[11px]">{today}</p>
        </div>
      </div>

      {/* Items table */}
      {items.length > 0 ? (
        <div className="px-6 py-3 border-b border-gray-100">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-[10px] font-semibold uppercase tracking-wide text-gray-400 pb-2">Description</th>
                <th className="text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400 pb-2 w-7">Qty</th>
                <th className="text-right text-[10px] font-semibold uppercase tracking-wide text-gray-400 pb-2">Rate</th>
                <th className="text-right text-[10px] font-semibold uppercase tracking-wide text-gray-400 pb-2">Amt</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const effPrice = effectiveUnitPrice(item);
                const disc = item.discountPercent ?? 0;
                return (
                  <tr key={item._key} className="border-t border-gray-50">
                    <td className="py-1.5 pr-2">
                      <p className="font-medium text-brown-dark leading-tight">
                        {item.productName || <span className="italic text-gray-300">Unnamed item</span>}
                      </p>
                      {item.variantLabel && <p className="text-gray-400 text-[10px]">{item.variantLabel}</p>}
                      {item.metalName && (
                        <p className="text-gray-400 text-[10px]">
                          {item.metalName}
                          {item.purity ? ` · ${item.purity}` : ""}
                          {item.weightGrams ? ` · ${item.weightGrams}g` : ""}
                        </p>
                      )}
                      {item.hsnCode && <p className="text-gray-300 text-[10px]">HSN: {item.hsnCode}</p>}
                      {item.gstPercent ? <p className="text-gray-300 text-[10px]">GST: {item.gstPercent}%</p> : null}
                      {disc > 0 && <p className="text-green-600 text-[10px]">Disc: {disc}%</p>}
                    </td>
                    <td className="py-1.5 text-center text-gray-600">{item.quantity}</td>
                    <td className="py-1.5 text-right text-gray-600">
                      {disc > 0 ? (
                        <span className="line-through text-gray-300 mr-0.5">{formatPrice(item.unitPrice)}</span>
                      ) : null}
                      {formatPrice(effPrice)}
                    </td>
                    <td className="py-1.5 text-right font-semibold text-brown-dark">
                      {formatPrice(effPrice * item.quantity)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-10 text-center">
          <FileText size={24} className="text-gray-200 mx-auto mb-2" />
          <p className="text-gray-300">Add items to see preview</p>
        </div>
      )}

      {/* Totals */}
      {items.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-100 space-y-1">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal (excl. GST)</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>GST</span>
            <span>{formatPrice(gstAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-brown-dark border-t border-gray-100 pt-1.5 mt-1">
            <span>Total</span>
            <span className="text-rose-gold">{formatPrice(totalAmount)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>- {formatPrice(discountAmount)}</span>
            </div>
          )}
          {exchangeValue > 0 && (
            <div className="flex justify-between text-amber-600">
              <span>{exchangeLabel || "Old Gold Exchange"}</span>
              <span>- {formatPrice(exchangeValue)}</span>
            </div>
          )}
          {(discountAmount > 0 || exchangeValue > 0) && (
            <div className="flex justify-between font-semibold text-brown-dark border-t border-gray-100 pt-1.5">
              <span>Amount Due</span>
              <span>{formatPrice(effectiveDue)}</span>
            </div>
          )}
          {payAmt > 0 && (
            <>
              <div className="flex justify-between text-green-600 pt-1 border-t border-gray-50">
                <span>Paid ({paymentMethod})</span>
                <span>{formatPrice(payAmt)}</span>
              </div>
              {balance > 0 ? (
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Balance Due</span>
                  <span>{formatPrice(balance)}</span>
                </div>
              ) : (
                <div className="flex justify-center mt-1">
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                    Fully Paid
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {notes && (
        <div className="px-6 py-3 border-b border-gray-100">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Notes</p>
          <p className="text-gray-500">{notes}</p>
        </div>
      )}

      <div className="px-6 py-3 text-center bg-gray-50/60">
        <p className="text-[10px] text-gray-400">Thank you for your purchase</p>
      </div>
    </div>
  );
}

// ─── Jewellery detail sub-form for custom items ───────────────────────────────

function JewelleryDetails({
  item,
  metalRates,
  onChange,
}: {
  item: LineItem;
  metalRates: Record<string, number>;
  onChange: (patch: Partial<LineItem>) => void;
}) {
  const [open, setOpen] = useState(false);

  const metalId = item._metalId ?? "";
  const purities = metalId ? (PURITY_OPTIONS[metalId] ?? []) : [];

  function handleMetalChange(newMetalId: string) {
    const rate = metalRates[newMetalId] ?? 0;
    const firstPurity = PURITY_OPTIONS[newMetalId]?.[0];
    const metal = METALS.find((m) => m.id === newMetalId);
    const patch: Partial<LineItem> = {
      _metalId: newMetalId,
      metalName: metal?.name,
      metalRate: rate,
      purity: firstPurity?.value,
      _purityPercent: firstPurity?.purityPercent,
    };
    onChange(patch);
  }

  function handlePurityChange(purityValue: string) {
    const opt = purities.find((p) => p.value === purityValue);
    if (!opt) return;
    onChange({ purity: opt.value, _purityPercent: opt.purityPercent });
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-[11px] font-semibold text-rose-gold hover:text-rose-gold-dark transition"
      >
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        Jewellery details {open ? "" : "(metal, weight, making charge)"}
      </button>

      {open && (
        <div className="mt-3 grid grid-cols-2 gap-2 p-3 bg-rose-50/30 rounded-xl border border-rose-gold/10">
          {/* Metal */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Metal</label>
            <select
              value={metalId}
              onChange={(e) => handleMetalChange(e.target.value)}
              className={selectCls}
            >
              <option value="">Select…</option>
              {METALS.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Purity */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Purity</label>
            <select
              value={item.purity ?? ""}
              onChange={(e) => handlePurityChange(e.target.value)}
              disabled={!metalId}
              className={selectCls}
            >
              <option value="">Select…</option>
              {purities.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Gross weight */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Gross Weight (g)</label>
            <input
              type="number"
              min={0}
              step={0.001}
              value={item.grossWeightGrams ?? ""}
              onChange={(e) => onChange({ grossWeightGrams: parseFloat(e.target.value) || undefined })}
              placeholder="0.000"
              className={inputCls}
            />
          </div>

          {/* Net weight — auto-calculated from gross × purity */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">
              Net Weight (g)
              {item.weightGrams ? (
                <span className="ml-1 text-green-600 font-semibold">auto</span>
              ) : null}
            </label>
            <input
              type="number"
              disabled
              value={item.weightGrams ?? ""}
              placeholder="auto (gross × purity)"
              className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`}
            />
          </div>

          {/* Metal rate */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Metal Rate (₹/g)</label>
            <input
              type="number"
              min={0}
              value={item.metalRate ?? ""}
              onChange={(e) => onChange({ metalRate: parseFloat(e.target.value) || undefined })}
              placeholder="auto-filled"
              className={inputCls}
            />
          </div>

          {/* Making charge type */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Making Charge</label>
            <div className="flex gap-1">
              <select
                value={item.makingChargeType ?? "PERCENT"}
                onChange={(e) => onChange({ makingChargeType: e.target.value as MakingChargeType })}
                className="w-24 px-2 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-rose-gold"
              >
                <option value="PERCENT">%</option>
                <option value="FIXED">₹ Fixed</option>
              </select>
              <input
                type="number"
                min={0}
                value={item.makingCharge ?? ""}
                onChange={(e) => onChange({ makingCharge: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className={`${inputCls} flex-1`}
              />
            </div>
          </div>

          {/* Auto-calc indicator */}
          {item.grossWeightGrams && item._purityPercent && item.metalRate && item.makingCharge !== undefined && (
            <div className="col-span-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700 font-medium flex justify-between">
              <span>Auto-calculated price (incl. GST {item.gstPercent ?? 3}%)</span>
              <span className="font-bold">{formatPrice(item.unitPrice)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function NewBillClient({
  catalogProducts,
  hasGstConfig,
  storeSettings,
  metalRates,
}: {
  catalogProducts: CatalogProduct[];
  hasGstConfig: boolean;
  storeSettings: StoreSettings;
  metalRates: Record<string, number>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // ── Customer ──
  const [customerMode, setCustomerMode] = useState<"walkin" | "search">("walkin");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerState, setCustomerState] = useState("");
  const [customerPan, setCustomerPan] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [linkedCustomer, setLinkedCustomer] = useState<CustomerMatch | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CustomerMatch[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ── Items ──
  const [items, setItems] = useState<LineItem[]>([]);
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");

  // ── Bill-level adjustments ──
  const [discountAmount, setDiscountAmount] = useState("");
  const [exchangeValue, setExchangeValue] = useState("");
  const [exchangeLabel, setExchangeLabel] = useState("");

  // ── Payment ──
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "CARD">("CASH");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  // ── Misc ──
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // ── Totals ──
  const subtotalRaw = items.reduce((s, i) => {
    const gst = i.gstPercent ?? 0;
    const effPrice = effectiveUnitPrice(i);
    return s + (effPrice / (1 + gst / 100)) * i.quantity;
  }, 0);
  const gstRaw = items.reduce((s, i) => {
    const gst = i.gstPercent ?? 0;
    const effPrice = effectiveUnitPrice(i);
    const base = effPrice / (1 + gst / 100);
    return s + base * (gst / 100) * i.quantity;
  }, 0);
  const subtotal = Math.round(subtotalRaw);
  const gstAmount = Math.round(gstRaw);
  const totalAmount = items.reduce((s, i) => s + effectiveUnitPrice(i) * i.quantity, 0);
  const billDiscount = parseFloat(discountAmount) || 0;
  const exchangeAmt = parseFloat(exchangeValue) || 0;
  const effectiveDue = Math.max(0, totalAmount - billDiscount - exchangeAmt);
  const payAmt = parseFloat(paymentAmount) || 0;

  // Preview customer
  const displayName = linkedCustomer?.name ?? customerName;
  const displayPhone = linkedCustomer?.phone ?? customerPhone;
  const displayEmail = linkedCustomer?.email ?? customerEmail;

  useEffect(() => {
    if (customerMode !== "search" || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      const res = await searchCustomers(searchQuery);
      setSearchResults(res);
      setSearching(false);
    }, 300);
  }, [searchQuery, customerMode]);

  function addCatalogItem(product: CatalogProduct, variantId?: string) {
    const variant = variantId ? product.variants.find((v) => v.id === variantId) : null;
    const price = variant ? variant.price : product.basePrice;
    const variantParts: string[] = [];
    if (variant?.size) variantParts.push(`Size ${variant.size}`);
    if (variant?.gemstone && variant.gemstone !== "None") variantParts.push(variant.gemstone);

    const item: LineItem = {
      _key: uid(),
      type: "CATALOG",
      productId: product.id,
      productName: product.name,
      variantLabel: variantParts.length > 0 ? variantParts.join(" · ") : undefined,
      metalName: product.metalName,
      purity: product.purity,
      weightGrams: product.weightGrams,
      metalRate: product.ratePerGram,
      makingCharge: product.makingCharge,
      makingChargeType: product.makingChargeType,
      hsnCode: "7113",
      gstPercent: product.gstPercent,
      discountPercent: 0,
      quantity: 1,
      unitPrice: price,
      totalPrice: price,
    };
    setItems((prev) => [...prev, item]);
    setShowCatalog(false);
    setCatalogSearch("");
  }

  function addCustomItem() {
    const item: LineItem = {
      _key: uid(),
      type: "CUSTOM",
      productName: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      gstPercent: 3,
      hsnCode: "7113",
      discountPercent: 0,
      makingChargeType: "PERCENT",
      makingCharge: 0,
    };
    setItems((prev) => [...prev, item]);
  }

  function updateItem(key: string, patch: Partial<LineItem>) {
    setItems((prev) =>
      prev.map((item) => {
        if (item._key !== key) return item;
        const updated = { ...item, ...patch };

        // Auto-compute net weight = gross × purity (pure metal content)
        if (updated.grossWeightGrams && updated._purityPercent) {
          updated.weightGrams =
            Math.round(updated.grossWeightGrams * updated._purityPercent * 1000) / 1000;
        }

        // Auto-calculate price when all jewellery details are present
        if (
          updated.type === "CUSTOM" &&
          updated.weightGrams &&
          updated.metalRate &&
          updated.makingCharge !== undefined &&
          updated.makingChargeType
        ) {
          updated.unitPrice = computeJewelleryPrice(
            updated.weightGrams,
            updated.metalRate,
            updated.makingChargeType,
            updated.makingCharge,
            updated.gstPercent ?? 3
          );
        }

        // totalPrice = effective per-unit price after discount
        const disc = updated.discountPercent ?? 0;
        updated.totalPrice = Math.round(updated.unitPrice * (1 - disc / 100));
        return updated;
      })
    );
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((i) => i._key !== key));
  }

  function validatePhone(val: string) {
    if (!val.trim()) return "";
    return /^[6-9]\d{9}$/.test(val.trim()) ? "" : "Enter a valid 10-digit mobile number";
  }

  function handleSubmit() {
    setError("");
    if (items.length === 0) {
      setError("Add at least one item.");
      return;
    }
    if (customerMode === "walkin" && !customerName.trim() && !customerPhone.trim()) {
      setError("Enter customer name or phone.");
      return;
    }
    const pErr = validatePhone(customerPhone);
    if (pErr) {
      setPhoneError(pErr);
      return;
    }

    startTransition(async () => {
      const result = await createBill({
        customerId: linkedCustomer?.id,
        customerName: linkedCustomer ? undefined : customerName || undefined,
        customerPhone: linkedCustomer ? undefined : customerPhone || undefined,
        customerEmail: linkedCustomer ? undefined : customerEmail || undefined,
        customerAddress: customerAddress || undefined,
        customerState: customerState || undefined,
        customerPan: customerPan || undefined,
        customerGstin: customerGstin || undefined,
        items,
        subtotal,
        gstAmount,
        totalAmount,
        discountAmount: billDiscount > 0 ? billDiscount : undefined,
        exchangeValue: exchangeAmt > 0 ? exchangeAmt : undefined,
        exchangeLabel: exchangeLabel || undefined,
        initialPaymentAmount: payAmt > 0 ? payAmt : undefined,
        initialPaymentMethod: payAmt > 0 ? paymentMethod : undefined,
        initialPaymentNote: paymentNote || undefined,
        notes: notes || undefined,
      });

      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push(`/admin/billing/${result.id}`);
    });
  }

  const filteredCatalog = catalogProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.metalName.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold text-brown-dark mb-4">New Bill</h1>

      {!hasGstConfig && (
        <div className="mb-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">GST details not configured</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Add your GSTIN before creating a bill.{" "}
              <a href="/admin/billing/settings" className="underline font-semibold">
                Set up GST details →
              </a>
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8 items-start">
        {/* ── Form ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">

            {/* Customer */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Customer</p>
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => { setCustomerMode("walkin"); setLinkedCustomer(null); setPhoneError(""); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    customerMode === "walkin"
                      ? "bg-rose-gold text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  <User size={12} /> Walk-in
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerMode("search")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    customerMode === "search"
                      ? "bg-rose-gold text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  <UserSearch size={12} /> Search Existing
                </button>
              </div>

              {customerMode === "walkin" ? (
                <div className="grid grid-cols-2 gap-3">
                  {/* Name */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Name</label>
                    <input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Customer name"
                      className={inputCls}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Phone</label>
                    <input
                      value={customerPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setCustomerPhone(val);
                        if (phoneError) setPhoneError(validatePhone(val));
                      }}
                      onBlur={(e) => setPhoneError(validatePhone(e.target.value))}
                      placeholder="10-digit mobile"
                      inputMode="numeric"
                      maxLength={10}
                      className={`${inputCls} ${phoneError ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                    />
                    {phoneError && <p className="mt-1 text-xs text-red-500">{phoneError}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Email (optional)</label>
                    <input
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="email@example.com"
                      className={inputCls}
                    />
                  </div>

                  {/* PAN */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">PAN (optional)</label>
                    <input
                      value={customerPan}
                      onChange={(e) => setCustomerPan(e.target.value.toUpperCase().slice(0, 10))}
                      placeholder="ABCDE1234F"
                      className={inputCls}
                    />
                  </div>

                  {/* Address */}
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-400 mb-1">Address (optional)</label>
                    <input
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="House / street / locality"
                      className={inputCls}
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">State (optional)</label>
                    <select
                      value={customerState}
                      onChange={(e) => setCustomerState(e.target.value)}
                      className={selectCls}
                    >
                      <option value="">Select state…</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Customer GSTIN */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Customer GSTIN (optional)</label>
                    <input
                      value={customerGstin}
                      onChange={(e) => setCustomerGstin(e.target.value.toUpperCase().slice(0, 15))}
                      placeholder="22AAAAA0000A1Z5"
                      className={inputCls}
                    />
                  </div>
                </div>
              ) : linkedCustomer ? (
                <div className="flex items-center justify-between bg-blush/30 rounded-xl px-4 py-3">
                  <div>
                    <p className="font-medium text-brown-dark text-sm">{linkedCustomer.name ?? "—"}</p>
                    <p className="text-xs text-gray-400">{linkedCustomer.phone ?? linkedCustomer.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLinkedCustomer(null)}
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, phone, or email…"
                      className={`${inputCls} pl-8`}
                    />
                    {searching && (
                      <Loader2
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
                      />
                    )}
                  </div>
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      {searchResults.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setLinkedCustomer(c);
                            setSearchResults([]);
                            setSearchQuery("");
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-blush/30 transition text-sm"
                        >
                          <p className="font-medium text-brown-dark">{c.name ?? "—"}</p>
                          <p className="text-xs text-gray-400">{c.phone ?? c.email}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Line items */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Items</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCatalog((v) => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blush/50 hover:bg-blush text-rose-gold text-xs font-semibold rounded-full transition"
                  >
                    <Package size={12} /> From Catalog
                  </button>
                  <button
                    type="button"
                    onClick={addCustomItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-full transition"
                  >
                    <PenLine size={12} /> Custom Item
                  </button>
                </div>
              </div>

              {/* Catalog picker */}
              {showCatalog && (
                <div className="mb-4 border border-gray-100 rounded-xl overflow-hidden">
                  <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <div className="relative">
                      <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        placeholder="Search products…"
                        className="w-full pl-7 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-rose-gold"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                    {filteredCatalog.length === 0 ? (
                      <p className="text-center text-sm text-gray-400 py-6">No products found.</p>
                    ) : (
                      filteredCatalog.map((p) => (
                        <div key={p.id} className="px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-brown-dark">{p.name}</p>
                              <p className="text-xs text-gray-400">
                                {p.metalName} · {p.purity} · {p.weightGrams}g
                              </p>
                            </div>
                            {p.variants.length === 0 ? (
                              <button
                                type="button"
                                onClick={() => addCatalogItem(p)}
                                className="ml-3 shrink-0 text-xs font-semibold text-rose-gold hover:text-rose-gold-dark border border-rose-gold/30 hover:border-rose-gold px-2.5 py-1 rounded-full transition"
                              >
                                + Add · {formatPrice(p.basePrice)}
                              </button>
                            ) : (
                              <div className="ml-3 shrink-0">
                                <select
                                  onChange={(e) => {
                                    if (e.target.value) addCatalogItem(p, e.target.value || undefined);
                                  }}
                                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-rose-gold"
                                  defaultValue=""
                                >
                                  <option value="">Pick variant…</option>
                                  <option value="__base">Base · {formatPrice(p.basePrice)}</option>
                                  {p.variants.map((v) => {
                                    const label = [
                                      v.size && `Size ${v.size}`,
                                      v.gemstone && v.gemstone !== "None" && v.gemstone,
                                    ]
                                      .filter(Boolean)
                                      .join(" · ");
                                    return (
                                      <option key={v.id} value={v.id}>
                                        {label || "Variant"} · {formatPrice(v.price)}
                                      </option>
                                    );
                                  })}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Item rows */}
              {items.length === 0 ? (
                <p className="text-center text-sm text-gray-300 py-8">
                  No items yet — add from catalog or create a custom item.
                </p>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item._key} className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Name */}
                          {item.type === "CUSTOM" ? (
                            <input
                              value={item.productName}
                              onChange={(e) => updateItem(item._key, { productName: e.target.value })}
                              placeholder="Item description…"
                              className={inputCls}
                            />
                          ) : (
                            <p className="text-sm font-medium text-brown-dark">
                              {item.productName}
                              {item.variantLabel && (
                                <span className="text-xs text-gray-400 ml-1.5">({item.variantLabel})</span>
                              )}
                            </p>
                          )}

                          {/* Qty / Unit price / GST / HSN / Discount */}
                          <div className="flex gap-2 items-center flex-wrap">
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-gray-400">Qty</label>
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(item._key, {
                                    quantity: Math.max(1, parseInt(e.target.value) || 1),
                                  })
                                }
                                className="w-14 px-2 py-1 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-rose-gold text-center"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-gray-400">Disc %</label>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={item.discountPercent || ""}
                                onChange={(e) =>
                                  updateItem(item._key, {
                                    discountPercent: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-14 px-2 py-1 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-rose-gold text-center"
                                placeholder="0"
                              />
                            </div>
                            {item.type === "CUSTOM" && (
                              <>
                                <div className="flex items-center gap-1">
                                  <label className="text-xs text-gray-400">GST %</label>
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.gstPercent ?? ""}
                                    onChange={(e) =>
                                      updateItem(item._key, {
                                        gstPercent: parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    className="w-14 px-2 py-1 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-rose-gold text-center"
                                    placeholder="3"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <label className="text-xs text-gray-400">HSN</label>
                                  <input
                                    value={item.hsnCode ?? ""}
                                    onChange={(e) => updateItem(item._key, { hsnCode: e.target.value })}
                                    className="w-16 px-2 py-1 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-rose-gold"
                                    placeholder="7113"
                                  />
                                </div>
                              </>
                            )}
                          </div>

                          {/* Metal info for catalog items */}
                          {item.type === "CATALOG" && item.metalName && (
                            <p className="text-xs text-gray-400">
                              {item.metalName} · {item.purity} · {item.weightGrams}g
                              {item.metalRate ? ` @ ${formatPrice(item.metalRate)}/g` : ""}
                            </p>
                          )}

                          {/* Jewellery details for custom items */}
                          {item.type === "CUSTOM" && (
                            <JewelleryDetails
                              item={item}
                              metalRates={metalRates}
                              onChange={(patch) => updateItem(item._key, patch)}
                            />
                          )}
                        </div>

                        {/* Line total + remove */}
                        <div className="shrink-0 text-right">
                          {(item.discountPercent ?? 0) > 0 ? (
                            <>
                              <p className="text-xs text-gray-300 line-through">{formatPrice(item.unitPrice * item.quantity)}</p>
                              <p className="text-sm font-semibold text-brown-dark">{formatPrice(effectiveUnitPrice(item) * item.quantity)}</p>
                            </>
                          ) : (
                            <p className="text-sm font-semibold text-brown-dark">
                              {formatPrice(effectiveUnitPrice(item) * item.quantity)}
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={() => removeItem(item._key)}
                            className="mt-1 text-gray-300 hover:text-red-500 transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Adjustments — discount + exchange */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Adjustments</p>

              {/* Bill-level discount */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Bill Discount (₹ flat)</label>
                <input
                  type="number"
                  min={0}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder="0"
                  className={inputCls}
                />
              </div>

              {/* Old gold exchange */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Old Gold / Exchange Value (₹)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    value={exchangeValue}
                    onChange={(e) => setExchangeValue(e.target.value)}
                    placeholder="0"
                    className={`${inputCls} flex-1`}
                  />
                  <input
                    value={exchangeLabel}
                    onChange={(e) => setExchangeLabel(e.target.value)}
                    placeholder="Label (e.g. Old Gold 22K)"
                    className={`${inputCls} flex-1`}
                  />
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                  Shown as a separate line on invoice — does not reduce GST base.
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Any special instructions or remarks…"
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>

          {/* ── Right: summary + payment ── */}
          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Summary</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal (excl. GST)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>GST</span>
                  <span>{formatPrice(gstAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-brown-dark text-base border-t border-gray-100 pt-2 mt-1">
                  <span>Total</span>
                  <span className="text-rose-gold">{formatPrice(totalAmount)}</span>
                </div>
                {billDiscount > 0 && (
                  <div className="flex justify-between text-green-600 text-xs">
                    <span>Discount</span>
                    <span>- {formatPrice(billDiscount)}</span>
                  </div>
                )}
                {exchangeAmt > 0 && (
                  <div className="flex justify-between text-amber-600 text-xs">
                    <span>{exchangeLabel || "Exchange"}</span>
                    <span>- {formatPrice(exchangeAmt)}</span>
                  </div>
                )}
                {(billDiscount > 0 || exchangeAmt > 0) && (
                  <div className="flex justify-between font-semibold text-brown-dark border-t border-gray-100 pt-1.5">
                    <span>Amount Due</span>
                    <span>{formatPrice(effectiveDue)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Initial Payment
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Method</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["CASH", "UPI", "CARD"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`py-1.5 rounded-lg text-xs font-semibold transition ${
                          paymentMethod === m
                            ? "bg-rose-gold text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={`0 of ${formatPrice(effectiveDue)}`}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Note (optional)</label>
                  <input
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="e.g. UPI ref #123"
                    className={inputCls}
                  />
                </div>
                {payAmt > 0 && (
                  <div
                    className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                      payAmt >= effectiveDue
                        ? "bg-green-50 text-green-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {payAmt >= effectiveDue
                      ? "Fully paid"
                      : `Balance: ${formatPrice(effectiveDue - payAmt)}`}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            {!hasGstConfig && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-center">
                Configure GST details to enable billing.
              </p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || items.length === 0 || !hasGstConfig}
              className="w-full py-3 bg-rose-gold hover:bg-rose-gold-dark text-white rounded-full text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Creating…
                </>
              ) : (
                "Create Bill & Invoice"
              )}
            </button>
          </div>
        </div>

        {/* ── Live preview ── */}
        <div className="xl:sticky xl:top-6 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Live Preview</p>
          <BillPreview
            storeSettings={storeSettings}
            customerName={displayName ?? ""}
            customerPhone={displayPhone ?? ""}
            customerEmail={displayEmail ?? ""}
            customerAddress={customerAddress}
            customerState={customerState}
            items={items}
            subtotal={subtotal}
            gstAmount={gstAmount}
            totalAmount={totalAmount}
            discountAmount={billDiscount}
            exchangeValue={exchangeAmt}
            exchangeLabel={exchangeLabel}
            payAmt={payAmt}
            paymentMethod={paymentMethod}
            notes={notes}
          />
        </div>
      </div>
    </div>
  );
}
