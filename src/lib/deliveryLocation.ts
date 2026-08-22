const PINCODE_KEY = "delivery_pincode";

export type PincodeSource = "geo" | "manual";

export type StoredPincode = {
  pincode: string;
  source: PincodeSource;
  updatedAt: number;
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((cb) => cb());
}

export function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// useSyncExternalStore requires getSnapshot to return a stable reference when
// the underlying value hasn't changed — JSON.parse-ing on every call would
// return a new object each time and trigger React's infinite-loop guard.
let cachedRaw: string | null = null;
let cachedValue: StoredPincode | null = null;

export function getSnapshot(): StoredPincode | null {
  const raw = window.localStorage.getItem(PINCODE_KEY);
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  if (!raw) {
    cachedValue = null;
    return cachedValue;
  }
  try {
    const parsed = JSON.parse(raw) as StoredPincode;
    cachedValue = /^\d{6}$/.test(parsed.pincode) ? parsed : null;
  } catch {
    cachedValue = null;
  }
  return cachedValue;
}

export function getServerSnapshot(): StoredPincode | null {
  return null;
}

export function setDeliveryPincode(pincode: string, source: PincodeSource) {
  const value: StoredPincode = { pincode, source, updatedAt: Date.now() };
  window.localStorage.setItem(PINCODE_KEY, JSON.stringify(value));
  notify();
}
