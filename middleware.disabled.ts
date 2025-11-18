import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "appraisal_auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes: login page & login API & static assets
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // Check auth cookie
  const auth = req.cookies.get(COOKIE_NAME)?.value;

  if (auth === "1") {
    // Authenticated → allow through
    return NextResponse.next();
  }

  // Not authenticated → redirect to /login
  const url = req.nextUrl.clone();
  url.pathname = "/login";

  // Optional: remember where they were trying to go
  url.searchParams.set("next", pathname + req.nextUrl.search);

  return NextResponse.redirect(url);
}

export const config = {
  // Run middleware on everything except Next static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
