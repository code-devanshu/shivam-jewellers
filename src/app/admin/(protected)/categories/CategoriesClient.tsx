"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Pencil, Trash2, Plus, X, Loader2, Images } from "lucide-react";
import type { Category } from "@/lib/types";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryProductImages,
  type CategoryFormState,
} from "./actions";

const INITIAL: CategoryFormState = { status: "idle" };
const MAX_IMAGES = 4;

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-brown-dark text-sm focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-colors placeholder-gray-300";

function CategoryModal({
  category,
  onClose,
}: {
  category?: Category;
  onClose: () => void;
}) {
  const action = category ? updateCategory.bind(null, category.id) : createCategory;
  const [state, formAction, isPending] = useActionState(action, INITIAL);

  const [imageUrl, setImageUrl] = useState(category?.imageUrl ?? "");
  const [imageUrls, setImageUrls] = useState<string[]>(category?.imageUrls ?? []);
  const [productImages, setProductImages] = useState<Array<{ url: string; productName: string }>>([]);
  const [loadingImages, startLoadImages] = useTransition();

  useEffect(() => {
    if (!category) return;
    startLoadImages(async () => {
      const imgs = await getCategoryProductImages(category.id);
      setProductImages(imgs);
    });
  }, [category?.id]);

  if (state.status === "success") {
    onClose();
    return null;
  }

  function toggleImage(url: string) {
    setImageUrls((prev) => {
      if (prev.includes(url)) return prev.filter((u) => u !== url);
      if (prev.length >= MAX_IMAGES) return prev;
      return [...prev, url];
    });
  }

  function removeSlot(idx: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-brown-dark">
            {category ? "Edit Category" : "Add Category"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form action={formAction} className="p-6 space-y-4 overflow-y-auto">
          {/* Pass imageUrls array as JSON */}
          <input type="hidden" name="imageUrls" value={JSON.stringify(imageUrls)} />

          {state.status === "error" && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {state.message}
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Name *
            </label>
            <input name="name" required defaultValue={category?.name} className={inputCls} placeholder="e.g. Rings" />
          </div>

          {category && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Slug
              </label>
              <input name="slug" defaultValue={category.slug} className={inputCls} />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Description
            </label>
            <textarea name="description" rows={2} className={inputCls} defaultValue={category?.description ?? ""} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Fallback Image URL
            </label>
            <input
              name="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={inputCls}
              placeholder="https://…"
            />
          </div>

          {/* ── Multi-image carousel picker ── */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Carousel Images
              </label>
              <span className="text-xs text-gray-400">{imageUrls.length}/{MAX_IMAGES} selected</span>
            </div>

            {/* 4 slots */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {Array.from({ length: MAX_IMAGES }).map((_, i) => {
                const url = imageUrls[i];
                return (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 relative">
                    {url ? (
                      <>
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeSlot(i)}
                          className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                        >
                          <X size={10} />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Images size={16} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Product image picker grid */}
            {category && (
              <>
                <p className="text-xs text-gray-400 mb-1.5">
                  {imageUrls.length < MAX_IMAGES
                    ? "Click to add to carousel:"
                    : "Remove a slot to add more:"}
                </p>
                {loadingImages ? (
                  <div className="flex items-center gap-2 text-sm text-gray-400 py-1">
                    <Loader2 size={14} className="animate-spin" /> Loading…
                  </div>
                ) : productImages.length === 0 ? (
                  <p className="text-xs text-gray-400 py-1">No product images in this category yet.</p>
                ) : (
                  <div className="grid grid-cols-5 gap-2 max-h-44 overflow-y-auto rounded-lg border border-gray-100 p-2 bg-gray-50">
                    {productImages.map((img) => {
                      const selected = imageUrls.includes(img.url);
                      const order = imageUrls.indexOf(img.url);
                      return (
                        <button
                          key={img.url}
                          type="button"
                          onClick={() => toggleImage(img.url)}
                          disabled={!selected && imageUrls.length >= MAX_IMAGES}
                          title={img.productName}
                          className={`relative aspect-square rounded-md overflow-hidden border-2 transition-colors disabled:opacity-40 ${
                            selected
                              ? "border-rose-gold ring-1 ring-rose-gold"
                              : "border-transparent hover:border-gray-300"
                          }`}
                        >
                          <img src={img.url} alt={img.productName} className="w-full h-full object-cover" />
                          {selected && (
                            <div className="absolute inset-0 bg-rose-gold/20 flex items-center justify-center">
                              <span className="w-4 h-4 rounded-full bg-rose-gold text-white text-[9px] font-bold flex items-center justify-center">
                                {order + 1}
                              </span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Display Order
            </label>
            <input name="order" type="number" className={inputCls} defaultValue={category?.order ?? 0} />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="showInNav"
              name="showInNav"
              type="checkbox"
              defaultChecked={category?.showInNav ?? false}
              className="w-4 h-4 accent-rose-gold rounded"
            />
            <label htmlFor="showInNav" className="text-sm text-brown-dark font-medium cursor-pointer">
              Show in navigation bar
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
              {category ? "Save" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CategoriesClient({ categories }: { categories: Category[] }) {
  const sorted = [...categories].sort((a, b) => a.order - b.order);
  const [modal, setModal] = useState<"new" | Category | null>(null);

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-dark">Categories</h1>
          <p className="text-sm text-gray-400 mt-1">{sorted.length} total</p>
        </div>
        <button
          onClick={() => setModal("new")}
          className="flex items-center gap-2 bg-rose-gold hover:bg-rose-gold-dark text-white px-5 py-2.5 rounded-full font-semibold text-sm transition-colors"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 font-medium">Name</th>
              <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Slug</th>
              <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Order</th>
              <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Images</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50/50">
                <td className="px-5 py-3">
                  <div className="font-medium text-brown-dark">{cat.name}</div>
                  {cat.description && (
                    <div className="text-xs text-gray-400 truncate max-w-xs">{cat.description}</div>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-400 font-mono text-xs hidden md:table-cell">
                  {cat.slug}
                </td>
                <td className="px-5 py-3 text-gray-400 hidden md:table-cell">{cat.order}</td>
                <td className="px-5 py-3 hidden md:table-cell">
                  <div className="flex -space-x-1">
                    {((cat.imageUrls ?? []).length > 0 ? cat.imageUrls : cat.imageUrl ? [cat.imageUrl] : []).slice(0, 4).map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover border-2 border-white"
                      />
                    ))}
                    {(cat.imageUrls ?? []).length === 0 && !cat.imageUrl && (
                      <span className="text-xs text-gray-300 italic">none</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setModal(cat)}
                      className="p-1.5 text-gray-400 hover:text-rose-gold transition-colors"
                      aria-label="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={cat.id} />
                      <button
                        type="submit"
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Delete"
                        onClick={(e) => {
                          if (!confirm(`Delete "${cat.name}"?`)) e.preventDefault();
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
        <CategoryModal
          category={modal === "new" ? undefined : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
