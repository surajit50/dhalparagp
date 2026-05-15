"use client";

import { Prisma } from "@prisma/client";
import { formatDate } from "@/utils/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { gpcode } from "@/constants/gpinfor";

// ---------------------------------------------------------------------
// Helper: ordinal suffix (1st, 2nd, 3rd, …)
// ---------------------------------------------------------------------
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

function formatWorkStatus(status?: string | null): string {
  if (!status) return "N/A";
  const withSpaces = status.replace(/([A-Z])/g, " $1");
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

function getBillStatus(status?: string | null): string {
  if (!status) return "No Bill";
  if (status === "billpaid") return "Paid";
  if (status === "billgenerated") return "Generated";
  return "No Bill";
}

interface NitItem {
  id?: string;
  memoNumber?: number;
  memoDate?: Date;
  tenderStatus?: string;
  workOrderCancellation?: any[];
  worksDetailId?: string;
  workslno?: number; // ✅ each NIT has its own work serial number
}

// ---------------------------------------------------------------------
// Main row type: WorksDetail + optional virtual nits array
// ---------------------------------------------------------------------
export type TenderStatusReportItem = Prisma.WorksDetailGetPayload<{
  include: {
    nitDetails: true;
    ApprovedActionPlanDetails: {
      include: { AggrementModel: true };
    };
    AwardofContract: {
      include: {
        workorderdetails: {
          include: {
            Bidagency: { include: { agencydetails: true } };
          };
        };
      };
    };
    WorkOrderCancellation: true;
    _count: {
      select: {
        workEstimateItems: true;
        workMeasurementBooks: true;
      };
    };
  };
}> & {
  nits?: NitItem[]; // virtual field for multi‑NIT support
};

export function isTenderFloatedLatest(row: TenderStatusReportItem): boolean {
  const nits = row.nits ?? [];
  const latestNit = nits.length > 0 ? nits[0] : undefined;

  const hasNitDetails = !!latestNit?.memoNumber || !!row.nitDetails?.memoNumber;

  if (!hasNitDetails) return false;

  const rawStatus =
    (latestNit?.tenderStatus as string | undefined) ??
    (row.tenderStatus as string | undefined);

  if (!rawStatus) return false;

  const status = rawStatus.toString().toLowerCase();

  if (status === "cancelled") return false;

  return true;
}

// ---------------------------------------------------------------------
// Custom column definition with optional label
// ---------------------------------------------------------------------
type CustomColumnDef<T> = ColumnDef<T> & {
  label?: string;
};

// ---------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------
export const columns: CustomColumnDef<TenderStatusReportItem>[] = [
  // Serial number (row index)
  {
    accessorKey: "id",
    header: "Sl No",
    cell: ({ row }) => row.index + 1,
  },

  // Activity ID
  {
    accessorKey: "ApprovedActionPlanDetails.activityCode",
    header: "Activity ID",
    label: "Activity ID",
    cell: ({ row }) => (
      <div>{row.original.ApprovedActionPlanDetails.activityCode}</div>
    ),
  },

  // Work Name / Scheme
  {
    accessorKey: "ApprovedActionPlanDetails.activityDescription",
    header: "Work Name / Scheme",
    label: "Work Name / Scheme",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">
          {row.original.ApprovedActionPlanDetails.activityDescription}
        </div>
        <div className="text-xs text-muted-foreground">
          {row.original.ApprovedActionPlanDetails.schemeName}
        </div>
      </div>
    ),
  },

  // Fund Type
  {
    accessorKey: "ApprovedActionPlanDetails.schemeName",
    header: "Fund Type",
    label: "Fund Type",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.ApprovedActionPlanDetails.schemeName || "N/A"}
      </div>
    ),
  },

  // NIT Details (includes per‑NIT Work Serial Number from nits.workslno)
  {
    accessorKey: "nitDetails.memoNumber",
    header: "NIT Details",
    label: "NIT Details",
    cell: ({ row }) => {
      const nits = row.original.nits;
      const parentWorkSlno = row.original.workslno; // fallback for single NIT

      // --- Single NIT (fallback) ---
      if (!nits?.length) {
        const nit = row.original.nitDetails;
        if (!nit) return "N/A";

        const nityear = nit.memoDate
          ? new Date(nit.memoDate).getFullYear()
          : "N/A";

        return (
          <div>
            <div className="font-medium">
              [Sl No: {parentWorkSlno}] {nit.memoNumber}/{gpcode}/{nityear}
            </div>
            <div className="text-xs text-muted-foreground">
              Date: {nit.memoDate ? formatDate(nit.memoDate) : "N/A"}
            </div>
          </div>
        );
      }

      // --- Multiple NITs: each uses its own workslno from the nits array ---
      return (
        <div className="space-y-2">
          {nits.map((nit, index) => {
            const nityear = nit.memoDate
              ? new Date(nit.memoDate).getFullYear()
              : "N/A";
            const nitLabel =
              nits.length > 1
                ? `${index + 1}${getOrdinalSuffix(index + 1)} NIT: `
                : "";

            // ✅ Use nit.workslno if provided; fallback to parent workslno or index
            const workSlno = nit.workslno ?? parentWorkSlno ?? index + 1;

            return (
              <div
                key={nit.id ?? index}
                className={index > 0 ? "pt-2 border-t" : ""}
              >
                {nitLabel && (
                  <div className="text-xs font-semibold text-orange-600 mb-1">
                    {nitLabel}
                  </div>
                )}
                <div className="font-medium">
                  [Sl No: {workSlno}] {nit.memoNumber}/{gpcode}/{nityear}
                </div>
                <div className="text-xs text-muted-foreground">
                  Date: {nit.memoDate ? formatDate(nit.memoDate) : "N/A"}
                </div>
              </div>
            );
          })}
        </div>
      );
    },
  },

  // Tender Status
  {
    accessorKey: "tenderStatus",
    header: "Tender Status",
    label: "Tender Status",
    cell: ({ row }) => {
      const nits = row.original.nits;

      if (!nits?.length) {
        const status = row.original.tenderStatus;
        const isCancelled =
          status === "Cancelled" ||
          (row.original.WorkOrderCancellation?.length ?? 0) > 0;

        return (
          <div
            className={`font-medium ${
              isCancelled ? "text-red-600" : "text-green-600"
            }`}
          >
            {isCancelled ? "Cancelled" : status}
          </div>
        );
      }

      return (
        <div className="space-y-2">
          {nits.map((nit, index) => {
            const isCancelled =
              nit.tenderStatus === "Cancelled" ||
              (nit.workOrderCancellation?.length ?? 0) > 0;
            const nitLabel =
              nits.length > 1
                ? `${index + 1}${getOrdinalSuffix(index + 1)} NIT: `
                : "";

            return (
              <div
                key={nit.id ?? index}
                className={index > 0 ? "pt-2 border-t" : ""}
              >
                {nitLabel && (
                  <div className="text-xs font-semibold text-orange-600 mb-1">
                    {nitLabel}
                  </div>
                )}
                <div
                  className={`font-medium ${
                    isCancelled ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {isCancelled ? "Cancelled" : nit.tenderStatus}
                </div>
              </div>
            );
          })}
        </div>
      );
    },
  },

  // Cancellation Details
  {
    accessorKey: "WorkOrderCancellation",
    header: "Cancellation Details",
    label: "Cancellation Details",
    cell: ({ row }) => {
      const nits = row.original.nits ?? [];

      if (nits.length === 0) return "-";

      return (
        <div className="space-y-2">
          {nits.map((nit, index) => {
            const cancellations = nit.workOrderCancellation ?? [];
            const nitLabel =
              nits.length > 1
                ? `${index + 1}${getOrdinalSuffix(index + 1)} NIT: `
                : "";

            if (cancellations.length === 0) {
              return (
                <div
                  key={nit.id ?? index}
                  className={index > 0 ? "pt-2 border-t" : ""}
                >
                  {nitLabel && (
                    <div className="text-xs font-semibold text-orange-600 mb-1">
                      {nitLabel}
                    </div>
                  )}
                  -
                </div>
              );
            }

            return (
              <div
                key={nit.id ?? index}
                className={index > 0 ? "pt-2 border-t" : ""}
              >
                {nitLabel && (
                  <div className="text-xs font-semibold text-orange-600 mb-1">
                    {nitLabel}
                  </div>
                )}
                <div className="text-sm text-red-500">
                  {cancellations.map((c: any) => (
                    <div key={c.id}>
                      {formatDate(c.createdAt)}:{" "}
                      {c.cancelReason || "No reason provided"}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    },
  },

  {
    accessorKey: "ApprovedActionPlanDetails.estimatedCost",
    header: "Estimate Value (₹)",
    label: "Estimate Value",
    cell: ({ row }) => {
      const amount = row.original.ApprovedActionPlanDetails?.estimatedCost;
      if (amount == null) return "—";
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    },
  },

  // Final Estimate Amount (currency formatted)
  {
    accessorKey: "finalEstimateAmount",
    header: "Final Estimate (₹)",
    label: "Final Estimate Amount",
    cell: ({ row }) => {
      const amount = row.original.finalEstimateAmount;
      if (amount == null) return "—";
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    },
  },

  {
    accessorKey: "nitDetails.isPublished",
    header: "Whether Quotation/ Tender Floated?",
    label: "Whether Quotation/ Tender Floated?",
    cell: ({ row }) => {
      return isTenderFloatedLatest(row.original) ? "Yes" : "No";
    },
    meta: {
      exportValue: (row: TenderStatusReportItem) =>
        isTenderFloatedLatest(row) ? "Yes" : "No",
    },
  },

  {
    accessorKey: "AwardofContract.id",
    header: "Whether Work Order Issued",
    label: "Whether Work Order Issued",
    cell: ({ row }) => {
      const hasWorkOrder = !!row.original.AwardofContract;
      return hasWorkOrder ? "Yes" : "No";
    },
    meta: {
      exportValue: (row: TenderStatusReportItem) =>
        row.AwardofContract ? "Yes" : "No",
    },
  },

  {
    accessorKey: "AwardofContract.workodermenonumber",
    header: "Work Order No",
    label: "Work Order No",
    cell: ({ row }) => {
      const no = row.original.AwardofContract?.workodermenonumber;
      const date = row.original.AwardofContract?.workordeermemodate;
      if (!no) return "N/A";
      if (!date) return String(no);
      const year = new Date(date).getFullYear();
      return `${no}/${gpcode}/${year}`;
    },
    meta: {
      exportValue: (row: TenderStatusReportItem) => {
        const no = row.AwardofContract?.workodermenonumber;
        const date = row.AwardofContract?.workordeermemodate;
        if (!no) return "";
        if (!date) return String(no);
        const year = new Date(date).getFullYear();
        return `${no}/${gpcode}/${year}`;
      },
    },
  },

  {
    accessorKey: "AwardofContract.workordeermemodate",
    header: "Date of Work Order Issued",
    label: "Date of Work Order Issued",
    cell: ({ row }) => {
      const date = row.original.AwardofContract?.workordeermemodate;
      return date ? formatDate(date) : "N/A";
    },
    meta: {
      exportValue: (row: TenderStatusReportItem) => {
        const date = row.AwardofContract?.workordeermemodate;
        return date ? formatDate(date) : "";
      },
    },
  },

  {
    accessorKey: "workStatus",
    header: "Work Status",
    label: "Work Status",
    cell: ({ row }) => formatWorkStatus(row.original.workStatus),
  },

  {
    accessorKey: "_count.workMeasurementBooks",
    header: "Whether Geo Tagged Photograph Uploaded?",
    label: "Whether Geo Tagged Photograph Uploaded?",
    cell: ({ row }) => {
      const count = 0;
      return count > 0 ? "Yes" : "No";
    },
  },

  {
    accessorKey: "completionDate",
    header: "Whether Work Completed?",
    label: "Whether Work Completed?",
    cell: ({ row }) => {
      const hasCompletionDate = !!row.original.completionDate;
      return hasCompletionDate ? "Yes" : "No";
    },
  },

  {
    accessorKey: "completionDateFormatted",
    header: "Date of Work Completion",
    label: "Date of Work Completion",
    cell: ({ row }) => {
      const date = row.original.completionDate;
      return date ? formatDate(date) : "N/A";
    },
    meta: {
      exportValue: (row: TenderStatusReportItem) => {
        const date = row.completionDate;
        return date ? formatDate(date) : "";
      },
    },
  },

  {
    accessorKey: "billStatus",
    header: "Whether Bill Send to Block ?",
    label: "Whether Bill Send to Block ?",
    cell: ({ row }) => {
      const status = row.original.workStatus;
      return status === "billpaid" || status === "billgenerated" ? "Yes" : "No";
    },
    meta: {
      exportValue: (row: TenderStatusReportItem) => {
        const status = row.workStatus;
        return status === "billpaid" || status === "billgenerated"
          ? "Yes"
          : "No";
      },
    },
  },
];
