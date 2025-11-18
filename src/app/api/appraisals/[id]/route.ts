import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Safely extract numeric id from the URL path.
 * e.g. "/api/appraisals/3" → 3
 */
function getIdFromRequest(req: NextRequest): number | null {
  const pathname = req.nextUrl.pathname; // "/api/appraisals/3"
  const parts = pathname.split("/").filter(Boolean);
  const rawId = parts[parts.length - 1]; // "3"

  const id = Number(rawId);
  if (!Number.isFinite(id) || id <= 0) return null;
  return id;
}

// GET /api/appraisals/:id  → fetch a single appraisal
export async function GET(req: NextRequest) {
  const id = getIdFromRequest(req);

  if (!id) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const appraisal = await prisma.appraisal.findUnique({
      where: { id },
    });

    if (!appraisal) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(appraisal);
  } catch (err) {
    console.error("GET /api/appraisals/[id] error", err);
    return NextResponse.json(
      { error: "Failed to fetch appraisal" },
      { status: 500 }
    );
  }
}

// PUT /api/appraisals/:id  → update an appraisal
export async function PUT(req: NextRequest) {
  const id = getIdFromRequest(req);

  if (!id) {
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

    const updated = await prisma.appraisal.update({
      where: { id },
      data: {
        status,
        title: appraisalTitle ?? "",
        address: streetAddress ?? "",
        suburb: suburb ?? "",
        postcode: postcode ?? "",
        state: state ?? "WA",
        data,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /api/appraisals/[id] error", err);
    return NextResponse.json(
      { error: "Failed to update appraisal" },
      { status: 500 }
    );
  }
}

// DELETE /api/appraisals/:id  → delete an appraisal
export async function DELETE(req: NextRequest) {
  const id = getIdFromRequest(req);

  if (!id) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    await prisma.appraisal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/appraisals/[id] error", err);
    return NextResponse.json(
      { error: "Failed to delete appraisal" },
      { status: 500 }
    );
  }
}
