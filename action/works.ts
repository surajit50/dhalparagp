"use server"

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleBoqPrepared(workId: string, currentStatus: boolean) {
  try {
    await db.worksDetail.update({
      where: { id: workId },
      data: {
        boqPrepared: !currentStatus
      }
    });

    revalidatePath("/admindashboard/manage-tender/report"); // Revalidate common paths where this might be used
    return { success: true };
  } catch (error) {
    console.error("Error toggling BOQ status:", error);
    return { success: false, error: "Failed to update status" };
  }
}
