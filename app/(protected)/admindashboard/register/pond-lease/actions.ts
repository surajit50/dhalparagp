"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { addYears, addMonths } from "date-fns";
import {
  PondLeaseSchema,
  PondLeaseFormValues,
  PondLeasePaymentSchema,
  PondLeasePaymentFormValues,
  PondLeaseExtensionSchema,
  PondLeaseExtensionFormValues,
  PondPublicPaymentSchema,
  PondPublicPaymentFormValues,
  PondLeaseStatusUpdateSchema,
  PondLeaseStatusUpdateValues,
} from "./schema";

export async function getPonds() {
  try {
    const ponds = await db.pond.findMany({
      where: {
        status: "AVAILABLE",
        NOT: {
          pondType: "PUBLIC",
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return ponds;
  } catch (error) {
    console.error("Failed to fetch ponds:", error);
    throw new Error("Failed to fetch ponds.");
  }
}

export async function getPublicPonds() {
  try {
    const ponds = await db.pond.findMany({
      where: { pondType: "PUBLIC" },
      orderBy: { name: "asc" },
      include: {
        publicPayments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    return ponds.map((pond) => {
      const totalCollected = pond.publicPayments.reduce(
        (sum, payment) => sum + payment.amountPaid,
        0,
      );

      return {
        ...pond,
        totalCollected,
      };
    });
  } catch (error) {
    console.error("Failed to fetch public ponds:", error);
    throw new Error("Failed to fetch public ponds.");
  }
}

/* --------------------------------
   Create Pond
-------------------------------- */

/* --------------------------------
   Create Pond Lease
-------------------------------- */

export async function createPondLease(data: PondLeaseFormValues) {
  const validated = PondLeaseSchema.parse(data);

  const pond = await db.pond.findUnique({
    where: { id: validated.pondId },
  });

  if (!pond) {
    throw new Error("Pond not found");
  }

  if (pond.pondType === "PUBLIC") {
    throw new Error("Public ponds cannot be leased out through tender.");
  }

  /* Use passed values or calculate as fallback */

  const leaseYears =
    validated.leaseYears || parseInt(validated.leasePeriod) || 1;

  const leaseEndDate =
    validated.leaseEndDate ||
    addYears(validated.leaseStartDate, leaseYears);

  const totalAmount =
    validated.totalAmount ||
    validated.leaseAmountYearly * leaseYears;

  const {
    totalAmount: _ta,
    leaseYears: _ly,
    leasePeriod: _lp,
    leaseEndDate: _le,
    ...dbData
  } = validated;

  const lease = await db.$transaction(async (tx) => {
    const createdLease = await tx.pondLease.create({
      data: {
        ...dbData,
        leaseEndDate,
        totalAmount,
        paidAmount: 0,
        pendingAmount: totalAmount,
        status: "ACTIVE",
      },
    });

    await tx.pond.update({
      where: { id: validated.pondId },
      data: { status: "LEASED" },
    });

    return createdLease;
  });

  revalidatePath("/admindashboard/register/pond-lease");

  return lease;
}

/* --------------------------------
   Update Pond Lease
-------------------------------- */

export async function updatePondLease(id: string, data: PondLeaseFormValues) {
  const validated = PondLeaseSchema.parse(data);

  // Get the current lease to calculate pending amount correctly
  const currentLease = await db.pondLease.findUnique({
    where: { id },
  });

  if (!currentLease) {
    throw new Error("Lease not found");
  }

  // Calculate new pending amount (new total - paid amount)
  const newPendingAmount = (validated.totalAmount || currentLease.totalAmount) - currentLease.paidAmount;

  // Calculate lease years
  const leaseYears = validated.leaseYears || parseInt(validated.leasePeriod) || 1;

  await db.pondLease.update({
    where: { id },
    data: {
      leasePartyName: validated.leasePartyName,
      leasePartyMobile: validated.leasePartyMobile,
      leasePartyFatherName: validated.leasePartyFatherName,
      leasePartyAddressLine1: validated.leasePartyAddressLine1,
      leasePartyAddressLine2: validated.leasePartyAddressLine2,
      leasePartyCity: validated.leasePartyCity,
      leasePartyPin: validated.leasePartyPin,
      remarks: validated.remarks,
      leaseStartDate: validated.leaseStartDate,
      leaseEndDate: validated.leaseEndDate,
      leaseAmountYearly: validated.leaseAmountYearly,
      totalAmount: validated.totalAmount || currentLease.totalAmount,
      pendingAmount: Math.max(newPendingAmount, 0),
    },
  });

  revalidatePath("/admindashboard/register/pond-lease");
}

/* --------------------------------
   Add Lease Payment
-------------------------------- */

export async function addPondLeasePayment(
  data: PondLeasePaymentFormValues
) {
  const validated =
    PondLeasePaymentSchema.parse(data);

  const result = await db.$transaction(
    async (tx) => {
      const lease = await tx.pondLease.findUnique({
        where: { id: validated.pondLeaseId },
      });

      if (!lease) {
        throw new Error("Lease not found");
      }

      /* Prevent overpayment */

      if (validated.amountPaid > lease.pendingAmount) {
        throw new Error(
          "Payment exceeds pending amount"
        );
      }

      /* Create payment */

      const payment =
        await tx.pondLeasePayment.create({
          data: validated,
        });

      const newPaidAmount =
        lease.paidAmount + validated.amountPaid;

      const newPendingAmount =
        lease.pendingAmount - validated.amountPaid;

      /* Auto complete lease if fully paid */

      const status =
        newPendingAmount === 0
          ? "COMPLETED"
          : lease.status;

      await tx.pondLease.update({
        where: { id: validated.pondLeaseId },
        data: {
          paidAmount: newPaidAmount,
          pendingAmount: newPendingAmount,
          status,
        },
      });

      return payment;
    }
  );

  revalidatePath("/admindashboard/register/pond-lease");

  return result;
}

/* --------------------------------
   Delete Pond Lease
-------------------------------- */

export async function deletePondLease(
  id: string
) {
  try {
    await db.$transaction(async (tx) => {
      const lease = await tx.pondLease.findUnique({ where: { id } });
      if (lease) {
        await tx.pond.update({
          where: { id: lease.pondId },
          data: { status: "AVAILABLE" },
        });
        await tx.pondLease.delete({ where: { id } });
      }
    });

    revalidatePath("/admindashboard/register/pond-lease");
  } catch (error) {
    console.error("Failed to delete pond lease:", error);
    throw new Error("Failed to delete pond lease.");
  }
}

/* --------------------------------
   Update Lease Status
-------------------------------- */

export async function updateLeaseStatus(
  id: string,
  status:
    | "ACTIVE"
    | "COMPLETED"
    | "CANCELLED"
    | "EXPIRED"
) {
  try {
    await db.$transaction(async (tx) => {
      const lease = await tx.pondLease.update({
        where: { id },
        data: { status },
      });

      if (
        status === "COMPLETED" ||
        status === "CANCELLED" ||
        status === "EXPIRED"
      ) {
        await tx.pond.update({
          where: { id: lease.pondId },
          data: { status: "AVAILABLE" },
        });
      }
    });

    revalidatePath("/admindashboard/register/pond-lease");
  } catch (error) {
    console.error("Failed to update lease status:", error);
    throw new Error("Failed to update lease status.");
  }
}

/* --------------------------------
   Update Lease Status With Resolution
-------------------------------- */

export async function updateLeaseStatusWithResolution(data: PondLeaseStatusUpdateValues) {
  const validated = PondLeaseStatusUpdateSchema.parse(data);
  try {
    await db.$transaction(async (tx) => {
      const lease = await tx.pondLease.findUnique({ where: { id: validated.id } });
      if (!lease) throw new Error("Lease not found");

      await tx.pondLease.update({
        where: { id: validated.id },
        data: { 
          status: validated.status,
          remarks: lease.remarks 
            ? `${lease.remarks}\n[${validated.status}] ${validated.remarks || ""}`
            : `[${validated.status}] ${validated.remarks || ""}`,
          resolutionDocumentUrl: validated.documentUrl,
          resolutionDocumentKey: validated.documentKey,
        },
      });

      if (
        validated.status === "COMPLETED" ||
        validated.status === "CANCELLED"
      ) {
        await tx.pond.update({
          where: { id: lease.pondId },
          data: { status: "AVAILABLE" },
        });
      }
    });

    revalidatePath("/admindashboard/register/pond-lease");
  } catch (error: any) {
    console.error("Failed to update lease status with resolution:", error);
    throw new Error(error.message || "Failed to update lease status.");
  }
}

/* --------------------------------
   Extend Pond Lease
-------------------------------- */

export async function extendPondLease(data: PondLeaseExtensionFormValues) {
  const validated = PondLeaseExtensionSchema.parse(data);

  const lease = await db.pondLease.findUnique({
    where: { id: validated.pondLeaseId },
  });

  if (!lease) {
    throw new Error("Lease not found");
  }

  let newEndDate: Date;
  let addedPeriod: string;

  if (validated.extensionPeriod === "6M") {
    newEndDate = addMonths(new Date(lease.leaseEndDate), 6);
    addedPeriod = "6 Months";
  } else {
    const years = parseInt(validated.extensionPeriod);
    newEndDate = addYears(new Date(lease.leaseEndDate), years);
    addedPeriod = `${years} Year${years > 1 ? "s" : ""}`;
  }

  const newTotalAmount = lease.totalAmount + validated.extensionAmount;
  const newPendingAmount = lease.pendingAmount + validated.extensionAmount;
  // leasePeriod is not stored in the DB; skip concatenation and just use the added period
  const newLeasePeriod = addedPeriod;

  const updatedLease = await db.pondLease.update({
    where: { id: validated.pondLeaseId },
    data: {
      leaseEndDate: newEndDate,
      totalAmount: newTotalAmount,
      pendingAmount: newPendingAmount,
      remarks: lease.remarks 
        ? `${lease.remarks}\n[Extended by ${addedPeriod}] ${validated.remarks}`
        : `[Extended by ${addedPeriod}] ${validated.remarks}`,
      status: "ACTIVE", // Reactivate if it was expired
      extensionDocumentUrl: validated.documentUrl,
      extensionDocumentKey: validated.documentKey,
    },
  });

  revalidatePath("/admindashboard/register/pond-lease");

  return updatedLease;
}

export async function verifyPondLease(id: string) {
  try {
    await db.pondLease.update({
      where: { id },
      data: { isVerified: true },
    });
    revalidatePath("/admindashboard/register/pond-lease");
  } catch (error) {
    console.error("Failed to verify pond lease:", error);
    throw new Error("Failed to verify pond lease.");
  }
}

/* --------------------------------
   Add Public Pond Payment
-------------------------------- */

export async function addPondPublicPayment(
  data: PondPublicPaymentFormValues,
) {
  const validated = PondPublicPaymentSchema.parse(data);

  const pond = await db.pond.findUnique({
    where: { id: validated.pondId },
  });

  if (!pond || pond.pondType !== "PUBLIC") {
    throw new Error("Selected pond is not a public pond.");
  }

  const payment = await db.pondPublicPayment.create({
    data: validated,
  });

  revalidatePath("/admindashboard/register/pond-lease");
  revalidatePath("/admindashboard/register/ponds");

  return payment;
}

/* --------------------------------
   Update Notice Count
-------------------------------- */

export async function updateNoticeCount(id: string) {
  try {
    await db.pondLease.update({
      where: { id },
      data: {
        noticeCount: { increment: 1 },
        lastNoticeDate: new Date(),
        noticeReceivedDate: null, // Reset received date on new notice
      },
    });
    revalidatePath("/admindashboard/register/pond-lease");
  } catch (error) {
    console.error("Failed to update notice count:", error);
    throw new Error("Failed to update notice count.");
  }
}

export async function bulkUpdateNoticeCount(ids: string[]) {
  try {
    await db.pondLease.updateMany({
      where: { id: { in: ids } },
      data: {
        noticeCount: { increment: 1 },
        lastNoticeDate: new Date(),
        noticeReceivedDate: null, // Reset received date on new notice
      },
    });
    revalidatePath("/admindashboard/register/pond-lease");
  } catch (error) {
    console.error("Failed to bulk update notice count:", error);
    throw new Error("Failed to bulk update notice count.");
  }
}

export async function markNoticeReceived(id: string, date: Date) {
  try {
    await db.pondLease.update({
      where: { id },
      data: { noticeReceivedDate: date },
    });
    revalidatePath("/admindashboard/register/pond-lease");
  } catch (error) {
    console.error("Failed to mark notice as received:", error);
    throw new Error("Failed to mark notice as received.");
  }
}
