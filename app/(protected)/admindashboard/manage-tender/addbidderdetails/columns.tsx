"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { NitDetailsProps } from "@/types/tender-manage"
import { formatDate } from "@/utils/utils"
import AddBidderDialog from "@/components/bidder-management-dialog"


export const columns: ColumnDef<NitDetailsProps>[] = [
  {
    accessorKey: "id",
    header: "Sl No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "memoNumber",
    header: "NIT Number",
    cell: ({ row }) => row.original.memoNumber || "N/A",
  },
  {
    accessorKey: "workName",
    header: "Work Name",
    cell: ({ row }) => {
      const workDetail = row.original.WorksDetail[0]
      return workDetail?.ApprovedActionPlanDetails?.activityDescription || "N/A"
    },
  },
  {
    accessorKey: "technicalBidOpeningDate",
    header: "Technical Bid Opening",
    cell: ({ row }) => formatDate(row.original.technicalBidOpeningDate) || "N/A",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <AddBidderDialog
          workid={row.original.id}
          nitNumber={row.original.memoNumber || "N/A"}
          triggerText="Add Bidder Details"
          triggerClassName="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          
        />
      )
    },
  },
]
