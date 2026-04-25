"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { paymentdetailsProps } from "@/types/paymentDetail";
import { ShowNitDetails } from "@/components/ShowNitDetails";
import PaymentCertificate from "@/components/PrintTemplet/payment-certificate";
import { formatDate } from "@/utils/utils";
import { blockname, gpcode, gpname, nameinprodhan, gpaddress } from "@/constants/gpinfor";
export const columns: ColumnDef<paymentdetailsProps>[] = [
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
    id: "nit_info",
    accessorFn: (row) =>
      `${row.nitDetails.memoNumber || ""} 
      ${formatDate(row.nitDetails.memoDate) || ""}`,
    header: "NIT Details",
    cell: ({ row }) => (
      <div className="space-y-1">
        <ShowNitDetails
          nitdetails={row.original.nitDetails.memoNumber}
          memoDate={row.original.nitDetails.memoDate}
          workslno={row.original.workslno}
        />
      </div>
    ),
  },
  {
    id: "agency_info",
    accessorFn: (row) => {
      const workOrder = row.AwardofContract?.workorderdetails?.[0];
      return workOrder?.Bidagency?.agencydetails?.name || "N/A"; // Only agency name
    },
    header: "Agency Name",
    cell: ({ row }) => {
      const agencyName =
        row.original.AwardofContract?.workorderdetails?.[0]?.Bidagency
          ?.agencydetails?.name;

      return (
        <span className="font-medium text-primary">{agencyName || "N/A"}</span>
      );
    },
  },
  {
    accessorFn: (row) => row.completionDate,
    header: "Completion Date",
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.completionDate
          ? formatDate(row.original.completionDate)
          : ""}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <PaymentCertificate paymentdetails={row.original} />,
  },
];
