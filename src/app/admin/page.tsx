import Link from "next/link";
import { Package, Tag, TrendingUp, AlertTriangle, ArrowRight } from "lucide-react";
import { storeGetAllProducts, storeGetAllCategories } from "@/lib/admin-store";
import { getLiveRates } from "@/lib/live-rates";
import { formatPrice } from "@/lib/price";

export const metadata = { title: "Dashboard" };

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  href?: string;
}) {
  const content = (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start gap-4 hover:shadow-sm transition-shadow">
      <div className="w-10 h-10 bg-rose-gold/10 rounded-xl flex items-center justify-center text-rose-gold shrink-0">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-brown-dark mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default async function AdminDashboard() {
  const [products, categories, rates] = await Promise.all([
    storeGetAllProducts(),
    storeGetAllCategories(),
    getLiveRates(),
  ]);

  const gold = rates.find((r) => r.metalId === "metal-gold");
  const silver = rates.find((r) => r.metalId === "metal-silver");
  const lowStock = products.filter((p) => p.stockQty <= 3);
  const unavailable = products.filter((p) => !p.isAvailable);

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-serif font-bold text-brown-dark">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Overview of your store</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Products"
          value={products.length}
          sub={`${unavailable.length} unavailable`}
          icon={Package}
          href="/admin/products"
        />
        <StatCard
          label="Categories"
          value={categories.length}
          icon={Tag}
          href="/admin/categories"
        />
        {gold && (
          <StatCard
            label="Gold Rate"
            value={`${formatPrice(gold.ratePerGram)}/g`}
            sub={gold.source === "MANUAL" ? "Manual override" : "Live spot price"}
            icon={TrendingUp}
            href="/admin/rates"
          />
        )}
        {silver && (
          <StatCard
            label="Silver Rate"
            value={`${formatPrice(silver.ratePerGram)}/g`}
            sub={silver.source === "MANUAL" ? "Manual override" : "Live spot price"}
            icon={TrendingUp}
            href="/admin/rates"
          />
        )}
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="font-semibold text-amber-800 text-sm">
              Low Stock ({lowStock.length} items)
            </h2>
          </div>
          <div className="space-y-1.5">
            {lowStock.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-amber-700">{p.name}</span>
                <span className="font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full text-xs">
                  {p.stockQty} left
                </span>
              </div>
            ))}
          </div>
          {lowStock.length > 5 && (
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1 text-xs text-amber-700 font-medium mt-3 hover:underline"
            >
              View all {lowStock.length} <ArrowRight size={12} />
            </Link>
          )}
        </div>
      )}

      {/* Recent products */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-brown-dark text-sm">Recent Products</h2>
          <Link
            href="/admin/products"
            className="text-xs text-rose-gold hover:text-rose-gold-dark font-medium flex items-center gap-1"
          >
            All products <ArrowRight size={12} />
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50">
              <th className="text-left px-5 py-3 font-medium">Product</th>
              <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Category</th>
              <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Metal</th>
              <th className="text-left px-5 py-3 font-medium">Stock</th>
              <th className="text-left px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.slice(0, 8).map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/50">
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="font-medium text-brown-dark hover:text-rose-gold transition-colors"
                  >
                    {p.name}
                  </Link>
                </td>
                <td className="px-5 py-3 text-gray-400 hidden md:table-cell">{p.category.name}</td>
                <td className="px-5 py-3 text-gray-400 hidden md:table-cell">
                  {p.metal.name} · {p.purity}
                </td>
                <td className="px-5 py-3 text-gray-500">{p.stockQty}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      p.isAvailable
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {p.isAvailable ? "Active" : "Hidden"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
