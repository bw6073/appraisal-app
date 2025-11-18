import { NextRequest, NextResponse } from "next/server";

const CORRECT_PASSWORD = process.env.APP_PASSWORD?.trim() || "1234"; // default for now

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const password = body.password as string | undefined;

    if (!password || password !== CORRECT_PASSWORD) {
      return NextResponse.json(
        { ok: false, error: "Invalid password" },
        { status: 401 }
      );
    }

    // ✅ Set a simple auth cookie
    const res = NextResponse.json({ ok: true });

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
    return NextResponse.json(
      { ok: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
