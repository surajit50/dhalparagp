import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { StreetLightComplaintSchema } from "@/schema/street-light";

// GET /api/street-lights/[id]/complaints
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const complaints = await db.streetLightComplaint.findMany({
      where: { streetLightId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(complaints);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch complaints" }, { status: 500 });
  }
}

// POST /api/street-lights/[id]/complaints — file a new complaint
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const parsed = StreetLightComplaintSchema.safeParse({
      ...body,
      streetLightId: id,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Generate complaint number: SLC-YYMM-XXXXX
    const now = new Date();
    const yymm = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const count = await db.streetLightComplaint.count();
    const complaintNo = `SLC-${yymm}-${String(count + 1).padStart(5, "0")}`;

    const complaint = await db.streetLightComplaint.create({
      data: {
        ...parsed.data,
        complaintNo,
      },
    });

    // Update the street light working status to NOT_WORKING if complaint type is NOT_WORKING
    if (parsed.data.complaintType === "NOT_WORKING") {
      await db.streetLight.update({
        where: { id },
        data: { workingStatus: "NOT_WORKING" },
      });
    }

    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create complaint" }, { status: 500 });
  }
}
