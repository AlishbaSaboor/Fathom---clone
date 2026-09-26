import "server-only";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

// node:crypto's scrypt, not a dependency: OWASP lists it alongside bcrypt/Argon2
// as an acceptable password hash, and it avoids adding a native module to a
// Windows dev environment.
const scrypt = promisify(scryptCallback) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>;
const KEY_LENGTH = 64;

/** `scrypt:saltHex:hashHex`. The scheme prefix leaves room to change the algorithm later without breaking old hashes. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

// Any validly-shaped hash works here: verifyPassword() below always runs a real scrypt
// computation against it, so a login for an email that doesn't exist takes the same time
// as a wrong password, not revealing which case it was.
const DUMMY_STORED = `scrypt:${"a".repeat(32)}:${"b".repeat(128)}`;

export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  const [scheme, saltHex, hashHex] = (stored ?? DUMMY_STORED).split(":");
  if (scheme !== "scrypt" || !saltHex || !hashHex) {
    await scrypt(password, randomBytes(16), KEY_LENGTH); // still take the time, even for a malformed row
    return false;
  }
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password, salt, expected.length);
  return stored !== null && actual.length === expected.length && timingSafeEqual(actual, expected);
}
