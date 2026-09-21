import "server-only";

// A tiny client for the Redis-over-HTTP (Upstash) store that Vercel's "KV"
// storage is now provisioned through. Plain fetch, no dependency: Vercel adds
// KV_REST_API_URL and KV_REST_API_TOKEN to the project when a store is
// connected (the UPSTASH_REDIS_REST_* names are accepted too). Unset means
// "no store": callers treat that as sharing being unavailable, never as a crash.

const baseUrl = () => (process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL)?.trim().replace(/\/+$/, "");
const token = () => (process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN)?.trim();

export const kvConfigured = () => !!(baseUrl() && token());

/** Runs one Redis command. Throws a bare Error on any failure: the response body is never surfaced, since it could echo request content. */
async function command(args: (string | number)[], timeoutMs = 4000): Promise<unknown> {
  const res = await fetch(baseUrl()!, {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
  const json = (await res.json().catch(() => null)) as { result?: unknown; error?: unknown } | null;
  if (!res.ok || !json || json.error) throw new Error("kv request failed");
  return json.result;
}

/** SET with an expiry in seconds. True when the store confirmed the write. */
export async function kvSet(key: string, value: string, ttlSec: number): Promise<boolean> {
  return (await command(["SET", key, value, "EX", ttlSec])) === "OK";
}

/** GET. null when the key does not exist (or has expired). */
export async function kvGet(key: string): Promise<string | null> {
  const result = await command(["GET", key]);
  return typeof result === "string" ? result : null;
}
