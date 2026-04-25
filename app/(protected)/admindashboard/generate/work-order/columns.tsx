
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { WorkOrder } from "@/types/workOrder";
import { Badge } from "@/components/ui/badge";
import WorkorderCertificate from "@/components/PrintTemplet/Work-order-Certificate";
import { ShowWorkOrderDetails } from "@/components/show-work-order-details";
import { ShowNitDetails } from "@/components/ShowNitDetails";
import { IndianRupee } from "lucide-react";

export const columns: ColumnDef<WorkOrder>[] = [
  {
    accessorFn: (row) => row.id,
    header: "SL NO",
    cell: ({ row }) => (
      <Badge 
        variant="outline" 
        className="font-mono bg-muted/50 px-3 py-1.5 rounded-md"
      >
        {row.index + 1}
      </Badge>
    ),
    size: 80,
  },
  {
    accessorFn: (row) => row.Bidagency?.WorksDetail?.nitDetails?.memoNumber,
    header: "NIT DETAILS",
    cell: ({ row }) => (
      <div className="min-w-[180px] py-2">
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
    size: 220,
  },
  {
    accessorFn: (row) => row.awardofcontractdetails?.workodermenonumber,
    header: "WORK ORDER",
    cell: ({ row }) => (
      <div className="min-w-[240px] py-2">
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
    size: 280,
  },
  {
    accessorFn: (row) => row.Bidagency?.agencydetails?.name,
    header: "AGENCY",
    cell: ({ row }) => (
      <div className="font-medium text-primary truncate max-w-[220px] py-2">
        {row.original.Bidagency?.agencydetails?.name || "N/A"}
      </div>
    ),
    size: 200,
  },
  {
    accessorFn: (row) => row.Bidagency?.biddingAmount,
    header: "BID AMOUNT (₹)",
    cell: ({ row }) => {
      const amount = row.original.Bidagency?.biddingAmount;
      return (
        <div className="flex items-center gap-1 font-medium py-2">
          <IndianRupee className="w-4 h-4 text-muted-foreground" />
          <span className="tracking-tighter">
            {amount
              ? amount.toLocaleString("en-IN", { 
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2
                })
              : "N/A"}
          </span>
        </div>
      );
    },
    size: 150,
  },
  {
    id: "actions",
    header: "ACTIONS",
    cell: ({ row }) => (
      <div className="flex justify-end py-2">
        <WorkorderCertificate 
          workOrderDetails={row.original} 
          
        />
      </div>
    ),
    size: 100,
  },
];
