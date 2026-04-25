"use client";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarDays,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { ExportButton } from "./export-button";
import { ReportDataItem } from "@/types";

function processWorksToReportData(works: any[]): ReportDataItem[] {
  return works.map((work, index) => {
    // Determine source of fund based on scheme name
    let sourceOfFund = "OSR";
    const schemeName =
      work.ApprovedActionPlanDetails?.schemeName?.toLowerCase() || "";
    if (schemeName.includes("sfc")) sourceOfFund = "SFC";
    else if (schemeName.includes("cfc")) sourceOfFund = "CFC";

    // Get work activity name and description
    const workActivityName =
      work.ApprovedActionPlanDetails?.activityDescription ||
      work.ApprovedActionPlanDetails?.activityName ||
      work.ApprovedActionPlanDetails?.schemeName ||
      "N/A";

    // Get winning bid amount
    const workOrderDetails = work.AwardofContract?.workorderdetails;
    const firstWorkOrder = workOrderDetails?.[0];
    const bidAgency = firstWorkOrder?.Bidagency;
    const winningBid = bidAgency?.biddingAmount || 0;

    // Get work order issue date
    const workOrderIssueDate = work.AwardofContract?.workordeermemodate ?? null;

    // Payment period (adjust as needed)
    const paymentStart = new Date("2024-04-01");
    const paymentEnd = new Date("2025-06-30");

    // Calculate payments in period and after period
    const allPayments = work.paymentDetails || [];
    const paymentsInPeriod = allPayments
      .filter((payment: any) => {
        const paymentDate = payment.billPaymentDate
          ? new Date(payment.billPaymentDate)
          : null;
        return (
          paymentDate &&
          paymentDate >= paymentStart &&
          paymentDate <= paymentEnd
        );
      })
      .reduce((sum: number, payment: any) => sum + payment.grossBillAmount, 0);

    const paymentsAfterPeriod = allPayments
      .filter((payment: any) => {
        const paymentDate = payment.billPaymentDate
          ? new Date(payment.billPaymentDate)
          : null;
        return paymentDate && paymentDate > paymentEnd;
      })
      .reduce((sum: number, payment: any) => sum + payment.grossBillAmount, 0);

    // Determine remarks
    let remarks = work.workStatus || "unknown";
    if (paymentsAfterPeriod > 0) {
      remarks = "Period Over Payment";
    } else if (paymentsInPeriod === 0 && allPayments.length > 0) {
      remarks = "No Payment in Period";
    }

    return {
      id: work.id || index.toString(),
      slNo: index + 1,
      workActivityId: work.ApprovedActionPlanDetails?.activityCode || "N/A",
      sourceOfFund,
      workActivityName,
      nitNumber: work.nitDetails?.memoNumber || "N/A",
      nitDate: work.nitDetails?.memoDate
        ? new Date(work.nitDetails.memoDate)
        : null,
      workOrderIssueDate,
      workOrderValue: winningBid,
      paymentsInPeriod,
      paymentsAfterPeriod,
      completionDate: work.completionDate
        ? new Date(work.completionDate)
        : null,
      workStatus: work.workStatus || "unknown",
      remarks,
      physicalCompletionPercentage: null,
      physicalCompletionDisplay: "",
    };
  });
}

interface FinancialReportClientProps {
  initialData: ReportDataItem[];
}

const FINANCIAL_YEARS = [
  { label: "2023-2024", start: "2023-04-01", end: "2024-03-31" },
  { label: "2024-2025", start: "2024-04-01", end: "2025-03-31" },
  // Add more years as needed
];

