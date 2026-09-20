import "server-only";
import { GEMINI_BASE_URL, getApiKey, getModelChain } from "./config";
import { GeminiError } from "./errors";

interface UpstreamError {
  error?: {
    message?: string;
    status?: string;
    details?: {
      "@type"?: string;
      violations?: { quotaId?: string }[];
      retryDelay?: string;
    }[];
  };
}

/** Turns a failed Gemini response into a GeminiError. Never includes the raw body. */
export function classifyFailure(status: number, bodyText: string): GeminiError {
  let parsed: UpstreamError = {};
  try {
    parsed = JSON.parse(bodyText) as UpstreamError;
  } catch {
    // non-JSON body: fall back to the HTTP status alone
  }
  const message = parsed.error?.message ?? "";
  const apiStatus = parsed.error?.status ?? "";

  if (/api key not valid|api_key_invalid|invalid api key/i.test(message)) return new GeminiError("auth");
  if (status === 401 || status === 403) return new GeminiError("auth");
  if (status === 404) {
    return /no longer available|not found|not supported/i.test(message) && /model/i.test(message)
      ? new GeminiError("model_unavailable")
      : new GeminiError("not_found");
  }
  if (status === 429) {
    const details = parsed.error?.details ?? [];
    const quotaId = details.find((d) => d["@type"]?.endsWith("QuotaFailure"))?.violations?.[0]?.quotaId ?? "";
    const retryDelay = details.find((d) => d["@type"]?.endsWith("RetryInfo"))?.retryDelay;
    const retryAfterSec = retryDelay ? Math.ceil(parseFloat(retryDelay)) : undefined;
    if (/PerDay/i.test(quotaId)) return new GeminiError("quota");
    if (quotaId || apiStatus === "RESOURCE_EXHAUSTED") {
      const wait = retryAfterSec ? ` Please wait about ${retryAfterSec} seconds and try again.` : " Please wait a moment and try again.";
      return new GeminiError(
        "rate_limit",
        `Gemini is rate limiting this API key right now (free-tier keys allow only a few requests per minute).${wait}`,
        { retryAfterSec },
      );
    }
    return new GeminiError("busy");
  }
  if (status >= 500) return new GeminiError("busy");
  if (status === 400) return new GeminiError("bad_request");
  return new GeminiError("unknown");
}

