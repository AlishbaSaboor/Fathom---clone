import "server-only";
import { GeminiError } from "./errors";

/**
 * Preferred models, tried in order. Gemini models come and go and get
 * overloaded independently, so a request walks this list. Override with
 * GEMINI_MODEL, which may be one model id or a comma-separated list.
 *
 * gemini-2.5-flash is deliberately absent: it is no longer available to new
 * API keys.
 */
const DEFAULT_MODELS = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash"];

/** The API key. Server-side only: it is never sent to the browser. */
export function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key === "your-key-here") throw new GeminiError("config");
  return key;
}

export function getModelChain(): string[] {
  const configured = process.env.GEMINI_MODEL?.split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  return configured?.length ? configured : DEFAULT_MODELS;
}

export const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com";
