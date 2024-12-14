import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cloudinary from "cloudinary";

export async function GET() {
  const products = await prisma.product.findMany();
  return NextResponse.json(products);
}

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    // Extract FormData
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string;
    const file = formData.get("image") as Blob;
    const material = formData.get("material") as string;
    const rating = formData.has("rating")
      ? parseInt(formData.get("rating") as string, 10)
      : null;
    const category = formData.get("category") as string;
    const subcategory = formData.get("subcategory") as string;
    const gender = formData.get("gender") as "Men" | "Women" | "Unisex";

    // Validate inputs
    if (!name || isNaN(price) || !description || !file || !gender) {
      return NextResponse.json(
        { error: "All fields are required, and price must be a number" },
        { status: 400 }
      );
    }

    // Upload image to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader
        .upload_stream({ resource_type: "auto" }, (error, result) => {
          if (error) reject(error);
          resolve(result);
        })
        .end(buffer);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageUrl = (uploadResult as any).secure_url;

    // Create the product in the database
    const product = await prisma.product.create({
      data: {
        name,
        price,
        description,
        image: imageUrl,
        material: material || null,
        rating: rating || null,
        category: category || null,
        subcategory: subcategory || null,
        gender,
      },
    });

    // Return success response
    return NextResponse.json(
      { message: "Product added successfully", product },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Parse request body
    const data = await req.json();
    const { id, name, price, description, image } = data;

    // Validate inputs
    if (!id || !name || !price || !description || !image) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Convert price to Float
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      return NextResponse.json(
        { error: "Price must be a valid number" },
        { status: 400 }
      );
    }

    // Update product in the database
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: parsedPrice, // Use the parsed float value
        description,
        image,
      },
    });

    // Return success response
    return NextResponse.json(
      { message: "Product updated successfully", product: updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ message: "Product deleted" });
}
