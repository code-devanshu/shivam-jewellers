import type { MetalRate } from "./types";
import { mockMetals, mockMetalRates } from "./mock/data";
import { storeGetRateOverride } from "./admin-store";
import { db } from "./db";

async function getRatesFromDb(): Promise<MetalRate[] | null> {
  const [gold, silver] = await Promise.all([
    db.metalRate.findFirst({
      where: { metalId: "metal-gold" },
      orderBy: { effectiveAt: "desc" },
      include: { metal: true },
    }),
    db.metalRate.findFirst({
      where: { metalId: "metal-silver" },
      orderBy: { effectiveAt: "desc" },
      include: { metal: true },
    }),
  ]);

  if (!gold && !silver) return null;

  const rates: MetalRate[] = [];
  if (gold)
    rates.push({
      id: gold.id,
      metalId: gold.metalId,
      metal: {
        id: gold.metal.id,
        name: gold.metal.name,
        symbol: gold.metal.symbol,
      },
      ratePerGram: Number(gold.ratePerGram),
      source: gold.source,
      effectiveAt: gold.effectiveAt.toISOString(),
    });
  if (silver)
    rates.push({
      id: silver.id,
      metalId: silver.metalId,
      metal: {
        id: silver.metal.id,
        name: silver.metal.name,
        symbol: silver.metal.symbol,
      },
      ratePerGram: Number(silver.ratePerGram),
      source: silver.source,
      effectiveAt: silver.effectiveAt.toISOString(),
    });

  return rates;
}

export async function getLiveRates(): Promise<MetalRate[]> {
  const now = new Date().toISOString();

  const [goldOverride, silverOverride] = await Promise.all([
    storeGetRateOverride("metal-gold"),
    storeGetRateOverride("metal-silver"),
  ]);

  if (goldOverride && silverOverride) {
    return [
      {
        id: "override-gold",
        metalId: "metal-gold",
        metal: mockMetals[0],
        ratePerGram: Number(goldOverride.ratePerGram),
        source: "MANUAL",
        effectiveAt: goldOverride.effectiveAt.toISOString(),
      },
      {
        id: "override-silver",
        metalId: "metal-silver",
        metal: mockMetals[1],
        ratePerGram: Number(silverOverride.ratePerGram),
        source: "MANUAL",
        effectiveAt: silverOverride.effectiveAt.toISOString(),
      },
    ];
  }

  const dbRates = await getRatesFromDb();
  if (dbRates && dbRates.length > 0) {
    return dbRates;
  }

  if (goldOverride || silverOverride) {
    return [
      {
        id: "override-gold",
        metalId: "metal-gold",
        metal: mockMetals[0],
        ratePerGram: Number(goldOverride?.ratePerGram ?? mockMetalRates[0].ratePerGram),
        source: "MANUAL",
        effectiveAt: goldOverride?.effectiveAt.toISOString() ?? now,
      },
      {
        id: "override-silver",
        metalId: "metal-silver",
        metal: mockMetals[1],
        ratePerGram: Number(silverOverride?.ratePerGram ?? mockMetalRates[1].ratePerGram),
        source: "MANUAL",
        effectiveAt: silverOverride?.effectiveAt.toISOString() ?? now,
      },
    ];
  }

  return mockMetalRates;
}
