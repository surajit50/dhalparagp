"use server";

import {
  EarnestMoneyRegisterEntryStatus,
  NitMode,
  PaymentMethod,
  UserRole,
} from "@prisma/client";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAuditLog } from "@/action/monitoring-actions";
import {
  mapRegisterStatusToLegacyStatus,
  getEffectiveRegisterStatus,
} from "@/lib/earnest-money-utils";

const MANAGE_ROLES: UserRole[] = ["admin", "superadmin", "staff"];

export type EligibleEarnestMoneyCandidate = {
  bidderId: string;
  bidderName: string;
  bidderAddress: string;
  nitNumber: number | null;
  nitDate: Date | null;
  nameOfWork: string;
  tenderMode: NitMode;
  availableEarnestMoneyAmount: number;
  originalTenderAmount: number;
  workOrderId: string | null;
  workOrderMemoNumber: string | null;
  workOrderMemoDate: Date | null;
};

export type EarnestMoneyEligibilityResult = {
  candidates: EligibleEarnestMoneyCandidate[];
  blockedOnlineWorksCount: number;
};

export type CreateEarnestMoneyRegisterInput = {
  bidderId: string;
  paymentMethod: PaymentMethod;
  registerStatus: EarnestMoneyRegisterEntryStatus;
  amountReceived: number;
  receiptNumber?: string;
  receiptDate: Date;
  remarks?: string;
};

export type UpdateEarnestMoneyRegisterInput = {
  paymentMethod?: PaymentMethod;
  registerStatus?: EarnestMoneyRegisterEntryStatus;
  amountReceived?: number;
  receiptNumber?: string | null;
  receiptDate?: Date | null;
  remarks?: string | null;
};

function ensureRole(role?: UserRole | null) {
  if (!role || !MANAGE_ROLES.includes(role)) {
    throw new Error("You are not authorized to manage the Earnest Money Register.");
  }
}

function formatAgencyName(agency?: {
  name?: string | null;
  agencyType?: "FARM" | "INDIVIDUAL" | null;
  proprietorName?: string | null;
} | null) {
  if (!agency?.name) {
    return "Unknown Agency";
  }

  if (agency.agencyType === "FARM" && agency.proprietorName) {
    return `${agency.name} (${agency.proprietorName})`;
  }

  return agency.name;
}

// Pure synchronous helpers are in earnest-money-utils.ts (no "use server").
// Import directly from there if needed outside this module.


export async function getEligibleEarnestMoneyCandidates(): Promise<EarnestMoneyEligibilityResult> {
  const [bidAgencies, blockedOnlineWorksCount] = await Promise.all([
    db.bidagency.findMany({
      where: {
        OR: [
          {
            WorksDetail: {
              is: {
                nitDetails: {
                  nitMode: "MANUAL",
                },
              },
            },
          },
          {
            workorderdetails: {
              some: {},
            },
            WorksDetail: {
              is: {
                nitDetails: {
                  nitMode: "ONLINE",
                },
              },
            },
          },
        ],
      },
      include: {
        agencydetails: true,
        earnestMoneyRegister: true,
        workorderdetails: {
          include: {
            awardofcontractdetails: true,
          },
        },
        WorksDetail: {
          include: {
            nitDetails: true,
            ApprovedActionPlanDetails: true,
          },
        },
      },
    }),
    db.worksDetail.count({
      where: {
        AND: [
          {
            nitDetails: {
              nitMode: "ONLINE",
            },
          },
          {
            biddingAgencies: {
              some: {},
            },
          },
          {
            biddingAgencies: {
              none: {
                workorderdetails: {
                  some: {},
                },
              },
            },
          },
        ],
      },
    }),
  ]);

  const candidates = bidAgencies
    .filter((bidAgency) => bidAgency.earnestMoneyRegister.length === 0)
    .map((bidAgency) => {
      const work = bidAgency.WorksDetail;
      const nit = work?.nitDetails;
      const workOrder = bidAgency.workorderdetails[0];

      return {
        bidderId: bidAgency.id,
        bidderName: formatAgencyName(bidAgency.agencydetails),
        bidderAddress: bidAgency.agencydetails?.contactDetails || "N/A",
        nitNumber: nit?.memoNumber ?? null,
        nitDate: nit?.memoDate ?? null,
        nameOfWork:
          work?.ApprovedActionPlanDetails?.activityDescription || "Unnamed Work",
        tenderMode: nit?.nitMode || "MANUAL",
        availableEarnestMoneyAmount: work?.earnestMoneyFee || 0,
        originalTenderAmount:
          bidAgency.biddingAmount || work?.finalEstimateAmount || 0,
        workOrderId: workOrder?.id || null,
        workOrderMemoNumber:
          workOrder?.awardofcontractdetails?.workodermenonumber || null,
        workOrderMemoDate:
          workOrder?.awardofcontractdetails?.workordeermemodate || null,
      } satisfies EligibleEarnestMoneyCandidate;
    })
    .sort((left, right) => {
      if ((left.nitNumber || 0) !== (right.nitNumber || 0)) {
        return (right.nitNumber || 0) - (left.nitNumber || 0);
      }

      return left.bidderName.localeCompare(right.bidderName);
    });

  return {
    candidates,
    blockedOnlineWorksCount,
  };
}

