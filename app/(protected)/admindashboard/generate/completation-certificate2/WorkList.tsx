"use client";

import { useState, useTransition, useMemo } from "react";
import { Loader2, Calendar, IndianRupee, FileText, Filter, CalendarDays, Download } from "lucide-react";
import type { CompletationCertificate } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShowNitDetails } from "@/components/ShowNitDetails";
import { fetchWorkData } from "@/action";
import { generatePDFAll } from "@/components/PrintTemplet/all-con-certificat";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import * as XLSX from "xlsx";

interface WorkListProps {
  works: CompletationCertificate[];
}

type FilterType = "payment" | "completion";

function getFinancialYear(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

export function WorkList({ works }: WorkListProps) {
  const [selectedWorks, setSelectedWorks] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [filterType, setFilterType] = useState<FilterType>("payment");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

  // Group works by financial year based on filter type
  const worksByYear = useMemo(() => {
    const grouped = works.reduce((acc, work) => {
      let dates: Date[] = [];

      if (filterType === "payment") {
        // Get all payment dates
        dates =
          work.paymentDetails?.map((p) => new Date(p.billPaymentDate)) || [];
      } else {
        // Use completion date
        if (work.completionDate) {
          dates = [new Date(work.completionDate)];
        }
      }

      // Group by each date's financial year
      dates.forEach((date) => {
        const fy = getFinancialYear(date);
        if (!acc[fy]) acc[fy] = new Set();
        acc[fy].add(work);
      });

      return acc;
    }, {} as Record<string, Set<CompletationCertificate>>);

    // Convert Sets to Arrays and sort years
    return Object.keys(grouped)
      .sort((a, b) => b.localeCompare(a))
      .reduce((acc, year) => {
        acc[year] = Array.from(grouped[year]);
        return acc;
      }, {} as Record<string, CompletationCertificate[]>);
  }, [works, filterType]);

  // Filter works based on selected year
  const filteredWorks = useMemo(() => {
    let list = selectedYear === "all" ? works : (worksByYear[selectedYear] || []);

    // Apply from/to date filter based on filterType
    if (fromDate || toDate) {
      const start = fromDate ? new Date(fromDate) : undefined;
      if (start) start.setHours(0, 0, 0, 0);
      const end = toDate ? new Date(toDate) : undefined;
      if (end) end.setHours(23, 59, 59, 999);
      list = list.filter((work) => {
        if (filterType === "payment") {
          const dates = (work.paymentDetails || [])
            .map((p) => (p.billPaymentDate ? new Date(p.billPaymentDate) : null))
            .filter((d): d is Date => Boolean(d));
          if (dates.length === 0) return false;
          // If any payment date falls within range, include
          return dates.some((d) => {
            const afterStart = start ? d >= start : true;
            const beforeEnd = end ? d <= end : true;
            return afterStart && beforeEnd;
          });
        } else {
          if (!work.completionDate) return false;
          const d = new Date(work.completionDate);
          const afterStart = start ? d >= start : true;
          const beforeEnd = end ? d <= end : true;
          return afterStart && beforeEnd;
        }
      });
    }

    return list;
  }, [selectedYear, works, worksByYear, fromDate, toDate, filterType]);

  const handleGeneratePDF = async () => {
    if (selectedWorks.length === 0) {
      alert("Please select at least one work");
      return;
    }

    setIsGenerating(true);
    try {
      // 1. Fetch work data from server
      const workData = await fetchWorkData(selectedWorks);

      // 2. Generate PDF on client side
      await generatePDFAll(workData);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF. See console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportExcel = () => {
    // Prepare data from currently filtered works (or just selected?)
    const exportSource = filteredWorks;
    const data = exportSource.map((work, idx) => {
      const latestPaymentDate = work.paymentDetails?.[work.paymentDetails.length - 1]?.billPaymentDate
        ? new Date(work.paymentDetails[work.paymentDetails.length - 1].billPaymentDate)
        : null;
      const agencyName = work.AwardofContract?.workorderdetails?.[0]?.Bidagency?.agencydetails?.name || "";
      const biddingAmount = work.AwardofContract?.workorderdetails?.[0]?.Bidagency?.biddingAmount || 0;
      return {
        SL: idx + 1,
        WorkDescription: work.ApprovedActionPlanDetails?.activityDescription || "",
        NITNumber: work.nitDetails?.memoNumber || "",
        NITDate: work.nitDetails?.memoDate ? format(new Date(work.nitDetails.memoDate), "dd-MM-yyyy") : "",
        Agency: agencyName,
        Amount: biddingAmount,
        LatestPaymentDate: latestPaymentDate ? format(latestPaymentDate, "dd-MM-yyyy") : "",
        CompletionDate: work.completionDate ? format(new Date(work.completionDate), "dd-MM-yyyy") : "",
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CompletionCertificates");

    let fileName = "completion_certificates";
    if (filterType === "payment") fileName += "_by_payment";
    else fileName += "_by_completion";
    if (fromDate) fileName += `_${format(fromDate, "yyyyMMdd")}`;
    if (toDate) fileName += `_${format(toDate, "yyyyMMdd")}`;
    fileName += ".xlsx";

    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Work List</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Found {filteredWorks.length} works matching your filters
              </p>
            </div>
            <Badge
              variant="secondary"
              className="w-fit px-4 py-1.5 text-sm bg-slate-100 dark:bg-slate-800"
            >
              {selectedWorks.length} selected
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-xl shadow-sm">
                <Filter className="w-4 h-4 ml-2 text-slate-500" />
                <div className="flex rounded-lg overflow-hidden bg-white dark:bg-slate-900/50 shadow-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-l-lg border-r flex items-center gap-2 px-4 ${
                      filterType === "payment"
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                        : ""
                    }`}
                    onClick={() => setFilterType("payment")}
                  >
                    <IndianRupee className="w-4 h-4" />
                    <span className="hidden sm:inline">Payment Date</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-r-lg flex items-center gap-2 px-4 ${
                      filterType === "completion"
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                        : ""
                    }`}
                    onClick={() => setFilterType("completion")}
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline">Completion Date</span>
                  </Button>
                </div>
              </div>

              <Select
                value={selectedYear}
                onValueChange={(value) => {
                  setSelectedWorks([]);
                  setSelectedYear(value);
                }}
              >
                <SelectTrigger className="w-[240px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
                  <SelectValue placeholder="Select financial year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Financial Years</SelectItem>
                  {Object.entries(worksByYear).map(([year, yearWorks]) => (
                    <SelectItem key={year} value={year}>
                      FY {year} ({yearWorks.length} works)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Date range filter */}
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <CalendarDays className="w-4 h-4" />
                      {fromDate ? format(fromDate, "dd MMM yyyy") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-2">
                      <CalendarComponent
                        mode="single"
                        selected={fromDate}
                        onSelect={setFromDate}
                        initialFocus
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <span className="text-slate-400">to</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <CalendarDays className="w-4 h-4" />
                      {toDate ? format(toDate, "dd MMM yyyy") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-2">
                      <CalendarComponent
                        mode="single"
                        selected={toDate}
                        onSelect={setToDate}
                        initialFocus
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                {(fromDate || toDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFromDate(undefined);
                      setToDate(undefined);
                    }}
                  >
                    Clear dates
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleExportExcel}
                className="min-w-[160px] border-slate-200 dark:border-slate-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedWorks([])}
                disabled={selectedWorks.length === 0 || isGenerating}
                className="min-w-[120px] border-slate-200 dark:border-slate-700"
              >
                Clear
              </Button>
              <Button
                onClick={handleGeneratePDF}
                disabled={selectedWorks.length === 0 || isGenerating}
                className="min-w-[200px] bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md"
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Generate ({selectedWorks.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="relative overflow-x-auto">
          {(isPending || isGenerating) && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                <span className="text-slate-900 dark:text-slate-100 font-medium">
                  {isGenerating
                    ? "Generating Certificates..."
                    : "Processing..."}
                </span>
              </div>
            </div>
          )}

          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800">
              <TableRow className="hover:bg-slate-100 dark:hover:bg-slate-700">
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={
                      filteredWorks.length > 0 &&
                      selectedWorks.length === filteredWorks.length
                    }
                    onCheckedChange={(checked) => {
                      setSelectedWorks(
                        checked ? filteredWorks.map((w) => w.id) : []
                      );
                    }}
                    disabled={filteredWorks.length === 0}
                  />
                </TableHead>
                <TableHead className="font-semibold">
                  Work Description
                </TableHead>
                <TableHead className="font-semibold">NIT Number</TableHead>
                <TableHead className="font-semibold">Agency</TableHead>
                <TableHead className="font-semibold text-right">
                  Amount
                </TableHead>
                <TableHead className="font-semibold">
                  {filterType === "payment"
                    ? "Latest Payment"
                    : "Completion Date"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorks.length > 0 ? (
                filteredWorks.map((work, index) => (
                  <TableRow
                    key={work.id}
                    className={`
                      ${
                        index % 2 === 0
                          ? "bg-white dark:bg-slate-900"
                          : "bg-slate-50 dark:bg-slate-800/50"
                      } 
                      hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors
                      ${
                        selectedWorks.includes(work.id)
                          ? "bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                          : ""
                      }
                    `}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedWorks.includes(work.id)}
                        onCheckedChange={(checked) => {
                          setSelectedWorks(
                            checked
                              ? [...selectedWorks, work.id]
                              : selectedWorks.filter((id) => id !== work.id)
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                      {work.ApprovedActionPlanDetails?.activityDescription ||
                        "N/A"}
                    </TableCell>
                    <TableCell>
                      <ShowNitDetails
                        nitdetails={work.nitDetails.memoNumber}
                        memoDate={work.nitDetails.memoDate}
                        workslno={work.workslno}
                      />
                    </TableCell>
                    <TableCell>
                      {work.AwardofContract?.workorderdetails?.[0]?.Bidagency
                        ?.agencydetails?.name || "N/A"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {work.AwardofContract?.workorderdetails?.[0]?.Bidagency?.biddingAmount?.toLocaleString(
                        "en-IN",
                        {
                          style: "currency",
                          currency: "INR",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      ) || "₹0.00"}
                    </TableCell>
                    <TableCell>
                      {filterType === "payment"
                        ? work.paymentDetails?.[work.paymentDetails.length - 1]
                            ?.billPaymentDate
                          ? new Date(
                              work.paymentDetails[
                                work.paymentDetails.length - 1
                              ].billPaymentDate
                            ).toLocaleDateString()
                          : "N/A"
                        : work.completionDate
                        ? new Date(work.completionDate).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                      <p>No works found</p>
                      <p className="text-xs text-slate-400">
                        Try changing your filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {filteredWorks.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-500 flex justify-between items-center">
            <div>
              {selectedWorks.length} of {filteredWorks.length} works selected
            </div>
            {selectedWorks.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              >
                {isGenerating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <FileText className="mr-2 h-4 w-4" />
                Generate Selected
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
