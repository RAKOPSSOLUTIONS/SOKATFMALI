import { NextResponse } from "next/server";

const ALLOWED_ORIGIN = process.env.WEB_ORIGIN || "http://localhost:4321";

/** CORS headers allowing the public Astro site to call the API from the browser. */
export function corsHeaders(origin?: string | null): Record<string, string> {
  // Echo the configured origin (single trusted origin model).
  const allow =
    origin && origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

/** Standard JSON response with CORS headers applied. */
export function jsonWithCors(
  body: unknown,
  init: { status?: number; origin?: string | null } = {},
) {
  return NextResponse.json(body, {
    status: init.status ?? 200,
    headers: corsHeaders(init.origin),
  });
}

/** Preflight handler shared by public POST routes. */
export function preflight(origin?: string | null) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}
