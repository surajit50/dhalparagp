// actions/updateWorkStatus.ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { workStatus } from "@prisma/client";

export async function updateWorkStatus(formData: FormData) {
  try {
    const workId = formData.get("workId") as string;
    const workStatus = formData.get("workStatus") as workStatus;
    const workCommencementDate = formData.get("workCommencementDate");
    const completionDate = formData.get("completionDate");

    if (!workId || !workStatus) {
      return { success: false, message: "Missing required fields" };
    }

    // Validate that workStatus is a valid enum value
    const validStatuses: workStatus[] = [
      "yettostart",
      "workinprogress",
      "workcompleted",
      "billpaid",
    ];

    if (!validStatuses.includes(workStatus)) {
      return { success: false, message: "Invalid work status" };
    }

    // Get current work details to check existing dates
    const currentWork = await db.worksDetail.findUnique({
      where: { id: workId },
    });

    if (!currentWork) {
      return { success: false, message: "Work not found" };
    }

    // Date validation logic
    if (workStatus === "workcompleted" || completionDate) {
      if (!currentWork.workCommencementDate && !workCommencementDate) {
        return {
          success: false,
          message: "Must set commencement date before completion date",
        };
      }

      if (workCommencementDate && completionDate) {
        const startDate = new Date(workCommencementDate as string);
        const endDate = new Date(completionDate as string);

        if (endDate < startDate) {
          return {
            success: false,
            message: "Completion date cannot be before commencement date",
          };
        }
      }
    }

    await db.worksDetail.update({
      where: { id: workId },
      data: {
        workStatus,
        workCommencementDate: workCommencementDate
          ? new Date(workCommencementDate as string)
          : currentWork.workCommencementDate,
        completionDate: completionDate
          ? new Date(completionDate as string)
          : currentWork.completionDate,
      },
    });

    revalidatePath("/admindashboard/manage-tender/work-status-change", 'page');
    return { success: true, message: "Work status updated successfully" };
  } catch (error) {
    console.error("Update error:", error);
    return { success: false, message: "Failed to update work status" };
  }
}
