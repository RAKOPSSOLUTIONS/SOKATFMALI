import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "sokatf_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const SESSION_MAX_AGE = MAX_AGE_SECONDS;

export const ROLES = ["admin", "comptable", "commercial"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<string, string> = {
  admin: "Administrateur",
  comptable: "Comptable",
  commercial: "Commercial",
};

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET is missing or too short (min 16 chars).");
  return new TextEncoder().encode(s);
}

export type Session = { email: string; role: Role; name: string };

export async function createSessionToken(email: string, role: Role, name: string): Promise<string> {
  return new SignJWT({ role, email, name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());
}

export async function verifySessionToken(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const role = String(payload.role ?? "");
    if (!ROLES.includes(role as Role)) return null;
    return { email: String(payload.email ?? ""), role: role as Role, name: String(payload.name ?? "") };
  } catch {
    return null;
  }
}

/** Bootstrap super-admin from env (used if no DB user matches). */
export function checkCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL || "admin@sokatf.com";
  const expectedPassword = process.env.ADMIN_PASSWORD || "changeme";
  return email.trim().toLowerCase() === expectedEmail.toLowerCase() && password === expectedPassword;
}

/** Role-based access map (path prefix -> allowed roles). admin sees all. */
const ACCESS: Record<string, Role[]> = {
  "/admin/leads": ["admin", "commercial"],
  "/admin/clients": ["admin", "comptable", "commercial"],
  "/admin/produits": ["admin", "comptable", "commercial"],
  "/admin/services": ["admin", "comptable", "commercial"],
  "/admin/devis": ["admin", "comptable", "commercial"],
  "/admin/factures": ["admin", "comptable", "commercial"],
  "/admin/finances": ["admin", "comptable"],
  "/admin/rapports": ["admin", "comptable"],
  "/admin/export": ["admin", "comptable"],
  "/admin/sectors": ["admin"],
  "/admin/projects": ["admin"],
  "/admin/parametres": ["admin", "comptable"],
  "/admin/site": ["admin"],
  "/admin/documentation": ["admin"],
  "/admin/activite": ["admin"],
  "/admin/sauvegarde": ["admin"],
  "/admin/backup": ["admin"],
  "/admin/utilisateurs": ["admin"],
};

export function canAccess(role: string, pathname: string): boolean {
  if (role === "admin") return true;
  const entry = Object.entries(ACCESS).find(([p]) => pathname === p || pathname.startsWith(p + "/"));
  if (!entry) return true; // dashboard home & unlisted routes
  return entry[1].includes(role as Role);
}
