/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

// 🔍 Get single product by ID
export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
  });
}

export async function getRelatedProducts(productId: string, category: string) {
  return prisma.product.findMany({
    where: {
      category,
      NOT: { id: productId },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
}

// 📦 Get all products with optional price filter & sort
export async function getProducts(
  page = 1,
  limit = 10,
  filter: {
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    search?: string;
  } = {}
) {
  const skip = (page - 1) * limit;
  const where: any = {};

  // 🔍 Elastic-style full-field search (broad)
  if (filter.search) {
    const searchTerm = filter.search.trim();

    where.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { material: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
      { category: { contains: searchTerm, mode: "insensitive" } },
      { subCategory: { contains: searchTerm, mode: "insensitive" } },
      { gender: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  // 💰 Price filtering
  if (filter.minPrice !== undefined) {
    where.price = { ...(where.price || {}), gte: filter.minPrice };
  }

  if (filter.maxPrice !== undefined) {
    where.price = { ...(where.price || {}), lte: filter.maxPrice };
  }

  // 🔃 Sorting logic
  let orderBy: any = { createdAt: "desc" };
  if (filter.sort === "price-asc") orderBy = { price: "asc" };
  if (filter.sort === "price-desc") orderBy = { price: "desc" };
  if (filter.sort === "newest") orderBy = { createdAt: "desc" };

  // 📦 Get data
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: limit,
      where,
      orderBy,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total };
}

// ➕ Add new product
export async function addProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const price = Number(formData.get("price"));
  const description = formData.get("description") as string;
  const quantity = Number(formData.get("quantity"));
  const weight = Number(formData.get("weight"));
  const material = formData.get("material") as string;
  const category = formData.get("category") as string;
  const subCategory = formData.get("subCategory") as string;
  const gender = formData.get("gender") as string;
  const images = JSON.parse(formData.get("images") as string) as string[];

  if (!name || !price || !description || !category || !subCategory || !gender) {
    redirect("/admin/add-product?error=All+fields+are+required");
  }

  await prisma.product.create({
    data: {
      name,
      price,
      description,
      material,
      weight: isNaN(weight) ? null : weight,
      quantity: isNaN(quantity) ? null : quantity,
      category,
      subCategory,
      gender,
      images,
    },
  });

  redirect("/admin/inventory");
}

// ✏️ Edit existing product
export async function editProduct(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const price = Number(formData.get("price"));
  const description = formData.get("description") as string;
  const quantity = Number(formData.get("quantity"));
  const weight = Number(formData.get("weight"));
  const material = formData.get("material") as string;
  const category = formData.get("category") as string;
  const subCategory = formData.get("subCategory") as string;
  const gender = formData.get("gender") as string;
  const images = JSON.parse(formData.get("images") as string) as string[];

  if (
    !id ||
    !name ||
    !price ||
    !description ||
    !category ||
    !subCategory ||
    !gender
  ) {
    redirect(`/admin/edit-product?id=${id}&error=All+fields+are+required`);
  }

  await prisma.product.update({
    where: { id },
    data: {
      name,
      price,
      description,
      weight: isNaN(weight) ? null : weight,
      quantity: isNaN(quantity) ? null : quantity,
      material,
      category,
      subCategory,
      gender,
      images,
    },
  });

  redirect("/admin/inventory");
}

// ❌ Delete product
export async function deleteProduct(formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) {
    redirect("/admin?error=Missing+product+ID");
  }

  await prisma.product.delete({
    where: { id },
  });

  redirect("/admin/inventory");
}
