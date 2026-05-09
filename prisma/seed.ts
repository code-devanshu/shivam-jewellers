import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // ── Metals ────────────────────────────────────────────────────────────────
  const gold = await db.metal.upsert({
    where: { id: "metal-gold" },
    update: {},
    create: { id: "metal-gold", name: "Gold", symbol: "Au" },
  });
  const silver = await db.metal.upsert({
    where: { id: "metal-silver" },
    update: {},
    create: { id: "metal-silver", name: "Silver", symbol: "Ag" },
  });
  console.log("✓ Metals");

  // ── Categories ────────────────────────────────────────────────────────────
  const rings = await db.category.upsert({
    where: { slug: "rings" },
    update: {},
    create: {
      id: "cat-rings",
      name: "Rings",
      slug: "rings",
      description: "Elegant rings in gold and silver — from classic bands to statement pieces.",
      imageUrl: "https://images.unsplash.com/photo-1588892239270-bab4a57b4b67?fm=jpg&q=80&w=800&auto=format&fit=crop",
      order: 1,
      showInNav: true,
    },
  });
  const necklaces = await db.category.upsert({
    where: { slug: "necklaces" },
    update: {},
    create: {
      id: "cat-necklaces",
      name: "Necklaces",
      slug: "necklaces",
      description: "Handcrafted necklaces from delicate chains to ornate traditional sets.",
      imageUrl: "https://images.unsplash.com/photo-1611012756377-05e2e4269fa3?fm=jpg&q=80&w=800&auto=format&fit=crop",
      order: 2,
      showInNav: true,
    },
  });
  const earrings = await db.category.upsert({
    where: { slug: "earrings" },
    update: {},
    create: {
      id: "cat-earrings",
      name: "Earrings",
      slug: "earrings",
      description: "From everyday studs to festive jhumkas — earrings for every occasion.",
      imageUrl: "https://images.unsplash.com/photo-1638854254875-a2416fe0fec2?fm=jpg&q=80&w=800&auto=format&fit=crop",
      order: 3,
      showInNav: true,
    },
  });
  const bangles = await db.category.upsert({
    where: { slug: "bangles" },
    update: {},
    create: {
      id: "cat-bangles",
      name: "Bangles",
      slug: "bangles",
      description: "Traditional and contemporary bangles in gold and silver.",
      imageUrl: "https://images.unsplash.com/photo-1617191880362-aac615de3c26?fm=jpg&q=80&w=800&auto=format&fit=crop",
      order: 4,
      showInNav: true,
    },
  });
  const pendants = await db.category.upsert({
    where: { slug: "pendants" },
    update: {},
    create: {
      id: "cat-pendants",
      name: "Pendants",
      slug: "pendants",
      description: "Meaningful pendants — deity motifs, Om, hearts, and more.",
      imageUrl: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?fm=jpg&q=80&w=800&auto=format&fit=crop",
      order: 5,
      showInNav: true,
    },
  });
  console.log("✓ Categories");

  // ── Products ──────────────────────────────────────────────────────────────

  const products = [
    // ── Rings
    {
      id: "prod-ring-1",
      name: "Classic 22K Gold Band Ring",
      slug: "classic-22k-gold-band-ring",
      description:
        "A timeless plain band in 22K gold, perfect for everyday wear or as a wedding band. BIS hallmarked.",
      categoryId: rings.id,
      metalId: gold.id,
      purity: "22K",
      purityPercent: 0.9167,
      weightGrams: 3.8,
      grossWeightGrams: 3.8,
      makingChargeType: "PERCENT" as const,
      makingCharge: 12,
      gstPercent: 3,
      isAvailable: true,
      isFeatured: true,
      stockQty: 8,
      images: [
        {
          id: "img-ring-1-1",
          url: "https://images.unsplash.com/photo-1588892239270-bab4a57b4b67?fm=jpg&q=80&w=800&auto=format&fit=crop",
          publicId: "unsplash/ring-1-1",
          isPrimary: true,
          order: 0,
        },
      ],
    },
    {
      id: "prod-ring-2",
      name: "Floral 18K Gold Ring",
      slug: "floral-18k-gold-ring",
      description:
        "A delicate floral-motif ring in 18K gold, ideal for gifting or special occasions.",
      categoryId: rings.id,
      metalId: gold.id,
      purity: "18K",
      purityPercent: 0.75,
      weightGrams: 4.2,
      grossWeightGrams: 4.5,
      makingChargeType: "PERCENT" as const,
      makingCharge: 15,
      gstPercent: 3,
      isAvailable: true,
      isFeatured: false,
      stockQty: 5,
      images: [
        {
          id: "img-ring-2-1",
          url: "https://images.unsplash.com/photo-1633934542430-0905ccb5f050?fm=jpg&q=80&w=800&auto=format&fit=crop",
          publicId: "unsplash/ring-2-1",
          isPrimary: true,
          order: 0,
        },
      ],
    },

    // ── Necklaces
    {
      id: "prod-necklace-1",
      name: "Traditional 22K Gold Necklace",
      slug: "traditional-22k-gold-necklace",
      description:
        "A rich traditional necklace in 22K gold with intricate craftsmanship, ideal for weddings and festivals.",
      categoryId: necklaces.id,
      metalId: gold.id,
      purity: "22K",
      purityPercent: 0.9167,
      weightGrams: 14.5,
      grossWeightGrams: 15.0,
      makingChargeType: "PERCENT" as const,
      makingCharge: 14,
      gstPercent: 3,
      isAvailable: true,
      isFeatured: true,
      stockQty: 3,
      images: [
        {
          id: "img-necklace-1-1",
          url: "https://images.unsplash.com/photo-1611012756377-05e2e4269fa3?fm=jpg&q=80&w=800&auto=format&fit=crop",
          publicId: "unsplash/necklace-1-1",
          isPrimary: true,
          order: 0,
        },
      ],
    },
    {
      id: "prod-necklace-2",
      name: "Layered Gold Chain Necklace",
      slug: "layered-gold-chain-necklace",
      description:
        "A modern multi-layered gold chain necklace in 18K gold — versatile for casual and formal looks.",
      categoryId: necklaces.id,
      metalId: gold.id,
      purity: "18K",
      purityPercent: 0.75,
      weightGrams: 8.5,
      grossWeightGrams: 8.5,
      makingChargeType: "PERCENT" as const,
      makingCharge: 16,
      gstPercent: 3,
      isAvailable: true,
      isFeatured: false,
      stockQty: 6,
      images: [
        {
          id: "img-necklace-2-1",
          url: "https://images.unsplash.com/photo-1643300866907-032b3baeeb1f?fm=jpg&q=80&w=800&auto=format&fit=crop",
          publicId: "unsplash/necklace-2-1",
          isPrimary: true,
          order: 0,
        },
      ],
    },

    // ── Earrings
    {
      id: "prod-earring-1",
      name: "Gold Jhumka Earrings",
      slug: "gold-jhumka-earrings",
      description:
        "Classic 22K gold jhumka earrings with a bell-shaped drop, perfect for ethnic wear.",
      categoryId: earrings.id,
      metalId: gold.id,
      purity: "22K",
      purityPercent: 0.9167,
      weightGrams: 5.2,
      grossWeightGrams: 5.5,
      makingChargeType: "PERCENT" as const,
      makingCharge: 18,
      gstPercent: 3,
      isAvailable: true,
      isFeatured: true,
      stockQty: 10,
      images: [
        {
          id: "img-earring-1-1",
          url: "https://images.unsplash.com/photo-1638854254875-a2416fe0fec2?fm=jpg&q=80&w=800&auto=format&fit=crop",
          publicId: "unsplash/earring-1-1",
          isPrimary: true,
          order: 0,
        },
      ],
    },
    {
      id: "prod-earring-2",
      name: "Gold Drop Earrings",
      slug: "gold-drop-earrings",
      description:
        "Elegant 18K gold drop earrings, lightweight and perfect for daily wear or semi-formal occasions.",
      categoryId: earrings.id,
      metalId: gold.id,
      purity: "18K",
      purityPercent: 0.75,
      weightGrams: 3.5,
      grossWeightGrams: 3.8,
      makingChargeType: "PERCENT" as const,
      makingCharge: 16,
      gstPercent: 3,
      isAvailable: true,
      isFeatured: false,
      stockQty: 12,
      images: [
        {
          id: "img-earring-2-1",
          url: "https://images.unsplash.com/photo-1611271525579-9402f4d6a7e5?fm=jpg&q=80&w=800&auto=format&fit=crop",
          publicId: "unsplash/earring-2-1",
          isPrimary: true,
          order: 0,
        },
      ],
    },

    // ── Bangles
    {
      id: "prod-bangle-1",
      name: "Kundan Gold Bangle",
      slug: "kundan-gold-bangle",
      description:
        "A pair of stunning 22K gold Kundan bangles with meenakari work — a bridal staple.",
      categoryId: bangles.id,
      metalId: gold.id,
      purity: "22K",
      purityPercent: 0.9167,
      weightGrams: 18.0,
      grossWeightGrams: 19.0,
      makingChargeType: "FIXED" as const,
      makingCharge: 2500,
      gstPercent: 3,
      isAvailable: true,
      isFeatured: true,
      stockQty: 4,
      images: [
        {
          id: "img-bangle-1-1",
          url: "https://images.unsplash.com/photo-1617191880362-aac615de3c26?fm=jpg&q=80&w=800&auto=format&fit=crop",
          publicId: "unsplash/bangle-1-1",
          isPrimary: true,
          order: 0,
        },
      ],
    },
    {
      id: "prod-bangle-2",
      name: "Silver Twisted Bangle",
      slug: "silver-twisted-bangle",
      description:
        "A contemporary 925 silver twisted bangle — lightweight, modern, and great for stacking.",
      categoryId: bangles.id,
      metalId: silver.id,
      purity: "925",
      purityPercent: 0.925,
      weightGrams: 12.0,
      grossWeightGrams: 12.0,
      makingChargeType: "FIXED" as const,
      makingCharge: 450,
      gstPercent: 3,
      isAvailable: true,
      isFeatured: false,
      stockQty: 15,
      images: [
        {
          id: "img-bangle-2-1",
          url: "https://images.unsplash.com/photo-1611598935678-c88dca238fce?fm=jpg&q=80&w=800&auto=format&fit=crop",
          publicId: "unsplash/bangle-2-1",
          isPrimary: true,
          order: 0,
        },
      ],
    },

    // ── Pendants
    {
      id: "prod-pendant-1",
      name: "Om Gold Pendant",
      slug: "om-gold-pendant",
      description:
        "A sacred Om pendant in 22K gold, crafted with fine detail. Comes without chain.",
      categoryId: pendants.id,
      metalId: gold.id,
      purity: "22K",
      purityPercent: 0.9167,
      weightGrams: 2.5,
      grossWeightGrams: 2.5,
      makingChargeType: "PERCENT" as const,
      makingCharge: 20,
      gstPercent: 3,
      isAvailable: true,
      isFeatured: true,
      stockQty: 20,
      images: [
        {
          id: "img-pendant-1-1",
          url: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?fm=jpg&q=80&w=800&auto=format&fit=crop",
          publicId: "unsplash/pendant-1-1",
          isPrimary: true,
          order: 0,
        },
      ],
    },
    {
      id: "prod-pendant-2",
      name: "Hamsa Hand Gold Pendant",
      slug: "hamsa-hand-gold-pendant",
      description:
        "A beautifully detailed Hamsa hand pendant in 18K gold — a symbol of protection and blessings.",
      categoryId: pendants.id,
      metalId: gold.id,
      purity: "18K",
      purityPercent: 0.75,
      weightGrams: 2.0,
      grossWeightGrams: 2.2,
      makingChargeType: "PERCENT" as const,
      makingCharge: 22,
      gstPercent: 3,
      isAvailable: true,
      isFeatured: false,
      stockQty: 18,
      images: [
        {
          id: "img-pendant-2-1",
          url: "https://images.unsplash.com/photo-1601121141461-920cb1993441?fm=jpg&q=80&w=800&auto=format&fit=crop",
          publicId: "unsplash/pendant-2-1",
          isPrimary: true,
          order: 0,
        },
      ],
    },
  ];

  for (const { images, ...product } of products) {
    await db.product.upsert({
      where: { id: product.id },
      update: {},
      create: {
        ...product,
        images: {
          create: images,
        },
      },
    });
  }
  console.log(`✓ Products (${products.length})`);

  console.log("\nSeed complete.");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
