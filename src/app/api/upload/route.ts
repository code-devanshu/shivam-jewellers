import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const files = data.getAll("images");

  const savedFiles: string[] = [];
  for (const file of files) {
    if (typeof file === "object" && "arrayBuffer" in file) {
      const bytes = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}-${
        (file as any).name
      }`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const filepath = path.join(uploadDir, filename);
      await fs.writeFile(filepath, bytes);

      const url = `/uploads/${filename}`;
      savedFiles.push(url);

      // Save to Image library
      await prisma.image.create({
        data: {
          url,
          altText: null, // You can extend your upload UI to accept alt text later
        },
      });
    }
  }

  return NextResponse.json({ files: savedFiles });
}
