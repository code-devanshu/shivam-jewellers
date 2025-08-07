"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface ImageItem {
  id: string;
  url: string;
  altText?: string | null;
}

interface Props {
  selectedImages: string[];
  onChange: (images: string[]) => void;
  onClose?: () => void;
  onSelect?: (images: string[]) => void;
}

export default function ImageLibrarySelector({
  selectedImages,
  onChange,
  onClose,
  onSelect,
}: Props) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchImages = async (pageToFetch: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/images?page=${pageToFetch}&limit=${limit}`);
      const data = await res.json();
      setImages(data.images);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(page);
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  const toggleImage = (url: string) => {
    if (selectedImages.includes(url)) {
      onChange(selectedImages.filter((img) => img !== url));
    } else {
      onChange([...selectedImages, url]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select from Image Library</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 text-xl font-bold"
            title="Close"
          >
            ×
          </button>
        </div>

        {loading ? (
          <p>Loading images...</p>
        ) : images.length === 0 ? (
          <p>No uploaded images found.</p>
        ) : (
          <>
            <div className="grid grid-cols-5 gap-3 max-h-64 overflow-y-auto border rounded p-2 bg-white">
              {images.map((img) => {
                const isSelected = selectedImages.includes(img.url);
                return (
                  <div
                    key={img.id}
                    className={`relative cursor-pointer rounded border ${
                      isSelected
                        ? "border-pink-600 ring-2 ring-pink-500"
                        : "border-gray-300"
                    }`}
                    onClick={() => toggleImage(img.url)}
                    title={img.altText || ""}
                  >
                    <Image
                      src={img.url}
                      alt={img.altText || "uploaded image"}
                      width={80}
                      height={80}
                      className="object-cover w-full h-20 rounded"
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-pink-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <nav className="flex justify-center mt-4 space-x-4">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className={`px-3 py-1 rounded ${
                  page <= 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-pink-500 text-white"
                }`}
              >
                Previous
              </button>
              <span className="px-3 py-1 rounded bg-gray-100 text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className={`px-3 py-1 rounded ${
                  page >= totalPages
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-pink-500 text-white"
                }`}
              >
                Next
              </button>
            </nav>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onSelect?.(selectedImages)}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded"
              >
                Select
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
