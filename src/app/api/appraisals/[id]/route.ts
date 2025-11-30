// src/app/api/appraisals/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// In Next 16, params is a Promise in route handlers
type RouteContext = {
  params: Promise<{ id: string }>;
};

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
 * GET /api/appraisals/[id]
 * Load one appraisal by id for the current user
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);

    if (!Number.isFinite(numericId) || numericId <= 0) {
      return jsonError("Invalid id", 400);
    }

    const supabase = await supabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(
        "auth.getUser error in GET /api/appraisals/[id]:",
        userError
      );
    }

    if (!user) {
      return jsonError("Unauthorised", 401);
    }

    const { data, error } = await supabase
      .from("appraisals")
      .select("*")
      .eq("id", numericId)
      .eq("user_id", user.id) // extra safety on top of RLS
      .single();

    if (error || !data) {
      console.error("Supabase GET /appraisals/[id] error:", error);
      return jsonError("Appraisal not found", 404);
    }

    const row = data as DbAppraisalRow;

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

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("GET /api/appraisals/[id] error:", err);
    return jsonError("Failed to load appraisal", 500);
  }
}

/**
 * PATCH /api/appraisals/[id]
 * Update an existing appraisal for the current user
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);

    if (!Number.isFinite(numericId) || numericId <= 0) {
      return jsonError("Invalid id", 400);
    }

    const supabase = await supabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(
        "auth.getUser error in PATCH /api/appraisals/[id]:",
        userError
      );
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

    const nowIso = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from("appraisals")
      .update({
        status: status ?? "DRAFT",
        title: appraisalTitle ?? "",
        address: streetAddress,
        suburb,
        postcode,
        state: state ?? "WA",
        data: data ?? body,
        updated_at: nowIso, // 🔑 keep last updated in sync
      })
      .eq("id", numericId)
      .eq("user_id", user.id) // safety & RLS alignment
      .select("*")
      .single();

    if (error || !updated) {
      console.error("Supabase PATCH /appraisals/[id] error:", error);
      return jsonError("Failed to update appraisal", 500);
    }

    const row = updated as DbAppraisalRow;

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

    return NextResponse.json(mapped);
  } catch (err) {
    console.error("PATCH /api/appraisals/[id] error:", err);
    return jsonError("Failed to update appraisal", 500);
  }
}

/**
 * DELETE /api/appraisals/[id]
 * Delete one appraisal for the current user
 */
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);

    if (!Number.isFinite(numericId) || numericId <= 0) {
      return jsonError("Invalid id", 400);
    }

    const supabase = await supabaseServer();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error(
        "auth.getUser error in DELETE /api/appraisals/[id]:",
        userError
      );
    }

    if (!user) {
      return jsonError("Unauthorised", 401);
    }

    const { error } = await supabase
      .from("appraisals")
      .delete()
      .eq("id", numericId)
      .eq("user_id", user.id); // only delete own rows

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
