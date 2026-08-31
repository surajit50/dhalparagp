import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const BulkAssignSchema = z.object({
  complaintIds: z.array(z.string()).min(1, "Select at least one complaint"),
  assignedAgencyId: z.string().min(1, "Agency is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = BulkAssignSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { complaintIds, assignedAgencyId } = parsed.data;

    // Bulk update complaints
    const result = await db.streetLightComplaint.updateMany({
      where: {
        id: { in: complaintIds },
      },
      data: {
        status: "WORK_ORDER_ISSUED",
        assignedAgencyId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully issued work order for ${result.count} complaints.`,
      count: result.count,
    });
  } catch (error) {
    console.error("Bulk assign error:", error);
    return NextResponse.json(
      { error: "Failed to issue work orders" },
      { status: 500 }
    );
  }
}
