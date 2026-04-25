"use client";

import { ShowNitDetails } from "@/components/ShowNitDetails";
import { Aocprint } from "@/components/PrintTemplet/aocprint";

import type { aoctype } from "@/types/aoc";
import type { ColumnDef } from "@tanstack/react-table";
import { IndianRupee } from "lucide-react";
import { AgencyCell } from "@/components/AgencyCell";

export const columns: ColumnDef<aoctype>[] = [
  {
    accessorFn: (row) => row.id,
    header: "SL NO",
    cell: ({ row }) => <div className="font-medium">{row.index + 1}</div>,
    size: 80,
  },
  {
    accessorFn: (row) => row.WorksDetail?.nitDetails.memoNumber || 0,
    header: "NIT DETAILS",
    cell: ({ row }) => (
      <div className="min-w-[180px] py-2">
        <ShowNitDetails
          nitdetails={row.original.WorksDetail?.nitDetails.memoNumber || 0}
          memoDate={row.original.WorksDetail?.nitDetails.memoDate || new Date()}
          workslno={row.original.WorksDetail?.workslno || 0}
        />
      </div>
    ),
    size: 220,
  },
  {
    header: "AGENCY",
    cell: ({ row }) => <AgencyCell agencyId={row.original.bidagencyid} />,
    size: 200,
  },
  {
    header: "BID AMOUNT (₹)",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1 font-medium py-2">
          <IndianRupee className="w-4 h-4 text-muted-foreground" />
          <span className="tracking-tighter">
            {row.original.bidAmount
              ? row.original.bidAmount.toLocaleString("en-IN")
              : 0}
          </span>
        </div>
      );
    },
    size: 150,
  },
  {
    id: "actions",
    header: "ACTIONS",
    cell: ({ row }) => <Aocprint workdetails={row.original} />,
    size: 120,
  },
];
