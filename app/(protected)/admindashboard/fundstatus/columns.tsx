"use client";
import { Badge } from "@/components/ui/badge";
import { IndianRupee } from "lucide-react";
import { ShowNitDetails } from "@/components/ShowNitDetails";
import { ColumnDef } from "@tanstack/react-table";
interface WorkItem {
  id: string;
  nitDetails: {
    id: string;
    memoDate: Date;
    memoNumber: number;
    isSupply: boolean;
    supplyitemname: string | null;
    publishingDate: Date;
    documentDownloadFrom: Date;
    startTime: Date;
    updatedAt: Date;
  };
  workslno: number;
  paymentDetails: Array<{
    grossBillAmount: number;
    billType: string;
  }>;
  ApprovedActionPlanDetails: {
    activityCode: string;
    activityDescription: string;
    schemeName: string;
  } | null;
  AwardofContract: {
    workorderdetails: Array<{
      Bidagency: {
        agencydetails: {
          name: string;
        };
      } | null;
    }>;
  } | null;
  workStatus: string;
  finalEstimateAmount: string;
  totalPaid: number;
  pending: number;
  financialYear: string;
  formattedNit: string;
}
export const columns: ColumnDef<WorkItem>[] = [
  {
    accessorKey: "financialYear",
    header: "FY",
  },
  {
    accessorKey: "formattedNit",
    header: "NIT Details",
    cell: ({ row }) => (
      <ShowNitDetails
        nitdetails={row.original.formattedNit}
        memoDate={row.original.nitDetails.memoDate}
        workslno={row.original.workslno}
      />
    ),
  },
  {
    accessorKey: "ApprovedActionPlanDetails.activityCode",
    header: "Activity Code",
    cell: ({ getValue }) => getValue() || "N/A",
  },
  {
    accessorKey: "ApprovedActionPlanDetails.activityDescription",
    header: "Work Description",
    cell: ({ getValue }) => getValue() || "N/A",
  },
  {
    accessorKey:
      "AwardofContract.workorderdetails.0.Bidagency.agencydetails.name",
    header: "Agency",
    cell: ({ getValue }) => getValue() || "N/A",
  },
  {
    accessorKey: "workStatus",
    header: "Status",
    cell: ({ getValue }) => (
      <Badge
        className={`${getStatusStyle(
          getValue() as string,
        )} px-3 py-1 rounded-full`}
      >
        {getValue() as string}
      </Badge>
    ),
  },
  {
    accessorKey: "totalPaid",
    header: () => <div className="text-right">Paid</div>,
    cell: ({ getValue }) => (
      <div className="text-right">
        <CurrencyDisplay value={getValue() as number} />
      </div>
    ),
  },
  {
    accessorKey: "pending",
    header: () => <div className="text-right">Pending</div>,
    cell: ({ getValue }) => (
      <div className="text-right">
        <CurrencyDisplay value={getValue() as number} />
      </div>
    ),
  },
];

// Helper component
export const CurrencyDisplay = ({ value }: { value: number }) => (
  <div className="flex items-center justify-end gap-1.5">
    <IndianRupee className="h-4 w-4 text-gray-600" />
    <span className="font-medium">
      {value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
    </span>
  </div>
);

// Status styling
const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "workcompleted":
      return "bg-green-100 text-green-800";
    case "billpaid":
      return "bg-orange-100 text-orange-800";
    case "approved":
      return "bg-purple-100 text-purple-800";
    case "workorder":
      return "bg-yellow-100 text-yellow-800";
    case "yettostart":
      return "bg-red-100 text-red-800";
    case "workinprogress":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
