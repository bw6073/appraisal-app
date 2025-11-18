import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    // 👇 Set your exact login code here
    const expected = "Br00kW00d";

    console.log("Login attempt with code:", code);

    if (code !== expected) {
      return NextResponse.json(
        { ok: false, error: "Invalid code" },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ ok: true });

    // Set the login cookie
    res.cookies.set("appraisal_session", "1", {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
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
