"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  IndianRupee,
  CalendarCheck,
  FileText,
  Check,
  Filter,
  Download,
  Search,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import { ShowNitDetails } from "@/components/ShowNitDetails";
import type { Deposit } from "@/types";
import { formatDate } from "@/utils/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MarkPaidButton } from "./MarkPaidButton";
import { motion, AnimatePresence } from "framer-motion";

interface SecurityDepositsPageProps {
  deposits: Deposit[];
}

type SecurityDepositStatus = "paid" | "unpaid";

// Utility functions
const normalizeStatus = (status: SecurityDepositStatus): "paid" | "unpaid" => {
  return status === "paid" ? "paid" : "unpaid";
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const calculateMaturityDate = (completionDate: Date | null) => {
  if (!completionDate) return null;
  const maturityDate = new Date(completionDate);
  maturityDate.setMonth(maturityDate.getMonth() + 6);
  return maturityDate;
};

const calculateDaysRemaining = (maturityDate: Date | null) => {
  if (!maturityDate) return null;
  const today = new Date();
  const maturity = new Date(maturityDate);
  if (isNaN(maturity.getTime())) return null;
  const diffTime = maturity.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Table Row Component
const DepositTableRow = memo(
  ({
    deposit,
    index,
    selectedDeposits,
    onToggleSelection,
    depositStatuses,
  }: {
    deposit: Deposit;
    index: number;
    selectedDeposits: Set<string>;
    onToggleSelection: (id: string) => void;
    depositStatuses: Record<string, "paid" | "unpaid">;
  }) => {
    const { data: session } = useSession();
    if (!deposit.PaymentDetails || deposit.PaymentDetails.length === 0) {
      return null;
    }

    const paymentDetail = deposit.PaymentDetails[0];
    const worksDetails = paymentDetail.WorksDetail;
    const completionDate = worksDetails?.completionDate;
    const maturityDate = calculateMaturityDate(completionDate);
    const daysRemaining = calculateDaysRemaining(maturityDate);
    const nitDetails = worksDetails?.nitDetails;
    const bidAgency =
      worksDetails?.AwardofContract?.workorderdetails[0]?.Bidagency
        ?.agencydetails;
    // if name then farm  propertor name in () or provide name
    const agince =
      bidAgency?.agencyType === "FARM"
        ? bidAgency?.name + "(" + bidAgency.proprietorName + ")" || ""
        : bidAgency?.name;

    const currentStatus =
      depositStatuses[deposit.id] || normalizeStatus(deposit.paymentstatus);
    const isAgency = session?.user?.role === "agency";

    return (
      <TableRow className="group border-b border-slate-100 hover:bg-slate-50/80 transition-all duration-200">
        <TableCell className="px-6 py-4 w-12">
          {!isAgency && (
            <Checkbox
              checked={selectedDeposits.has(deposit.id)}
              onCheckedChange={() => onToggleSelection(deposit.id)}
              aria-label={`Select deposit ${index + 1}`}
              className="border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
            />
          )}
        </TableCell>
        <TableCell className="px-6 py-4 font-medium text-slate-500">
          {index + 1}
        </TableCell>
        <TableCell className="px-6 py-4">
          <div className="font-semibold text-slate-900 line-clamp-2 max-w-[250px]">
            {agince}
          </div>
        </TableCell>
        <TableCell className="px-6 py-4">
          {nitDetails && (
            <ShowNitDetails
              nitdetails={nitDetails.memoNumber}
              memoDate={nitDetails.memoDate}
              workslno={worksDetails?.workslno || ""}
            />
          )}
        </TableCell>
        <TableCell className="px-6 py-4 font-bold text-right text-slate-900 tracking-tight">
          {formatCurrency(deposit.securityDepositAmt)}
        </TableCell>
        <TableCell className="px-6 py-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">
              {maturityDate ? formatDate(maturityDate) : "N/A"}
            </span>
            {daysRemaining !== null && (
              <span
                className={`inline-flex items-center text-[11px] font-semibold uppercase tracking-wider ${
                  daysRemaining < 0
                    ? "text-rose-600"
                    : daysRemaining <= 7
                      ? "text-amber-600"
                      : "text-slate-500"
                }`}
              >
                {daysRemaining < 0 ? "Matured" : `${daysRemaining} days left`}
              </span>
            )}
          </div>
        </TableCell>
        <TableCell className="px-6 py-4">
          <Badge
            variant="outline"
            className={`rounded-full px-3 py-1 text-xs font-semibold border-0 ${
              currentStatus === "paid"
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                : "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20"
            }`}
          >
            {currentStatus === "paid" ? "Paid" : "Unpaid"}
          </Badge>
        </TableCell>
        <TableCell className="px-6 py-4 text-right">
          {currentStatus === "unpaid" && !isAgency && (
            <MarkPaidButton depositId={deposit.id} />
          )}
        </TableCell>
      </TableRow>
    );
  },
);

DepositTableRow.displayName = "DepositTableRow";

export function SecurityDepositsPage({ deposits }: SecurityDepositsPageProps) {
  const { data: session } = useSession();
  const isAgency = session?.user?.role === "agency";
  const [selectedDeposits, setSelectedDeposits] = useState<Set<string>>(
    new Set(),
  );
  const [selectedFund, setSelectedFund] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("unpaid");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [depositStatuses, setDepositStatuses] = useState<
    Record<string, "paid" | "unpaid">
  >(() => {
    const initialStatuses: Record<string, "paid" | "unpaid"> = {};
    deposits.forEach((deposit) => {
      initialStatuses[deposit.id] = normalizeStatus(deposit.paymentstatus);
    });
    return initialStatuses;
  });

  // Memoize fund types
  const fundTypes = useMemo(
    () =>
      Array.from(
        new Set(
          deposits
            .map(
              (d) =>
                d.PaymentDetails?.[0]?.WorksDetail?.ApprovedActionPlanDetails
                  ?.schemeName,
            )
            .filter(Boolean),
        ),
      ),
    [deposits],
  );

  // Memoize filtered deposits
  const filteredDeposits = useMemo(
    () =>
      deposits.filter((deposit) => {
        const fundMatch =
          selectedFund === "all" ||
          deposit.PaymentDetails?.[0]?.WorksDetail?.ApprovedActionPlanDetails
            ?.schemeName === selectedFund;

        const currentStatus =
          depositStatuses[deposit.id] || normalizeStatus(deposit.paymentstatus);
        const statusMatch =
          statusFilter === "all" ||
          (statusFilter === "paid" && currentStatus === "paid") ||
          (statusFilter === "unpaid" && currentStatus === "unpaid");

        // Search functionality
        const bidAgency =
          deposit.PaymentDetails?.[0]?.WorksDetail?.AwardofContract
            ?.workorderdetails[0]?.Bidagency?.agencydetails.name || "";
        const nitNumber = String(
          deposit.PaymentDetails?.[0]?.WorksDetail?.nitDetails?.memoNumber ||
            "",
        );
        const searchMatch =
          searchQuery === "" ||
          bidAgency.toLowerCase().includes(searchQuery.toLowerCase()) ||
          nitNumber.toLowerCase().includes(searchQuery.toLowerCase());

        return fundMatch && statusMatch && searchMatch;
      }),
    [deposits, selectedFund, statusFilter, depositStatuses, searchQuery],
  );

  // Memoize summary calculations
  const summary = useMemo(() => {
    let maturedCount = 0;
    let approachingCount = 0;
    let activeCount = 0;
    let totalDeposits = 0;

    filteredDeposits.forEach((deposit) => {
      const paymentDetail = deposit.PaymentDetails?.[0];
      const worksDetails = paymentDetail?.WorksDetail;
      const completionDate = worksDetails?.completionDate;
      const maturityDate = calculateMaturityDate(completionDate);
      const daysRemaining = calculateDaysRemaining(maturityDate);

      if (daysRemaining === null) return;

      if (daysRemaining < 0) {
        maturedCount++;
      } else if (daysRemaining <= 7) {
        approachingCount++;
      } else {
        activeCount++;
      }

      totalDeposits += deposit.securityDepositAmt;
    });

    return { maturedCount, approachingCount, activeCount, totalDeposits };
  }, [filteredDeposits]);

  const toggleDepositSelection = useCallback((depositId: string) => {
    setSelectedDeposits((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(depositId)) {
        newSelection.delete(depositId);
      } else {
        newSelection.add(depositId);
      }
      return newSelection;
    });
  }, []);

  const toggleAllDeposits = useCallback(() => {
    setSelectedDeposits((prev) =>
      prev.size === filteredDeposits.length
        ? new Set()
        : new Set(filteredDeposits.map((d) => d.id)),
    );
  }, [filteredDeposits]);

  const markSelectedAsPaid = useCallback(() => {
    setDepositStatuses((prev) => {
      const newStatuses = { ...prev };
      selectedDeposits.forEach((depositId) => {
        newStatuses[depositId] = "paid";
      });
      return newStatuses;
    });
    setSelectedDeposits(new Set());
  }, [selectedDeposits]);

  const exportToPDF = useCallback(() => {
    // PDF Generation Logic remains exactly the same...
    try {
      const doc = new jsPDF("landscape", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Security Deposits Report", pageWidth / 2, 20, {
        align: "center",
      });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const currentDate = new Date().toLocaleDateString("en-IN");
      const fundFilterText =
        selectedFund === "all" ? "All Fund Types" : selectedFund;
      const statusFilterText =
        statusFilter === "all" ? "All Statuses" : statusFilter;
      doc.text(
        `Generated on: ${currentDate} | Fund: ${fundFilterText} | Status: ${statusFilterText}`,
        pageWidth / 2,
        30,
        { align: "center" },
      );

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Summary:", 14, 45);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Total Deposits: ${formatCurrency(summary.totalDeposits)}`,
        14,
        52,
      );
      doc.text(
        `Active: ${summary.activeCount} | Approaching Maturity: ${summary.approachingCount} | Matured: ${summary.maturedCount}`,
        14,
        59,
      );

      const tableData = filteredDeposits.map((deposit, index) => {
        const paymentDetail = deposit.PaymentDetails?.[0];
        const worksDetails = paymentDetail?.WorksDetail;
        const nitDetails = worksDetails?.nitDetails;
        const bidAgency =
          worksDetails?.AwardofContract?.workorderdetails[0]?.Bidagency
            ?.agencydetails.name || "N/A";
        const completionDate = worksDetails?.completionDate;
        const maturityDate = calculateMaturityDate(completionDate);
        const daysRemaining = calculateDaysRemaining(maturityDate);
        const currentStatus =
          depositStatuses[deposit.id] || normalizeStatus(deposit.paymentstatus);

        return [
          index + 1,
          bidAgency,
          nitDetails?.memoNumber || "N/A",
          deposit.securityDepositAmt,
          maturityDate ? formatDate(maturityDate) : "N/A",
          daysRemaining === null
            ? "N/A"
            : daysRemaining < 0
              ? "Matured"
              : `${daysRemaining} days`,
          currentStatus === "paid" ? "Paid" : "unpaid",
        ];
      });

      autoTable(doc, {
        head: [
          [
            "Sl No",
            "Agency Name",
            "NIT Details",
            "Amount",
            "Maturity Date",
            "Days Remaining",
            "Status",
          ],
        ],
        body: tableData,
        startY: 70,
        theme: "striped",
        headStyles: {
          fillColor: [79, 70, 229],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 10,
          halign: "center",
        },
        bodyStyles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { halign: "center", cellWidth: 15 },
          1: { halign: "left", cellWidth: 50 },
          2: { halign: "left", cellWidth: 35 },
          3: { halign: "right", cellWidth: 35 },
          4: { halign: "center", cellWidth: 30 },
          5: { halign: "center", cellWidth: 30 },
          6: { halign: "center", cellWidth: 25 },
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { top: 70, left: 14, right: 14 },
        didParseCell: (data) => {
          if (data.column.index === 6 && data.section === "body") {
            if (data.cell.text[0] === "Paid") {
              data.cell.styles.textColor = [16, 185, 129];
              data.cell.styles.fontStyle = "bold";
            } else {
              data.cell.styles.textColor = [225, 29, 72];
              data.cell.styles.fontStyle = "bold";
            }
          }
          if (data.column.index === 5 && data.section === "body") {
            const daysText = data.cell.text[0];
            if (daysText !== "N/A") {
              if (daysText === "Matured") {
                data.cell.styles.textColor = [225, 29, 72];
                data.cell.styles.fontStyle = "bold";
              } else if (!isNaN(parseInt(daysText))) {
                const days = parseInt(daysText);
                if (days <= 7) {
                  data.cell.styles.textColor = [245, 158, 11];
                  data.cell.styles.fontStyle = "bold";
                }
              }
            }
          }
        },
      });

      const finalY = (doc as any).lastAutoTable.finalY || 70;
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text(
        "© Security Deposits Management System",
        pageWidth / 2,
        finalY + 20,
        { align: "center" },
      );

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - 20,
          doc.internal.pageSize.getHeight() - 10,
          { align: "right" },
        );
      }

      doc.save(
        `security-deposits-${new Date().toISOString().slice(0, 10)}.pdf`,
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    }
  }, [filteredDeposits, selectedFund, statusFilter, depositStatuses, summary]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 text-slate-900">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-7xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <span className="bg-indigo-600/10 p-2 rounded-xl text-indigo-600">
                <IndianRupee className="h-7 w-7" strokeWidth={2.5} />
              </span>
              Security Deposits
            </h1>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">
              Monitor, track, and manage all contractor security deposits.
            </p>
          </div>
          <Button
            className="bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 transition-all rounded-xl px-5 h-11"
            onClick={exportToPDF}
          >
            <Download className="h-4 w-4 mr-2 text-indigo-500" />
            Export Report
          </Button>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 shadow-sm ring-1 ring-slate-200 overflow-hidden bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">
                    Total Value
                  </p>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                    {formatCurrency(summary.totalDeposits)}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center">
                  <IndianRupee className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-slate-200 overflow-hidden bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">
                    Active Deposits
                  </p>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                    {summary.activeCount}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CalendarCheck className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-slate-200 overflow-hidden bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">
                    Approaching Maturity
                  </p>
                  <h3 className="text-2xl font-bold tracking-tight text-amber-600">
                    {summary.approachingCount}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-amber-50 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-slate-200 overflow-hidden bg-white">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">Matured</p>
                  <h3 className="text-2xl font-bold tracking-tight text-rose-600">
                    {summary.maturedCount}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-rose-50 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Unified Toolbar (Search & Filters) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search agency name or NIT number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 bg-slate-50/50 border-slate-200 rounded-xl focus-visible:ring-indigo-500 w-full"
            />
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <Select value={selectedFund} onValueChange={setSelectedFund}>
              <SelectTrigger className="w-full md:w-[200px] h-11 border-slate-200 rounded-xl bg-slate-50/50">
                <Filter className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Fund Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Funds</SelectItem>
                {fundTypes.map((fund) => (
                  <SelectItem key={fund} value={fund}>
                    {fund}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[160px] h-11 border-slate-200 rounded-xl bg-slate-50/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Bulk Actions Banner */}
        <AnimatePresence>
          {selectedDeposits.size > 0 && !isAgency && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            >
              <div className="bg-indigo-600 text-white rounded-2xl shadow-lg p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 font-medium">
                  <div className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    {selectedDeposits.size} selected
                  </div>
                  <span>Ready to update statuses?</span>
                </div>
                <Button
                  onClick={markSelectedAsPaid}
                  variant="secondary"
                  className="bg-white text-indigo-700 hover:bg-slate-50 border-0 shadow-sm w-full sm:w-auto rounded-xl"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Paid
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Data Table Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-0 shadow-sm ring-1 ring-slate-200 rounded-2xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 py-5 bg-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  Deposit Ledger
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-600 hover:bg-slate-100 font-medium px-3"
                >
                  {filteredDeposits.length} Records
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredDeposits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-slate-50/30">
                  <div className="bg-slate-100 p-5 rounded-full mb-5 shadow-inner">
                    <Search className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">
                    No Records Found
                  </h3>
                  <p className="text-slate-500 max-w-sm text-sm">
                    We couldn&apos;t find any deposits matching your current
                    filters and search term.
                  </p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedFund("all");
                      setStatusFilter("all");
                    }}
                    className="mt-4 text-indigo-600"
                  >
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12 px-6 py-4">
                          {!isAgency && (
                            <Checkbox
                              checked={
                                selectedDeposits.size ===
                                  filteredDeposits.length &&
                                filteredDeposits.length > 0
                              }
                              onCheckedChange={toggleAllDeposits}
                              aria-label="Select all deposits"
                              className="border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            />
                          )}
                        </TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          #
                        </TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Agency
                        </TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          NIT Details
                        </TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                          Amount
                        </TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Maturity
                        </TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Status
                        </TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDeposits.map((deposit, index) => (
                        <DepositTableRow
                          key={deposit.id}
                          deposit={deposit}
                          index={index}
                          selectedDeposits={selectedDeposits}
                          onToggleSelection={toggleDepositSelection}
                          depositStatuses={depositStatuses}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
