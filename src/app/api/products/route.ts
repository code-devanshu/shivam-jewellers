import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/types/product";
import { v4 as uuidv4 } from "uuid";

// In-memory products array (will replace with DB later)
let products: Product[] = [
  {
    id: uuidv4(),
    name: "Gold Necklace",
    price: 34999,
    description: "Beautiful handcrafted gold necklace.",
    image: "/necklace.jpg",
  },
  {
    id: uuidv4(),
    name: "Diamond Earrings",
    price: 22999,
    description: "Elegant diamond-studded earrings.",
    image: "/earrings.jpg",
  },
];

// GET: List all products
export async function GET() {
  return NextResponse.json(products);
}

// POST: Add a product
export async function POST(req: NextRequest) {
  const { name, price, description, image } = await req.json();
  const newProduct: Product = {
    id: uuidv4(),
    name,
    price,
    description,
    image,
  };
  products.push(newProduct);
  return NextResponse.json(newProduct, { status: 201 });
}

// PUT: Edit a product
export async function PUT(req: NextRequest) {
  const { id, name, price, description, image } = await req.json();
  products = products.map((product) =>
    product.id === id
      ? { ...product, name, price, description, image }
      : product
  );
  return NextResponse.json({ success: true });
}

// DELETE: Remove a product
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  products = products.filter((product) => product.id !== id);
  return NextResponse.json({ success: true });
}
