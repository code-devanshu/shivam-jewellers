// Simple in-memory sliding-window counter, per server instance. Same pattern
// already used for admin login lockouts (src/app/admin/login/actions.ts) —
// not perfectly global across serverless instances, but enough to blunt
// scripted abuse without needing new infra.
type Entry = { count: number; windowStart: number };
const buckets = new Map<string, Entry>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now - entry.windowStart > windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
