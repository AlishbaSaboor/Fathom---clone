import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/server/session";

// Gates the app's signed-in pages. This is the "optimistic" check from Next's own
// auth guide: signature + expiry only, no database call, so it stays cheap on
// every prefetched navigation. It is not the real access check — every page and
// API route re-verifies against the sessions collection via lib/server/auth.ts,
// which is what actually decides whether data is returned.
export async function proxy(request: NextRequest) {
  const sessionId = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (sessionId) return NextResponse.next();

  const url = new URL("/login", request.url);
  url.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/calls", "/upload", "/meetings/:path*", "/playlists", "/playlists/:path*"],
};
