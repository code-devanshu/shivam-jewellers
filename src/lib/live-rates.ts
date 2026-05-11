import type { MetalRate } from "./types";
import { mockMetals, mockMetalRates } from "./mock/data";
import { storeGetRateOverride } from "./admin-store";
import { db } from "./db";

const TROY_OZ_TO_GRAMS = 31.1035;
const BASE_URL = "https://www.goldapi.io/api";

type GoldApiResponse = {
  timestamp: number;
  metal: string;
  currency: string;
  price: number; // INR per troy ounce
};

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

async function fetchSpotPrice(
  symbol: "XAU" | "XAG",
  apiKey: string,
): Promise<number> {
  const res = await fetch(`${BASE_URL}/${symbol}/INR`, {
    headers: {
      "x-access-token": apiKey,
      "Content-Type": "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok)
    throw new Error(`goldapi.io ${symbol}: ${res.status} ${res.statusText}`);

  const data: GoldApiResponse = await res.json();
  return Math.round(data.price / TROY_OZ_TO_GRAMS);
}

export async function getLiveRates(): Promise<MetalRate[]> {
  const now = new Date().toISOString();
  console.log(`[rates] Fetching live rates at ${now}`);

  // Admin manual overrides always take priority
  const [goldOverride, silverOverride] = await Promise.all([
    storeGetRateOverride("metal-gold"),
    storeGetRateOverride("metal-silver"),
  ]);

  if (goldOverride && silverOverride) {
    console.info("[rates] Using full manual overrides for Gold and Silver");
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

  const apiKey = process.env.GOLDAPI_KEY;

  if (!apiKey) {
    console.warn("[rates] GOLDAPI_KEY not set — using mock rates");
    return mockMetalRates;
  }

  try {
    console.log("[rates] Initiating external API fetch...");

    const [goldPerGram, silverPerGram] = await Promise.all([
      goldOverride
        ? (console.log("[rates] Gold: Using manual override"),
          Promise.resolve(goldOverride.ratePerGram))
        : fetchSpotPrice("XAU", apiKey),
      silverOverride
        ? (console.log("[rates] Silver: Using manual override"),
          Promise.resolve(silverOverride.ratePerGram))
        : fetchSpotPrice("XAG", apiKey),
    ]);

    console.log(
      `[rates] Success. Gold: ${goldPerGram}/g, Silver: ${silverPerGram}/g`,
    );

    return [
      {
        id: "live-rate-gold",
        metalId: "metal-gold",
        metal: mockMetals[0],
        ratePerGram: Number(goldPerGram),
        source: goldOverride ? "MANUAL" : "AUTO",
        effectiveAt: goldOverride ? goldOverride.effectiveAt.toISOString() : now,
      },
      {
        id: "live-rate-silver",
        metalId: "metal-silver",
        metal: mockMetals[1],
        ratePerGram: Number(silverPerGram),
        source: silverOverride ? "MANUAL" : "AUTO",
        effectiveAt: silverOverride ? silverOverride.effectiveAt.toISOString() : now,
      },
    ];
  } catch (err) {
    console.error("[rates] Live fetch failed:", err);

    const dbRates = await getRatesFromDb();
    if (dbRates) {
      console.info("[rates] Falling back to last known rates from Database");
      return dbRates;
    }

    console.warn(
      "[rates] Database rates unavailable, falling back to mock hardcoded rates",
    );
    return mockMetalRates;
  }
}
