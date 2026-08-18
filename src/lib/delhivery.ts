import type { ShipmentStatus } from "@prisma/client";

// NOTE: checkPincodeServiceability/calculateShippingCost/getExpectedDelivery were
// verified against the live production API (see comments above each). createShipment/
// trackShipment/cancelShipment below remain UNVERIFIED — confirm against
// https://track.delhivery.com/docs (or the partner dashboard docs) before going live —
// see parseDelhivery*Response() helpers, which isolate the assumptions to one place each.
const DEFAULT_BASE_URL = "https://track.delhivery.com";

function getConfig() {
  const token = process.env.DELHIVERY_API_TOKEN;
  const pickupLocation = process.env.DELHIVERY_PICKUP_LOCATION;
  if (!token || !pickupLocation) {
    throw new Error("DELHIVERY_API_TOKEN and DELHIVERY_PICKUP_LOCATION must be set.");
  }
  const baseUrl = process.env.DELHIVERY_BASE_URL ?? DEFAULT_BASE_URL;
  return { token, pickupLocation, baseUrl };
}

function getOriginPincode(): string {
  const pincode = process.env.DELHIVERY_ORIGIN_PINCODE;
  if (!pincode) {
    throw new Error("DELHIVERY_ORIGIN_PINCODE must be set.");
  }
  return pincode;
}

// Must match between calculateShippingCost and getExpectedDelivery so the
// quoted charge and ETA stay consistent (Surface vs Express have different TAT).
function getShipMode(): string {
  return process.env.DELHIVERY_SHIP_MODE ?? "S";
}

// Maps Delhivery's raw status strings to our internal ShipmentStatus enum.
// Unknown raw values map to UNKNOWN rather than throwing, so unmapped states
// surface via logging instead of breaking the webhook/create flow.
export const DELHIVERY_STATUS_MAP: Record<string, ShipmentStatus> = {
  Manifested: "MANIFESTED",
  "Not Picked": "NOT_PICKED",
  "Picked Up": "PICKED_UP",
  "In Transit": "IN_TRANSIT",
  Pending: "PENDING",
  Dispatched: "DISPATCHED",
  "Out for Delivery": "OUT_FOR_DELIVERY",
  Delivered: "DELIVERED",
  "RTO Initiated": "RTO_INITIATED",
  "RTO In Transit": "RTO_IN_TRANSIT",
  "RTO Delivered": "RTO_DELIVERED",
  Cancelled: "CANCELLED",
  Lost: "LOST",
};

export function mapDelhiveryStatus(rawStatus: string): ShipmentStatus {
  const mapped = DELHIVERY_STATUS_MAP[rawStatus];
  if (!mapped) {
    console.warn(`[delhivery] Unmapped status string: "${rawStatus}" — defaulting to UNKNOWN.`);
    return "UNKNOWN";
  }
  return mapped;
}

export type PincodeServiceability = {
  pincode: string;
  serviceable: boolean;
  codAvailable: boolean;
  prepaidAvailable: boolean;
  city?: string;
  state?: string;
};

function parseDelhiveryPincodeResponse(pincode: string, body: unknown): PincodeServiceability {
  const entry = (body as { delivery_codes?: { postal_code?: Record<string, unknown> }[] })
    ?.delivery_codes?.[0]?.postal_code;
  if (!entry) {
    return { pincode, serviceable: false, codAvailable: false, prepaidAvailable: false };
  }
  return {
    pincode,
    serviceable: true,
    codAvailable: entry.cod === "Y",
    prepaidAvailable: entry.pre_paid === "Y",
    city: typeof entry.city === "string" ? entry.city : undefined,
    state: typeof entry.state_code === "string" ? entry.state_code : undefined,
  };
}