export default function FinancialReportClient({
  initialData,
}: FinancialReportClientProps) {
  const [selectedYear, setSelectedYear] = useState(FINANCIAL_YEARS[1]);
  const [reportData, setReportData] = useState(initialData);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(
        `/api/financial-report?fyStart=${selectedYear.start}&fyEnd=${selectedYear.end}`
      );
      const works = await res.json();

      setReportData(processWorksToReportData(works));
    }
    fetchData();
  }, [selectedYear]);

  // Calculate summary statistics
  const totalWorkOrders = reportData.length;
  const totalWorkOrderValue = reportData.reduce(
    (sum, item) => sum + item.workOrderValue,
    0
  );
  const totalPaymentsInPeriod = reportData.reduce(
    (sum, item) => sum + item.paymentsInPeriod,
    0
  );
  const periodOverPayments = reportData.filter(
    (item) => item.paymentsAfterPeriod > 0
  ).length;

  // Calculate completion metrics
  const worksWithCompletionDate = reportData.filter(
    (item) => item.completionDate !== null
  );
  const paymentEnd = new Date("2025-06-30"); // Adjust as needed
  const completedWithinPeriod = worksWithCompletionDate.filter(
    (item) => item.completionDate! <= paymentEnd
  ).length;

  // Calculate percentage of works completed within period relative to ALL work orders
  const completionPercentageOfTotalWorks =
    totalWorkOrders > 0
      ? Math.floor((completedWithinPeriod / totalWorkOrders) * 100)
      : 0;

  const getStatusBadge = (status: string, paymentsAfterPeriod: number) => {
    if (paymentsAfterPeriod > 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Period Over Payment
        </Badge>
      );
    }
    switch (status) {
      case "workcompleted":
        return (
          <Badge variant="default" className="bg-green-600">
            Completed
          </Badge>
        );
      case "workinprogress":
        return <Badge variant="secondary">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSourceBadge = (source: string) => {
    const colors = {
      SFC: "bg-blue-100 text-blue-800 border-blue-200",
      CFC: "bg-purple-100 text-purple-800 border-purple-200",
      OSR: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return (
      <Badge
        variant="outline"
        className={colors[source as keyof typeof colors] || colors.OSR}
      >
        {source}
      </Badge>
    );
  };

  // Highlight top 5 high value works
  const top5Ids = [...reportData]
    .sort((a, b) => b.workOrderValue - a.workOrderValue)
    .slice(0, 5)
    .map((item) => item.id);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Work Order Financial Report
        </h1>
        <p className="text-muted-foreground">
          Financial Year {selectedYear.label} • Payment Period: April 2024 -
          June 2025
        </p>
      </div>
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Work Orders
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Work Order Value
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalWorkOrderValue.toLocaleString("en-IN")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Payments in Period
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalPaymentsInPeriod.toLocaleString("en-IN")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Period Over Payments
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {periodOverPayments}
            </div>
            <p className="text-xs text-muted-foreground">
              work orders affected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed in Period
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedWithinPeriod}</div>
            <p className="text-xs text-muted-foreground">
              {completionPercentageOfTotalWorks}% of total work orders
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>Work Order Details</CardTitle>
          <CardDescription>
            Detailed breakdown of all work orders issued in FY{" "}
            {selectedYear.label}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <select
            value={selectedYear.label}
            onChange={(e) => {
              const year = FINANCIAL_YEARS.find(
                (y) => y.label === e.target.value
              );
              setSelectedYear(year ?? selectedYear); // fallback to current if not found
            }}
            className="mb-4 px-2 py-1 border rounded"
          >
            {FINANCIAL_YEARS.map((year) => (
              <option key={year.label} value={year.label}>
                {year.label}
              </option>
            ))}
          </select>
          <ExportButton reportData={reportData} />
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">SL No</TableHead>
                  <TableHead>Work/Activity ID</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="min-w-[200px]">
                    Work/Activity Name
                  </TableHead>
                  <TableHead>NIT No</TableHead>
                  <TableHead>NIT Date</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead className="text-right">Order Value</TableHead>
                  <TableHead className="text-right">
                    Gross Bills (Apr 24-Jun 25)
                  </TableHead>
                  <TableHead>Completion Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((item) => (
                  <TableRow
                    key={item.id}
                    className={`hover:bg-muted/50 ${
                      top5Ids.includes(item.id) ? "ring-2 ring-yellow-400" : ""
                    }`}
                  >
                    <TableCell className="font-medium text-center">
                      {item.slNo}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.workActivityId}
                    </TableCell>
                    <TableCell>{getSourceBadge(item.sourceOfFund)}</TableCell>
                    <TableCell className="font-medium">
                      {item.workActivityName !== "N/A" ? (
                        item.workActivityName
                      ) : (
                        <span className="text-muted-foreground italic">
                          No activity name
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.nitNumber}
                    </TableCell>
                    <TableCell>
                      {item.nitDate
                        ? format(item.nitDate, "dd/MM/yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {item.workOrderIssueDate
                        ? format(item.workOrderIssueDate, "dd/MM/yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {item.workOrderValue > 0 ? (
                        `₹${item.workOrderValue.toLocaleString("en-IN")}`
                      ) : (
                        <span className="text-muted-foreground">₹0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <div className="space-y-1">
                        <div>
                          ₹{item.paymentsInPeriod.toLocaleString("en-IN")}
                        </div>
                        {item.paymentsAfterPeriod > 0 && (
                          <div className="text-xs text-destructive">
                            +₹{item.paymentsAfterPeriod.toLocaleString("en-IN")}{" "}
                            after period
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.completionDate ? (
                        format(item.completionDate, "dd/MM/yyyy")
                      ) : (
                        <span className="text-muted-foreground">
                          In Progress
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(
                        item.workStatus,
                        item.paymentsAfterPeriod
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
