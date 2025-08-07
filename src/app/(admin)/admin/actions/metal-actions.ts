// app/admin/actions/metal-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { MetalRate } from "@prisma/client";

// Utility to derive rate from material string
function getRateFromMaterial(material: string, rates: MetalRate): number {
  if (!material) return 0;

  if (material.includes("24K")) return rates.karat24;
  if (material.includes("22K")) return rates.karat22;
  if (material.includes("18K")) return rates.karat18;
  if (material.toLowerCase().includes("silver")) return rates.silverRate;

  return 0; // Default fallback
}

export async function getMetalRates() {
  return prisma.metalRate.findFirst();
}

export async function updateMetalRates(data: {
  karat24: number;
  karat22: number;
  karat18: number;
  silverRate: number;
}) {
  // 1. Upsert metal rates
  const updatedRates = await prisma.metalRate.upsert({
    where: { id: "1" },
    update: data,
    create: { id: "1", ...data },
  });

  // 2. Get all products to update their prices
  const products = await prisma.product.findMany({
    where: {
      material: { not: null },
      weight: { not: null },
    },
    select: {
      id: true,
      material: true,
      weight: true,
    },
  });

  // 3. Prepare chunked updates
  const chunkSize = 100;
  const updates = [];

  for (const product of products) {
    const material = product.material!;
    const weight = product.weight!;
    const rate = getRateFromMaterial(material, updatedRates);

    if (!rate || !weight) continue;

    const price = parseFloat(((rate / 10) * weight).toFixed(2));

    updates.push(
      prisma.product.update({
        where: { id: product.id },
        data: { price },
      })
    );
  }

  // 4. Apply in chunks to avoid overloading DB
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    await prisma.$transaction(chunk);
  }

  return updatedRates;
}
