"use client";
import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Search,
  Layers,
} from "lucide-react";
import { ExportButton } from "./export-button";
import { ReportDataItem } from "@/types";

const FINANCIAL_YEARS = [
  { label: "2020-2021", start: "2020-04-01", end: "2021-03-31" },
  { label: "2021-2022", start: "2021-04-01", end: "2022-03-31" },
  { label: "2022-2023", start: "2022-04-01", end: "2023-03-31" },
  { label: "2023-2024", start: "2023-04-01", end: "2024-03-31" },
  { label: "2024-2025", start: "2024-04-01", end: "2025-03-31" },
  { label: "2025-2026", start: "2025-04-01", end: "2026-03-31" },
  { label: "2026-2027", start: "2026-04-01", end: "2027-03-31" },
];

function getPaymentPeriod(fyStart: string) {
  const startDate = new Date(fyStart);
  const startYear = startDate.getFullYear();
  const endYear = startYear + 1;
  const paymentStart = new Date(`${startYear}-04-01T00:00:00.000`);
  const paymentEnd = new Date(`${endYear}-06-30T23:59:59.999`);
  return { startYear, endYear, paymentStart, paymentEnd };
}

function processWorksToReportData(
  works: any[],
  paymentStart: Date,
  paymentEnd: Date
): ReportDataItem[] {
  return works
    .filter((work) => {
      const schemeName =
        work.ApprovedActionPlanDetails?.schemeName?.toLowerCase() || "";
      return !schemeName.includes("apas");
    })
    .map((work, index) => {
      const fullSchemeName =
        work.ApprovedActionPlanDetails?.schemeName || "N/A";

      let sourceOfFund = fullSchemeName;
      const lowerScheme = fullSchemeName.toLowerCase();
      if (lowerScheme.includes("sfc")) sourceOfFund = "SFC";
      else if (lowerScheme.includes("cfc")) sourceOfFund = "CFC";
      else if (lowerScheme.includes("osr")) sourceOfFund = "OSR";
      else if (lowerScheme.includes("pbg")) sourceOfFund = "PBG";

      const workActivityName =
        work.ApprovedActionPlanDetails?.activityDescription ||
        work.ApprovedActionPlanDetails?.activityName ||
        work.ApprovedActionPlanDetails?.schemeName ||
        "N/A";

      const workOrderDetails = work.AwardofContract?.workorderdetails;
      const firstWorkOrder = workOrderDetails?.[0];
      const bidAgency = firstWorkOrder?.Bidagency;
      let winningBid = bidAgency?.biddingAmount || 0;
      if (!winningBid && work.biddingAgencies?.length > 0) {
        winningBid = work.biddingAgencies[0]?.biddingAmount || 0;
      }
      if (!winningBid) {
        winningBid = Number(work.finalEstimateAmount) || 0;
      }

      const workOrderIssueDate = work.AwardofContract?.workordeermemodate ?? null;

      const allPayments = work.paymentDetails || [];
      const inPeriodPayments = allPayments.filter((payment: any) => {
        const paymentDate = payment.billPaymentDate
          ? new Date(payment.billPaymentDate)
          : null;
        return (
          paymentDate &&
          paymentDate >= paymentStart &&
          paymentDate <= paymentEnd
        );
      });

      const paymentsInPeriod = inPeriodPayments.reduce(
        (sum: number, payment: any) => sum + (payment.grossBillAmount || 0),
        0
      );

      const periodPaymentDates = inPeriodPayments
        .map((p: any) =>
          p.billPaymentDate ? format(new Date(p.billPaymentDate), "dd/MM/yyyy") : ""
        )
        .filter(Boolean)
        .join(", ");

      const afterPeriodPayments = allPayments.filter((payment: any) => {
        const paymentDate = payment.billPaymentDate
          ? new Date(payment.billPaymentDate)
          : null;
        return paymentDate && paymentDate > paymentEnd;
      });

      const paymentsAfterPeriod = afterPeriodPayments.reduce(
        (sum: number, payment: any) => sum + (payment.grossBillAmount || 0),
        0
      );

      const afterPeriodPaymentDates = afterPeriodPayments
        .map((p: any) =>
          p.billPaymentDate ? format(new Date(p.billPaymentDate), "dd/MM/yyyy") : ""
        )
        .filter(Boolean)
        .join(", ");

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
        schemeName: fullSchemeName,
        workActivityName,
        nitNumber: work.nitDetails?.memoNumber || "N/A",
        nitDate: work.nitDetails?.memoDate
          ? new Date(work.nitDetails.memoDate)
          : null,
        workOrderIssueDate: workOrderIssueDate
          ? new Date(workOrderIssueDate)
          : null,
        workOrderValue: winningBid,
        paymentsInPeriod,
        periodPaymentDates,
        paymentsAfterPeriod,
        afterPeriodPaymentDates,
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
  initialData?: ReportDataItem[];
}

export default function FinancialReportClient({
  initialData = [],
}: FinancialReportClientProps) {
  const [selectedYear, setSelectedYear] = useState(
    FINANCIAL_YEARS.find((y) => y.label === "2025-2026") || FINANCIAL_YEARS[5]
  );
  const [reportData, setReportData] = useState<ReportDataItem[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScheme, setSelectedScheme] = useState<string>("ALL");
  const [paymentPeriod, setPaymentPeriod] = useState(() =>
    getPaymentPeriod(selectedYear.start)
  );

  useEffect(() => {
    const period = getPaymentPeriod(selectedYear.start);
    setPaymentPeriod(period);

    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/financial-report?fyStart=${selectedYear.start}&fyEnd=${selectedYear.end}`
        );
        const works = await res.json();
        if (Array.isArray(works)) {
          setReportData(
            processWorksToReportData(works, period.paymentStart, period.paymentEnd)
          );
        } else {
          setReportData([]);
        }
      } catch (error) {
        console.error("Failed to fetch report data:", error);
        setReportData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedYear]);

  const availableSchemes = useMemo(() => {
    const set = new Set<string>();
    reportData.forEach((item) => {
      if (item.schemeName && item.schemeName !== "N/A") {
        set.add(item.schemeName);
      }
    });
    return Array.from(set).sort();
  }, [reportData]);

  const filteredReportData = useMemo(() => {
    return reportData.filter((item) => {
      if (selectedScheme !== "ALL") {
        const itemScheme = item.schemeName || item.sourceOfFund;
        if (itemScheme !== selectedScheme) return false;
      }
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.workActivityName.toLowerCase().includes(term) ||
        String(item.workActivityId).toLowerCase().includes(term) ||
        String(item.nitNumber).toLowerCase().includes(term) ||
        (item.schemeName && item.schemeName.toLowerCase().includes(term)) ||
        item.sourceOfFund.toLowerCase().includes(term) ||
        item.workStatus.toLowerCase().includes(term) ||
        (item.periodPaymentDates && item.periodPaymentDates.toLowerCase().includes(term))
      );
    });
  }, [reportData, selectedScheme, searchTerm]);

  const totalWorkOrders = filteredReportData.length;
  const totalWorkOrderValue = filteredReportData.reduce(
    (sum, item) => sum + item.workOrderValue,
    0
  );
  const totalPaymentsInPeriod = filteredReportData.reduce(
    (sum, item) => sum + item.paymentsInPeriod,
    0
  );
  const periodOverPayments = filteredReportData.filter(
    (item) => item.paymentsAfterPeriod > 0
  ).length;

  const paymentEnd = paymentPeriod.paymentEnd;
  const worksWithCompletionDate = filteredReportData.filter(
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

  const getSchemeBadge = (scheme?: string, source?: string) => {
    const name = scheme || source || "OSR";
    const lower = name.toLowerCase();
    let badgeClass = "bg-slate-100 text-slate-800 border-slate-300";
    if (lower.includes("sfc")) badgeClass = "bg-orange-100 text-orange-900 border-orange-300";
    else if (lower.includes("cfc")) badgeClass = "bg-purple-100 text-purple-900 border-purple-300";
    else if (lower.includes("osr")) badgeClass = "bg-emerald-100 text-emerald-900 border-emerald-300";
    else if (lower.includes("pbg")) badgeClass = "bg-blue-100 text-blue-900 border-blue-300";

    return (
      <Badge variant="outline" className={`font-medium whitespace-nowrap text-xs ${badgeClass}`}>
        {name}
      </Badge>
    );
  };

  const top5Ids = useMemo(() => {
    return [...filteredReportData]
      .sort((a, b) => b.workOrderValue - a.workOrderValue)
      .slice(0, 5)
      .map((item) => item.id);
  }, [filteredReportData]);

  const paymentPeriodText = `April ${paymentPeriod.startYear} - June ${paymentPeriod.endYear}`;
  const paymentColumnTitle = `Payment made during April ${paymentPeriod.startYear} to June ${paymentPeriod.endYear} (INR)`;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Work Order Financial Report (APA)
        </h1>
        <p className="text-muted-foreground">
          Financial Year <span className="font-semibold text-foreground">{selectedYear.label}</span> • Payment Period:{" "}
          <span className="font-semibold text-foreground">{paymentPeriodText}</span>
          {selectedScheme !== "ALL" && (
            <span> • Scheme: <span className="font-semibold text-orange-600">{selectedScheme}</span></span>
          )}
        </p>
      </div>

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
            <p className="text-xs text-muted-foreground">
              in FY {selectedYear.label} {selectedScheme !== "ALL" ? `(${selectedScheme})` : ""}
            </p>
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

        <Card className="border-orange-200 bg-orange-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-950">
              Payment Made (Apr {paymentPeriod.startYear} - Jun {paymentPeriod.endYear})
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
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
              {completionPercentageOfTotalWorks}% of filtered work orders
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Work Order Details</CardTitle>
          <CardDescription>
            Detailed breakdown of all work orders issued in FY {selectedYear.label}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="client-year-select" className="text-sm font-medium whitespace-nowrap">
                  Financial Year:
                </label>
                <select
                  id="client-year-select"
                  value={selectedYear.label}
                  onChange={(e) => {
                    const year = FINANCIAL_YEARS.find(
                      (y) => y.label === e.target.value
                    );
                    if (year) setSelectedYear(year);
                  }}
                  className="px-3 py-2 border rounded-md text-sm bg-background font-medium focus:ring-2 focus:ring-orange-500"
                >
                  {FINANCIAL_YEARS.map((year) => (
                    <option key={year.label} value={year.label}>
                      {year.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground hidden sm:inline-block" />
                <label htmlFor="client-scheme-select" className="text-sm font-medium whitespace-nowrap">
                  Scheme:
                </label>
                <select
                  id="client-scheme-select"
                  value={selectedScheme}
                  onChange={(e) => setSelectedScheme(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm bg-background font-medium focus:ring-2 focus:ring-orange-500 max-w-[220px]"
                >
                  <option value="ALL">All Schemes</option>
                  {availableSchemes.map((scheme) => (
                    <option key={scheme} value={scheme}>
                      {scheme}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative min-w-[200px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search activity, NIT, date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
            </div>

            <ExportButton
              reportData={filteredReportData}
              paymentColumnHeader={paymentColumnTitle}
              filename={`APA_Report_${selectedScheme !== "ALL" ? selectedScheme.replace(/[^a-zA-Z0-9]/g, "_") + "_" : ""}FY_${selectedYear.label}.xlsx`}
            />
          </div>

          <div className="rounded-md border mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-14 text-center">SL No</TableHead>
                  <TableHead>Work/Activity ID</TableHead>
                  <TableHead className="min-w-[140px]">Scheme</TableHead>
                  <TableHead className="min-w-[240px]">
                    Work/Activity Name
                  </TableHead>
                  <TableHead>NIT No</TableHead>
                  <TableHead>NIT Date</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Order Value (INR)</TableHead>
                  <TableHead className="text-right whitespace-nowrap bg-orange-50/60 font-semibold text-orange-950 min-w-[210px]">
                    <div className="flex flex-col items-end leading-tight py-1">
                      <span>Payment made</span>
                      <span>during April {paymentPeriod.startYear}</span>
                      <span>to June {paymentPeriod.endYear} (INR)</span>
                    </div>
                  </TableHead>
                  <TableHead>Completion Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredReportData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      No works found for {selectedScheme !== "ALL" ? `Scheme "${selectedScheme}" in ` : ""}Financial Year {selectedYear.label}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReportData.map((item) => (
                    <TableRow
                      key={item.id}
                      className={`hover:bg-muted/50 transition-colors ${
                        top5Ids.includes(item.id) ? "ring-2 ring-yellow-400" : ""
                      }`}
                    >
                      <TableCell className="font-medium text-center">
                        {item.slNo}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.workActivityId}
                      </TableCell>
                      <TableCell>{getSchemeBadge(item.schemeName, item.sourceOfFund)}</TableCell>
                      <TableCell className="font-medium">
                        {item.workActivityName !== "N/A" ? (
                          item.workActivityName
                        ) : (
                          <span className="text-muted-foreground italic">
                            No activity name
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm font-medium">
                        {item.nitNumber}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.nitDate
                          ? format(item.nitDate, "dd/MM/yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.workOrderIssueDate
                          ? format(item.workOrderIssueDate, "dd/MM/yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {item.workOrderValue > 0 ? (
                          `₹${item.workOrderValue.toLocaleString("en-IN")}`
                        ) : (
                          <span className="text-muted-foreground">₹0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono bg-orange-50/30">
                        <div className="space-y-1">
                          <div className="font-bold text-orange-950">
                            ₹{item.paymentsInPeriod.toLocaleString("en-IN")}
                          </div>
                          {item.periodPaymentDates ? (
                            <div className="text-[11px] text-muted-foreground font-sans font-normal">
                              <span className="font-semibold text-slate-800">Date:</span> {item.periodPaymentDates}
                            </div>
                          ) : item.paymentsInPeriod === 0 && (
                            <div className="text-[10px] text-muted-foreground italic font-sans">
                              No payment in period
                            </div>
                          )}
                          {item.paymentsAfterPeriod > 0 && (
                            <div className="text-xs text-destructive font-medium font-sans border-t border-destructive/20 pt-1 mt-1">
                              <div>
                                +₹{item.paymentsAfterPeriod.toLocaleString("en-IN")}{" "}
                                <span className="text-[10px]">after June {paymentPeriod.endYear}</span>
                              </div>
                              {item.afterPeriodPaymentDates && (
                                <div className="text-[10px] text-destructive/80 font-normal">
                                  Date: {item.afterPeriodPaymentDates}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {item.completionDate ? (
                          format(item.completionDate, "dd/MM/yyyy")
                        ) : (
                          <span className="text-muted-foreground italic">
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
