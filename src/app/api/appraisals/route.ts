// src/app/api/appraisals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

type DbAppraisalRow = {
  id: number;
  user_id?: string | null;
  title: string | null;
  address: string | null;
  suburb: string | null;
  postcode: string | null;
  state: string | null;
  status: string;
  data: any;
  created_at?: string | null;
  updated_at?: string | null;
};

function jsonError(message: string, status = 500) {
  console.error(message);
  return NextResponse.json({ error: message }, { status });
}

/**
 * GET /api/appraisals
 * Prefer per-user results if we can see a user,
 * otherwise fall back to ALL appraisals (dev / offline-friendly).
 */
export async function GET(_req: NextRequest) {
  try {
    const supabase = await supabaseServer();

    let userId: string | null = null;

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.warn("auth.getUser error in GET /api/appraisals:", userError);
      }

      if (user) {
        userId = user.id;
      }
    } catch (err) {
      console.warn("auth.getUser threw in GET /api/appraisals:", err);
    }

    // Base query
    let query = supabase
      .from("appraisals")
      .select("*")
      .order("updated_at", { ascending: false });

    // If we *do* have a user, filter to just their rows
    if (userId) {
      query = query.eq("user_id", userId);
    } else {
      console.warn(
        "GET /api/appraisals: no auth user found – returning ALL appraisals (dev fallback)."
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase GET /appraisals error:", error);
      return jsonError("Failed to load appraisals", 500);
    }

    const rows = (data ?? []) as DbAppraisalRow[];

    const mapped = rows.map((row) => ({
      id: row.id,
      title: row.title,
      address: row.address,
      suburb: row.suburb,
      postcode: row.postcode,
      state: row.state,
      status: row.status,
      data: row.data,
      createdAt: row.created_at ?? null,
      updatedAt: row.updated_at ?? null,
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET /api/appraisals error:", err);
    return jsonError("Failed to load appraisals", 500);
  }
}

/**
 * POST /api/appraisals
 * Create a new appraisal – if we can see a user, attach user_id.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await supabaseServer();

    let userId: string | null = null;

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.warn("auth.getUser error in POST /api/appraisals:", userError);
      }

      if (user) {
        userId = user.id;
      }
    } catch (err) {
      console.warn("auth.getUser threw in POST /api/appraisals:", err);
    }

    const body = await req.json();

    const {
      status,
      appraisalTitle,
      streetAddress,
      suburb,
      postcode,
      state,
      data,
    } = body;

    if (!streetAddress || !suburb || !postcode) {
      return jsonError("streetAddress, suburb and postcode are required", 400);
    }

    const insertPayload: any = {
      status: status ?? "DRAFT",
      title: appraisalTitle ?? "",
      address: streetAddress,
      suburb,
      postcode,
      state: state ?? "WA",
      data: data ?? body,
    };

    if (userId) {
      insertPayload.user_id = userId;
    }

    const { data: inserted, error } = await supabase
      .from("appraisals")
      .insert(insertPayload)
      .select("*")
      .single();

    if (error || !inserted) {
      console.error("Supabase POST /appraisals error:", error);
      return jsonError("Failed to create appraisal", 500);
    }

    const row = inserted as DbAppraisalRow;

    const mapped = {
      id: row.id,
      title: row.title,
      address: row.address,
      suburb: row.suburb,
      postcode: row.postcode,
      state: row.state,
      status: row.status,
      data: row.data,
      createdAt: row.created_at ?? null,
      updatedAt: row.updated_at ?? null,
    };

    return NextResponse.json(mapped, { status: 201 });
  } catch (err) {
    console.error("POST /api/appraisals error:", err);
    return jsonError("Failed to create appraisal", 500);
  }
}
