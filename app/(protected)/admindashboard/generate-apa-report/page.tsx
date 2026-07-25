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
  Star,
} from "lucide-react";
import { ExportButton } from "./export-button";
import { ReportDataItem } from "@/types";

const FINANCIAL_YEARS = [
  { label: "2023-2024", start: "2023-04-01", end: "2024-03-31" },
  { label: "2024-2025", start: "2024-04-01", end: "2025-03-31" },
  { label: "2025-2026", start: "2025-04-01", end: "2026-03-31" },
];

// Helper function to get payment period (April-June) of the financial year
function getPaymentPeriod(fyStart: string) {
  const startDate = new Date(fyStart);
  const year = startDate.getFullYear();
  // Payment period is April-June of the financial year
  const paymentStart = new Date(`${year}-04-01`);
  const paymentEnd = new Date(`${year}-06-30`);
  return { paymentStart, paymentEnd };
}

function processWorksToReportData(
  works: any[],
  paymentStart: Date,
  paymentEnd: Date
): ReportDataItem[] {
  return works
    .filter((work) => {
      // Filter out APAS scheme
      const schemeName =
        work.ApprovedActionPlanDetails?.schemeName?.toLowerCase() || "";
      return !schemeName.includes("apas");
    })
    .map((work, index) => {
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

export default function FinancialReportPage() {
  const [selectedYear, setSelectedYear] = useState(FINANCIAL_YEARS[2]); // Default to 2025-2026
  const [reportData, setReportData] = useState<ReportDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentPeriod, setPaymentPeriod] = useState({ paymentStart: new Date(), paymentEnd: new Date() });

  useEffect(() => {
    // Calculate payment period based on selected year
    const period = getPaymentPeriod(selectedYear.start);
    setPaymentPeriod(period);

    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/financial-report?fyStart=${selectedYear.start}&fyEnd=${selectedYear.end}`
        );
        const works = await res.json();
        setReportData(
          processWorksToReportData(works, period.paymentStart, period.paymentEnd)
        );
      } catch (error) {
        console.error("Failed to fetch report data:", error);
      } finally {
        setLoading(false);
      }
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
  const paymentEnd = new Date(selectedYear.end);
  const worksWithCompletionDate = reportData.filter(
    (item) => item.completionDate !== null
  );
  const completedWithinPeriod = worksWithCompletionDate.filter(
    (item) => item.completionDate! <= paymentEnd
  ).length;

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
      SFC: "bg-orange-100 text-orange-800 border-orange-200",
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

  // Identify top 5 most valuable work orders
  const top5Ids = [...reportData]
    .sort((a, b) => b.workOrderValue - a.workOrderValue)
    .slice(0, 5)
    .map((item) => item.id);

  // Create a map of high-value work orders (≥ ₹2.5 lakh) with their ranks
  const highValueItems = [...reportData]
    .filter((item) => item.workOrderValue >= 250000)
    .sort((a, b) => b.workOrderValue - a.workOrderValue);

  const highValueMap = new Map<string | number, number>();
  highValueItems.forEach((item, index) => {
    highValueMap.set(item.id, index + 1);
  });

  const shouldHighlightRow = (item: ReportDataItem) => {
    return item.workStatus !== "workcompleted";
  };

  const top5IncompleteIds = top5Ids.filter((id) => {
    const item = reportData.find((item) => item.id === id);
    return item && shouldHighlightRow(item);
  });

  const paymentPeriodText = `${format(paymentPeriod.paymentStart, "MMM yyyy")} - ${format(paymentPeriod.paymentEnd, "MMM yyyy")}`;

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Work Order Financial Report
        </h1>
        <p className="text-muted-foreground">
          Financial Year {selectedYear.label} • Payment Period: {paymentPeriodText}
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
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-100 rounded-sm"></div>
              Work orders ≥ ₹2.5 lakh
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-400 rounded-sm ring-2 ring-yellow-400"></div>
              Top 5 most valuable
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-50 rounded-sm"></div>
              Incomplete work
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-purple-200 rounded-sm"></div>
              Top 5 & Incomplete
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              Top 5 by value
            </div>
            <div className="flex items-center gap-1">
              <span className="w-5 h-5 flex items-center justify-center text-xs font-bold bg-orange-600 text-white rounded-full">
                1
              </span>
              Ranked by value
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <label htmlFor="year-select" className="text-sm font-medium">
              Select Financial Year:
            </label>
            <select
              id="year-select"
              value={selectedYear.label}
              onChange={(e) => {
                const year = FINANCIAL_YEARS.find(
                  (y) => y.label === e.target.value
                );
                if (year) setSelectedYear(year);
              }}
              className="px-3 py-2 border rounded-md text-sm"
            >
              {FINANCIAL_YEARS.map((year) => (
                <option key={year.label} value={year.label}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>

          <ExportButton reportData={reportData} />

          <div className="rounded-md border mt-4">
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
                    Gross Bills ({format(paymentPeriod.paymentStart, "MMM yy")}-{format(paymentPeriod.paymentEnd, "MMM yy")})
                  </TableHead>
                  <TableHead>Completion Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {reportData.map((item) => {
                  const isHighlighted = shouldHighlightRow(item);
                  const isHighValue = item.workOrderValue >= 250000;
                  const rank = highValueMap.get(item.id);
                  const isTop5 = top5Ids.includes(item.id);
                  const isTop5Incomplete = top5IncompleteIds.includes(item.id);

                  return (
                    <TableRow
                      key={item.id}
                      className={`
                        hover:bg-muted/50 
                        ${isTop5 ? "ring-2 ring-yellow-400" : ""}
                        ${
                          isTop5Incomplete
                            ? "bg-purple-100 hover:bg-purple-200"
                            : isHighlighted
                              ? "bg-red-50 hover:bg-red-100"
                              : isHighValue
                                ? "bg-orange-50 hover:bg-orange-100"
                                : "hover:bg-muted/50"
                        }
                      `}
                    >
                      <TableCell className="font-medium text-center">
                        {item.slNo}
                        {isTop5 && (
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mx-auto mt-1" />
                        )}
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
                        {isTop5Incomplete && (
                          <Badge
                            variant="destructive"
                            className="mt-1 bg-purple-600"
                          >
                            Top 5 & Incomplete
                          </Badge>
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
                        <div className="relative">
                          {item.workOrderValue > 0 ? (
                            `₹${item.workOrderValue.toLocaleString("en-IN")}`
                          ) : (
                            <span className="text-muted-foreground">₹0</span>
                          )}
                          {rank && (
                            <span className="absolute -top-2 -right-2 bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                              {rank}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-right font-mono">
                        <div className="space-y-1">
                          <div>
                            ₹{item.paymentsInPeriod.toLocaleString("en-IN")}
                          </div>
                          {item.paymentsAfterPeriod > 0 && (
                            <div className="text-xs text-destructive">
                              +₹
                              {item.paymentsAfterPeriod.toLocaleString(
                                "en-IN"
                              )}{" "}
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
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
