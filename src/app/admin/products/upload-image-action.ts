"use server";

import { cloudinary } from "@/lib/cloudinary";

type UploadResult =
  | { url: string; publicId: string }
  | { error: string };

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export async function uploadProductImage(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file");
  if (!file || typeof file === "string") return { error: "No file provided." };

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Only JPEG, PNG, WebP, or AVIF images are allowed." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Image must be under 10 MB." };
  }

  const bytes = await file.arrayBuffer();
  const dataUri = `data:${file.type};base64,${Buffer.from(bytes).toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "shivam-jewellers/products",
    transformation: [
      { width: 1200, height: 1200, crop: "limit" },
      { quality: "auto", fetch_format: "auto" },
    ],
  });

  return { url: result.secure_url, publicId: result.public_id };
}
