"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2, X, AlertCircle, Library } from "lucide-react";
import { uploadProductImage } from "@/app/admin/(protected)/products/upload-image-action";
import MediaPicker from "@/components/admin/MediaPicker";

type Props = {
  defaultUrls?: string[];
};

export default function MultiImageUploader({ defaultUrls = [] }: Props) {
  const [urls, setUrls] = useState<string[]>(defaultUrls);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | null | undefined) {
    if (!file) return;
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    startTransition(async () => {
      const result = await uploadProductImage(fd);
      if ("error" in result) {
        setError(result.error);
      } else {
        setUrls((prev) => [...prev, result.url]);
      }
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function remove(idx: number) {
    setUrls((prev) => prev.filter((_, i) => i !== idx));
  }

  function makePrimary(idx: number) {
    setUrls((prev) => {
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      return [item, ...next];
    });
  }

  return (
    <div className="space-y-3">
      {/* Hidden form values — one per image, order determines primary */}
      {urls.map((url, i) => (
        <input key={i} type="hidden" name="images[]" value={url} />
      ))}

      <div className="flex flex-wrap gap-3">
        {urls.map((url, idx) => (
          <div key={idx} className="relative group">
            <div
              className={`w-24 h-24 rounded-xl overflow-hidden border-2 transition-colors ${
                idx === 0 ? "border-rose-gold" : "border-gray-200"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>

            {idx === 0 && (
              <span className="absolute top-1 left-1 bg-rose-gold text-white text-[10px] font-semibold px-1.5 py-0.5 rounded leading-none pointer-events-none">
                Primary
              </span>
            )}

            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              aria-label="Remove image"
            >
              <X size={11} />
            </button>

            {idx !== 0 && (
              <button
                type="button"
                onClick={() => makePrimary(idx)}
                className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-white bg-black/50 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-gold whitespace-nowrap"
              >
                Set primary
              </button>
            )}
          </div>
        ))}

        {/* Add-more / empty-state tile */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-40 ${
            isDragging
              ? "border-rose-gold bg-rose-gold/5"
              : "border-gray-200 hover:border-rose-gold/50 hover:bg-gray-50"
          }`}
        >
          {isPending ? (
            <Loader2 size={18} className="text-rose-gold animate-spin" />
          ) : (
            <>
              <ImagePlus size={18} className="text-gray-300" />
              <span className="text-[10px] text-gray-400">
                {urls.length === 0 ? "Add image" : "Add more"}
              </span>
            </>
          )}
        </button>
      </div>

      {urls.length === 0 && (
        <p className="text-xs text-gray-400">
          Drag &amp; drop onto the tile or click to browse · JPEG, PNG, WebP · max 10 MB
        </p>
      )}

      <div className="flex items-center gap-3">
        {urls.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs text-rose-gold hover:text-rose-gold-dark font-medium transition-colors"
            >
              Upload image
            </button>
            <span className="text-gray-200 text-xs">|</span>
          </>
        )}
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-brown-dark font-medium transition-colors"
        >
          <Library size={12} />
          Choose from library
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {isPending && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Loader2 size={12} className="animate-spin" /> Uploading…
        </div>
      )}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle size={13} /> {error}
        </div>
      )}

      {pickerOpen && (
        <MediaPicker
          currentUrl={urls[0] ?? ""}
          onSelect={(picked) => {
            if (!urls.includes(picked)) setUrls((prev) => [...prev, picked]);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
