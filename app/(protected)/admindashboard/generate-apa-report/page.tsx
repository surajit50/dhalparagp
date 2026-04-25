import { db } from "@/lib/db";
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
import * as XLSX from "xlsx";
import { ExportButton } from "./export-button";

interface WorkDetailWithRelations {
  id?: string | number;
  workslno?: number;
  completionDate?: Date | null;
  workStatus?: string | null;
  nitDetails?: {
    memoNumber?: number | null;
    memoDate?: Date | null;
  } | null;
  ApprovedActionPlanDetails?: {
    activityCode?: string | null;
    activityName?: string | null;
    activityDescription?: string | null;
    schemeName?: string | null;
    estimatedCost?: number | null;
  } | null;
  AwardofContract?: {
    workodermenonumber?: string | null;
    workordeermemodate?: Date | null;
    workorderdetails?: {
      Bidagency?: {
        biddingAmount?: number | null;
        agencydetails?: {
          name?: string | null;
        } | null;
      } | null;
    }[];
  } | null;
  paymentDetails?: {
    grossBillAmount: number;
    netAmt: number;
    billPaymentDate?: Date | null;
    billType?: string;
  }[];
}

const FinancialReportPage = async () => {
  // Financial year dates (April 2024 - March 2025)
  const fyStart = new Date("2025-04-01");
  const fyEnd = new Date("2026-03-31");

  // Payment period (April 2024 - June 2025)
  const paymentStart = new Date("2025-04-01");
  const paymentEnd = new Date("2026-06-30");

  const works = (await db.worksDetail.findMany({
    where: {
      awardofContractId: { not: null },
      AwardofContract: {
        workordeermemodate: {
          gte: fyStart,
          lte: fyEnd,
        },
      },
      nitDetails: {
        isSupply: false,
      },
    },
    include: {
      nitDetails: true,
      ApprovedActionPlanDetails: true,
      AwardofContract: {
        include: {
          workorderdetails: {
            include: {
              Bidagency: {
                include: {
                  agencydetails: true,
                },
              },
            },
          },
        },
      },
      paymentDetails: true,
    },
    orderBy: {
      AwardofContract: {
        workordeermemodate: "asc",
      },
    },
    take: 1000,
  })) as WorkDetailWithRelations[];

  // Process data for the report
  const reportData = works.map((work, index) => {
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
    const workOrderIssueDate = work.AwardofContract?.workordeermemodate;

    // Calculate payments in period and check for period over payments
    const allPayments = work.paymentDetails || [];
    const paymentsInPeriod = allPayments
      .filter((payment) => {
        const paymentDate = payment.billPaymentDate;
        return (
          paymentDate &&
          paymentDate >= paymentStart &&
          paymentDate <= paymentEnd
        );
      })
      .reduce((sum, payment) => sum + payment.grossBillAmount, 0);

    const paymentsAfterPeriod = allPayments
      .filter((payment) => {
        const paymentDate = payment.billPaymentDate;
        return paymentDate && paymentDate > paymentEnd;
      })
      .reduce((sum, payment) => sum + payment.grossBillAmount, 0);

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
      nitDate: work.nitDetails?.memoDate ?? null,
      workOrderIssueDate: work.AwardofContract?.workordeermemodate ?? null,
      workOrderValue: winningBid,
      paymentsInPeriod,
      paymentsAfterPeriod,
      completionDate: work.completionDate ?? null,
      workStatus: work.workStatus || "unknown",
      remarks,
      physicalCompletionPercentage: null,
      physicalCompletionDisplay: "",
    };
  });

  // Calculate summary statistics
  const totalWorkOrders = reportData.length;
  const totalWorkOrderValue = reportData.reduce(
    (sum, item) => sum + item.workOrderValue,
    0,
  );
  const totalPaymentsInPeriod = reportData.reduce(
    (sum, item) => sum + item.paymentsInPeriod,
    0,
  );
  const periodOverPayments = reportData.filter(
    (item) => item.paymentsAfterPeriod > 0,
  ).length;

  // Calculate completion metrics
  const worksWithCompletionDate = reportData.filter(
    (item) => item.completionDate !== null,
  );
  const completedWithinPeriod = worksWithCompletionDate.filter(
    (item) => item.completionDate! <= paymentEnd,
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

  // Identify top 5 most valuable work orders
  const top5Ids = [...reportData]
    .sort((a, b) => b.workOrderValue - a.workOrderValue)
    .slice(0, 7)
    .map((item) => item.id);

  // Create a map of high-value work orders (≥ ₹2.5 lakh) with their ranks
  const highValueItems = [...reportData]
    .filter((item) => item.workOrderValue >= 250000)
    .sort((a, b) => b.workOrderValue - a.workOrderValue);

  const highValueMap = new Map<string | number, number>();
  highValueItems.forEach((item, index) => {
    highValueMap.set(item.id, index + 1);
  });

  // Function to determine if row should be highlighted (work not completed)
  const shouldHighlightRow = (item: (typeof reportData)[0]) => {
    return item.workStatus !== "workcompleted";
  };

  // Identify work orders that are both top 5 and incomplete
  const top5IncompleteIds = top5Ids.filter((id) => {
    const item = reportData.find((item) => item.id === id);
    return item && shouldHighlightRow(item);
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Work Order Financial Report
        </h1>
        <p className="text-muted-foreground">
          Financial Year 2024-2025 • Payment Period: April 2024 - June 2025
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
            Detailed breakdown of all work orders issued in FY 2024-25
          </CardDescription>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-100 rounded-sm"></div>
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
              <span className="w-5 h-5 flex items-center justify-center text-xs font-bold bg-blue-600 text-white rounded-full">
                1
              </span>
              Ranked by value
            </div>
          </div>
        </CardHeader>

        <CardContent>
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
                                ? "bg-blue-50 hover:bg-blue-100"
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
                            <span className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
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
                                "en-IN",
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
                          item.paymentsAfterPeriod,
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
};

export default FinancialReportPage;
