"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import ImageLibrarySelector from "./ImageLibrarySelector";

export default function ImagesBridge({
  initialImages = [],
  name,
}: {
  initialImages?: string[];
  name: string;
}) {
  const [isLibraryOpen, setLibraryOpen] = useState(false);
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const uploadData = new FormData();
    Array.from(e.target.files).forEach((file) =>
      uploadData.append("images", file)
    );

    setUploading(true);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const result = await res.json();
      const uploaded = result.files as string[];

      const updated = [...images, ...uploaded];
      setImages(updated);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
  };

  return (
    <>
      <input type="hidden" name={name} value={JSON.stringify(images)} />

      <div className="space-y-4">
        {/* Upload from file */}
        <div>
          <label className="block font-medium text-sm text-gray-700 mb-2">
            Upload New Images
          </label>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="px-4 py-2 bg-pink-600 text-white text-sm rounded hover:bg-pink-700 transition"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "📁 Choose Files"}
            </button>
            <span className="text-xs text-gray-500 hidden sm:inline">
              JPG, PNG — You can select multiple images
            </span>
          </div>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFiles}
            ref={fileInputRef}
            disabled={uploading}
            className="hidden"
          />
        </div>

        {/* Preview uploaded images */}
        {images.length > 0 && (
          <div>
            <label className="block font-medium text-sm text-gray-700 mb-2">
              Preview
            </label>

            <div className="flex gap-3 flex-wrap">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="relative w-24 h-24 border border-neutral-200 rounded-lg overflow-hidden bg-neutral-100 shadow-sm"
                >
                  <Image
                    src={img}
                    alt={`Uploaded ${i}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(i)}
                    className="absolute top-0 right-0 bg-black bg-opacity-60 text-white text-xs w-6 h-6 flex items-center justify-center rounded-bl hover:bg-red-600 transition"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className="mt-2 px-4 py-2 bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-300 rounded-md font-medium transition"
        >
          📁 Select from Image Library
        </button>

        {isLibraryOpen && (
          <ImageLibrarySelector
            selectedImages={images}
            onChange={(imgs) => setImages(imgs)} // sync preview while selecting
            onSelect={(imgs) => {
              setImages(imgs); // finalize selection
              setLibraryOpen(false); // close modal
            }}
            onClose={() => setLibraryOpen(false)}
          />
        )}
      </div>
    </>
  );
}
