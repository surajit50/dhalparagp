"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateWorkDocument(
  workId: string,
  documentType: "estimateDocument" | "boqDocument" | "scrutinySheetDocument" | "agreementDocument" | "drawingDocument",
  url: string | null
) {
  try {
    const updatedWork = await db.worksDetail.update({
      where: { id: workId },
      data: {
        [documentType]: url,
      },
    });

    revalidatePath("/admindashboard/manage-tender/document-upload");
    return { success: true, data: updatedWork };
  } catch (error) {
    console.error(`Failed to update ${documentType} for work ${workId}:`, error);
    return { success: false, error: "Failed to update document." };
  }
}
