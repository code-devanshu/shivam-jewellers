"use client";

import { useActionState, useState, useTransition } from "react";
import { Pencil, Trash2, Plus, X, GripVertical } from "lucide-react";
import type { Banner } from "@/lib/types";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerActive,
  type BannerFormState,
} from "./actions";

const INITIAL: BannerFormState = { status: "idle" };

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-brown-dark text-sm focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-colors placeholder-gray-300";

function BannerModal({
  banner,
  onClose,
}: {
  banner?: Banner;
  onClose: () => void;
}) {
  const action = banner ? updateBanner.bind(null, banner.id) : createBanner;
  const [state, formAction, isPending] = useActionState(action, INITIAL);

  if (state.status === "success") {
    onClose();
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-brown-dark">
            {banner ? "Edit Banner" : "Add Banner"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form action={formAction} className="p-6 space-y-4 overflow-y-auto">
          {state.status === "error" && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {state.message}
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Image *
            </label>
            <ImageUploader name="imageUrl" defaultUrl={banner?.imageUrl ?? ""} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Title (alt text)
            </label>
            <input name="title" defaultValue={banner?.title ?? ""} className={inputCls} placeholder="e.g. Diwali Collection" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Link URL
            </label>
            <input
              name="linkUrl"
              defaultValue={banner?.linkUrl ?? ""}
              className={inputCls}
              placeholder="/products?category=rings"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Display Order
            </label>
            <input name="order" type="number" className={inputCls} defaultValue={banner?.order ?? 0} />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              defaultChecked={banner?.isActive ?? true}
              className="w-4 h-4 accent-rose-gold rounded"
            />
            <label htmlFor="isActive" className="text-sm text-brown-dark font-medium cursor-pointer">
              Active (shown on homepage)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-rose-gold hover:bg-rose-gold-dark text-white rounded-full text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {banner ? "Save" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ActiveToggle({ banner }: { banner: Banner }) {
  const [active, setActive] = useState(banner.isActive);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        const next = !active;
        setActive(next);
        startTransition(() => toggleBannerActive(banner.id, next));
      }}
      disabled={isPending}
      className={`relative w-9 h-5 rounded-full transition-colors disabled:opacity-60 ${
        active ? "bg-rose-gold" : "bg-gray-200"
      }`}
      aria-label="Toggle active"
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
          active ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function BannersClient({ banners }: { banners: Banner[] }) {
  const sorted = [...banners].sort((a, b) => a.order - b.order);
  const [modal, setModal] = useState<"new" | Banner | null>(null);

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-dark">Banners</h1>
          <p className="text-sm text-gray-400 mt-1">
            {sorted.length} total · shown in the homepage hero carousel
          </p>
        </div>
        <button
          onClick={() => setModal("new")}
          className="flex items-center gap-2 bg-rose-gold hover:bg-rose-gold-dark text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-colors"
        >
          <Plus size={16} /> Add Banner
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 font-medium">Banner</th>
              <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Link</th>
              <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Order</th>
              <th className="text-left px-5 py-3 font-medium">Active</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-400 text-sm">
                  No banners yet. Add one to populate the homepage carousel.
                </td>
              </tr>
            )}
            {sorted.map((banner) => (
              <tr key={banner.id} className="hover:bg-gray-50/50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <GripVertical size={14} className="text-gray-200 shrink-0 hidden sm:block" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={banner.imageUrl}
                      alt={banner.title ?? ""}
                      className="w-16 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                    />
                    <div className="font-medium text-brown-dark truncate max-w-40">
                      {banner.title || <span className="text-gray-300 italic font-normal">Untitled</span>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-400 font-mono text-xs hidden md:table-cell truncate max-w-40">
                  {banner.linkUrl || "—"}
                </td>
                <td className="px-5 py-3 text-gray-400 hidden md:table-cell">{banner.order}</td>
                <td className="px-5 py-3">
                  <ActiveToggle banner={banner} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setModal(banner)}
                      className="p-1.5 text-gray-400 hover:text-rose-gold transition-colors"
                      aria-label="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <form action={deleteBanner}>
                      <input type="hidden" name="id" value={banner.id} />
                      <button
                        type="submit"
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Delete"
                        onClick={(e) => {
                          if (!confirm("Delete this banner?")) e.preventDefault();
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <BannerModal
          banner={modal === "new" ? undefined : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
