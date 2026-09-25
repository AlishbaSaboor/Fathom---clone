// Constants shared by proxy.ts and the server-side reader (lib/server/owner.ts).
// Kept free of server-only imports so the proxy can use it too.

/**
 * There are no accounts in this build. Each browser is given a random id in an
 * httpOnly cookie, and every recording is stored against it, so My Calls lists
 * only what that browser uploaded. The id is 122 random bits and is never sent
 * to other visitors, which makes it work as its own secret. It is not a login:
 * clearing cookies means losing the way back to your list (share links keep working).
 */
export const OWNER_COOKIE = "fathom_owner";
export const OWNER_COOKIE_MAX_AGE_SEC = 365 * 24 * 60 * 60;

export const isOwnerId = (value: string | undefined): value is string =>
  !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value);
