import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const appraisals = await prisma.appraisal.findMany();
    return NextResponse.json(appraisals);
  } catch (err) {
    console.error("GET /api/appraisals error", err);
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

    if (!streetAddress || !suburb || !postcode) {
      return NextResponse.json(
        { error: "streetAddress, suburb and postcode are required" },
        { status: 400 }
      );
    }

    const appraisal = await prisma.appraisal.create({
      data: {
        status: status ?? "DRAFT",
        // map to your actual Prisma fields
        title: appraisalTitle ?? "",
        address: streetAddress,
        suburb,
        postcode,
        state: state ?? "WA",
        data: data ?? {},
      },
    });

    return NextResponse.json(appraisal, { status: 201 });
  } catch (err) {
    console.error("POST /api/appraisals error", err);
    return NextResponse.json(
      { error: "Failed to create appraisal" },
      { status: 500 }
    );
  }
}
