"use client";

// All product imagery is hosted on Cloudinary, which already resizes/optimizes
// on upload (see upload-image-action.ts). Routing every render through Vercel's
// Image Optimization API on top of that burns transformation quota for no
// benefit — so we ask Cloudinary to do the per-size delivery transform itself
// via its URL syntax instead. Non-Cloudinary sources (dev/mock placeholders)
// are served as-is.
const CLOUDINARY_UPLOAD_MARKER = "/image/upload/";

export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const markerIndex = src.indexOf(CLOUDINARY_UPLOAD_MARKER);
  if (markerIndex === -1) {
    // Not a Cloudinary asset (e.g. seed/mock imagery). Still vary the URL by
    // width so Next's loader-width check passes and responsive srcsets work.
    try {
      const url = new URL(src);
      url.searchParams.set("w", String(width));
      return url.toString();
    } catch {
      return src;
    }
  }

  const insertAt = markerIndex + CLOUDINARY_UPLOAD_MARKER.length;
  const params = ["f_auto", "c_limit", `w_${width}`, `q_${quality ?? "auto"}`].join(",");

  return `${src.slice(0, insertAt)}${params}/${src.slice(insertAt)}`;
}
