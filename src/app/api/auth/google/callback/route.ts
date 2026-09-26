import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { GeminiError } from "@/lib/gemini/errors";
import { claimAnonymousMeetings, createSession, isSafeRedirect } from "@/lib/server/auth";
import { OAUTH_COOKIE, exchangeCodeForIdentity } from "@/lib/server/googleOAuth";
import { findOrCreateGoogleUser } from "@/lib/server/users";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookieStore = await cookies();

  try {
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const raw = cookieStore.get(OAUTH_COOKIE)?.value;
    cookieStore.delete(OAUTH_COOKIE);
    if (!code || !state || !raw) throw new GeminiError("oauth_failed");

    const stored = JSON.parse(raw) as { state?: string; verifier?: string; from?: string };
    // Constant-time comparison isn't needed here: `state` isn't a secret, only a per-attempt
    // nonce checked against what this same browser was given moments ago.
    if (!stored.state || !stored.verifier || stored.state !== state) throw new GeminiError("oauth_failed");

    const redirectUri = new URL("/api/auth/google/callback", url.origin).toString();
    const identity = await exchangeCodeForIdentity(code, redirectUri, stored.verifier);
    const user = await findOrCreateGoogleUser(identity);
    await createSession(user.id);
    await claimAnonymousMeetings(user.id);

    const from = isSafeRedirect(stored.from) ? stored.from : "/calls";
    return NextResponse.redirect(new URL(from, url.origin));
  } catch (e) {
    const message = e instanceof GeminiError ? e.message : "Something went wrong. Please try again.";
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, url.origin));
  }
}
