import type { MetalRate } from "./types";
import { mockMetals, mockMetalRates } from "./mock/data";
import { storeGetRateOverride } from "./admin-store";

const TROY_OZ_TO_GRAMS = 31.1035;
const BASE_URL = "https://www.goldapi.io/api";

type GoldApiResponse = {
  timestamp: number;
  metal: string;
  currency: string;
  price: number; // INR per troy ounce
};

async function fetchSpotPrice(symbol: "XAU" | "XAG", apiKey: string): Promise<number> {
  const res = await fetch(`${BASE_URL}/${symbol}/INR`, {
    headers: {
      "x-access-token": apiKey,
      "Content-Type": "application/json",
    },
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`goldapi.io ${symbol}: ${res.status} ${res.statusText}`);

  const data: GoldApiResponse = await res.json();
  return Math.round(data.price / TROY_OZ_TO_GRAMS);
}

export async function getLiveRates(): Promise<MetalRate[]> {
  const now = new Date().toISOString();

  // Admin manual overrides always take priority
  const goldOverride = storeGetRateOverride("metal-gold");
  const silverOverride = storeGetRateOverride("metal-silver");

  if (goldOverride && silverOverride) {
    return [
      { id: "override-gold", metalId: "metal-gold", metal: mockMetals[0], ratePerGram: goldOverride.ratePerGram, source: "MANUAL", effectiveAt: goldOverride.setAt },
      { id: "override-silver", metalId: "metal-silver", metal: mockMetals[1], ratePerGram: silverOverride.ratePerGram, source: "MANUAL", effectiveAt: silverOverride.setAt },
    ];
  }

  const apiKey = process.env.GOLDAPI_KEY;

  if (!apiKey) {
    console.warn("[rates] GOLDAPI_KEY not set — using mock rates");
    return mockMetalRates;
  }

  try {
    const [goldPerGram, silverPerGram] = await Promise.all([
      goldOverride ? Promise.resolve(goldOverride.ratePerGram) : fetchSpotPrice("XAU", apiKey),
      silverOverride ? Promise.resolve(silverOverride.ratePerGram) : fetchSpotPrice("XAG", apiKey),
    ]);

    return [
      { id: "live-rate-gold", metalId: "metal-gold", metal: mockMetals[0], ratePerGram: goldPerGram, source: goldOverride ? "MANUAL" : "AUTO", effectiveAt: goldOverride?.setAt ?? now },
      { id: "live-rate-silver", metalId: "metal-silver", metal: mockMetals[1], ratePerGram: silverPerGram, source: silverOverride ? "MANUAL" : "AUTO", effectiveAt: silverOverride?.setAt ?? now },
    ];
  } catch (err) {
    console.error("[rates] Live fetch failed, falling back to mock:", err);
    return mockMetalRates;
  }
}
