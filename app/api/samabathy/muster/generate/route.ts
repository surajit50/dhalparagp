
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { SAMABYATHI_CONFIG } from "@/constants/samabyathi";

export async function POST() {
  try {
    // Find all approved applications WITHOUT a muster roll yet
    const applications = await db.samabyathiApplication.findMany({
      where: {
        status: "APPROVED",
        musterRolls: { none: {} },   // prevents duplicate muster
      },
      orderBy: { createdAt: "asc" },
    });

    if (!applications.length) {
      return Response.json(
        { error: "No eligible applications found" },
        { status: 400 }
      );
    }

    const AMOUNT_PER_APP = SAMABYATHI_CONFIG.AMOUNT_PER_APP;
    const musterRollNo = `MR-${new Date().getFullYear()}-${Date.now()}`;

    // Create all muster rolls in a transaction
    await db.$transaction(
      applications.map((app) =>
        db.musterRoll.create({
          data: {
            applicationId: app.id,
            musterRollNo,
            allottedAmount: AMOUNT_PER_APP,
            paymentStatus: "PENDING",
          },
        })
      )
    );

    // Clear page cache so the table refreshes
    revalidatePath("/admindashboard/manage-samabyathi/applications","page")
    revalidatePath("/admindashboard/manage-samabyathi/muster-roll","page"); // adjust to the exact page path if needed, e.g., "/muster"


    return Response.json({
      message: "Muster generated successfully",
      count: applications.length,
      totalAmount: applications.length * AMOUNT_PER_APP,
      musterRollNo,
    });
  } catch (error) {
    console.error("MUSTER ERROR:", error);
    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
