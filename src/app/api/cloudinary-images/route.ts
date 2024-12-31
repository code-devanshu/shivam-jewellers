import { NextRequest, NextResponse } from "next/server";
import cloudinary from "cloudinary";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    console.log("Fetching images from Cloudinary with cursor:", cursor);

    // Fetch resources from Cloudinary with pagination
    const { resources, next_cursor } = await cloudinary.v2.api.resources({
      type: "upload",
      max_results: 100, // Maximum results per request
      next_cursor: cursor, // Cursor for fetching the next page
    });

    if (!resources || resources.length === 0) {
      return NextResponse.json({ images: [], next_cursor: null });
    }

    // Map the resources to a simpler structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const images = resources.map((resource: any) => ({
      secure_url: resource.secure_url,
      public_id: resource.public_id, // Include public ID for potential usage
    }));

    return NextResponse.json({ images, next_cursor });
  } catch (error) {
    console.error("Error fetching images from Cloudinary:", error);
    return NextResponse.json(
      { error: "Failed to fetch images from Cloudinary" },
      { status: 500 }
    );
  }
}
