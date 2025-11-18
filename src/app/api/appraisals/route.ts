// src/app/api/appraisals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// Shape of what’s actually in your Supabase table
type DbAppraisalRow = {
  id: number;
  title: string | null;
  address: string | null;
  suburb: string | null;
  postcode: string | null;
  state: string | null;
  status: string;
  data: any;
  created_at: string | null;
  updated_at: string | null;
};

// Shape we return to the front-end (matches your TypeScript)
type ApiAppraisal = {
  id: number;
  title: string | null;
  address: string | null;
  suburb: string | null;
  postcode: string | null;
  state: string | null;
  status: string;
  data: any;
  createdAt?: string;
  updatedAt?: string;
};

// Helper to map DB row → API shape
function mapRow(row: DbAppraisalRow): ApiAppraisal {
  return {
    id: row.id,
    title: row.title,
    address: row.address,
    suburb: row.suburb,
    postcode: row.postcode,
    state: row.state,
    status: row.status,
    data: row.data ?? null,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

/**
 * GET /api/appraisals
 * List all appraisals (newest first)
 */
export async function GET(_req: NextRequest) {
  try {
    const { data, error } = await supabaseServer
      .from("appraisals")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Supabase SELECT error in GET /api/appraisals:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data ?? []) as DbAppraisalRow[];
    const mapped = rows.map(mapRow);

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET /api/appraisals fatal error:", err);
    return NextResponse.json(
      { error: "Failed to load appraisals" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/appraisals
 * Create a new appraisal
 */
export async function POST(req: NextRequest) {
  try {
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

    // Basic validation
    if (!streetAddress || !suburb || !postcode) {
      return NextResponse.json(
        { error: "streetAddress, suburb and postcode are required" },
        { status: 400 }
      );
    }

    // Insert into Supabase
    const { data: inserted, error } = await supabaseServer
      .from("appraisals")
      .insert({
        title: appraisalTitle ?? "",
        address: streetAddress,
        suburb,
        postcode,
        state: state ?? "WA",
        status: status ?? "DRAFT",
        data: data ?? {},
      })
      .select("*")
      .single();

    if (error || !inserted) {
      console.error("Supabase INSERT error in POST /api/appraisals:", error);
      return NextResponse.json(
        { error: error?.message ?? "Failed to create appraisal" },
        { status: 500 }
      );
    }

    const mapped = mapRow(inserted as DbAppraisalRow);
    return NextResponse.json(mapped, { status: 201 });
  } catch (err) {
    console.error("POST /api/appraisals fatal error:", err);
    return NextResponse.json(
      { error: "Failed to create appraisal" },
      { status: 500 }
    );
  }
}
