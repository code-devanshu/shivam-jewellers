"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/price";

export type ChartDay = { label: string; date: string; orders: number; bills: number };

export function RevenueBarChart({ days }: { days: ChartDay[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxVal = Math.max(...days.map((d) => d.orders + d.bills), 1);

  return (
    <div className="flex items-end gap-2 h-36 px-1 pt-2">
      {days.map((d, i) => {
        const total = d.orders + d.bills;
        const totalPct = (total / maxVal) * 100;
        const ordersPct = total > 0 ? (d.orders / total) * 100 : 0;
        const isHov = hovered === i;

        return (
          <div
            key={d.date}
            className="relative flex-1 flex flex-col items-center gap-1.5 cursor-default"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Tooltip */}
            <div
              className={`absolute bottom-full mb-2 z-20 bg-white border border-gray-100 shadow-xl rounded-xl p-3 text-xs whitespace-nowrap left-1/2 -translate-x-1/2 pointer-events-none transition-all duration-150 ${
                isHov ? "opacity-100 -translate-y-0" : "opacity-0 translate-y-1"
              }`}
            >
              <p className="font-semibold text-brown-dark mb-1.5">{d.label}</p>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-rose-gold" />
                <span className="text-gray-500">Orders</span>
                <span className="font-semibold text-brown-dark ml-2">{formatPrice(d.orders)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-gray-500">Bills</span>
                <span className="font-semibold text-brown-dark ml-2">{formatPrice(d.bills)}</span>
              </div>
              {total > 0 && (
                <div className="mt-1.5 pt-1.5 border-t border-gray-100 font-bold text-brown-dark">
                  Total: {formatPrice(total)}
                </div>
              )}
            </div>

            {/* Bar */}
            <div className="w-full flex flex-col justify-end" style={{ height: "100px" }}>
              {total > 0 ? (
                <div
                  className={`w-full rounded-t-md overflow-hidden transition-all duration-200 ${isHov ? "opacity-90" : ""}`}
                  style={{ height: `${Math.max(totalPct, 3)}%` }}
                >
                  {/* Orders on top */}
                  <div
                    className="w-full bg-rose-gold"
                    style={{ height: `${ordersPct}%` }}
                  />
                  {/* Bills on bottom */}
                  <div
                    className="w-full bg-amber-400"
                    style={{ height: `${100 - ordersPct}%` }}
                  />
                </div>
              ) : (
                <div className="w-full h-1 bg-gray-100 rounded-full" />
              )}
            </div>

            <span
              className={`text-[10px] font-medium transition-colors ${
                isHov ? "text-brown-dark" : "text-gray-400"
              }`}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function RevenueSplitDonut({
  orders,
  bills,
}: {
  orders: number;
  bills: number;
}) {
  const total = orders + bills;
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-4">
        <div className="w-20 h-20 rounded-full border-4 border-gray-100" />
        <p className="text-xs text-gray-400">No revenue recorded yet</p>
      </div>
    );
  }

  const ordersPct = Math.round((orders / total) * 100);
  const billsPct = 100 - ordersPct;

  return (
    <div className="flex items-center gap-5">
      <div
        className="w-20 h-20 rounded-full flex-shrink-0"
        style={{
          background: `conic-gradient(#C8738A 0% ${ordersPct}%, #F59E0B ${ordersPct}% 100%)`,
          maskImage: "radial-gradient(circle, transparent 34%, black 34%)",
          WebkitMaskImage: "radial-gradient(circle, transparent 34%, black 34%)",
        }}
      />
      <div className="space-y-3 flex-1">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-gold" />
            <span className="text-xs text-gray-500">Online Orders</span>
          </div>
          <p className="text-sm font-bold text-brown-dark ml-4">{ordersPct}%</p>
          <p className="text-xs text-gray-400 ml-4">{formatPrice(orders)}</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-xs text-gray-500">Walk-in Bills</span>
          </div>
          <p className="text-sm font-bold text-brown-dark ml-4">{billsPct}%</p>
          <p className="text-xs text-gray-400 ml-4">{formatPrice(bills)}</p>
        </div>
      </div>
    </div>
  );
}
