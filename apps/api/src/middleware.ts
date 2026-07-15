import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken, canAccess } from "@/lib/auth";

// Protect every /admin route except the login page.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  // Role-based access control
  if (!canAccess(session.role, pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
