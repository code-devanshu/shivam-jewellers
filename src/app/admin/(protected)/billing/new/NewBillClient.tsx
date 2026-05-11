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
  ChevronDown,
  Loader2,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { formatPrice } from "@/lib/price";
import { createBill, searchCustomers, type BillItemInput } from "../actions";
import type { MakingChargeType } from "@prisma/client";

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

type LineItem = BillItemInput & { _key: string };

type CustomerMatch = {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
};

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-brown-dark focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-colors placeholder-gray-300";

function uid() {
  return Math.random().toString(36).slice(2);
}

// ─── Live bill preview ───────────────────────────────────────────────────────

function BillPreview({
  storeSettings,
  customerName,
  customerPhone,
  customerEmail,
  items,
  subtotal,
  gstAmount,
  totalAmount,
  payAmt,
  paymentMethod,
  notes,
}: {
  storeSettings: StoreSettings;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: LineItem[];
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
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

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-xs leading-snug">
      {/* Store header */}
      <div className="px-6 py-5 text-center border-b border-gray-100 bg-gradient-to-b from-rose-50/50 to-white">
        {storeName ? (
          <p className="font-bold text-sm tracking-wide uppercase text-brown-dark">{storeName}</p>
        ) : (
          <p className="font-bold text-sm tracking-wide uppercase text-gray-300 italic">Store Name</p>
        )}
        {storeAddress && <p className="text-gray-500 mt-0.5 text-[11px]">{storeAddress}</p>}
        {gstin && <p className="text-gray-500 mt-0.5 text-[11px]">GSTIN: {gstin}</p>}
      </div>

      {/* Invoice label + preview badge */}
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
                <th className="text-left text-[10px] font-semibold uppercase tracking-wide text-gray-400 pb-2">
                  Description
                </th>
                <th className="text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400 pb-2 w-7">
                  Qty
                </th>
                <th className="text-right text-[10px] font-semibold uppercase tracking-wide text-gray-400 pb-2">
                  Rate
                </th>
                <th className="text-right text-[10px] font-semibold uppercase tracking-wide text-gray-400 pb-2">
                  Amt
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._key} className="border-t border-gray-50">
                  <td className="py-1.5 pr-2">
                    <p className="font-medium text-brown-dark leading-tight">
                      {item.productName || <span className="italic text-gray-300">Unnamed item</span>}
                    </p>
                    {item.variantLabel && (
                      <p className="text-gray-400 text-[10px]">{item.variantLabel}</p>
                    )}
                    {item.metalName && (
                      <p className="text-gray-400 text-[10px]">
                        {item.metalName}
                        {item.purity ? ` · ${item.purity}` : ""}
                      </p>
                    )}
                    {item.hsnCode && (
                      <p className="text-gray-300 text-[10px]">HSN: {item.hsnCode}</p>
                    )}
                    {item.gstPercent ? (
                      <p className="text-gray-300 text-[10px]">GST: {item.gstPercent}%</p>
                    ) : null}
                  </td>
                  <td className="py-1.5 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-1.5 text-right text-gray-600">{formatPrice(item.unitPrice)}</td>
                  <td className="py-1.5 text-right font-semibold text-brown-dark">
                    {formatPrice(item.totalPrice * item.quantity)}
                  </td>
                </tr>
              ))}
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
          {payAmt > 0 && (
            <>
              <div className="flex justify-between text-green-600 pt-1 border-t border-gray-50">
                <span>Paid ({paymentMethod})</span>
                <span>{formatPrice(payAmt)}</span>
              </div>
              {totalAmount - payAmt > 0 ? (
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Balance Due</span>
                  <span>{formatPrice(totalAmount - payAmt)}</span>
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

      {/* Notes */}
      {notes && (
        <div className="px-6 py-3 border-b border-gray-100">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Notes</p>
          <p className="text-gray-500">{notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 text-center bg-gray-50/60">
        <p className="text-[10px] text-gray-400">Thank you for your purchase</p>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function NewBillClient({
  catalogProducts,
  hasGstConfig,
  storeSettings,
}: {
  catalogProducts: CatalogProduct[];
  hasGstConfig: boolean;
  storeSettings: StoreSettings;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Customer
  const [customerMode, setCustomerMode] = useState<"walkin" | "search">("walkin");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [linkedCustomer, setLinkedCustomer] = useState<CustomerMatch | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CustomerMatch[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Line items
  const [items, setItems] = useState<LineItem[]>([]);
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "CARD">("CASH");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  // Misc
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Totals
  const subtotalRaw = items.reduce((s, i) => {
    const gst = i.gstPercent ?? 0;
    return s + (i.totalPrice / (1 + gst / 100)) * i.quantity;
  }, 0);
  const gstRaw = items.reduce((s, i) => {
    const gst = i.gstPercent ?? 0;
    const base = i.unitPrice / (1 + gst / 100);
    return s + base * (gst / 100) * i.quantity;
  }, 0);
  const subtotal = Math.round(subtotalRaw);
  const gstAmount = Math.round(gstRaw);
  const totalAmount = items.reduce((s, i) => s + i.totalPrice * i.quantity, 0);
  const payAmt = parseFloat(paymentAmount) || 0;

  // Preview customer
  const displayCustomerName = linkedCustomer?.name ?? customerName;
  const displayCustomerPhone = linkedCustomer?.phone ?? customerPhone;
  const displayCustomerEmail = linkedCustomer?.email ?? customerEmail;

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
    };
    setItems((prev) => [...prev, item]);
  }

  function updateItem(key: string, patch: Partial<LineItem>) {
    setItems((prev) =>
      prev.map((item) => {
        if (item._key !== key) return item;
        const updated = { ...item, ...patch };
        updated.totalPrice = Math.round(updated.unitPrice * updated.quantity);
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
        items,
        subtotal,
        gstAmount,
        totalAmount,
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
          {/* Left — customer + items + notes */}
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
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Name</label>
                    <input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Customer name"
                      className={inputCls}
                    />
                  </div>
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
                      placeholder="10-digit mobile number"
                      inputMode="numeric"
                      maxLength={10}
                      className={`${inputCls} ${phoneError ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                    />
                    {phoneError && (
                      <p className="mt-1 text-xs text-red-500">{phoneError}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-400 mb-1">Email (optional)</label>
                    <input
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="email@example.com"
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

            {/* Line Items */}
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
                              <label className="text-xs text-gray-400">Unit ₹</label>
                              <input
                                type="number"
                                min={0}
                                value={item.unitPrice || ""}
                                onChange={(e) =>
                                  updateItem(item._key, { unitPrice: parseFloat(e.target.value) || 0 })
                                }
                                className="w-24 px-2 py-1 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-rose-gold"
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
                          {item.metalName && (
                            <p className="text-xs text-gray-400">
                              {item.metalName} · {item.purity} · {item.weightGrams}g
                              {item.metalRate ? ` @ ${formatPrice(item.metalRate)}/g` : ""}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-semibold text-brown-dark">
                            {formatPrice(item.totalPrice * item.quantity)}
                          </p>
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

          {/* Right — summary + payment + submit */}
          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Summary</p>
              <div className="space-y-2 text-sm">
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
                    placeholder={`0 of ${formatPrice(totalAmount)}`}
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
                      payAmt >= totalAmount
                        ? "bg-green-50 text-green-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {payAmt >= totalAmount
                      ? "Fully paid"
                      : `Balance: ${formatPrice(totalAmount - payAmt)}`}
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
            customerName={displayCustomerName ?? ""}
            customerPhone={displayCustomerPhone ?? ""}
            customerEmail={displayCustomerEmail ?? ""}
            items={items}
            subtotal={subtotal}
            gstAmount={gstAmount}
            totalAmount={totalAmount}
            payAmt={payAmt}
            paymentMethod={paymentMethod}
            notes={notes}
          />
        </div>
      </div>
    </div>
  );
}
