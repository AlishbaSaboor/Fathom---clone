import "server-only";
import { GeminiError } from "@/lib/gemini/errors";
import type { ApiErrorBody } from "@/lib/recordings/types";
import { checkRateLimit, clientIp } from "./rateLimit";

export function errorResponse(e: unknown): Response {
  const err = e instanceof GeminiError ? e : new GeminiError("unknown");
  // Log the kind only: never the raw error, which could echo request details.
  if (!(e instanceof GeminiError)) console.error("[api] unexpected error:", (e as Error)?.name ?? "unknown");
  const body: ApiErrorBody = {
    error: { kind: err.kind, message: err.message, retryable: err.retryable, retryAfterSec: err.retryAfterSec },
  };
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (err.retryAfterSec) headers["Retry-After"] = String(Math.ceil(err.retryAfterSec));
  return Response.json(body, { status: err.httpStatus, headers });
}

export function json(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, { ...init, headers: { "Cache-Control": "no-store", ...init?.headers } });
}

/** Reads a small JSON body, rejecting oversized or malformed input. */
export async function readJson(request: Request, maxBytes = 1_000_000): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (text.length > maxBytes) throw new GeminiError("invalid_input", "That request was too large.");
  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("shape");
    return parsed as Record<string, unknown>;
  } catch {
    throw new GeminiError("invalid_input");
  }
}

/** Throws a rate_limited GeminiError when this IP has exceeded `limit` requests per window for `scope`. */
export function enforceRateLimit(request: Request, scope: string, limit: number, windowMs: number): void {
  const r = checkRateLimit(`${scope}:${clientIp(request)}`, limit, windowMs);
  if (!r.ok) {
    throw new GeminiError("rate_limited", `Too many requests. Please try again in ${r.retryAfterSec} seconds.`);
  }
}
