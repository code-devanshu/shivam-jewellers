import { Product } from "@prisma/client";
import { getMetalRates } from "./actions/metal-actions";
import { getProducts } from "./actions/product-actions";
import MetalRateForm from "./components/MetalRateForm";
import { Boxes, CircleDollarSign, AlertCircle } from "lucide-react";

export default async function AdminPage() {
  const [rates, { products, total }] = await Promise.all([
    getMetalRates(),
    getProducts(1, 1000),
  ]);

  const lastUpdated = rates?.updatedAt
    ? new Intl.DateTimeFormat("en-GB", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(rates.updatedAt))
    : null;

  const totalProducts = total;

  const goldItems = products.filter((p: Product) =>
    p.material?.toLowerCase().includes("gold")
  ).length;

  const silverItems = products.filter((p: Product) =>
    p.material?.toLowerCase().includes("silver")
  ).length;

  const outOfStock = products.filter(
    (p: Product) => p.quantity === 0 || p.quantity == null
  ).length;

  const categorySnapshot = groupBy(products, "category");
  const subCategorySnapshot = groupBy(products, "subCategory");
  const genderSnapshot = groupBy(products, "gender");

  return (
    <main>
      {/* 👋 Welcome */}
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 text-sm mt-1">
          Manage inventory, update metal rates, and monitor stock.
        </p>
      </div>

      {/* 🔢 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <DashboardCard title="Total Products" value={totalProducts} />
        <DashboardCard title="Gold Items" value={goldItems} />
        <DashboardCard title="Silver Items" value={silverItems} />
        <DashboardCard title="Out of Stock" value={outOfStock} />
      </div>

      {/* 🧾 Inventory Snapshots in Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <InventorySnapshot title="By Category" data={categorySnapshot} />
        <InventorySnapshot title="By Sub Category" data={subCategorySnapshot} />
        <InventorySnapshot title="By Gender" data={genderSnapshot} />
      </div>

      {/* 💎 Metal Rate Section */}
      <div className="mb-16">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Update Precious Metal Rates
          </h2>
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
      </div>
    </main>
  );
}

// 📦 Stat Card
function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  const cardIcons = {
    "Total Products": <Boxes className="w-5 h-5 text-pink-600" />,
    "Gold Items": <CircleDollarSign className="w-5 h-5 text-yellow-600" />,
    "Silver Items": <CircleDollarSign className="w-5 h-5 text-gray-500" />,
    "Out of Stock": <AlertCircle className="w-5 h-5 text-red-600" />,
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">{title}</span>
          <span className="text-2xl font-bold text-gray-800 mt-1">{value}</span>
        </div>
        <div className="bg-gray-100 p-2 rounded-lg">
          {cardIcons[title as keyof typeof cardIcons]}
        </div>
      </div>
    </div>
  );
}

// 📊 Inventory Snapshot
function InventorySnapshot({
  title,
  data,
}: {
  title: string;
  data: Record<string, Product[]>;
}) {
  return (
    <div className="bg-white shadow rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">
          Inventory Snapshot {title}
        </h3>
      </div>
      <div className="divide-y divide-gray-100">
        {Object.keys(data).length > 0 ? (
          Object.entries(data).map(([group, items]) => {
            const totalQty = items.reduce(
              (sum, item) => sum + (item.quantity ?? 0),
              0
            );
            return (
              <div
                key={group}
                className="px-6 py-3 flex items-center justify-between text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <span>{group || "Uncategorized"}</span>
                <span className="font-medium">{totalQty} pcs</span>
              </div>
            );
          })
        ) : (
          <div className="px-6 py-4 text-sm text-gray-500">
            No data available.
          </div>
        )}
      </div>
    </div>
  );
}

// 🧮 groupBy function
function groupBy<T>(items: T[], key: keyof T): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const groupKey = item[key] ?? "Uncategorized";
    const keyStr = String(groupKey);
    if (!acc[keyStr]) acc[keyStr] = [];
    acc[keyStr].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