async function getValidatedBidderForRegister(bidderId: string) {
  const bidAgency = await db.bidagency.findUnique({
    where: {
      id: bidderId,
    },
    include: {
      agencydetails: true,
      earnestMoneyRegister: true,
      workorderdetails: {
        include: {
          awardofcontractdetails: true,
        },
      },
      WorksDetail: {
        include: {
          nitDetails: true,
          ApprovedActionPlanDetails: true,
        },
      },
    },
  });

  if (!bidAgency?.WorksDetail?.nitDetails) {
    throw new Error("Bidder tender details could not be found.");
  }

  if (bidAgency.earnestMoneyRegister.length > 0) {
    throw new Error("An Earnest Money Register entry already exists for this bidder.");
  }

  const work = bidAgency.WorksDetail;
  const nit = work.nitDetails;
  const workOrder = bidAgency.workorderdetails[0];

  if (nit.nitMode === "ONLINE" && !workOrder) {
    throw new Error(
      "Earnest Money Register entry cannot be created until the Work Order is issued."
    );
  }

  return {
    bidAgency,
    work,
    nit,
    workOrder,
  };
}

export async function createEarnestMoneyRegisterEntry(
  input: CreateEarnestMoneyRegisterInput
) {
  const user = await currentUser();
  ensureRole(user?.role);

  if (!user?.id) {
    throw new Error("Unable to identify the current user.");
  }

  if (input.amountReceived <= 0) {
    throw new Error("Amount received must be greater than zero.");
  }

  const { bidAgency, work, nit, workOrder } = await getValidatedBidderForRegister(
    input.bidderId
  );

  const availableAmount = work.earnestMoneyFee || 0;

  if (availableAmount <= 0) {
    throw new Error("Earnest Money amount is not available for this bidder.");
  }

  const registerEntry = await db.earnestMoneyRegister.create({
    data: {
      bidderId: bidAgency.id,
      earnestMoneyAmount: availableAmount,
      amountReceived: input.amountReceived,
      originalTenderAmount: bidAgency.biddingAmount || work.finalEstimateAmount,
      originalEarnestMoneyAmount: availableAmount,
      registerStatus: input.registerStatus,
      paymentstatus: mapRegisterStatusToLegacyStatus(input.registerStatus),
      paymentMethod: input.paymentMethod,
      paymentDate: input.receiptDate,
      nitNumber: nit.memoNumber,
      nitDate: nit.memoDate,
      nameOfWork: work.ApprovedActionPlanDetails?.activityDescription,
      bidderAgencyName: formatAgencyName(bidAgency.agencydetails),
      bidderAddress: bidAgency.agencydetails?.contactDetails,
      tenderMode: nit.nitMode,
      receiptNumber: input.receiptNumber,
      receiptDate: input.receiptDate,
      workOrderId: workOrder?.id,
      workOrderMemoNumber: workOrder?.awardofcontractdetails?.workodermenonumber,
      workOrderMemoDate: workOrder?.awardofcontractdetails?.workordeermemodate,
      remarks: input.remarks,
      createdById: user.id,
      updatedById: user.id,
    },
  });

  await createAuditLog({
    action: "Created Earnest Money Register Entry",
    entityId: registerEntry.id,
    entityType: "EarnestMoneyRegister",
    details: `Created EMD entry for bidder ${formatAgencyName(
      bidAgency.agencydetails
    )} under NIT ${nit.memoNumber}.`,
    userId: user.id,
  });

  return registerEntry;
}

export async function updateEarnestMoneyRegisterEntry(
  id: string,
  input: UpdateEarnestMoneyRegisterInput
) {
  const user = await currentUser();
  ensureRole(user?.role);

  if (!user?.id) {
    throw new Error("Unable to identify the current user.");
  }

  const existingEntry = await db.earnestMoneyRegister.findUnique({
    where: { id },
  });

  if (!existingEntry) {
    throw new Error("Earnest Money Register entry not found.");
  }

  const nextStatus =
    input.registerStatus || getEffectiveRegisterStatus(existingEntry);

  const updatedEntry = await db.earnestMoneyRegister.update({
    where: { id },
    data: {
      registerStatus: nextStatus,
      paymentstatus: mapRegisterStatusToLegacyStatus(nextStatus),
      paymentMethod: input.paymentMethod ?? existingEntry.paymentMethod,
      paymentDate: input.receiptDate ?? existingEntry.paymentDate,
      amountReceived: input.amountReceived ?? existingEntry.amountReceived,
      receiptNumber:
        input.receiptNumber !== undefined
          ? input.receiptNumber
          : existingEntry.receiptNumber,
      receiptDate:
        input.receiptDate !== undefined
          ? input.receiptDate
          : existingEntry.receiptDate,
      remarks:
        input.remarks !== undefined ? input.remarks : existingEntry.remarks,
      updatedById: user.id,
    },
  });

  await createAuditLog({
    action: "Updated Earnest Money Register Entry",
    entityId: updatedEntry.id,
    entityType: "EarnestMoneyRegister",
    details: `Updated EMD entry status to ${nextStatus}.`,
    userId: user.id,
  });

  return updatedEntry;
}
