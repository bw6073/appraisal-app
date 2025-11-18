import { NextRequest, NextResponse } from "next/server";

const CORRECT_PASSWORD = process.env.APP_PASSWORD?.trim() || "1234"; // default for now

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const password = formData.get("password");

    // ❌ Wrong or missing password → back to /login with ?error=1
    if (typeof password !== "string" || password !== CORRECT_PASSWORD) {
      const url = new URL("/login", req.url);
      url.searchParams.set("error", "1");
      return NextResponse.redirect(url);
    }

    // ✅ Correct password → set cookie + redirect to /appraisals
    const redirectUrl = new URL("/appraisals", req.url);
    const res = NextResponse.redirect(redirectUrl);

    res.cookies.set("appraisal_auth", "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return res;
  } catch (err) {
    console.error("POST /api/login error", err);
    const url = new URL("/login", req.url);
    url.searchParams.set("error", "1");
    return NextResponse.redirect(url);
  }
}
