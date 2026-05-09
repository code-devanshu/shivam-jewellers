import { getCurrentRates } from "@/lib/data";
import RatesClient from "./RatesClient";

export const metadata = { title: "Metal Rates" };

export default async function AdminRatesPage() {
  const rates = await getCurrentRates();
  const gold = rates.find((r) => r.metal.symbol === "Au");
  const silver = rates.find((r) => r.metal.symbol === "Ag");

  return (
    <RatesClient
      currentGold={gold?.ratePerGram ?? null}
      currentSilver={silver?.ratePerGram ?? null}
    />
  );
}
