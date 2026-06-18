"use server";

import { db } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { updateWorkStatus } from "@/lib/actionplan";

const AddWorkDetailsSchema = z.object({
  approvedActionPlanId: z.string().nonempty("Please select a work detail"),
  participation_fee: z.string().nonempty("Participation fee is required"),
  final_Estimate_Amount: z
    .string()
    .nonempty("Final estimate amount is required"),
});

export const addTenderDetails = async (
  values: z.infer<typeof AddWorkDetailsSchema>,
  tenderId: string
) => {
  try {
    const nitDetails = await db.nitDetails.findUnique({
      where: {
        id: tenderId,
      },
    });

    if (!nitDetails) {
      return { error: "Tender id is not found" };
    }

    let final_Estimate_Amount: number;
    let participation_fee: number;

    try {
      final_Estimate_Amount = parseFloat(values.final_Estimate_Amount);
      participation_fee = parseFloat(values.participation_fee);

      if (isNaN(final_Estimate_Amount) || isNaN(participation_fee)) {
        throw new Error("Invalid number format");
      }
    } catch (parseError) {
      return { error: "Invalid amount format" };
    }

    const earnest_money_fee = final_Estimate_Amount * 0.02;

    const slno = await db.worksDetail.count({
      where: {
        nitDetailsId: nitDetails.id,
      },
    });

    const slnon = slno + 1;

    const tender = await db.worksDetail.create({
      data: {
        workslno: slnon,
        nitDetailsId: nitDetails.id,
        approvedActionPlanDetailsId: values.approvedActionPlanId,
        participationFee: participation_fee,
        earnestMoneyFee: earnest_money_fee,
        finalEstimateAmount: final_Estimate_Amount,
        tenderStatus: "published",
      },
    });

    await db.approvedActionPlanDetails.update({
      where: {
        id: tender.approvedActionPlanDetailsId,
      },
      data: {
        isPublish: true,
      },
    });

    revalidatePath(`/admindashboard/manage-tender/add/${tenderId}`);
    revalidatePath("/admindashboard/manage-tender/add", "layout");
    return { success: "Work details added successfully" };
  } catch (error) {
    console.error("Error adding tender details:", error);
    return { error: "Something went wrong" };
  }
};
