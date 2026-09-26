import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { GeminiError } from "@/lib/gemini/errors";

// Hand-rolled OAuth 2.0 Authorization Code flow with PKCE, against Google's own
// documented endpoints. No SDK: this is a well-specified protocol, not a place
// to trust an unverified shortcut. Two things matter most for safety here:
//   - `state` (checked against the short-lived cookie set before the redirect)
//     stops a forged callback from logging a victim into an attacker's account.
//   - the id_token's signature is verified against Google's published keys
//     (not just base64-decoded), so a tampered or forged token is rejected.

export const OAUTH_COOKIE = "fathom_oauth";
export const OAUTH_COOKIE_MAX_AGE_SEC = 600;

const AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

function credentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new GeminiError("config", "Google sign-in isn't configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local (or the Vercel project's environment variables) and restart.");
  }
  return { clientId, clientSecret };
}

export function generatePkce(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function buildAuthorizeUrl(redirectUri: string, state: string, codeChallenge: string): string {
  const { clientId } = credentials();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    access_type: "online",
    prompt: "select_account",
  });
  return `${AUTHORIZE_URL}?${params}`;
}

export interface GoogleIdentity {
  googleId: string;
  email: string;
  name: string;
}

/** Exchanges the authorization code and returns the caller's identity, having verified the id_token's signature ourselves. */
export async function exchangeCodeForIdentity(code: string, redirectUri: string, codeVerifier: string): Promise<GoogleIdentity> {
  const { clientId, clientSecret } = credentials();
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      code_verifier: codeVerifier,
    }),
  });
  if (!res.ok) throw new GeminiError("oauth_failed");
  const body = (await res.json().catch(() => null)) as { id_token?: string } | null;
  if (!body?.id_token) throw new GeminiError("oauth_failed");

  const { payload } = await jwtVerify(body.id_token, JWKS, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience: clientId,
  }).catch(() => {
    throw new GeminiError("oauth_failed");
  });

  const { sub, email, email_verified: emailVerified, name } = payload;
  if (typeof sub !== "string" || typeof email !== "string" || emailVerified !== true) {
    throw new GeminiError("oauth_failed", "Google didn't return a verified email address.");
  }
  return { googleId: sub, email: email.toLowerCase(), name: typeof name === "string" && name ? name : email };
}
