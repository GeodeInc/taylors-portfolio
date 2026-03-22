// Simple in-memory per-IP rate limiter.
// Resets each window. Fine for a single-instance Next.js deployment (Vercel hobby/pro).

const store = new Map<string, { count: number; resetAt: number }>();

/** Returns true if the IP is allowed, false if rate-limited. */
export function checkRateLimit(
  ip: string,
  limit = 5,
  windowMs = 60 * 60 * 1000, // 1 hour
): boolean {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now >= entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count += 1;
  return true;
}
