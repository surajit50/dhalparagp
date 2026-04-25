"use client";
import { ColumnDef } from "@tanstack/react-table";
import { scrutneesheettype } from "@/types/worksdetails";

import PDFGeneratorComponent from "@/components/PrintTemplet/ScrutnisheetTemplete";
import { formatDate } from "@/utils/utils";
export const columns: ColumnDef<scrutneesheettype>[] = [
  {
    accessorFn: (row) => row.id,
    header: "Sl No",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorFn: (row) => row.nitDetails.memoNumber,
    header: "NIT No",
    cell: ({ row }) => row.original.nitDetails.memoNumber || "N/A",
  },
  {
    accessorFn: (row) => row.nitDetails.memoDate,
    header: "Date",
    cell: ({ row }) =>
      row.original.nitDetails.memoDate
        ? formatDate(row.original.nitDetails.memoDate)
        : "n/A",
  },
  {
    accessorFn: (row) => row.workslno,
    header: "Work Sl. No.",
    cell: ({ row }) => row.original.workslno,
  },
  {
    accessorFn: (row) => row.ApprovedActionPlanDetails.activityDescription,
    header: "Work Name",
    cell: ({ row }) =>
      row.original.ApprovedActionPlanDetails.activityDescription || "N/A",
  },
  {
    accessorFn: (row) => row.tenderStatus,
    header: "Status",
    cell: ({ row }) => row.original.tenderStatus || "N/A",
  },
  {
    id: "actions",
    cell: ({ row }) => <PDFGeneratorComponent workdetails={row.original} />,
  },
];
