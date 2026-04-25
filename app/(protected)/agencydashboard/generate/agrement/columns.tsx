"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Agreement } from "@/types/agreement";
import { AgrementCertificate } from "@/components/PrintTemplet/Agrement-certificate";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { formatDate } from "@/utils/utils";
import { ShowNitDetails } from "@/components/ShowNitDetails";
import { blockname, gpcode, gpname, nameinprodhan, gpaddress } from "@/constants/gpinfor";
export const columns: ColumnDef<Agreement>[] = [
  {
    accessorFn: (row) => row.id,
    header: "Sl No",
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-mono px-3 py-1 rounded-md">
        {row.index + 1}
      </Badge>
    ),
  },
  {
    accessorFn: (row) => row.acceptagency?.WorksDetail?.nitDetails?.memoNumber,
    header: "NIT Details",
    cell: ({ row }) => (
      <ShowNitDetails
        nitdetails={
          row.original.acceptagency?.WorksDetail?.nitDetails?.memoNumber || 0
        }
        memoDate={
          row.original.acceptagency.WorksDetail?.nitDetails.memoDate ||
          new Date()
        }
        workslno={row.original.acceptagency.WorksDetail?.workslno || 0}
      />
    ),
  },
  {
    accessorFn: (row) => row.aggrementno,
    header: "Agreement No",
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 group">
              <span className="font-semibold text-blue-600 group-hover:text-blue-800 transition-colors">
                {row.original.aggrementno}
              </span>
              <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-gray-800 text-white">
            <p>
              Date:{" "}
              {row.original.aggrementdate
                ? formatDate(row.original.aggrementdate)
                : ""}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    accessorFn: (row) => row.acceptagency?.agencydetails?.name,
    header: "Agency Name",
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="max-w-[200px] truncate font-medium hover:text-clip">
              {row.original.acceptagency.agencydetails.name}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-[300px]">
            <p>{row.original.acceptagency.agencydetails.name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <AgrementCertificate agrement={row.original} />
      </div>
    ),
  },
];