export async function checkPincodeServiceability(pincode: string): Promise<PincodeServiceability> {
  const { token, baseUrl } = getConfig();

  const res = await fetch(`${baseUrl}/c/api/pin-codes/json/?filter_codes=${pincode}`, {
    headers: { Authorization: `Token ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Delhivery API error: ${JSON.stringify(err)}`);
  }

  const body = await res.json().catch(() => ({}));
  return parseDelhiveryPincodeResponse(pincode, body);
}

// Verified live against production on 2026-07-15 (GET, one array element back):
// https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?md=S&ss=Delivered&d_pin=110001&o_pin=274806&cgm=100&pt=COD
// -> [{ status, zone, total_amount, charge_COD, charged_weight, tax_data: {...}, ... }]
export type ShippingCostInput = {
  destinationPincode: string;
  weightGrams: number;
  paymentMode: "COD" | "Prepaid";
};

export type ShippingCostResult = {
  totalAmount: number;
  zone: string;
  chargedWeightGrams: number;
  raw: unknown;
};

function parseDelhiveryShippingCostResponse(body: unknown, weightGrams: number): ShippingCostResult {
  const entry = Array.isArray(body) ? (body[0] as Record<string, unknown>) : undefined;
  if (typeof entry?.total_amount !== "number") {
    throw new Error(`Delhivery API error: unexpected shipping cost response — ${JSON.stringify(body)}`);
  }
  return {
    totalAmount: entry.total_amount,
    zone: typeof entry.zone === "string" ? entry.zone : "",
    chargedWeightGrams: typeof entry.charged_weight === "number" ? entry.charged_weight : weightGrams,
    raw: body,
  };
}

export async function calculateShippingCost(input: ShippingCostInput): Promise<ShippingCostResult> {
  const { token, baseUrl } = getConfig();
  const params = new URLSearchParams({
    md: getShipMode(),
    ss: "Delivered",
    o_pin: getOriginPincode(),
    d_pin: input.destinationPincode,
    cgm: String(Math.round(input.weightGrams)),
    pt: input.paymentMode,
  });

  const res = await fetch(`${baseUrl}/api/kinko/v1/invoice/charges/.json?${params.toString()}`, {
    headers: { Authorization: `Token ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Delhivery API error: ${JSON.stringify(err)}`);
  }

  const body = await res.json().catch(() => ({}));
  return parseDelhiveryShippingCostResponse(body, input.weightGrams);
}

// Verified live against production on 2026-07-15 (GET):
// https://track.delhivery.com/api/dc/expected_tat?origin_pin=274806&destination_pin=110001&mot=S&pdt=B2C&expected_pickup_date=2026-07-16%2010:00
// -> { success: true, msg: "", data: { tat: 4, expected_delivery_date: "2026-07-20" } }
export type ExpectedTATInput = {
  destinationPincode: string;
  pickupDate?: Date;
};

export type ExpectedTATResult = {
  tatDays: number;
  expectedDeliveryDate?: string;
  raw: unknown;
};

function formatPickupDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseDelhiveryTATResponse(body: unknown): ExpectedTATResult {
  const data = (
    body as { success?: boolean; data?: { tat?: number; expected_delivery_date?: string } }
  )?.data;
  if (typeof data?.tat !== "number") {
    throw new Error(`Delhivery API error: unexpected TAT response — ${JSON.stringify(body)}`);
  }
  return { tatDays: data.tat, expectedDeliveryDate: data.expected_delivery_date, raw: body };
}

export async function getExpectedDelivery(input: ExpectedTATInput): Promise<ExpectedTATResult> {
  const { token, baseUrl } = getConfig();
  const params = new URLSearchParams({
    origin_pin: getOriginPincode(),
    destination_pin: input.destinationPincode,
    mot: getShipMode(),
    pdt: "B2C",
  });
  if (input.pickupDate) {
    params.set("expected_pickup_date", formatPickupDate(input.pickupDate));
  }

  const res = await fetch(`${baseUrl}/api/dc/expected_tat?${params.toString()}`, {
    headers: { Accept: "application/json", Authorization: `Token ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Delhivery API error: ${JSON.stringify(err)}`);
  }

  const body = await res.json().catch(() => ({}));
  return parseDelhiveryTATResponse(body);
}

export type CreateShipmentInput = {
  orderNumber: string;
  paymentMode: "COD" | "Prepaid";
  codAmount: number;
  totalAmount: number;
  weightGrams: number;
  dimensionsCm: { l: number; w: number; h: number };
  consignee: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  productsDescription: string;
};

export type CreateShipmentResult = { waybill: string; trackingUrl: string; raw: unknown };

function trackingUrlFor(waybill: string): string {
  return `https://www.delhivery.com/track/package/${waybill}`;
}

function parseDelhiveryCreateResponse(body: unknown): CreateShipmentResult {
  const typed = body as {
    packages?: { waybill?: string; status?: string; remarks?: unknown }[];
    rmk?: string;
  };
  const pkg = typed?.packages?.[0];
  if (!pkg?.waybill) {
    const remarks = Array.isArray(pkg?.remarks)
      ? pkg.remarks.join("; ")
      : typeof pkg?.remarks === "string"
        ? pkg.remarks
        : undefined;
    const reason = remarks || typed?.rmk || JSON.stringify(body);
    throw new Error(`Delhivery API error: shipment not created — ${reason}`);
  }
  return { waybill: pkg.waybill, trackingUrl: trackingUrlFor(pkg.waybill), raw: body };
}

export async function createShipment(input: CreateShipmentInput): Promise<CreateShipmentResult> {
  const { token, pickupLocation, baseUrl } = getConfig();

  const payload = {
    pickup_location: { name: pickupLocation },
    shipments: [
      {
        name: input.consignee.name,
        add: [input.consignee.line1, input.consignee.line2].filter(Boolean).join(", "),
        city: input.consignee.city,
        state: input.consignee.state,
        country: "India",
        pin: input.consignee.pincode,
        phone: input.consignee.phone,
        order: input.orderNumber,
        payment_mode: input.paymentMode,
        products_desc: input.productsDescription,
        cod_amount: input.codAmount,
        total_amount: input.totalAmount,
        weight: input.weightGrams,
        shipment_length: input.dimensionsCm.l,
        shipment_width: input.dimensionsCm.w,
        shipment_height: input.dimensionsCm.h,
      },
    ],
  };

  const body = new URLSearchParams({ format: "json", data: JSON.stringify(payload) });

  const res = await fetch(`${baseUrl}/api/cmu/create.json`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Delhivery API error: ${JSON.stringify(err)}`);
  }

  const responseBody = await res.json().catch(() => ({}));
  return parseDelhiveryCreateResponse(responseBody);
}

export type TrackShipmentResult = {
  waybill: string;
  currentStatus: string;
  scans: {
    status: string;
    statusType?: string;
    instructions?: string;
    location?: string;
    scannedAt: string;
  }[];
};

function parseDelhiveryTrackResponse(waybill: string, body: unknown): TrackShipmentResult {
  const shipmentData = (
    body as {
      ShipmentData?: {
        Shipment?: {
          Status?: { Status?: string };
          Scans?: {
            ScanDetail?: {
              Scan?: string;
              ScanType?: string;
              Instructions?: string;
              ScannedLocation?: string;
              ScanDateTime?: string;
            };
          }[];
        };
      }[];
    }
  )?.ShipmentData?.[0]?.Shipment;

  return {
    waybill,
    currentStatus: shipmentData?.Status?.Status ?? "Unknown",
    scans: (shipmentData?.Scans ?? []).map((s) => ({
      status: s.ScanDetail?.Scan ?? "Unknown",
      statusType: s.ScanDetail?.ScanType,
      instructions: s.ScanDetail?.Instructions,
      location: s.ScanDetail?.ScannedLocation,
      scannedAt: s.ScanDetail?.ScanDateTime ?? new Date().toISOString(),
    })),
  };
}

export async function trackShipment(waybill: string): Promise<TrackShipmentResult> {
  const { token, baseUrl } = getConfig();

  const res = await fetch(`${baseUrl}/api/v1/packages/json/?waybill=${waybill}`, {
    headers: { Authorization: `Token ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Delhivery API error: ${JSON.stringify(err)}`);
  }

  const body = await res.json().catch(() => ({}));
  return parseDelhiveryTrackResponse(waybill, body);
}

export async function cancelShipment(waybill: string): Promise<void> {
  const { token, baseUrl } = getConfig();

  const res = await fetch(`${baseUrl}/api/p/edit`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ waybill, cancellation: true }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Delhivery API error: ${JSON.stringify(err)}`);
  }
}

// Isolated so the webhook route only needs to update this function if Delhivery's
// real callback payload shape differs from this assumption.
export type ParsedWebhookEvent = {
  waybill: string;
  rawStatus: string;
  statusType?: string;
  instructions?: string;
  location?: string;
  scannedAt: Date;
};

export function parseDelhiveryWebhookPayload(body: unknown): ParsedWebhookEvent | null {
  const shipment = (
    body as {
      Shipment?: {
        AWB?: string;
        Status?: {
          Status?: string;
          StatusType?: string;
          Instructions?: string;
          StatusLocation?: string;
          StatusDateTime?: string;
        };
      };
    }
  )?.Shipment;

  if (!shipment?.AWB || !shipment.Status?.Status) return null;

  return {
    waybill: shipment.AWB,
    rawStatus: shipment.Status.Status,
    statusType: shipment.Status.StatusType,
    instructions: shipment.Status.Instructions,
    location: shipment.Status.StatusLocation,
    scannedAt: shipment.Status.StatusDateTime ? new Date(shipment.Status.StatusDateTime) : new Date(),
  };
}
