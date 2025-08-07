import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const files = data.getAll("images");

  const savedFiles: string[] = [];

  for (const file of files) {
    if (typeof file === "object" && "arrayBuffer" in file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Create a base64 data URI from the buffer
      const base64 = buffer.toString("base64");
      const mime = (file as File).type;
      const dataUri = `data:${mime};base64,${base64}`;

      try {
        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(dataUri, {
          folder: "shivam-jewellers-assets", // Optional: set folder in Cloudinary
          public_id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        });

        const url = uploadResponse.secure_url;
        savedFiles.push(url);

        // Save to DB
        await prisma.image.create({
          data: {
            url,
            altText: null,
          },
        });
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        return NextResponse.json(
          { error: "Image upload failed" },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ files: savedFiles });
}
