"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { addYears, addMonths } from "date-fns";
import {
  PondLeaseSchema,
  PondLeasePaymentSchema,
  PondLeaseExtensionSchema,
  PondLeaseFormValues,
  PondLeasePaymentFormValues,
  PondLeaseExtensionFormValues,
} from "./schema";

export async function getPonds() {
  try {
    const ponds = await db.pond.findMany({
      where: { status: "AVAILABLE" },
      orderBy: { createdAt: "desc" },
    });
    return ponds;
  } catch (error) {
    console.error("Failed to fetch ponds:", error);
    throw new Error("Failed to fetch ponds.");
  }
}

/* --------------------------------
   Create Pond
-------------------------------- */

export async function createPond(values: {
  name: string;
  location: string;
  area: number;
}) {
  await db.pond.create({
    data: {
      name: values.name,
      location: values.location,
      area: String(values.area),
    },
  });

  revalidatePath("/admindashboard/register/pond-lease");
}

/* --------------------------------
   Create Pond Lease
-------------------------------- */

export async function createPondLease(data: PondLeaseFormValues) {
  const validated = PondLeaseSchema.parse(data);

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

  const {
    leasePartyName,
    leasePartyMobile,
    leasePartyFatherName,
    leasePartyAddressLine1,
    leasePartyAddressLine2,
    leasePartyCity,
    leasePartyPin,
    remarks,
  } = validated;

  await db.pondLease.update({
    where: { id },
    data: {
      leasePartyName,
      leasePartyMobile,
      leasePartyFatherName,
      leasePartyAddressLine1,
      leasePartyAddressLine2,
      leasePartyCity,
      leasePartyPin,
      remarks,
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
      // leasePeriod is not a column in the DB; omitting
      remarks: lease.remarks 
        ? `${lease.remarks}\n[Extended by ${addedPeriod}] ${validated.remarks}`
        : `[Extended by ${addedPeriod}] ${validated.remarks}`,
      status: "ACTIVE", // Reactivate if it was expired
    },
  });

  revalidatePath("/admindashboard/register/pond-lease");

  return updatedLease;
}
