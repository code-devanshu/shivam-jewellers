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
    // Use req.nextUrl to handle the URL properly
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    // Fetch resources from Cloudinary with pagination
    const { resources, next_cursor } = await cloudinary.v2.api.resources({
      type: "upload",
      max_results: 100, // Maximum results per request
      next_cursor: cursor, // Cursor for fetching the next page
    });

    if (!resources || resources.length === 0) {
      console.warn("No images found in the specified folder.");
      return NextResponse.json([]);
    }

    // Map the resources to a simpler structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const images = resources.map((resource: any) => resource.secure_url);

    return NextResponse.json({ images, next_cursor }); // Include the next cursor for pagination
  } catch (error) {
    console.error("Error fetching images from Cloudinary:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
