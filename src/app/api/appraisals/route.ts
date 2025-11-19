// src/app/api/appraisals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

type DbAppraisalRow = {
  id: number;
  title: string | null;
  address: string | null;
  suburb: string | null;
  postcode: string | null;
  state: string | null;
  status: string;
  data: any;
  user_id: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

function jsonError(message: string, status = 500) {
  console.error(message);
  return NextResponse.json({ error: message }, { status });
}

/**
 * GET /api/appraisals
 * List appraisals for the current logged-in user
 */
export async function GET(_req: NextRequest) {
  try {
    const supabase = await supabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("auth.getUser error in GET /api/appraisals:", userError);
    }

    if (!user) {
      return jsonError("Unauthorised", 401);
    }

    const { data, error } = await supabase
      .from("appraisals")
      .select("*")
      .eq("user_id", user.id) // 👈 extra guard (RLS also enforces this)
      .order("updated_at", { ascending: false });

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
 * Create a new appraisal for the current user
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await supabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("auth.getUser error in POST /api/appraisals:", userError);
    }

    if (!user) {
      return jsonError("Unauthorised", 401);
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

    const { data: inserted, error } = await supabase
      .from("appraisals")
      .insert({
        user_id: user.id, // 👈 tie to the user
        status: status ?? "DRAFT",
        title: appraisalTitle ?? "",
        address: streetAddress,
        suburb,
        postcode,
        state: state ?? "WA",
        data: data ?? body,
      })
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
