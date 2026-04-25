"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { GetPaymentDetailstype } from "@/types";
import CompletionCertificate from "@/components/PrintTemplet/completation-certificate";
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
import { ShowWorkOrderDetails } from "@/components/show-work-order-details";
import {
  blockname,
  gpcode,
  gpname,
  nameinprodhan,
  gpaddress,
} from "@/constants/gpinfor";
export const columns: ColumnDef<GetPaymentDetailstype>[] = [
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
    accessorFn: (row) => row.nitDetails.memoNumber,
    header: "NIT Details",
    cell: ({ row }) => (
      <ShowNitDetails
        nitdetails={row.original.nitDetails.memoNumber}
        memoDate={row.original.nitDetails.memoDate}
        workslno={row.original.workslno}
      />
    ),
  },
  {
    accessorFn: (row) =>
      row.AwardofContract?.workorderdetails[0].Bidagency?.agencydetails.name,
    header: "Agency Name",
    cell: ({ row }) => (
      <p>
        {row.original.AwardofContract?.workorderdetails[0]?.Bidagency
          ?.agencydetails.name || "NA"}
      </p>
    ),
  },
  {
    accessorFn: (row) => row.AwardofContract?.workodermenonumber,
    header: "Work Order Details",
    cell: ({ row }) => (
      <ShowWorkOrderDetails
        workorderno={row.original.AwardofContract?.workodermenonumber || ""}
        workorderdate={row.original.AwardofContract?.workordeermemodate}
        nitno={`${
          row.original.nitDetails.memoNumber
        }/${gpcode}/${row.original.nitDetails.memoDate.getFullYear()}`}
        workname={row.original.ApprovedActionPlanDetails.activityDescription}
        slno={row.original.workslno.toFixed()}
      />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <CompletionCertificate paymentdetails={row.original} />
      </div>
    ),
  },
];
