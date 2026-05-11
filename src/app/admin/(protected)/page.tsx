import Link from "next/link";
import {
  Package,
  Tag,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShoppingBag,
  Receipt,
  Users,
  MessageSquare,
  IndianRupee,
  Wallet,
  Clock,
  BarChart3,
  Truck,
  CheckCircle2,
  CircleDot,
} from "lucide-react";
import { storeGetAllProducts, storeGetAllCategories } from "@/lib/admin-store";
import { getLiveRates } from "@/lib/live-rates";
import { formatPrice } from "@/lib/price";
import { db } from "@/lib/db";
import { RevenueBarChart, RevenueSplitDonut, type ChartDay } from "./DashboardCharts";

export const metadata = { title: "Dashboard" };

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
      {children}
    </h2>
  );
}

function KpiCard({
  label,
  value,
  sub,
  subColor,
  icon: Icon,
  iconBg,
  href,
}: {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  icon: React.ElementType;
  iconBg: string;
  href?: string;
}) {
  const inner = (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-sm transition-shadow h-full">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={18} />
        </div>
        {href && (
          <ArrowRight size={14} className="text-gray-300 mt-1" />
        )}
      </div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-brown-dark leading-none">{value}</p>
      {sub && (
        <p className={`text-xs mt-1.5 ${subColor ?? "text-gray-400"}`}>{sub}</p>
      )}
    </div>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}

function ActivityCard({
  label,
  value,
  icon: Icon,
  iconColor,
  href,
  badge,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  iconColor: string;
  href?: string;
  badge?: string;
}) {
  const inner = (
    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 ${iconColor}`}>
        <Icon size={17} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xl font-bold text-brown-dark">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
      {badge && (
        <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </div>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}

const ORDER_STATUS_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  CONFIRMED:        { label: "Confirmed",        color: "text-blue-600",   bg: "bg-blue-50" },
  PROCESSING:       { label: "Processing",        color: "text-purple-600", bg: "bg-purple-50" },
  READY_FOR_PICKUP: { label: "Ready for Pickup",  color: "text-teal-600",   bg: "bg-teal-50" },
  SHIPPED:          { label: "Shipped",           color: "text-indigo-600", bg: "bg-indigo-50" },
  DELIVERED:        { label: "Delivered",         color: "text-green-600",  bg: "bg-green-50" },
  CANCELLED:        { label: "Cancelled",         color: "text-red-500",    bg: "bg-red-50" },
};

export default async function AdminDashboard() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    products,
    categories,
    rates,
    allOrderAgg,
    allBillAgg,
    recentOrders,
    recentBills,
    customerCount,
    unreadInquiries,
    orderStatusCounts,
  ] = await Promise.all([
    storeGetAllProducts(),
    storeGetAllCategories(),
    getLiveRates(),
    db.order.aggregate({
      _sum: { totalAmount: true },
      _count: { id: true },
      where: { status: { notIn: ["PENDING_PAYMENT", "CANCELLED"] } },
    }),
    db.bill.aggregate({
      _sum: { amountPaid: true, balanceDue: true },
      _count: { id: true },
    }),
    db.order.findMany({
      where: { status: { notIn: ["PENDING_PAYMENT", "CANCELLED"] } },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        status: true,
        deliveryType: true,
        createdAt: true,
        customer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
    db.bill.findMany({
      select: {
        id: true,
        billNumber: true,
        amountPaid: true,
        balanceDue: true,
        status: true,
        createdAt: true,
        customerName: true,
        customer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
    db.customer.count(),
    db.inquiry.count({ where: { isRead: false } }),
    db.order.groupBy({
      by: ["status"],
      _count: { id: true },
      where: { status: { notIn: ["PENDING_PAYMENT"] } },
    }),
  ]);

  // ── Revenue metrics ─────────────────────────────────────────────────────────
  const totalOrderRevenue = Number(allOrderAgg._sum.totalAmount ?? 0);
  const totalBillCollected = Number(allBillAgg._sum.amountPaid ?? 0);
  const totalOutstanding = Number(allBillAgg._sum.balanceDue ?? 0);
  const totalRevenue = totalOrderRevenue + totalBillCollected;

  const thisMonthOrders = recentOrders.filter((o) => o.createdAt >= thirtyDaysAgo);
  const thisMonthBills = recentBills.filter((b) => b.createdAt >= thirtyDaysAgo);
  const thisMonthRevenue =
    thisMonthOrders.reduce((s, o) => s + Number(o.totalAmount), 0) +
    thisMonthBills.reduce((s, b) => s + Number(b.amountPaid), 0);

  const totalSales = (allOrderAgg._count.id ?? 0) + (allBillAgg._count.id ?? 0);
  const avgSale = totalSales > 0 ? Math.round(totalRevenue / totalSales) : 0;

  // ── Order status breakdown ────────────────────────────────────────────────
  const statusMap = Object.fromEntries(
    orderStatusCounts.map((s) => [s.status, s._count.id])
  );
  const activeStatuses = ["CONFIRMED", "PROCESSING", "READY_FOR_PICKUP", "SHIPPED", "DELIVERED"] as const;

  // ── 7-day chart data ──────────────────────────────────────────────────────
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const ordersMap = new Map<string, number>();
  const billsMap = new Map<string, number>();
  for (const o of recentOrders) {
    const k = dayKey(o.createdAt);
    ordersMap.set(k, (ordersMap.get(k) ?? 0) + Number(o.totalAmount));
  }
  for (const b of recentBills) {
    const k = dayKey(b.createdAt);
    billsMap.set(k, (billsMap.get(k) ?? 0) + Number(b.amountPaid));
  }

  const chartDays: ChartDay[] = last7.map((d) => {
    const k = dayKey(d);
    return {
      label: d.toLocaleDateString("en-IN", { weekday: "short" }),
      date: k,
      orders: ordersMap.get(k) ?? 0,
      bills: billsMap.get(k) ?? 0,
    };
  });

  // ── Products stats ────────────────────────────────────────────────────────
  const lowStock = products.filter((p) => p.stockQty > 0 && p.stockQty <= 3);
  const outOfStock = products.filter((p) => p.stockQty <= 0 && p.isAvailable === false);
  const featuredCount = products.filter((p) => p.isFeatured).length;

  // ── Metal rates ───────────────────────────────────────────────────────────
  const gold = rates.find((r) => r.metalId === "metal-gold");
  const silver = rates.find((r) => r.metalId === "metal-silver");

  // ── Recent 5 orders ───────────────────────────────────────────────────────
  const recentFiveOrders = recentOrders.slice(0, 5);
  const recentFiveBills = recentBills.slice(0, 5);

  return (
    <div className="p-8 space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brown-dark">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          {gold && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-full px-3 py-1.5 text-xs font-semibold text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Gold {formatPrice(gold.ratePerGram)}/g
            </div>
          )}
          {silver && (
            <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-600">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              Silver {formatPrice(silver.ratePerGram)}/g
            </div>
          )}
        </div>
      </div>

      {/* ── KPI row ────────────────────────────────────────────────────────── */}
      <div>
        <SectionTitle>Revenue</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Collected"
            value={formatPrice(totalRevenue)}
            sub={`${totalSales} transactions`}
            icon={IndianRupee}
            iconBg="bg-rose-gold/10 text-rose-gold"
          />
          <KpiCard
            label="This Month"
            value={formatPrice(thisMonthRevenue)}
            sub="Last 30 days"
            icon={BarChart3}
            iconBg="bg-purple-100 text-purple-600"
          />
          <KpiCard
            label="Outstanding"
            value={formatPrice(totalOutstanding)}
            sub={totalOutstanding > 0 ? "Pending collections" : "All bills settled"}
            subColor={totalOutstanding > 0 ? "text-amber-600" : "text-green-600"}
            icon={Wallet}
            iconBg="bg-amber-50 text-amber-500"
            href="/admin/billing"
          />
          <KpiCard
            label="Avg. Transaction"
            value={avgSale > 0 ? formatPrice(avgSale) : "—"}
            sub="Per sale (all time)"
            icon={TrendingUp}
            iconBg="bg-green-50 text-green-600"
          />
        </div>
      </div>

      {/* ── Activity row ───────────────────────────────────────────────────── */}
      <div>
        <SectionTitle>Activity</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <ActivityCard
            label="Online Orders"
            value={allOrderAgg._count.id ?? 0}
            icon={ShoppingBag}
            iconColor="text-rose-gold"
            href="/admin/orders"
          />
          <ActivityCard
            label="Walk-in Bills"
            value={allBillAgg._count.id ?? 0}
            icon={Receipt}
            iconColor="text-amber-500"
            href="/admin/billing"
          />
          <ActivityCard
            label="Customers"
            value={customerCount}
            icon={Users}
            iconColor="text-blue-500"
          />
          <ActivityCard
            label="Unread Inquiries"
            value={unreadInquiries}
            icon={MessageSquare}
            iconColor="text-purple-500"
            href="/admin/inquiries"
            badge={unreadInquiries > 0 ? `${unreadInquiries} new` : undefined}
          />
        </div>
      </div>

      {/* ── Charts row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-brown-dark text-sm">Revenue — Last 7 Days</h3>
              <p className="text-xs text-gray-400 mt-0.5">Online orders + walk-in bills</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-gold inline-block" />
                Orders
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                Bills
              </span>
            </div>
          </div>
          <RevenueBarChart days={chartDays} />
        </div>

        {/* Donut split */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="font-semibold text-brown-dark text-sm mb-1">Revenue Split</h3>
          <p className="text-xs text-gray-400 mb-5">All-time channel breakdown</p>
          <RevenueSplitDonut orders={totalOrderRevenue} bills={totalBillCollected} />

          <div className="mt-5 pt-4 border-t border-gray-50 space-y-2">
            {gold && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Gold rate
                </span>
                <span className="font-semibold text-brown-dark">
                  {formatPrice(gold.ratePerGram)}/g
                  {gold.source === "MANUAL" && (
                    <span className="ml-1 text-gray-400 font-normal">(manual)</span>
                  )}
                </span>
              </div>
            )}
            {silver && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gray-400" /> Silver rate
                </span>
                <span className="font-semibold text-brown-dark">
                  {formatPrice(silver.ratePerGram)}/g
                  {silver.source === "MANUAL" && (
                    <span className="ml-1 text-gray-400 font-normal">(manual)</span>
                  )}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Package size={12} className="text-gray-400" /> Catalog
              </span>
              <span className="font-semibold text-brown-dark">
                {products.length} products · {featuredCount} featured
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Order pipeline + inventory ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order pipeline */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-brown-dark text-sm">Order Pipeline</h3>
            <Link
              href="/admin/orders"
              className="text-xs text-rose-gold hover:text-rose-gold-dark font-medium flex items-center gap-1"
            >
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2.5">
            {activeStatuses.map((s) => {
              const count = statusMap[s] ?? 0;
              const meta = ORDER_STATUS_META[s];
              return (
                <div key={s} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${meta.bg}`}>
                    {s === "DELIVERED" ? (
                      <CheckCircle2 size={14} className={meta.color} />
                    ) : s === "SHIPPED" ? (
                      <Truck size={14} className={meta.color} />
                    ) : (
                      <CircleDot size={14} className={meta.color} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">{meta.label}</span>
                      <span className={`text-xs font-bold ${meta.color}`}>{count}</span>
                    </div>
                    {/* Progress bar */}
                    {count > 0 && (
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${meta.bg.replace("bg-", "bg-").replace("-50", "-400")}`}
                          style={{
                            width: `${Math.min((count / Math.max(...activeStatuses.map((x) => statusMap[x] ?? 0), 1)) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {activeStatuses.every((s) => (statusMap[s] ?? 0) === 0) && (
              <p className="text-sm text-gray-400 py-4 text-center">No active orders</p>
            )}
          </div>

          {(statusMap["CANCELLED"] ?? 0) > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
              <span>Cancelled orders</span>
              <span className="font-semibold text-red-400">{statusMap["CANCELLED"]}</span>
            </div>
          )}
        </div>

        {/* Inventory alerts */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-brown-dark text-sm">Inventory</h3>
            <Link
              href="/admin/products"
              className="text-xs text-rose-gold hover:text-rose-gold-dark font-medium flex items-center gap-1"
            >
              Manage <ArrowRight size={11} />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-brown-dark">{products.length}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Total</p>
            </div>
            <div className={`rounded-xl p-3 text-center ${lowStock.length > 0 ? "bg-amber-50" : "bg-gray-50"}`}>
              <p className={`text-xl font-bold ${lowStock.length > 0 ? "text-amber-600" : "text-gray-400"}`}>
                {lowStock.length}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Low Stock</p>
            </div>
            <div className={`rounded-xl p-3 text-center ${outOfStock.length > 0 ? "bg-red-50" : "bg-gray-50"}`}>
              <p className={`text-xl font-bold ${outOfStock.length > 0 ? "text-red-500" : "text-gray-400"}`}>
                {outOfStock.length}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Out of Stock</p>
            </div>
          </div>

          {lowStock.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                <AlertTriangle size={11} className="text-amber-400" /> Low stock alerts
              </p>
              {lowStock.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="text-brown-dark hover:text-rose-gold transition-colors truncate flex-1 min-w-0 mr-2"
                  >
                    {p.name}
                  </Link>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      p.stockQty <= 1 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {p.stockQty} left
                  </span>
                </div>
              ))}
              {lowStock.length > 5 && (
                <Link
                  href="/admin/products?status=LOW_STOCK"
                  className="text-xs text-rose-gold hover:underline flex items-center gap-1 mt-1"
                >
                  +{lowStock.length - 5} more <ArrowRight size={11} />
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <CheckCircle2 size={28} className="text-green-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">All products are well stocked</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent activity ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="font-semibold text-brown-dark text-sm">Recent Orders</h3>
            <Link
              href="/admin/orders"
              className="text-xs text-rose-gold hover:text-rose-gold-dark font-medium flex items-center gap-1"
            >
              All orders <ArrowRight size={11} />
            </Link>
          </div>
          {recentFiveOrders.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingBag size={28} className="text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No orders yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentFiveOrders.map((o) => {
                const meta = ORDER_STATUS_META[o.status];
                return (
                  <div key={o.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${meta?.bg ?? "bg-gray-50"}`}>
                      <ShoppingBag size={13} className={meta?.color ?? "text-gray-400"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-brown-dark">
                          {o.orderNumber}
                        </span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${meta?.bg} ${meta?.color}`}>
                          {meta?.label ?? o.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {o.customer.name ?? "Customer"} ·{" "}
                        {o.createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-brown-dark shrink-0">
                      {formatPrice(Number(o.totalAmount))}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent bills */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="font-semibold text-brown-dark text-sm">Recent Bills</h3>
            <Link
              href="/admin/billing"
              className="text-xs text-rose-gold hover:text-rose-gold-dark font-medium flex items-center gap-1"
            >
              All bills <ArrowRight size={11} />
            </Link>
          </div>
          {recentFiveBills.length === 0 ? (
            <div className="p-8 text-center">
              <Receipt size={28} className="text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No bills yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentFiveBills.map((b) => {
                const statusStyle =
                  b.status === "PAID"
                    ? { bg: "bg-green-50", color: "text-green-600", label: "Paid" }
                    : b.status === "PARTIAL"
                    ? { bg: "bg-yellow-50", color: "text-yellow-600", label: "Partial" }
                    : { bg: "bg-red-50", color: "text-red-500", label: "Unpaid" };
                const customerName = b.customer?.name ?? b.customerName ?? "Walk-in";
                return (
                  <div key={b.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${statusStyle.bg}`}>
                      <Receipt size={13} className={statusStyle.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/admin/billing/${b.id}`}
                          className="text-sm font-semibold text-brown-dark hover:text-rose-gold"
                        >
                          {b.billNumber}
                        </Link>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.color}`}>
                          {statusStyle.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {customerName} ·{" "}
                        {b.createdAt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-brown-dark">
                        {formatPrice(Number(b.amountPaid))}
                      </p>
                      {Number(b.balanceDue) > 0 && (
                        <p className="text-[10px] text-red-400">
                          {formatPrice(Number(b.balanceDue))} due
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Categories + quick links ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/admin/products/new"
          className="bg-rose-gold hover:bg-rose-gold-dark text-white rounded-2xl p-4 flex items-center gap-3 transition-colors group"
        >
          <Package size={20} className="shrink-0" />
          <div>
            <p className="text-sm font-bold">Add Product</p>
            <p className="text-[11px] opacity-70">New to catalog</p>
          </div>
        </Link>
        <Link
          href="/admin/billing/new"
          className="bg-white hover:bg-gray-50 border border-gray-200 text-brown-dark rounded-2xl p-4 flex items-center gap-3 transition-colors"
        >
          <Receipt size={20} className="text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-bold">New Bill</p>
            <p className="text-[11px] text-gray-400">Walk-in counter</p>
          </div>
        </Link>
        <Link
          href="/admin/rates"
          className="bg-white hover:bg-gray-50 border border-gray-200 text-brown-dark rounded-2xl p-4 flex items-center gap-3 transition-colors"
        >
          <TrendingUp size={20} className="text-rose-gold shrink-0" />
          <div>
            <p className="text-sm font-bold">Update Rates</p>
            <p className="text-[11px] text-gray-400">Gold &amp; silver</p>
          </div>
        </Link>
        <Link
          href="/admin/categories"
          className="bg-white hover:bg-gray-50 border border-gray-200 text-brown-dark rounded-2xl p-4 flex items-center gap-3 transition-colors"
        >
          <Tag size={20} className="text-blue-500 shrink-0" />
          <div>
            <p className="text-sm font-bold">Categories</p>
            <p className="text-[11px] text-gray-400">{categories.length} active</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
