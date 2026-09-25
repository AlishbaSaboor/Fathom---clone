import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { OWNER_COOKIE, OWNER_COOKIE_MAX_AGE_SEC, isOwnerId } from "@/lib/ownerCookie";

// Gives each new browser its anonymous owner id (see lib/ownerCookie.ts). Runs
// only on the app pages, never on the marketing page at "/" or the public
// share pages: a visitor who hasn't opened the app yet is not given an identity.
export function proxy(request: NextRequest) {
  if (isOwnerId(request.cookies.get(OWNER_COOKIE)?.value)) return NextResponse.next();

  const id = crypto.randomUUID();
  // Set on the request as well, so the page rendered for this very first visit already sees it.
  request.cookies.set(OWNER_COOKIE, id);
  const response = NextResponse.next({ request });
  response.cookies.set({
    name: OWNER_COOKIE,
    value: id,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: OWNER_COOKIE_MAX_AGE_SEC,
  });
  return response;
}

export const config = {
  matcher: ["/calls", "/upload", "/meetings/:path*"],
};