/** fetch against the Gemini API with the key in a header (never in the URL) and a hard timeout. */
export async function geminiFetch(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<Response> {
  const { timeoutMs = 30_000, headers, ...rest } = init;
  try {
    return await fetch(`${GEMINI_BASE_URL}${path}`, {
      ...rest,
      headers: { "x-goog-api-key": getApiKey(), ...(headers as Record<string, string> | undefined) },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    if (e instanceof GeminiError) throw e;
    const name = (e as { name?: string }).name;
    throw new GeminiError(name === "TimeoutError" || name === "AbortError" ? "timeout" : "network");
  }
}

export interface GenerateInput {
  contents: unknown[];
  systemInstruction?: string;
  generationConfig?: Record<string, unknown>;
  /** Total time budget across every attempt and model, in ms. */
  budgetMs?: number;
  /** Time allowed for a single attempt, in ms. */
  attemptTimeoutMs?: number;
  /**
   * Don't start an attempt with less than this left in the budget: it could not
   * finish before the platform kills the function, so the caller would get a
   * bare timeout instead of a proper error it can retry.
   */
  minAttemptMs?: number;
}

export interface GenerateResult {
  text: string;
  model: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * generateContent with retries and model fallback. Gemini regularly answers 503
 * "high demand" for a while, models disappear for new keys, and free-tier keys
 * are limited to a few requests per minute *per model*, so a request walks the
 * model list:
 *  - 503 / timeout / network (busy): retry the same model once after a short
 *    backoff, then move on to the next model
 *  - 429 rate limit or quota: that model's counter is spent, but the next
 *    model has its own, so move on immediately
 *  - model not available to this key: skip it
 *  - auth / bad input / blocked: fail straight away (retrying cannot help)
 * If every model is rate limited and Gemini says the wait is short, wait it out
 * once and run the list again. Everything respects a single time budget so it
 * stays inside the function's maximum duration.
 */
export async function generateWithFallback(input: GenerateInput): Promise<GenerateResult> {
  const { budgetMs = 240_000, attemptTimeoutMs = 100_000, minAttemptMs = 5_000 } = input;
  const deadline = Date.now() + budgetMs;
  const buildBody = (generationConfig: Record<string, unknown> | undefined) =>
    JSON.stringify({
      contents: input.contents,
      ...(input.systemInstruction ? { systemInstruction: { parts: [{ text: input.systemInstruction }] } } : {}),
      generationConfig,
    });

  let last: GeminiError | null = null;
  let anyModelExisted = false;

  for (let pass = 1; pass <= 2; pass++) {
    for (const model of getModelChain()) {
      // Each model gets the caller's config afresh: a thinking level one model refuses may suit the next.
      let config = input.generationConfig;
      for (let attempt = 1; attempt <= 2; attempt++) {
        const remaining = deadline - Date.now();
        if (remaining < minAttemptMs) throw last ?? new GeminiError("timeout");

        try {
          const res = await geminiFetch(`/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: buildBody(config),
            timeoutMs: Math.min(attemptTimeoutMs, remaining),
          });
          const text = await res.text();
          if (!res.ok) {
            // Models differ in which thinking levels they accept (3.8 refuses "minimal"). Step down
            // minimal -> low -> no thinkingConfig, retrying this model immediately each time.
            if (res.status === 400 && config && "thinkingConfig" in config && /thinking/i.test(text)) {
              const level = (config.thinkingConfig as { thinkingLevel?: string } | undefined)?.thinkingLevel;
              config =
                level === "minimal"
                  ? { ...config, thinkingConfig: { thinkingLevel: "low" } }
                  : Object.fromEntries(Object.entries(config).filter(([k]) => k !== "thinkingConfig"));
              attempt--;
              continue;
            }
            throw classifyFailure(res.status, text);
          }

          anyModelExisted = true;
          return { text: extractText(text), model };
        } catch (e) {
          const err = e instanceof GeminiError ? e : new GeminiError("unknown");
          last = err;
          if (err.kind === "model_unavailable") break; // try the next model
          if (err.kind === "rate_limit" || err.kind === "quota") {
            anyModelExisted = true;
            break; // this model's limit is spent; the next model has its own
          }
          if (err.kind === "busy" || err.kind === "timeout" || err.kind === "network") {
            anyModelExisted = true;
            if (attempt === 1) await sleep(1_500 + Math.random() * 1_000);
            continue;
          }
          throw err; // auth, bad_request, blocked, empty...
        }
      }
    }

    // Every model was tried. If they were all rate limited for a short while, wait it out once.
    const wait = last?.kind === "rate_limit" ? last.retryAfterSec : undefined;
    if (pass === 1 && wait && wait <= 30 && deadline - Date.now() > (wait + 25) * 1000) {
      await sleep((wait + 1) * 1000);
      continue;
    }
    break;
  }

  if (last?.kind === "model_unavailable" && !anyModelExisted) throw last;
  throw last ?? new GeminiError("busy");
}

/** Pulls the text out of a generateContent response, surfacing blocks and truncation. */
function extractText(responseBody: string): string {
  let json: {
    promptFeedback?: { blockReason?: string };
    candidates?: { finishReason?: string; content?: { parts?: { text?: string; thought?: boolean }[] } }[];
  };
  try {
    json = JSON.parse(responseBody);
  } catch {
    throw new GeminiError("bad_output");
  }
  if (json.promptFeedback?.blockReason) throw new GeminiError("blocked");
  const candidate = json.candidates?.[0];
  if (!candidate) throw new GeminiError("empty");
  if (candidate.finishReason === "SAFETY" || candidate.finishReason === "PROHIBITED_CONTENT") {
    throw new GeminiError("blocked");
  }
  const text = (candidate.content?.parts ?? [])
    .filter((p) => !p.thought)
    .map((p) => p.text ?? "")
    .join("");
  if (!text.trim()) throw new GeminiError("empty");
  // MAX_TOKENS means the JSON is cut off mid-way; callers will fail to parse it and retry.
  return text;
}
