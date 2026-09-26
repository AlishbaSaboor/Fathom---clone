import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { isSafeRedirect } from "@/lib/server/auth";
import { OAUTH_COOKIE, OAUTH_COOKIE_MAX_AGE_SEC, buildAuthorizeUrl, generatePkce } from "@/lib/server/googleOAuth";

// Starts Google sign-in: stashes state + the PKCE verifier + where to return to in a
// short-lived cookie, then sends the browser to Google. The callback checks all three.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const state = randomBytes(16).toString("base64url");
  const { verifier, challenge } = generatePkce();
  const redirectUri = new URL("/api/auth/google/callback", url.origin).toString();

  const response = NextResponse.redirect(buildAuthorizeUrl(redirectUri, state, challenge));
  response.cookies.set(OAUTH_COOKIE, JSON.stringify({ state, verifier, from: isSafeRedirect(from) ? from : "/calls" }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: OAUTH_COOKIE_MAX_AGE_SEC,
  });
  return response;
}
