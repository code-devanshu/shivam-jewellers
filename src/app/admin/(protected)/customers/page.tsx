import { Phone, ShoppingCart, Users } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentRates } from "@/lib/data";
import { calculatePrice, formatPrice } from "@/lib/price";
import CartAccordion from "./CartAccordion";
import CustomersBrowser from "./CustomersBrowser";

export const metadata = { title: "Customers" };

const PAGE_SIZE = 20;

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDateTime(d: Date) {
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// wa.me wants the number without a leading "+"
function waLink(phone: string) {
  return `https://wa.me/${phone.replace(/^\+/, "")}`;
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string }>;
}) {
  const { filter, page: pageParam } = await searchParams;
  const leadsOnly = filter !== "all";
  const page = Math.max(1, Number(pageParam) || 1);

  const where = leadsOnly ? { cart: { items: { some: {} } } } : {};
  const orderBy = leadsOnly
    ? { cart: { updatedAt: "desc" as const } }
    : { createdAt: "desc" as const };

  const [customers, totalCount, leadsCount, rates] = await Promise.all([
    db.customer.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        cart: {
          include: {
            items: {
              include: { product: true, variant: true },
            },
          },
        },
        orders: { select: { id: true } },
      },
    }),
    db.customer.count(),
    db.customer.count({ where: { cart: { items: { some: {} } } } }),
    getCurrentRates(),
  ]);

  const rateMap = Object.fromEntries(rates.map((r) => [r.metalId, r.ratePerGram]));

  const rows = customers.map((customer) => {
    const rawItems = customer.cart?.items ?? [];
    const itemCount = rawItems.reduce((sum, item) => sum + item.quantity, 0);

    const items = rawItems.map((item) => {
      const price = calculatePrice(
        {
          purityPercent: Number(item.product.purityPercent),
          weightGrams: Number(item.product.weightGrams),
          makingChargeType: item.product.makingChargeType,
          makingCharge: Number(item.product.makingCharge),
          gstPercent: Number(item.product.gstPercent),
        },
        rateMap[item.product.metalId] ?? 0,
        item.variant?.additionalPrice ? Number(item.variant.additionalPrice) : 0,
      );
      return {
        id: item.id,
        quantity: item.quantity,
        product: { name: item.product.name },
        variant: item.variant
          ? { size: item.variant.size, gemstone: item.variant.gemstone }
          : null,
        unitPrice: price.totalPrice,
        lineTotal: price.totalPrice * item.quantity,
      };
    });

    const cartValue = items.reduce((sum, item) => sum + item.lineTotal, 0);

    return { customer, items, itemCount, cartValue };
  });

  const totalPages = Math.max(1, Math.ceil((leadsOnly ? leadsCount : totalCount) / PAGE_SIZE));

  return (
    <div className="p-8">
      <CustomersBrowser
        leadsOnly={leadsOnly}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        leadsCount={leadsCount}
      >
        {rows.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
              {leadsOnly ? <ShoppingCart size={24} /> : <Users size={24} />}
            </div>
            <h2 className="font-semibold text-brown-dark mb-2">
              {leadsOnly ? "No active carts right now" : "No customers yet"}
            </h2>
            <p className="text-sm text-gray-400 max-w-sm">
              {leadsOnly
                ? "Customers who add items to their cart but haven't checked out will show up here for follow-up calls."
                : "Registered customers will appear here."}
            </p>
          </div>
        ) : (
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-medium">Customer</th>
                  <th className="text-left px-5 py-3 font-medium">Cart</th>
                  <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Cart value</th>
                  <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Orders</th>
                  <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Joined</th>
                  <th className="text-left px-5 py-3 font-medium">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map(({ customer, items, itemCount, cartValue }) => (
                  <tr key={customer.id} className="hover:bg-gray-50/50 align-top">
                    <td className="px-5 py-3">
                      <p className="font-medium text-brown-dark">{customer.name ?? "—"}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{customer.phone ?? customer.email ?? ""}</p>
                    </td>
                    <td className="px-5 py-3">
                      {itemCount > 0 ? (
                        <>
                          <p className="text-brown-dark">
                            {itemCount} item{itemCount !== 1 ? "s" : ""}
                          </p>
                          <div className="mt-0.5">
                            <CartAccordion items={items} cartValue={cartValue} />
                          </div>
                          {customer.cart && (
                            <p className="text-xs text-gray-400 mt-1">
                              Updated {fmtDateTime(customer.cart.updatedAt)}
                            </p>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-300">Empty</span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-semibold text-brown-dark hidden md:table-cell">
                      {cartValue > 0 ? formatPrice(cartValue) : "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-500 hidden lg:table-cell">
                      {customer.orders.length}
                    </td>
                    <td className="px-5 py-3 text-gray-500 hidden md:table-cell">
                      {fmtDate(customer.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      {customer.phone ? (
                        <div className="flex items-center gap-3">
                          <a
                            href={`tel:${customer.phone}`}
                            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-rose-gold transition-colors"
                            aria-label={`Call ${customer.name ?? customer.phone}`}
                          >
                            <Phone size={14} />
                            {customer.phone}
                          </a>
                          <a
                            href={waLink(customer.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gray-400 hover:text-green-600 transition-colors"
                          >
                            WhatsApp
                          </a>
                        </div>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CustomersBrowser>
    </div>
  );
}
