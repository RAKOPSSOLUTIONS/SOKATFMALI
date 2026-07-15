import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken, type Session } from "./auth";

/** Read the current admin session (server components / actions). */
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}
