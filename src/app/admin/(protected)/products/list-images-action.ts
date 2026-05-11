"use server";

import { cloudinary } from "@/lib/cloudinary";

export type CloudinaryImage = {
  publicId: string;
  url: string;
  width: number;
  height: number;
  createdAt: string;
};

export type ListImagesResult =
  | { images: CloudinaryImage[]; nextCursor: string | null }
  | { error: string };

export async function listProductImages(cursor?: string): Promise<ListImagesResult> {
  try {
    const res = await cloudinary.api.resources({
      type: "upload",
      max_results: 24,
      next_cursor: cursor,
    });

    const images: CloudinaryImage[] = res.resources.map(
      (r: { public_id: string; secure_url: string; width: number; height: number; created_at: string }) => ({
        publicId: r.public_id,
        url: r.secure_url,
        width: r.width,
        height: r.height,
        createdAt: r.created_at,
      })
    );

    return { images, nextCursor: res.next_cursor ?? null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load images from Cloudinary.";
    return { error: msg };
  }
}
