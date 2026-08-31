"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function markComplaintRepaired(
  complaintId: string,
  repairRemarks: string,
  completionImageUrl: string,
  completionImagePublicId: string
) {
  try {
    const updated = await db.streetLightComplaint.update({
      where: { id: complaintId },
      data: {
        status: "RESOLVED",
        repairDate: new Date(),
        repairRemarks,
        completionImageUrl,
        completionImagePublicId,
      },
    });

    revalidatePath("/agencydashboard/street-lights/repairs");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error marking complaint as repaired:", error);
    return { success: false, error: error.message || "Failed to update complaint" };
  }
}
