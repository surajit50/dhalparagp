"use client";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, PlusCircle } from "lucide-react";
import { ShowNitDetails } from "@/components/ShowNitDetails";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
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
export const funstatuscolumns: ColumnDef<WorkItem>[] = [
  {
    id: "financialYear",
    accessorFn: (row) => row.financialYear,
    header: () => <div className="text-left">FY</div>,
    cell: ({ row }) => (
      <div className="text-left">{row.original.financialYear}</div>
    ),
  },
  {
    id: "nitDetails",
    accessorFn: (row) => row.nitDetails.memoNumber,
    header: () => <div className="text-left">NIT Details</div>,
    cell: ({ row }) => (
      <ShowNitDetails
        nitdetails={row.original.formattedNit}
        memoDate={row.original.nitDetails.memoDate}
        workslno={row.original.workslno}
      />
    ),
  },
  {
    id: "activityCode",
    accessorFn: (row) => row.ApprovedActionPlanDetails?.activityCode,
    header: () => <div className="text-left">Activity Code</div>,
    cell: ({ row }) => (
      <div className="text-left">
        {row.original.ApprovedActionPlanDetails?.activityCode || "N/A"}
      </div>
    ),
  },
  {
    id: "workDescription",
    accessorFn: (row) => row.ApprovedActionPlanDetails?.activityDescription,
    header: () => <div className="text-left">Work Description</div>,
    cell: ({ row }) => (
      <div className="text-left">
        {row.original.ApprovedActionPlanDetails?.activityDescription || "N/A"}
      </div>
    ),
  },
  {
    id: "agency",
    accessorFn: (row) =>
      row.AwardofContract?.workorderdetails?.[0]?.Bidagency?.agencydetails
        ?.name,
    header: () => <div className="text-left">Agency</div>,
    cell: ({ row }) => (
      <div className="text-left">
        {row.original.AwardofContract?.workorderdetails?.[0]?.Bidagency
          ?.agencydetails?.name || "N/A"}
      </div>
    ),
  },
  {
    id: "workStatus",
    accessorFn: (row) => row.workStatus,
    header: () => <div className="text-left">Status</div>,
    cell: ({ row }) => (
      <Badge
        className={`${getStatusStyle(
          row.original.workStatus as string,
        )} px-3 py-1 rounded-full`}
      >
        {row.original.workStatus as string}
      </Badge>
    ),
  },
  {
    id: "totalPaid",
    accessorFn: (row) => row.totalPaid,
    header: () => <div className="text-right">Paid</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <CurrencyDisplay value={row.original.totalPaid as number} />
      </div>
    ),
  },
  {
    id: "pending",
    accessorFn: (row) => row.pending,
    header: () => <div className="text-right">Pending</div>,
    cell: ({ row }) => {
      const value = row.original.pending as number;

      return (
        <div className="flex items-center justify-end gap-2 text-right">
          <CurrencyDisplay value={value} />
          {value > 0 && (
            <Link
              href={`/admindashboard/addpaymentdetails/${row.original.id}`}
              className="p-1 rounded-full hover:bg-green-100 text-green-600"
              title="Add Payment"
            >
              <PlusCircle size={16} strokeWidth={2} />
            </Link>
          )}
        </div>
      );
    },
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
      return "bg-blue-100 text-blue-800";
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
