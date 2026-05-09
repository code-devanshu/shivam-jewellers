"use client";

import { useActionState, useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Category, Metal, Product } from "@/lib/types";
import type { ProductFormState } from "@/app/admin/products/actions";
import ImageUploader from "@/components/admin/ImageUploader";

const PURITY_PRESETS = [
  { label: "24K (99.9%)", purity: "24K", purityPercent: 99.9 },
  { label: "22K (91.7%)", purity: "22K", purityPercent: 91.67 },
  { label: "18K (75%)", purity: "18K", purityPercent: 75 },
  { label: "14K (58.5%)", purity: "14K", purityPercent: 58.5 },
  { label: "Sterling 925", purity: "Sterling", purityPercent: 92.5 },
  { label: "Fine Silver 999", purity: "999", purityPercent: 99.9 },
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/, "");
}

type Props = {
  action: (prev: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  categories: Category[];
  metals: Metal[];
  product?: Product;
};

const INITIAL: ProductFormState = { status: "idle" };

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-brown-dark text-sm focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-colors placeholder-gray-300";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

export default function ProductForm({ action, categories, metals, product }: Props) {
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, isPending] = useActionState(action, INITIAL);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(!!product);
  const [purity, setPurity] = useState(product?.purity ?? "");
  const [purityPercent, setPurityPercent] = useState(
    product ? String(product.purityPercent * 100) : ""
  );
  const [makingType, setMakingType] = useState<"PERCENT" | "FIXED">(
    product?.makingChargeType ?? "PERCENT"
  );
  const [grossWeight, setGrossWeight] = useState(
    product?.grossWeightGrams ? String(product.grossWeightGrams) : ""
  );
  const [netWeight, setNetWeight] = useState(
    product?.weightGrams ? String(product.weightGrams) : ""
  );

  useEffect(() => {
    const gross = parseFloat(grossWeight);
    const pp = parseFloat(purityPercent);
    if (!isNaN(gross) && !isNaN(pp) && pp > 0) {
      setNetWeight((gross * pp / 100).toFixed(4));
    } else {
      setNetWeight("");
    }
  }, [grossWeight, purityPercent]);

  useEffect(() => {
    if (state.status === "idle") return;
    if (state.status === "success") {
      toast.success(state.message);
      if (!product) {
        setName("");
        setSlug("");
        setSlugEdited(false);
        setPurity("");
        setPurityPercent("");
        setMakingType("PERCENT");
        setGrossWeight("");
        setNetWeight("");
        setFormKey((k) => k + 1);
      }
    } else {
      toast.error(state.message);
    }
  }, [state, product]);

  useEffect(() => {
    if (!slugEdited) setSlug(slugify(name));
  }, [name, slugEdited]);

  return (
    <form key={formKey} action={formAction} className="space-y-6">
      {/* Basic info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-brown-dark text-sm border-b border-gray-100 pb-3">
          Basic Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Product Name *</label>
            <input
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="e.g. Classic Gold Bangle"
            />
          </div>
          <div>
            <label className={labelCls}>Slug *</label>
            <input
              name="slug"
              type="text"
              required
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
              className={inputCls}
              placeholder="auto-generated"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Category *</label>
            <select name="categoryId" required defaultValue={product?.categoryId ?? ""} className={inputCls}>
              <option value="" disabled>Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Metal *</label>
            <select name="metalId" required defaultValue={product?.metalId ?? ""} className={inputCls}>
              <option value="" disabled>Select metal</option>
              {metals.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea
            name="description"
            rows={3}
            className={inputCls}
            placeholder="Optional product description"
            defaultValue={product?.description ?? ""}
          />
        </div>
      </div>

      {/* Purity & Weight */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-brown-dark text-sm border-b border-gray-100 pb-3">
          Purity &amp; Weight
        </h2>

        <div>
          <label className={labelCls}>Purity Quick-Select</label>
          <div className="flex flex-wrap gap-2">
            {PURITY_PRESETS.map((p) => (
              <button
                key={p.purity}
                type="button"
                onClick={() => { setPurity(p.purity); setPurityPercent(String(p.purityPercent)); }}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  purity === p.purity
                    ? "bg-rose-gold text-white border-rose-gold"
                    : "border-gray-200 text-gray-500 hover:border-rose-gold hover:text-rose-gold"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className={labelCls}>Purity Label *</label>
            <input
              name="purity"
              type="text"
              required
              value={purity}
              onChange={(e) => setPurity(e.target.value)}
              className={inputCls}
              placeholder="22K"
            />
          </div>
          <div>
            <label className={labelCls}>Purity % *</label>
            <input
              name="purityPercent"
              type="number"
              required
              step="0.01"
              min="0"
              max="100"
              value={purityPercent}
              onChange={(e) => setPurityPercent(e.target.value)}
              className={inputCls}
              placeholder="91.67"
            />
          </div>
          <div>
            <label className={labelCls}>
              Gross Weight (g) *
            </label>
            <input
              name="grossWeightGrams"
              type="number"
              required
              step="0.01"
              min="0"
              value={grossWeight}
              onChange={(e) => setGrossWeight(e.target.value)}
              className={inputCls}
              placeholder="5.5"
            />
          </div>
          <div>
            <label className={labelCls}>
              Net Weight (g)
              <span className="ml-1 normal-case font-normal text-gray-400">(auto)</span>
            </label>
            <input
              name="weightGrams"
              type="number"
              step="0.0001"
              readOnly
              value={netWeight}
              onChange={() => {}}
              className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`}
              placeholder="—"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-brown-dark text-sm border-b border-gray-100 pb-3">
          Pricing
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Making Charge Type *</label>
            <div className="flex gap-3 mt-2">
              {(["PERCENT", "FIXED"] as const).map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                  <input
                    type="radio"
                    name="makingChargeType"
                    value={t}
                    checked={makingType === t}
                    onChange={() => setMakingType(t)}
                    className="accent-rose-gold"
                  />
                  {t === "PERCENT" ? "Percentage" : "Fixed (₹)"}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>
              Making Charge{" "}
              <span className="text-gray-400 normal-case font-normal">
                ({makingType === "PERCENT" ? "%" : "₹"})
              </span>{" "}
              *
            </label>
            <input
              name="makingCharge"
              type="number"
              required
              step="0.01"
              min="0"
              className={inputCls}
              placeholder={makingType === "PERCENT" ? "12" : "500"}
              defaultValue={product?.makingCharge}
            />
          </div>
          <div>
            <label className={labelCls}>GST %</label>
            <input
              name="gstPercent"
              type="number"
              step="0.01"
              min="0"
              className={inputCls}
              placeholder="3"
              defaultValue={product?.gstPercent ?? 3}
            />
          </div>
        </div>
      </div>

      {/* Inventory & Media */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-brown-dark text-sm border-b border-gray-100 pb-3">
          Inventory &amp; Media
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Stock Quantity</label>
            <input
              name="stockQty"
              type="number"
              min="0"
              className={inputCls}
              placeholder="1"
              defaultValue={product?.stockQty ?? 1}
            />
          </div>
          <div>
            <label className={labelCls}>Primary Image</label>
            <ImageUploader
              name="imageUrl"
              defaultUrl={product?.images.find((i) => i.isPrimary)?.url ?? ""}
            />
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
            <input
              type="checkbox"
              name="isAvailable"
              defaultChecked={product?.isAvailable ?? true}
              className="accent-rose-gold w-4 h-4"
            />
            Available (visible on store)
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
            <input
              type="checkbox"
              name="isFeatured"
              defaultChecked={product?.isFeatured ?? false}
              className="accent-rose-gold w-4 h-4"
            />
            Featured (show on home page)
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 bg-rose-gold hover:bg-rose-gold-dark disabled:opacity-60 text-white px-8 py-3 rounded-full font-semibold text-sm transition-colors"
        >
          {isPending && <Loader2 size={15} className="animate-spin" />}
          {product ? "Save Changes" : "Add Product"}
        </button>
      </div>
    </form>
  );
}
