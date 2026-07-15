import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/** Node-only password hashing (scrypt). Do NOT import from edge/middleware. */
export function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [salt, hash] = (stored || "").split(":");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const test = scryptSync(pw, salt, 64);
  return hashBuf.length === test.length && timingSafeEqual(hashBuf, test);
}
