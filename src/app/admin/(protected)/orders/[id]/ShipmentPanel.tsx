"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Truck, ExternalLink, RefreshCw, XCircle } from "lucide-react";
import { createShipmentAction, refreshTrackingAction, cancelShipmentAction } from "../shipment-actions";
import type { ShipmentStatus, OrderStatus, DeliveryType } from "@prisma/client";

const SHIPMENT_STATUS_MAP: Record<ShipmentStatus, { label: string; cls: string }> = {
  MANIFESTED: { label: "Manifested", cls: "bg-gray-100 text-gray-600" },
  NOT_PICKED: { label: "Not Picked", cls: "bg-yellow-100 text-yellow-700" },
  PICKED_UP: { label: "Picked Up", cls: "bg-blue-100 text-blue-700" },
  IN_TRANSIT: { label: "In Transit", cls: "bg-blue-100 text-blue-700" },
  PENDING: { label: "Pending", cls: "bg-yellow-100 text-yellow-700" },
  DISPATCHED: { label: "Dispatched", cls: "bg-purple-100 text-purple-700" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", cls: "bg-purple-100 text-purple-700" },
  DELIVERED: { label: "Delivered", cls: "bg-green-100 text-green-700" },
  RTO_INITIATED: { label: "RTO Initiated", cls: "bg-red-100 text-red-700" },
  RTO_IN_TRANSIT: { label: "RTO In Transit", cls: "bg-red-100 text-red-700" },
  RTO_DELIVERED: { label: "RTO Delivered", cls: "bg-red-100 text-red-700" },
  CANCELLED: { label: "Cancelled", cls: "bg-red-100 text-red-700" },
  LOST: { label: "Lost", cls: "bg-red-100 text-red-700" },
  UNKNOWN: { label: "Unknown", cls: "bg-gray-100 text-gray-600" },
};

function fmtDateTime(d: Date) {
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type ShipmentEventRow = {
  id: string;
  status: ShipmentStatus;
  instructions: string | null;
  location: string | null;
  scannedAt: Date;
};

type ShipmentData = {
  id: string;
  waybill: string;
  courierName: string;
  status: ShipmentStatus;
  trackingUrl: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  events: ShipmentEventRow[];
};

type OrderData = {
  id: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
  shipment: ShipmentData | null;
};

export default function ShipmentPanel({ order }: { order: OrderData }) {
  const [isPending, startTransition] = useTransition();

  if (order.deliveryType === "STORE_PICKUP") return null;

  const canCreate =
    !order.shipment && ["CONFIRMED", "PROCESSING"].includes(order.status);

  function handleCreate() {
    startTransition(async () => {
      const res = await createShipmentAction(order.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Shipment created — AWB ${res.waybill}`);
      }
    });
  }

  function handleRefresh(shipmentId: string) {
    startTransition(async () => {
      const res = await refreshTrackingAction(shipmentId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Tracking refreshed");
      }
    });
  }

  function handleCancel(shipmentId: string) {
    if (!confirm("Cancel this shipment with Delhivery? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await cancelShipmentAction(shipmentId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Shipment cancelled");
      }
    });
  }

  if (!order.shipment) {
    if (!canCreate) return null;
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Shipment</p>
        <button
          onClick={handleCreate}
          disabled={isPending}
          className="w-full py-2 bg-rose-gold hover:bg-rose-gold-dark text-white rounded-full text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <Truck size={15} />
          {isPending ? "Creating Shipment…" : "Create Shipment (Delhivery)"}
        </button>
      </div>
    );
  }

  const s = order.shipment;
  const badge = SHIPMENT_STATUS_MAP[s.status];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Shipment</p>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      <div className="text-sm text-brown-dark space-y-1">
        <p>
          <span className="text-gray-400 text-xs">Courier:</span> {s.courierName}
        </p>
        <p>
          <span className="text-gray-400 text-xs">AWB:</span>{" "}
          <span className="font-mono">{s.waybill}</span>
        </p>
        {s.trackingUrl && (
          <a
            href={s.trackingUrl}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-gold hover:text-rose-gold-dark"
          >
            Track Shipment <ExternalLink size={11} />
          </a>
        )}
        {s.shippedAt && (
          <p className="text-xs text-gray-400">Shipped: {fmtDateTime(s.shippedAt)}</p>
        )}
        {s.deliveredAt && (
          <p className="text-xs text-gray-400">Delivered: {fmtDateTime(s.deliveredAt)}</p>
        )}
      </div>

      {!["DELIVERED", "CANCELLED", "RTO_DELIVERED", "LOST"].includes(s.status) && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={() => handleRefresh(s.id)}
            disabled={isPending}
            className="flex-1 py-2 border border-gray-200 hover:bg-gray-50 text-brown-dark rounded-full text-xs font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            <RefreshCw size={13} />
            Refresh Tracking
          </button>
          <button
            onClick={() => handleCancel(s.id)}
            disabled={isPending}
            className="flex-1 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-full text-xs font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            <XCircle size={13} />
            Cancel Shipment
          </button>
        </div>
      )}

      {s.events.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          {[...s.events].reverse().map((ev) => {
            const evBadge = SHIPMENT_STATUS_MAP[ev.status];
            return (
              <div key={ev.id} className="text-xs">
                <p className="font-medium text-brown-dark">{evBadge.label}</p>
                {ev.instructions && <p className="text-gray-400">{ev.instructions}</p>}
                {ev.location && <p className="text-gray-400">{ev.location}</p>}
                <p className="text-gray-300">{fmtDateTime(ev.scannedAt)}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
