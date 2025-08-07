// app/admin/page.tsx
import { getMetalRates } from "./actions/metal-actions";
import MetalRateForm from "./components/MetalRateForm";

export default async function AdminPage() {
  const rates = await getMetalRates();

  const lastUpdated = rates?.updatedAt
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(rates.updatedAt))
    : null;

  return (
    <main className="max-w-full mx-auto px-6 py-10">
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Update Precious Metal Rates
        </h1>
        {lastUpdated && (
          <div className="mt-2 flex items-center text-sm text-gray-500 gap-2">
            <span className="inline-block w-2 h-2 bg-gray-400 rounded-full" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        )}
      </div>

      <MetalRateForm
        initialKarat24={rates?.karat24 ?? 0}
        initialKarat22={rates?.karat22 ?? 0}
        initialKarat18={rates?.karat18 ?? 0}
        initialSilverRate={rates?.silverRate ?? 0}
      />
    </main>
  );
}
