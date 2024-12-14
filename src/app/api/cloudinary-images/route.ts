import { NextResponse } from "next/server";
import cloudinary from "cloudinary";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    // Fetch resources from Cloudinary
    const { resources } = await cloudinary.v2.api.resources({
      type: "upload",
    });

    if (!resources || resources.length === 0) {
      console.warn("No images found in the specified folder.");
      return NextResponse.json([]);
    }

    // Map the resources to a simpler structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const images = resources.map((resource: any) => ({
      url: resource.secure_url,
      id: resource.public_id,
    }));

    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching images from Cloudinary:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
