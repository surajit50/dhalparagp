import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IndianRupee } from "lucide-react";
import { ShowNitDetails } from "@/components/ShowNitDetails";
import { funstatuscolumns } from "./table-col-ref/funstatuscolumns";
import { DataTable } from "./data-table";

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

// Helper function to process work items
const processWorkItem = (work: any): WorkItem => {
  const totalPaid = work.paymentDetails.reduce(
    (sum: number, payment: any) => sum + (payment.grossBillAmount || 0),
    0
  );
  const estimatedCost = Number(work.finalEstimateAmount) || 0;
  const hasFinalBill = work.paymentDetails.some((p: any) =>
    p.billType.toLowerCase().includes("final bill")
  );
  const pending = hasFinalBill ? 0 : estimatedCost - totalPaid;
  const financialYear = getFinancialYear(work.nitDetails.memoDate);

  return {
    ...work,
    totalPaid,
    pending,
    financialYear,
    formattedNit: `${work.nitDetails.memoNumber}`
    }
};

// Financial year helper function
const getFinancialYear = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

interface WorksTableProps {
  works: WorkItem[];
}

export default function WorksTable({ works }: WorksTableProps) {
  // Process the works data before rendering
  const processedWorks = works.map(processWorkItem);

  return (
    <Card className="bg-gradient-to-br from-gray-50 to-white">
      <div className="p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Work Details</h2>
        <div className="border rounded-lg overflow-hidden">
          <DataTable data={processedWorks} columns={funstatuscolumns} />
        </div>
      </div>
    </Card>
  );
}

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
