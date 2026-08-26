import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ComplaintUpdateSchema } from "@/schema/street-light";

// GET /api/street-lights/complaints/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const complaint = await db.streetLightComplaint.findUnique({
      where: { id },
      include: {
        streetLight: {
          include: { mouza: { select: { mouzaName: true } } },
        },
      },
    });
    if (!complaint)
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    return NextResponse.json(complaint);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch complaint" }, { status: 500 });
  }
}

// PUT /api/street-lights/complaints/[id]  — update complaint status/repair
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = ComplaintUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { assignedDate, repairDate, resolvedDate, ...rest } = parsed.data;

    const complaint = await db.streetLightComplaint.update({
      where: { id },
      data: {
        ...rest,
        ...(assignedDate ? { assignedDate: new Date(assignedDate) } : {}),
        ...(repairDate ? { repairDate: new Date(repairDate) } : {}),
        ...(resolvedDate ? { resolvedDate: new Date(resolvedDate) } : {}),
      },
    });

    // If complaint is resolved, update the street light to WORKING
    if (parsed.data.status === "RESOLVED" || parsed.data.status === "CLOSED") {
      await db.streetLight.update({
        where: { id: complaint.streetLightId },
        data: { workingStatus: "WORKING" },
      });
    }

    return NextResponse.json(complaint);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update complaint" }, { status: 500 });
  }
}
