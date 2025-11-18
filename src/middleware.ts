// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Simple auth gate:
 * - Allows /login and /api/login
 * - Allows Next static assets
 * - Requires "appraisal_session" cookie for /appraisals...
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public / allowed routes (no login required)
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/assets")
  ) {
    return NextResponse.next();
  }

  // We only protect the appraisals area (see matcher below)
  const session = request.cookies.get("appraisal_session")?.value;

  if (!session) {
    // Not logged in → send to /login, remembering where they came from
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in → carry on
  return NextResponse.next();
}

// Only run middleware on these paths
export const config = {
  matcher: ["/appraisals/:path*"],
};
