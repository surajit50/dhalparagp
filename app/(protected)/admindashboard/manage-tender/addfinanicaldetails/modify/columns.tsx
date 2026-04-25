"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import type { AddFinancialDetailsType } from "@/types";
import { ShowNitDetails } from "@/components/ShowNitDetails";
import { BidFormDialog } from "@/components/bid-form-dialog";

export const columns: any[] = [
  {
    accessorKey: "id",
    header: "Sl No",
    cell: ({ row }: { row: any }) => row.index + 1,
  },
  {
    accessorKey: "memoNumber",
    header: "Tender Information",
    cell: ({ row }: { row: any }) => (
      <ShowNitDetails
        nitdetails={row.original.nitDetails.memoNumber}
        memoDate={row.original.nitDetails.memoDate}
        workslno={row.original.workslno}
      />
    ),
  },
  {
    accessorKey: "workName",
    header: "Activity Details",
    cell: ({ row }: { row: any }) => {
      const workDetail = row.original.ApprovedActionPlanDetails;
      return workDetail.activityDescription;
    },
  },
  {
    accessorKey: "tenderStatus",
    header: "Stage",
    cell: ({ row }: { row: any }) => row.original.tenderStatus,
  },
  {
    id: "Actions",
    cell: ({ row }: { row: any }) => {
      return (
        <div className="flex gap-2">
          <BidFormDialog
            work={row.original}
            trigger={
              <Button
                size="sm"
                variant="default"
                className="group-hover:bg-primary/10"
              >
                Modify Bids
              </Button>
            }
            onSuccess={() => {
              // The dialog handles refresh and toast
            }}
          />
        </div>
      );
    },
  },
];
