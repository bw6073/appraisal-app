// src/app/api/appraisals/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// In Next 16, params is a Promise in route handlers
type RouteContext = {
  params: Promise<{ id: string }>;
};

// Small helper so we can *always* log + return JSON
function jsonError(message: string, status = 500) {
  console.error(message);
  return NextResponse.json({ error: message }, { status });
}

/**
 * GET /api/appraisals/[id]
 * Load one appraisal
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);

    if (!Number.isFinite(numericId) || numericId <= 0) {
      return jsonError("Invalid id", 400);
    }

    const supabase = await supabaseServer();

    const { data, error } = await supabase
      .from("appraisals")
      .select("*")
      .eq("id", numericId)
      .single();

    if (error || !data) {
      console.error("Supabase GET /appraisals/[id] error:", error);
      return jsonError("Appraisal not found", 404);
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/appraisals/[id] error:", err);
    return jsonError("Failed to load appraisal", 500);
  }
}

/**
 * PATCH /api/appraisals/[id]
 * Update an existing appraisal
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);

    if (!Number.isFinite(numericId) || numericId <= 0) {
      return jsonError("Invalid id", 400);
    }

    const body = await req.json();

    // This assumes your form POST sends the same shape for new + edit:
    // {
    //   status, appraisalTitle, streetAddress, suburb, postcode, state, data: { ...full form... }
    // }
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

    const { data: updated, error } = await supabase
      .from("appraisals")
      .update({
        status: status ?? "DRAFT",
        title: appraisalTitle ?? "",
        address: streetAddress,
        suburb,
        postcode,
        state: state ?? "WA",
        data: data ?? body, // keep full form either in data or fallback
      })
      .eq("id", numericId)
      .select("*")
      .single();

    if (error || !updated) {
      console.error("Supabase PATCH /appraisals/[id] error:", error);
      return jsonError("Failed to update appraisal", 500);
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/appraisals/[id] error:", err);
    return jsonError("Failed to update appraisal", 500);
  }
}

/**
 * DELETE /api/appraisals/[id]
 */
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);

    if (!Number.isFinite(numericId) || numericId <= 0) {
      return jsonError("Invalid id", 400);
    }

    const supabase = await supabaseServer();

    const { error } = await supabase
      .from("appraisals")
      .delete()
      .eq("id", numericId);

    if (error) {
      console.error("Supabase DELETE /appraisals/[id] error:", error);
      return jsonError("Failed to delete appraisal", 500);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/appraisals/[id] error:", err);
    return jsonError("Failed to delete appraisal", 500);
  }
}
