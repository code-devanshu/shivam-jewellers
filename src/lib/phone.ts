const INDIAN_MOBILE_RE = /^[6-9]\d{9}$/;

// Accepts "9876543210", "+919876543210", "919876543210", with surrounding
// whitespace/dashes/spaces stripped, and returns the bare 10-digit number if valid.
function extractTenDigits(raw: string): string | null {
  const digits = raw.replace(/[\s-]/g, "");
  if (/^\+?91\d{10}$/.test(digits)) {
    return digits.slice(-10);
  }
  if (/^\d{10}$/.test(digits)) {
    return digits;
  }
  return null;
}

export function isValidIndianPhone(raw: string): boolean {
  const tenDigits = extractTenDigits(raw);
  return tenDigits !== null && INDIAN_MOBILE_RE.test(tenDigits);
}

// Normalizes to E.164 (+91XXXXXXXXXX) for storage and for WhatsApp/SMS API calls.
// Throws if the input isn't a valid Indian mobile number — validate first.
export function normalizePhone(raw: string): string {
  const tenDigits = extractTenDigits(raw);
  if (!tenDigits || !INDIAN_MOBILE_RE.test(tenDigits)) {
    throw new Error("Invalid Indian phone number.");
  }
  return `+91${tenDigits}`;
}
