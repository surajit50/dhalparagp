"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import type { AddFinancialDetailsType } from "@/types";
import { EyeIcon, PlusIcon } from "lucide-react";
import { ShowNitDetails } from "@/components/ShowNitDetails";
import { BidFormDialog } from "@/components/bid-form-dialog";

export const columns: ColumnDef<AddFinancialDetailsType>[] = [
  {
    accessorKey: "id",
    header: "Sl No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "memoNumber",
    header: "Tender Information",
    cell: ({ row }) => (
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
    cell: ({ row }) => {
      const workDetail = row.original.ApprovedActionPlanDetails;
      return workDetail.activityDescription;
    },
  },
  {
    accessorKey: "tenderStatus",
    header: "Stage",
    cell: ({ row }) => row.original.tenderStatus,
  },
  {
    id: "Actions",
    cell: ({ row }) => {
      // Check if all bids are already entered
      const allBidsEntered = !row.original.biddingAgencies.some(
        (agency) => agency.biddingAmount == null,
      );

      return (
        <div className="flex gap-2">
          <BidFormDialog
            work={row.original}
            trigger={
              <Button
                size="sm"
                variant={allBidsEntered ? "secondary" : "default"}
                className="group-hover:bg-primary/10"
              >
                {allBidsEntered ? (
                  <>
                    <EyeIcon className="w-4 h-4 mr-2" />
                    View Bids
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Bids
                  </>
                )}
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
