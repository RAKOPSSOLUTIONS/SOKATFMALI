import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "sokatf_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) {
    // Fail loud rather than signing with a weak/empty key.
    throw new Error("AUTH_SECRET is missing or too short (min 16 chars).");
  }
  return new TextEncoder().encode(s);
}

/** Create a signed session token for the admin. */
export async function createSessionToken(email: string): Promise<string> {
  return new SignJWT({ role: "admin", email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());
}

/** Verify a session token; returns the payload or null. */
export async function verifySessionToken(
  token: string | undefined,
): Promise<{ email: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.role !== "admin") return null;
    return { email: String(payload.email ?? "") };
  } catch {
    return null;
  }
}

/** Constant-time-ish credential check against env config. */
export function checkCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL || "admin@sokatf-sarl.com";
  const expectedPassword = process.env.ADMIN_PASSWORD || "changeme";
  return (
    email.trim().toLowerCase() === expectedEmail.toLowerCase() &&
    password === expectedPassword
  );
}

export const SESSION_MAX_AGE = MAX_AGE_SECONDS;
