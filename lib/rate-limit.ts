import "server-only";

// In-memory, per-process rate limiter. Resets on server restart and does
// not share state across multiple instances — acceptable for this demo's
// single-instance scope, not for a multi-instance/serverless deployment
// (use a shared store like Redis there instead).

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitCheck =
  | { limited: false }
  | { limited: true; retryAfterSeconds: number };

/** Checks whether `key` is currently rate-limited, without consuming an attempt. */
export function isRateLimited(key: string, maxAttempts: number): RateLimitCheck {
  const bucket = buckets.get(key);
  const now = Date.now();

  if (!bucket || bucket.resetAt <= now) {
    return { limited: false };
  }
  if (bucket.count >= maxAttempts) {
    return { limited: true, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { limited: false };
}

/** Records a failed attempt against `key`, starting a new window if needed. */
export function recordFailedAttempt(key: string, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
  } else {
    bucket.count += 1;
  }
}

/** Clears any recorded attempts for `key` (e.g. after a successful login). */
export function clearAttempts(key: string) {
  buckets.delete(key);
}

/**
 * Checks and consumes one attempt against `key` in a single step — for
 * limits where every call counts, not just failures (e.g. registration).
 */
export function consumeRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): RateLimitCheck {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false };
  }
  if (bucket.count >= maxAttempts) {
    return { limited: true, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { limited: false };
}
