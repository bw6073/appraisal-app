// src/app/api/appraisals/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// In Next 16, params is a Promise in route handlers
type RouteParams = { id: string };
type RouteContext = { params: Promise<RouteParams> };

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

function mapRow(row: DbAppraisalRow) {
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
 * GET /api/appraisals/:id
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseServer
      .from("appraisals")
      .select("*")
      .eq("id", numericId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error(
        "Supabase SELECT error in GET /api/appraisals/[id]:",
        error
      );
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const mapped = mapRow(data as DbAppraisalRow);
    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET /api/appraisals/[id] fatal error:", err);
    return NextResponse.json(
      { error: "Failed to fetch appraisal" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/appraisals/:id
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

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

    const { data: updated, error } = await supabaseServer
      .from("appraisals")
      .update({
        title: appraisalTitle ?? "",
        address: streetAddress ?? "",
        suburb: suburb ?? "",
        postcode: postcode ?? "",
        state: state ?? "WA",
        status: status ?? "DRAFT",
        data: data ?? {},
      })
      .eq("id", numericId)
      .select("*")
      .single();

    if (error) {
      console.error(
        "Supabase UPDATE error in PUT /api/appraisals/[id]:",
        error
      );
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const mapped = mapRow(updated as DbAppraisalRow);
    return NextResponse.json(mapped);
  } catch (err) {
    console.error("PUT /api/appraisals/[id] fatal error:", err);
    return NextResponse.json(
      { error: "Failed to update appraisal" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/appraisals/:id
 */
export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const numericId = Number(id);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const { error } = await supabaseServer
      .from("appraisals")
      .delete()
      .eq("id", numericId);

    if (error) {
      console.error(
        "Supabase DELETE error in DELETE /api/appraisals/[id]:",
        error
      );
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/appraisals/[id] fatal error:", err);
    return NextResponse.json(
      { error: "Failed to delete appraisal" },
      { status: 500 }
    );
  }
}
