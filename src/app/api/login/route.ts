import { NextRequest, NextResponse } from "next/server";

const PASSWORD = process.env.APPRAISAL_APP_PASSWORD || "1234";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const password = body?.password as string | undefined;

    if (!password || password !== PASSWORD) {
      return NextResponse.json(
        { ok: false, error: "Invalid password" },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ ok: true });

    // Set auth cookie
    res.cookies.set("appraisal_auth", "1", {
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return res;
  } catch (err) {
    console.error("POST /api/login error", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
