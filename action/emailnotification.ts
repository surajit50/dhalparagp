"use server";
// Helper to detect Next.js redirect errors without importing internal APIs
function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in (error as any) &&
    typeof (error as any).digest === "string" &&
    (error as any).digest.startsWith("NEXT_REDIRECT")
  );
}
import { revalidatePath } from "next/cache";
import { sentAwardedNotification, sentWorkOrderConfirmation } from "@/lib/mail";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatDate } from "@/utils/utils";
import {gpcode} from "@/constants/gpinfor";
export async function sendReceivedRemainder(formData: FormData) {
  const workOrderId = formData.get("workOrderId") as string;

  try {
    const workOrder = await db.workorderdetails.findUnique({
      where: { id: workOrderId },
      include: {
        Bidagency: {
          include: {
            agencydetails: true,
            WorksDetail: {
              include: {
                ApprovedActionPlanDetails: true,
                nitDetails: true,
              },
            },
          },
        },
        awardofcontractdetails: true,
      },
    });

    if (!workOrder) {
      redirect(
        "/admindashboard/manage-tender/awardofcontract?error=Work order not found"
      );
    }
    if (!workOrder.Bidagency?.agencydetails?.email) {
      redirect(
        "/admindashboard/manage-tender/awardofcontract?error=Agency email not found for this work order"
      );
    }

    const nitNumber =
      workOrder.Bidagency.WorksDetail?.nitDetails?.memoNumber || "N/A";
    const nitDate =
      workOrder.Bidagency.WorksDetail?.nitDetails?.memoDate || new Date();
    const workslno = workOrder.Bidagency.WorksDetail?.workslno || "N/A";
    const agencyName = workOrder.Bidagency.agencydetails.name || "Agency";
    const receiveddate =
      workOrder.awardofcontractdetails.deliveryDate || new Date();

    const completionDate = new Date(receiveddate);
    completionDate.setDate(completionDate.getDate() + 30);

    const workDescription =
      workOrder.Bidagency.WorksDetail?.ApprovedActionPlanDetails
        ?.activityDescription || "Work description not available";
    const estimatedAmount =
      workOrder.Bidagency.WorksDetail?.finalEstimateAmount?.toFixed(2) ||
      "0.00";

    if (
      !workOrder.awardofcontractdetails.workodermenonumber ||
      !workOrder.awardofcontractdetails.workordeermemodate
    ) {
      redirect(
        "/admindashboard/manage-tender/awardofcontract?error=Work order memo details are incomplete"
      );
    }

    await sentWorkOrderConfirmation(
      workOrder.Bidagency.agencydetails.email,
      agencyName,
      `${
        workOrder.awardofcontractdetails.workodermenonumber
      }/${gpcode}/${workOrder.awardofcontractdetails.workordeermemodate.getFullYear()}`,
      formatDate(workOrder.awardofcontractdetails.workordeermemodate),
      nitNumber.toString(),
      workDescription,
      estimatedAmount,
      completionDate.toDateString()
    );

    return { success: "Work order confirmation sent successfully" };
  } catch (error) {
    console.error("Error sending reminder:", error);
    if (isNextRedirectError(error)) {
      throw error as any;
    }
    return { error: "Failed to send work order confirmation" };
  }
}

export async function sendReminderEmail(formData: FormData) {
  const workOrderId = formData.get("workOrderId") as string;

  try {
    const workOrder = await db.workorderdetails.findUnique({
      where: { id: workOrderId },
      include: {
        Bidagency: {
          include: {
            agencydetails: true,
            WorksDetail: {
              include: {
                nitDetails: true,
              },
            },
          },
        },
        awardofcontractdetails: true,
      },
    });

    if (!workOrder) {
      return { error: "Work order not found" };
    }
    if (!workOrder.Bidagency?.agencydetails?.email) {
      return { error: "Agency email not found for this work order" };
    }

    const nitNumber =
      workOrder.Bidagency.WorksDetail?.nitDetails?.memoNumber || 0;
    const nitDate =
      workOrder.Bidagency.WorksDetail?.nitDetails?.memoDate || new Date();
    const workslno = workOrder.Bidagency.WorksDetail?.workslno || 0;
    const agencyName = workOrder.Bidagency.agencydetails.name || "Agency";

    if (workOrder.awardofcontractdetails.isdelivery) {
      return { error: "Cannot send reminder - work order already delivered" };
    }

    await sentAwardedNotification(
      workOrder.Bidagency.agencydetails.email,
      nitNumber,
      nitDate,
      workslno,
      agencyName
    );

    revalidatePath("/admindashboard/manage-tender/awardofcontract", 'page');
    return { success: "Reminder email sent successfully" };
  } catch (error) {
    console.error("Error sending reminder:", error);
    if (isNextRedirectError(error)) {
      throw error as any;
    }
    return { error: "Failed to send reminder email" };
  }
}

export async function markAsReceived(formData: FormData) {
  if (!formData) {
    return { error: "No form data provided" };
  }

  const workOrderId = formData.get("workOrderId");
  const receivedDate = formData.get("receiveddate");

  // Input validation
  if (!workOrderId || typeof workOrderId !== "string") {
    return { error: "Invalid work order ID" };
  }

  try {
    // Fetch work order with necessary relations
    const workOrder = await db.workorderdetails.findUnique({
      where: {
        id: workOrderId,
      },
      include: {
        awardofcontractdetails: true,
        Bidagency: {
          include: {
            WorksDetail: true,
          },
        },
      },
    });

    // Validation checks
    if (!workOrder) {
      return { error: "Work order not found" };
    }

    if (!workOrder.awardofcontractdetails) {
      return { error: "Award of contract details not found" };
    }

    if (workOrder.awardofcontractdetails.isdelivery) {
      return { error: "Work order already marked as received" };
    }

    // Parse and validate received date
    const parsedReceivedDate = receivedDate
      ? new Date(receivedDate as string)
      : workOrder.awardofcontractdetails.workordeermemodate;

    if (parsedReceivedDate && isNaN(parsedReceivedDate.getTime())) {
      return { error: "Invalid received date" };
    }

    // Update work order status
    await db.awardofContract.update({
      where: {
        id: workOrder.awardofcontractdetails.id,
      },
      data: {
        isdelivery: true,
        deliveryDate: parsedReceivedDate,
      },
    });

    // Update work status if needed
    if (workOrder.Bidagency?.WorksDetail) {
      await db.worksDetail.update({
        where: {
          id: workOrder.Bidagency.WorksDetail.id,
        },
        data: {
          workStatus: "yettostart",
        },
      });
    }

    // Revalidate the page
    revalidatePath("/admindashboard/manage-tender/awardofcontract", 'page');

    return {
      success: "Work order successfully marked as received",
      receivedDate: parsedReceivedDate.toISOString(),
    };
  } catch (error) {
    console.error("Error marking as received:", error);

    if (isNextRedirectError(error)) {
      throw error as any;
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to update work order status",
    };
  }
}
