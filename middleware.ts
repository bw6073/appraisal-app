import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public paths that do NOT require auth
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const auth = req.cookies.get("appraisal_auth")?.value;

  // If not logged in → send to /login
  if (!auth) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // If logged in & they hit /, send to /appraisals
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/appraisals";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Apply to everything except static assets
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
