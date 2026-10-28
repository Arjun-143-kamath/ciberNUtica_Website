import 'server-only';

const buckets = new Map<string, { count: number; resetAt: number }>();

export function allowAuthAttempt(key: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const current = buckets.get(key);
  if (current && current.resetAt > now && current.count >= limit) return false;
  buckets.set(key, !current || current.resetAt <= now ? { count: 1, resetAt: now + windowMs } : { ...current, count: current.count + 1 });
  if (buckets.size > 10_000) for (const [bucketKey, value] of buckets) if (value.resetAt <= now) buckets.delete(bucketKey);
  return true;
}

export function requestIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}
