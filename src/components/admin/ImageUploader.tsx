"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2, X, AlertCircle, Library } from "lucide-react";
import { uploadProductImage } from "@/app/admin/products/upload-image-action";
import MediaPicker from "@/components/admin/MediaPicker";

type Props = {
  name: string;
  defaultUrl?: string;
};

export default function ImageUploader({ name, defaultUrl = "" }: Props) {
  const [url, setUrl] = useState(defaultUrl);
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
        setUrl(result.url);
      }
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  return (
    <div className="space-y-2">
      {/* Hidden form value */}
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-gray-200 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Product" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => setUrl("")}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            aria-label="Remove image"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 w-full h-36 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
            isDragging
              ? "border-rose-gold bg-rose-gold/5"
              : "border-gray-200 hover:border-rose-gold/50 hover:bg-gray-50"
          }`}
        >
          {isPending ? (
            <Loader2 size={22} className="text-rose-gold animate-spin" />
          ) : (
            <>
              <ImagePlus size={22} className="text-gray-300" />
              <p className="text-xs text-gray-400 text-center leading-relaxed">
                Drag image here or{" "}
                <span className="text-rose-gold font-medium">browse</span>
                <br />
                <span className="text-[11px]">JPEG, PNG, WebP · max 10 MB</span>
              </p>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Action links */}
      <div className="flex items-center gap-3">
        {url && !isPending && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs text-rose-gold hover:text-rose-gold-dark font-medium transition-colors"
          >
            Replace image
          </button>
        )}
        {url && !isPending && (
          <span className="text-gray-200 text-xs">|</span>
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
          currentUrl={url}
          onSelect={(picked) => setUrl(picked)}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
