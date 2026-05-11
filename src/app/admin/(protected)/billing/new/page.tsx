import { db } from "@/lib/db";
import { getLiveRates } from "@/lib/live-rates";
import { calculatePrice } from "@/lib/price";
import { getStoreSettings } from "../actions";
import NewBillClient from "./NewBillClient";

export const metadata = { title: "New Bill" };

export default async function NewBillPage() {
  const [products, rates, settings] = await Promise.all([
    db.product.findMany({
      where: { isAvailable: true },
      include: {
        metal: true,
        images: { where: { isPrimary: true }, take: 1 },
        variants: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { name: "asc" },
    }),
    getLiveRates(),
    getStoreSettings(),
  ]);

  const hasGstConfig = !!(settings?.gstin?.trim());

  const ratesMap = Object.fromEntries(rates.map((r) => [r.metalId, r.ratePerGram]));

  const catalogProducts = products.map((p) => {
    const ratePerGram = ratesMap[p.metalId] ?? 0;
    const baseBreakdown = calculatePrice(
      {
        purityPercent: Number(p.purityPercent),
        weightGrams: Number(p.weightGrams),
        makingChargeType: p.makingChargeType,
        makingCharge: Number(p.makingCharge),
        gstPercent: Number(p.gstPercent),
      },
      ratePerGram,
      0
    );

    return {
      id: p.id,
      name: p.name,
      metalName: p.metal.name,
      metalId: p.metalId,
      purity: p.purity,
      weightGrams: Number(p.weightGrams),
      purityPercent: Number(p.purityPercent),
      makingCharge: Number(p.makingCharge),
      makingChargeType: p.makingChargeType,
      gstPercent: Number(p.gstPercent),
      ratePerGram,
      basePrice: baseBreakdown.totalPrice,
      imageUrl: p.images[0]?.url ?? null,
      variants: p.variants.map((v) => {
        const vBreakdown = calculatePrice(
          {
            purityPercent: Number(p.purityPercent),
            weightGrams: Number(p.weightGrams),
            makingChargeType: p.makingChargeType,
            makingCharge: Number(p.makingCharge),
            gstPercent: Number(p.gstPercent),
          },
          ratePerGram,
          Number(v.additionalPrice)
        );
        return {
          id: v.id,
          size: v.size,
          gemstone: v.gemstone,
          additionalPrice: Number(v.additionalPrice),
          price: vBreakdown.totalPrice,
        };
      }),
    };
  });

  return (
    <NewBillClient
      catalogProducts={catalogProducts}
      hasGstConfig={hasGstConfig}
      storeSettings={settings}
    />
  );
}
