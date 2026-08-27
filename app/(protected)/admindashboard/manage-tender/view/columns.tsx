"use client";

import { formatDateTime } from "@/utils/utils";
import { Prisma } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { FaEye } from "react-icons/fa";
import { gpcode } from "@/constants/gpinfor";
// Define the type for the table data
export type TenderColDefProps = Prisma.WorksDetailGetPayload<{
  include: {
    nitDetails: true;
    ApprovedActionPlanDetails: true;
  };
}>;

// Define the columns for the table
export const tenderColDef: ColumnDef<TenderColDefProps>[] = [
  {
    header: "Sl No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "nitDetails.memoNumber",
    header: "Memo Number",
    cell: (info) => `${info.getValue()} /${gpcode}/`, // Format the memo number
  },
  {
    accessorKey: "nitDetails.memoDate",
    header: "Memo Date",
    // Format the date
    cell: (info) => formatDateTime(info.getValue() as string).dateTime,
  },
  {
    accessorKey: "nitDetails.technicalBidOpeningDate",
    header: "Technical Bid Opening Date",
    // Format the date
    cell: (info) => formatDateTime(info.getValue() as string).dateTime,
  },
  {
    accessorKey: "ApprovedActionPlanDetails.activityDescription",
    header: "Name of work",
    // Format the date
  },
  {
    accessorKey: "finalEstimateAmount",
    header: "Estimate Amount",
    // Format the date
  },
  {
    accessorKey: "nitDetails.nitMode",
    header: "Mode",
    cell: ({ row }) => {
      const mode = row.original.nitDetails?.nitMode || "ONLINE";
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            mode === "MANUAL"
              ? "bg-amber-100 text-amber-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {mode}
        </span>
      );
    },
  },

  {
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <div>
        <button onClick={() => handleEdit(row.original)}>
          <FaEye />
        </button>
      </div>
    ),
  },
];

// Define example functions for the Action column
const handleEdit = (item: TenderColDefProps) => {
  // Implement the edit functionality
  console.log("Edit:", item);
};
