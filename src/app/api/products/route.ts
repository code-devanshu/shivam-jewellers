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
    const imageInput = formData.get("images") as string; // Can be a URL or File
    const material = formData.get("material") as string;
    const rating = formData.has("rating")
      ? parseInt(formData.get("rating") as string, 10)
      : null;
    const category = formData.get("category") as string;
    const subcategory = formData.get("subcategory") as string;
    const gender = formData.get("gender") as "Men" | "Women" | "Unisex";

    if (!name || isNaN(price) || !description || !imageInput || !gender) {
      return NextResponse.json(
        { error: "All fields are required, and price must be a number" },
        { status: 400 }
      );
    }

    // Create the product in the database
    const product = await prisma.product.create({
      data: {
        name,
        price,
        description,
        image: JSON.parse(imageInput),
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
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string;
    const imageInput = formData.get("images") as string;
    const material = formData.get("material") as string;
    const category = formData.get("category") as string;
    const subcategory = formData.get("subcategory") as string;
    const gender = formData.get("gender") as "Men" | "Women" | "Unisex";

    // Validate inputs
    if (
      !id ||
      !name ||
      isNaN(price) ||
      !description ||
      !imageInput ||
      !gender
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // // Update product in the database
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        price,
        description,
        image: JSON.parse(imageInput),
        material: material || null,
        category: category || null,
        subcategory: subcategory || null,
        gender,
      },
    });

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
