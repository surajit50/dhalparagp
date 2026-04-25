"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleBoqPrepared(workId: string, currentStatus: boolean) {
  try {
    await db.worksDetail.update({
      where: { id: workId },
      data: { boqPrepared: !currentStatus },
    });
    revalidatePath("/nits/[id]"); // revalidate the page to show updated status
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle BOQ status:", error);
    return { success: false, error: "Failed to update" };
  }
}
