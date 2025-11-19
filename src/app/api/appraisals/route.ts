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
  created_at?: string | null;
  updated_at?: string | null;
};

function jsonError(message: string, status = 500) {
  console.error(message);
  return NextResponse.json({ error: message }, { status });
}

// GET /api/appraisals → list all appraisals
export async function GET() {
  try {
    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("appraisals")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Supabase GET /appraisals error:", error);
      return jsonError("Failed to load appraisals", 500);
    }

    const rows = (data ?? []) as DbAppraisalRow[];

    // 🔁 Normalise from snake_case → camelCase for the frontend
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

// POST /api/appraisals → create a new appraisal
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

    if (!streetAddress || !suburb || !postcode) {
      return jsonError("streetAddress, suburb and postcode are required", 400);
    }

    const supabase = await supabaseServer();

    const { data: inserted, error } = await supabase
      .from("appraisals")
      .insert({
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
