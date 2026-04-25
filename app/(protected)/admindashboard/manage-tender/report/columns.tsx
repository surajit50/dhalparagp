"use client";
import { TenderStatus } from "@prisma/client";
import { useState } from "react";
import type { workdetailstype } from "@/types/worksdetails";
import { formatDate } from "@/utils/utils";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateWorkStatus } from "@/action/updateWorkStatus";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { gpcode } from "@/constants/gpinfor";
// Define a custom type that extends ColumnDef
type CustomColumnDef<T> = ColumnDef<T> & {
  label?: string;
};

export const columns: CustomColumnDef<workdetailstype>[] = [
  {
    accessorKey: "id",
    header: "Sl No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "nitDetails.memoNumber",
    header: "NIT NO",
    label: "NIT NO",
    cell: ({ row }) => {
      const memoDate = row.original?.nitDetails?.memoDate;
      const nityear = memoDate ? new Date(memoDate).getFullYear() : "N/A";
      return (
        <div>
          <div>{`${
            row.original?.nitDetails?.memoNumber || "N/A"
          }/${gpcode}/${nityear}`}</div>
          <div className="text-sm text-muted-foreground">
            Date: {memoDate ? formatDate(memoDate) : "N/A"}
          </div>
          <div className="text-sm text-muted-foreground">
            SL No: {row.original?.workslno || "N/A"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "AwardofContract.workodermenonumber",
    header: "Work Order No",
    label: "Work Order No",
  },
  {
    accessorFn: (row) =>
      row?.AwardofContract?.workorderdetails?.[0]?.Bidagency?.agencydetails
        ?.name || "N/A",
    cell: (info) => info.getValue(),
    header: "Agency Name",
    label: "Agency Name",
  },
  {
    accessorKey: "ApprovedActionPlanDetails.activityDescription",
    header: "Work Name",
    label: "Work Name",
    cell: ({ row }) => {
      return (
        <div>
          {row.original.ApprovedActionPlanDetails.activityDescription}-
          {row.original.ApprovedActionPlanDetails.activityCode}
        </div>
      );
    },
  },
  {
    accessorKey: "finalEstimateAmount",
    header: "Estimate Cost",
    label: "Estimate Cost",
  },
  {
    accessorFn: (row) =>
      row?.AwardofContract?.workorderdetails?.[0]?.Bidagency?.biddingAmount ||
      "N/A",
    cell: (info) => info.getValue(),
    header: "Awarded Cost",
    label: "Awarded Cost",
  },
  {
    accessorKey: "tenderStatus",
    header: "Tender Status",
    label: "Tender Status",
    cell: ({ row }) => {
      return <div>{row.original.tenderStatus}</div>;
    },
  },
  {
    accessorKey: "ApprovedActionPlanDetails.schemeName",
    header: "Fund Type",
    label: "Fund Type",
    cell: ({ row }) => {
      return <div>{row.original.ApprovedActionPlanDetails.schemeName}</div>;
    },
  },

  {
    accessorKey: "workStatus",
    header: "Work Status",
    label: "Work Status",
    cell: ({ row }) => {
      return <div>{row.original.workStatus}</div>;
    },
  },
];
