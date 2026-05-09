"use client";

import { useEffect, useState, useTransition } from "react";
import { X, Check, Loader2, ImageOff, ChevronDown } from "lucide-react";
import { listProductImages, type CloudinaryImage } from "@/app/admin/products/list-images-action";

type Props = {
  currentUrl: string;
  onSelect: (url: string) => void;
  onClose: () => void;
};

export default function MediaPicker({ currentUrl, onSelect, onClose }: Props) {
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [selected, setSelected] = useState(currentUrl);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, startLoadMore] = useTransition();

  useEffect(() => {
    listProductImages().then((res) => {
      if ("error" in res) {
        setError(res.error);
      } else {
        setImages(res.images);
        setNextCursor(res.nextCursor);
      }
      setLoading(false);
    });
  }, []);

  function loadMore() {
    if (!nextCursor) return;
    startLoadMore(async () => {
      const res = await listProductImages(nextCursor);
      if ("error" in res) {
        setError(res.error);
      } else {
        setImages((prev) => [...prev, ...res.images]);
        setNextCursor(res.nextCursor);
      }
    });
  }

  function confirm() {
    if (selected) onSelect(selected);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-brown-dark">Media Library</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Grid */}
        <div className="overflow-y-auto flex-1 p-5">
          {loading ? (
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <ImageOff size={28} className="text-gray-300" />
              <p className="text-sm text-gray-400">{error}</p>
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <ImageOff size={28} className="text-gray-300" />
              <p className="text-sm font-medium text-gray-500">No images uploaded yet</p>
              <p className="text-xs text-gray-400">Upload an image using the drop zone first.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-3">
                {images.map((img) => {
                  const isSelected = selected === img.url;
                  return (
                    <button
                      key={img.publicId}
                      type="button"
                      onClick={() => setSelected(img.url)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all focus:outline-none ${
                        isSelected
                          ? "border-rose-gold ring-2 ring-rose-gold/30"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-rose-gold/20 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-rose-gold flex items-center justify-center">
                            <Check size={13} className="text-white" strokeWidth={3} />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {nextCursor && (
                <div className="flex justify-center mt-5">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-brown-dark border border-gray-200 px-5 py-2 rounded-full transition-colors disabled:opacity-50"
                  >
                    {isLoadingMore ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0">
          <p className="text-xs text-gray-400">
            {images.length > 0 && `${images.length} image${images.length !== 1 ? "s" : ""} loaded`}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={!selected}
              className="px-6 py-2 bg-rose-gold hover:bg-rose-gold-dark disabled:opacity-40 text-white rounded-full text-sm font-semibold transition-colors"
            >
              Use this image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
