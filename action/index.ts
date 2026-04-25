"use server";

import { db } from "@/lib/db";
import { formatDate } from "@/utils/utils";
import { revalidatePath } from "next/cache";
import { gpcode } from "@/constants/gpinfor";
function parseDate(dateString: string | Date): Date {
  return typeof dateString === "string" ? new Date(dateString) : dateString;
}

// Helper function for payment formatting
function formatPaymentValues(amounts: number[]): string {
  if (amounts.length === 0) return "0.00";
  if (amounts.length === 1) return amounts[0].toFixed(2);
  const formatted = amounts.map((a) => a.toFixed(2));
  const total = amounts.reduce((sum, a) => sum + a, 0).toFixed(2);
  return `${formatted.join(" + ")} = ${total}`;
}


export async function fetchWorkData(workIds: string[]) {
  try {
    // Validate input
    if (!Array.isArray(workIds)) throw new Error("Invalid request format");
    if (workIds.length === 0) throw new Error("No work IDs provided");

    // Database query with explicit relation loading
    const allworks = await db.worksDetail.findMany({
      where: { id: { in: workIds } },
      include: {
        AwardofContract: {
          select: {
            workodermenonumber: true,
            workordeermemodate: true,
            workorderdetails: {
              select: {
                Bidagency: {
                  select: {
                    biddingAmount: true,
                    agencydetails: {
                      select: { name: true, contactDetails: true },
                    },
                  },
                },
              },
            },
          },
        },
        nitDetails: { select: { memoNumber: true, memoDate: true } },
        ApprovedActionPlanDetails: { select: { activityDescription: true } },
        paymentDetails: { select: { grossBillAmount: true, netAmt: true } },
      },
      orderBy: { id: "asc" }, // Ensure consistent order
    });

    if (allworks.length === 0) throw new Error("No matching works found");

    // Data transformation with proper null handling
    return allworks.map((work) => {
      // Agency details with fallbacks
      const primaryWorkOrder =
        work.AwardofContract?.workorderdetails?.[0]?.Bidagency;
      const agencyName =
        primaryWorkOrder?.agencydetails?.name || "Unknown Agency";
      const agencyAddress =
        primaryWorkOrder?.agencydetails?.contactDetails || "Unknown Address";

      // NIT details
      const memoDate = work.nitDetails?.memoDate
        ? formatDate(parseDate(work.nitDetails.memoDate))
        : "N/A";

      // Work order details
      const workOrderDate = work.AwardofContract?.workordeermemodate
        ? formatDate(parseDate(work.AwardofContract.workordeermemodate))
        : "N/A";

      // Payment calculations
      const paymentDetails = work.paymentDetails || [];
      const grossTotal = paymentDetails.reduce(
        (sum, p) => sum + p.grossBillAmount,
        0
      );
      const netTotal = paymentDetails.reduce((sum, p) => sum + p.netAmt, 0);

      return {
        agencydetails: `This is to certify that ${agencyName}, located at ${agencyAddress}, has successfully completed:`,
        workname:
          work.ApprovedActionPlanDetails?.activityDescription || "Unnamed Work",
        nitdetails: `${work.nitDetails?.memoNumber || "N/A"}/${gpcode}/${
          work.nitDetails?.memoDate
            ? parseDate(work.nitDetails.memoDate).getFullYear()
            : "N/A"
        } Date: ${memoDate} | Sl.No: ${work.workslno || work.id}`,
        workorderno: `${
          work.AwardofContract?.workodermenonumber || "N/A"
        }/${gpcode}/${
          work.AwardofContract?.workordeermemodate
            ? parseDate(work.AwardofContract.workordeermemodate).getFullYear()
            : "N/A"
        } Date: ${workOrderDate}`,
        completationdate: work.completionDate
          ? formatDate(parseDate(work.completionDate))
          : "Not Completed",
        sanctionamt: (primaryWorkOrder?.biddingAmount || 0).toFixed(2),
        grosbillamnt: formatPaymentValues(
          paymentDetails.map((p) => p.grossBillAmount)
        ),
        netbill: formatPaymentValues(paymentDetails.map((p) => p.netAmt)),
        qrcode: `https://www.dhalparagp.in/work-verification/${work.id}`,
        certificateno: `Certificate No: ${work.completionDate?.getFullYear()}${work.completionDate?.getMonth()}-${
          work.AwardofContract?.workodermenonumber
        }-${work.nitDetails.memoNumber}`,
        certificatedate: `Date:${
          work.completionDate ? formatDate(work.completionDate) : ""
        }`,
      };
    });
  } catch (error) {
    console.error("Data Fetching Error:", error);
    throw new Error(error instanceof Error ? error.message : "Unknown error");
  }
}

export async function verifyAllDocuments(warishId: string) {
  // Update all documents for this warish application
  await db.warishDocument.updateMany({
    where: {
      warishId,
      verified: false,
    },
    data: {
      verified: true,
      remarks: "Verified in bulk",
    },
  });

  // Update the warish application status
  await db.warishApplication.update({
    where: { id: warishId },
    data: { warishdocumentverified: true },
  });

  revalidatePath(`/admindashboard/manage-warish/verify-document/${warishId}`);
}

export async function watertankbooking() {
  try {
    const bookings = await db.booking.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        serviceType: true,
        bookingDate: true,
        address: true,
        phone: true,
        amount: true,
        status: true,
        isPaid: true,
        paymentDate: true,
        receiptNumber: true,
        isDeposited: true,
        depositDate: true,
      },
    });

    return bookings.map((booking) => ({
      ...booking,
      bookingDate: booking.bookingDate.toISOString(),
      paymentDate: booking.paymentDate?.toISOString() || undefined,
      depositDate: booking.depositDate?.toISOString() || undefined,
      receiptNumber: booking.receiptNumber || null,
    }));
  } catch (error) {
    console.error("Error fetching water tank bookings:", error);
    throw new Error("Failed to fetch water tank bookings");
  }
}
