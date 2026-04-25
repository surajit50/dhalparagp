"use client";

import { ColumnDef } from "@tanstack/react-table";
import { WorkOrder } from "@/types/workOrder";
import { Badge } from "@/components/ui/badge";
import WorkorderCertificate from "@/components/PrintTemplet/Work-order-Certificate";
import { ShowWorkOrderDetails } from "@/components/show-work-order-details";
import { ShowNitDetails } from "@/components/ShowNitDetails";
import { IndianRupee } from "lucide-react";
import SupplyOrder from "@/components/PrintTemplet/Supply-order";

export const columns: ColumnDef<WorkOrder>[] = [
  {
    accessorFn: (row) => row.id,
    header: "Sl No",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.index + 1}
      </Badge>
    ),
  },
  {
    accessorFn: (row) => row.Bidagency?.WorksDetail?.nitDetails?.memoNumber,
    header: "NIT No",
    cell: ({ row }) => (
      <div className="min-w-[200px]">
        <ShowNitDetails
          nitdetails={
            row.original.Bidagency?.WorksDetail?.nitDetails.memoNumber || 0
          }
          memoDate={
            row.original.Bidagency?.WorksDetail?.nitDetails.memoDate ||
            new Date()
          }
          workslno={row.original.Bidagency?.WorksDetail?.workslno || 0}
        />
      </div>
    ),
  },
  {
    accessorFn: (row) => row.awardofcontractdetails?.workodermenonumber,
    header: "AOC Details",
    cell: ({ row }) => (
      <div className="min-w-[250px]">
        <ShowWorkOrderDetails
          workorderno={row.original.awardofcontractdetails.workodermenonumber}
          workorderdate={row.original.awardofcontractdetails.workordeermemodate}
          nitno={row.original.Bidagency?.WorksDetail?.nitDetails.memoNumber.toFixed()}
          workname={
            row.original.Bidagency?.WorksDetail?.ApprovedActionPlanDetails
              .activityDescription
          }
          slno={row.original.Bidagency?.WorksDetail?.workslno.toFixed()}
        />
      </div>
    ),
  },
  {
    accessorFn: (row) => row.Bidagency?.agencydetails?.name,
    header: "Agency Name",
    cell: ({ row }) => (
      <div className="font-medium text-primary">
        {row.original.Bidagency?.agencydetails?.name || "N/A"}
      </div>
    ),
  },
  {
    accessorFn: (row) => row.Bidagency?.biddingAmount,
    header: "Bidding Amount",
    cell: ({ row }) => {
      const amount = row.original.Bidagency?.biddingAmount;
      return (
        <div className="flex items-center gap-1 font-medium">
          <IndianRupee className="w-4 h-4 text-muted-foreground" />
          <span>
            {amount
              ? amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })
              : "N/A"}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <SupplyOrder workOrderDetails={row.original} />
      </div>
    ),
  },
];
