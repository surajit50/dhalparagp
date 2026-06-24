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
  AlertTriangle,
  Briefcase,
  X,
  Building2,
  Hash,
  Calendar,
  TrendingDown,
  ShieldCheck,
  Layers,
  SlidersHorizontal,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

// ─── Work Details Dialog ──────────────────────────────────────────────────────
const WorkDetailsDialog = ({
  deposit,
  open,
  onClose,
}: {
  deposit: Deposit | null;
  open: boolean;
  onClose: () => void;
}) => {
  if (!deposit) return null;

  const paymentDetail = deposit.PaymentDetails[0];
  const worksDetails = paymentDetail?.WorksDetail;
  const nitDetails = worksDetails?.nitDetails;
  const completionDate = worksDetails?.completionDate;
  const maturityDate = calculateMaturityDate(completionDate);
  const daysRemaining = calculateDaysRemaining(maturityDate);

  const bidAgency =
    worksDetails?.AwardofContract?.workorderdetails[0]?.Bidagency?.agencydetails;
  const agencyName =
    bidAgency?.agencyType === "FARM"
      ? bidAgency?.name + "(" + bidAgency.proprietorName + ")" || ""
      : bidAgency?.name;

  const workName =
    worksDetails?.ApprovedActionPlanDetails?.activityDescription || "N/A";

  const isMature = daysRemaining !== null && daysRemaining < 0;
  const isApproaching =
    daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 7;

  const statusColor = isMature
    ? { bg: "from-rose-500 to-rose-600", badge: "bg-rose-100 text-rose-700 ring-rose-300", text: "text-rose-700", subtext: "text-rose-600", cardBg: "bg-rose-50 border-rose-100" }
    : isApproaching
      ? { bg: "from-amber-500 to-orange-500", badge: "bg-amber-100 text-amber-700 ring-amber-300", text: "text-amber-700", subtext: "text-amber-600", cardBg: "bg-amber-50 border-amber-100" }
      : { bg: "from-emerald-500 to-teal-600", badge: "bg-emerald-100 text-emerald-700 ring-emerald-300", text: "text-emerald-700", subtext: "text-emerald-600", cardBg: "bg-emerald-50 border-emerald-100" };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        {/* Gradient Header */}
        <div className={`bg-gradient-to-r ${statusColor.bg} px-6 pt-6 pb-8 relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }} />
          <DialogHeader className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-white">
                    Work Details
                  </DialogTitle>
                  <p className="text-xs text-white/75 mt-0.5">
                    Security deposit information
                  </p>
                </div>
              </div>
              {daysRemaining !== null && (
                <Badge className={`rounded-full px-3 py-1 text-xs font-semibold border-0 ring-1 ${statusColor.badge}`}>
                  {isMature ? "Matured" : `${daysRemaining} days left`}
                </Badge>
              )}
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4 bg-white -mt-4 rounded-t-3xl relative z-10">
          {/* Work Name */}
          <div className="rounded-xl bg-orange-50 border border-orange-100 p-4">
            <div className="flex items-start gap-3">
              <div className="bg-orange-100 p-1.5 rounded-lg mt-0.5 shrink-0">
                <Briefcase className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">
                  Work Name
                </p>
                <p className="text-sm font-semibold text-slate-800 leading-snug">
                  {workName}
                </p>
              </div>
            </div>
          </div>

          {/* Agency Name */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="bg-slate-200 p-1.5 rounded-lg mt-0.5 shrink-0">
              <Building2 className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Agency / Contractor
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {agencyName || "N/A"}
              </p>
            </div>
          </div>

          {/* NIT Details & Deposit Info grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="h-3.5 w-3.5 text-slate-400" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  NIT No.
                </p>
              </div>
              <p className="text-sm font-bold text-slate-800">
                {nitDetails?.memoNumber || "N/A"}
              </p>
              {nitDetails?.memoDate && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatDate(nitDetails.memoDate)}
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Deposit Amount
                </p>
              </div>
              <p className="text-sm font-bold text-slate-800">
                {formatCurrency(deposit.securityDepositAmt)}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Completion Date
                </p>
              </div>
              <p className="text-sm font-medium text-slate-700">
                {completionDate ? formatDate(completionDate) : "N/A"}
              </p>
            </div>

            <div className={`p-4 rounded-xl border ${statusColor.cardBg}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className={`h-3.5 w-3.5 ${statusColor.subtext}`} />
                <p className={`text-[10px] font-bold uppercase tracking-widest ${statusColor.subtext}`}>
                  Maturity Date
                </p>
              </div>
              <p className={`text-sm font-bold ${statusColor.text}`}>
                {maturityDate ? formatDate(maturityDate) : "N/A"}
              </p>
              {daysRemaining !== null && (
                <p className={`text-xs font-semibold mt-0.5 ${statusColor.subtext}`}>
                  {isMature ? "Already Matured" : `${daysRemaining} days left`}
                </p>
              )}
            </div>
          </div>

          {/* Work Sl No */}
          {worksDetails?.workslno && (
            <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Work Sl. No.
              </span>
              <span className="text-sm font-bold text-slate-800">
                {worksDetails.workslno}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <Button
            onClick={onClose}
            className="h-9 px-5 bg-slate-800 text-white hover:bg-slate-700 rounded-xl text-sm font-medium"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Table Row Component ──────────────────────────────────────────────────────
const DepositTableRow = memo(
  ({
    deposit,
    index,
    selectedDeposits,
    onToggleSelection,
    depositStatuses,
    onViewDetails,
  }: {
    deposit: Deposit;
    index: number;
    selectedDeposits: Set<string>;
    onToggleSelection: (id: string) => void;
    depositStatuses: Record<string, "paid" | "unpaid">;
    onViewDetails: (deposit: Deposit) => void;
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
    const agince =
      bidAgency?.agencyType === "FARM"
        ? bidAgency?.name + "(" + bidAgency.proprietorName + ")" || ""
        : bidAgency?.name;

    const workName =
      worksDetails?.ApprovedActionPlanDetails?.activityDescription;

    const currentStatus =
      depositStatuses[deposit.id] || normalizeStatus(deposit.paymentstatus);
    const isAgency = session?.user?.role === "agency";

    const isMature = daysRemaining !== null && daysRemaining < 0;
    const isApproaching =
      daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= 7;

    const rowAccent = isMature
      ? "border-l-rose-500 bg-rose-50/30 hover:bg-rose-50/60"
      : isApproaching
        ? "border-l-amber-500 bg-amber-50/20 hover:bg-amber-50/50"
        : "border-l-transparent hover:bg-slate-50/80";

    return (
      <TableRow
        className={`group border-b border-slate-100 border-l-4 transition-all duration-200 ${rowAccent}`}
      >
        <TableCell className="px-5 py-4 w-12">
          {!isAgency && (
            <Checkbox
              checked={selectedDeposits.has(deposit.id)}
              onCheckedChange={() => onToggleSelection(deposit.id)}
              aria-label={`Select deposit ${index + 1}`}
              className="border-slate-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
            />
          )}
        </TableCell>
        <TableCell className="px-5 py-4">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
            {index + 1}
          </span>
        </TableCell>
        <TableCell className="px-5 py-4">
          <div className="space-y-1">
            <div className="font-semibold text-slate-900 line-clamp-2 max-w-[240px] text-sm">
              {agince}
            </div>
            {workName && (
              <button
                onClick={() => onViewDetails(deposit)}
                className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 hover:underline font-medium transition-colors max-w-[240px] text-left"
                title="Click to view work details"
              >
                <Briefcase className="h-3 w-3 shrink-0" />
                <span className="line-clamp-1">{workName}</span>
              </button>
            )}
          </div>
        </TableCell>
        <TableCell className="px-5 py-4">
          {nitDetails && (
            <ShowNitDetails
              nitdetails={nitDetails.memoNumber}
              memoDate={nitDetails.memoDate}
              workslno={worksDetails?.workslno || ""}
            />
          )}
        </TableCell>
        <TableCell className="px-5 py-4 text-right">
          <span className="font-bold text-slate-900 tabular-nums text-sm">
            {formatCurrency(deposit.securityDepositAmt)}
          </span>
        </TableCell>
        <TableCell className="px-5 py-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">
              {maturityDate ? formatDate(maturityDate) : "N/A"}
            </span>
            {daysRemaining !== null && (
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit ${
                  daysRemaining < 0
                    ? "bg-rose-100 text-rose-700"
                    : daysRemaining <= 7
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {daysRemaining < 0 ? "● Matured" : `${daysRemaining}d left`}
              </span>
            )}
          </div>
        </TableCell>
        <TableCell className="px-5 py-4">
          <Badge
            variant="outline"
            className={`rounded-full px-3 py-1 text-xs font-semibold border-0 ${
              currentStatus === "paid"
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                : "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20"
            }`}
          >
            {currentStatus === "paid" ? "✓ Paid" : "● Unpaid"}
          </Badge>
        </TableCell>
        <TableCell className="px-5 py-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onViewDetails(deposit)}
              className="h-8 w-8 p-0 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
              title="View work details"
            >
              <Briefcase className="h-4 w-4" />
            </Button>
            {currentStatus === "unpaid" && !isAgency && (
              <MarkPaidButton depositId={deposit.id} />
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  },
);

DepositTableRow.displayName = "DepositTableRow";

// ─── Summary Stat Card ────────────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  icon: Icon,
  gradient,
  delay,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  gradient: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay }}
  >
    <Card className={`border-0 shadow-md overflow-hidden bg-gradient-to-br ${gradient} text-white`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-1">
              {label}
            </p>
            <p className="text-2xl font-extrabold tracking-tight">{value}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export function SecurityDepositsPage({ deposits }: SecurityDepositsPageProps) {
  const { data: session } = useSession();
  const isAgency = session?.user?.role === "agency";
  const [selectedDeposits, setSelectedDeposits] = useState<Set<string>>(
    new Set(),
  );
  const [selectedFund, setSelectedFund] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("unpaid");
  const [maturityFilter, setMaturityFilter] = useState<string>("all");
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

  const [selectedWorkDeposit, setSelectedWorkDeposit] =
    useState<Deposit | null>(null);
  const [workDialogOpen, setWorkDialogOpen] = useState(false);

  const openWorkDetails = useCallback((deposit: Deposit) => {
    setSelectedWorkDeposit(deposit);
    setWorkDialogOpen(true);
  }, []);

  const closeWorkDetails = useCallback(() => {
    setWorkDialogOpen(false);
  }, []);

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

        const paymentDetail = deposit.PaymentDetails?.[0];
        const completionDate = paymentDetail?.WorksDetail?.completionDate;
        const maturityDate = calculateMaturityDate(completionDate);
        const daysRemaining = calculateDaysRemaining(maturityDate);

        const maturityMatch =
          maturityFilter === "all" ||
          (maturityFilter === "mature" &&
            daysRemaining !== null &&
            daysRemaining < 0) ||
          (maturityFilter === "unmature" &&
            daysRemaining !== null &&
            daysRemaining >= 0) ||
          (maturityFilter === "approaching" &&
            daysRemaining !== null &&
            daysRemaining >= 0 &&
            daysRemaining <= 7);

        const bidAgency =
          deposit.PaymentDetails?.[0]?.WorksDetail?.AwardofContract
            ?.workorderdetails[0]?.Bidagency?.agencydetails.name || "";
        const nitNumber = String(
          deposit.PaymentDetails?.[0]?.WorksDetail?.nitDetails?.memoNumber ||
            "",
        );
        const workName =
          deposit.PaymentDetails?.[0]?.WorksDetail?.ApprovedActionPlanDetails
            ?.activityDescription || "";
        const searchMatch =
          searchQuery === "" ||
          bidAgency.toLowerCase().includes(searchQuery.toLowerCase()) ||
          nitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          workName.toLowerCase().includes(searchQuery.toLowerCase());

        return fundMatch && statusMatch && maturityMatch && searchMatch;
      }),
    [
      deposits,
      selectedFund,
      statusFilter,
      maturityFilter,
      depositStatuses,
      searchQuery,
    ],
  );

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
      const maturityFilterText =
        maturityFilter === "all"
          ? "All"
          : maturityFilter === "mature"
            ? "Matured"
            : maturityFilter === "unmature"
              ? "Un-Matured"
              : "Approaching";
      doc.text(
        `Generated on: ${currentDate} | Fund: ${fundFilterText} | Status: ${statusFilterText} | Maturity: ${maturityFilterText}`,
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
        const workName =
          worksDetails?.ApprovedActionPlanDetails?.activityDescription || "N/A";

        return [
          index + 1,
          bidAgency,
          workName,
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
            "Work Name",
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
          fillColor: [234, 88, 12],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 10,
          halign: "center",
        },
        bodyStyles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
          0: { halign: "center", cellWidth: 12 },
          1: { halign: "left", cellWidth: 40 },
          2: { halign: "left", cellWidth: 50 },
          3: { halign: "left", cellWidth: 30 },
          4: { halign: "right", cellWidth: 30 },
          5: { halign: "center", cellWidth: 28 },
          6: { halign: "center", cellWidth: 28 },
          7: { halign: "center", cellWidth: 22 },
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { top: 70, left: 14, right: 14 },
        didParseCell: (data) => {
          if (data.column.index === 7 && data.section === "body") {
            if (data.cell.text[0] === "Paid") {
              data.cell.styles.textColor = [16, 185, 129];
              data.cell.styles.fontStyle = "bold";
            } else {
              data.cell.styles.textColor = [225, 29, 72];
              data.cell.styles.fontStyle = "bold";
            }
          }
          if (data.column.index === 6 && data.section === "body") {
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
  }, [
    filteredDeposits,
    selectedFund,
    statusFilter,
    maturityFilter,
    depositStatuses,
    summary,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-100 pb-16 text-slate-900">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-7xl space-y-7">

        {/* ── Hero Header ───────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 p-6 sm:p-8 shadow-xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          
        >
          {/* decorative circles */}
          <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/10" />
          <div className="absolute top-6 right-24 h-20 w-20 rounded-full bg-white/5" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-inner">
                <ShieldCheck className="h-7 w-7 text-white" strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  Security Deposits
                </h1>
                <p className="text-orange-100/80 mt-1 text-sm">
                  Monitor, track &amp; manage all contractor security deposits
                </p>
              </div>
            </div>
            <Button
              onClick={exportToPDF}
              className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 transition-all rounded-xl px-5 h-11 font-semibold shadow-sm w-fit"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </motion.div>
        </div>

        {/* ── Summary Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Value"
            value={formatCurrency(summary.totalDeposits)}
            icon={IndianRupee}
            gradient="from-orange-500 to-amber-500"
            delay={0.05}
          />
          <StatCard
            label="Active Deposits"
            value={summary.activeCount}
            icon={CalendarCheck}
            gradient="from-emerald-500 to-teal-600"
            delay={0.1}
          />
          <StatCard
            label="Approaching Maturity"
            value={summary.approachingCount}
            icon={Clock}
            gradient="from-amber-500 to-orange-400"
            delay={0.15}
          />
          <StatCard
            label="Matured"
            value={summary.maturedCount}
            icon={AlertTriangle}
            gradient="from-rose-500 to-red-600"
            delay={0.2}
          />
        </div>

        {/* ── Toolbar ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          
        >
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Search agency, work name or NIT number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-orange-500 text-sm w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-slate-200 my-1" />

            {/* Filters row */}
            <div className="flex flex-wrap gap-2 items-center">
              <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0" />

              <Select value={selectedFund} onValueChange={setSelectedFund}>
                <SelectTrigger className="w-[160px] h-10 border-slate-200 rounded-xl bg-slate-50 text-sm">
                  <Layers className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
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
                <SelectTrigger className="w-[140px] h-10 border-slate-200 rounded-xl bg-slate-50 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>

              <Select value={maturityFilter} onValueChange={setMaturityFilter}>
                <SelectTrigger
                  className={`w-[160px] h-10 rounded-xl border text-sm ${
                    maturityFilter === "mature"
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : maturityFilter === "unmature"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : maturityFilter === "approaching"
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <AlertTriangle
                    className={`h-3.5 w-3.5 mr-1.5 ${
                      maturityFilter === "mature"
                        ? "text-rose-500"
                        : maturityFilter === "unmature"
                          ? "text-emerald-500"
                          : maturityFilter === "approaching"
                            ? "text-amber-500"
                            : "text-slate-400"
                    }`}
                  />
                  <SelectValue placeholder="Maturity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Maturity</SelectItem>
                  <SelectItem value="mature">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" />
                      Matured
                    </div>
                  </SelectItem>
                  <SelectItem value="unmature">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                      Un-Matured
                    </div>
                  </SelectItem>
                  <SelectItem value="approaching">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
                      Approaching (≤7 days)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filter chips */}
          {(maturityFilter !== "all" ||
            statusFilter !== "unpaid" ||
            selectedFund !== "all") && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 self-center">
                Active:
              </span>
              {maturityFilter !== "all" && (
                <button
                  onClick={() => setMaturityFilter("all")}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    maturityFilter === "mature"
                      ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                      : maturityFilter === "unmature"
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  }`}
                >
                  {maturityFilter === "mature"
                    ? "Matured"
                    : maturityFilter === "unmature"
                      ? "Un-Matured"
                      : "Approaching"}
                  <X className="h-3 w-3" />
                </button>
              )}
              {statusFilter !== "unpaid" && statusFilter !== "all" && (
                <button
                  onClick={() => setStatusFilter("unpaid")}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-all"
                >
                  {statusFilter === "paid" ? "Paid" : "Unpaid"}
                  <X className="h-3 w-3" />
                </button>
              )}
              {selectedFund !== "all" && (
                <button
                  onClick={() => setSelectedFund("all")}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
                >
                  {selectedFund}
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </motion.div>
</div>
        {/* ── Bulk Actions Banner ───────────────────────────────────── */}
        <AnimatePresence>
          {selectedDeposits.size > 0 && !isAgency && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-2xl shadow-lg p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 font-medium">
                  <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                    {selectedDeposits.size} selected
                  </div>
                  <span className="text-white/90">Ready to update statuses?</span>
                </div>
                <Button
                  onClick={markSelectedAsPaid}
                  variant="secondary"
                  className="bg-white text-orange-700 hover:bg-slate-50 border-0 shadow-sm w-full sm:w-auto rounded-xl font-semibold"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Paid
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Data Table Card ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-0 shadow-sm ring-1 ring-slate-200 rounded-2xl overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 py-4 px-6 bg-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-500" />
                  Deposit Ledger
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-orange-50 text-orange-700 border border-orange-200 font-semibold px-3 rounded-full text-xs"
                  >
                    {filteredDeposits.length} Records
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredDeposits.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                  <div className="relative mb-6">
                    <div className="bg-slate-100 p-6 rounded-full">
                      <Search className="h-10 w-10 text-slate-300" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-orange-100 p-1.5 rounded-full">
                      <Filter className="h-3.5 w-3.5 text-orange-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">
                    No Records Found
                  </h3>
                  <p className="text-slate-500 max-w-xs text-sm">
                    No deposits match your current filters and search criteria.
                  </p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedFund("all");
                      setStatusFilter("all");
                      setMaturityFilter("all");
                    }}
                    className="mt-4 text-orange-600 font-semibold"
                  >
                    Clear all filters
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/90 border-b border-slate-200">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12 px-5 py-3.5">
                          {!isAgency && (
                            <Checkbox
                              checked={
                                selectedDeposits.size ===
                                  filteredDeposits.length &&
                                filteredDeposits.length > 0
                              }
                              onCheckedChange={toggleAllDeposits}
                              aria-label="Select all deposits"
                              className="border-slate-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                            />
                          )}
                        </TableHead>
                        <TableHead className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 w-10">
                          #
                        </TableHead>
                        <TableHead className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          Agency / Work
                        </TableHead>
                        <TableHead className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          NIT Details
                        </TableHead>
                        <TableHead className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">
                          Amount
                        </TableHead>
                        <TableHead className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          Maturity
                        </TableHead>
                        <TableHead className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          Status
                        </TableHead>
                        <TableHead className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">
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
                          onViewDetails={openWorkDetails}
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

      {/* Work Details Dialog */}
      <WorkDetailsDialog
        deposit={selectedWorkDeposit}
        open={workDialogOpen}
        onClose={closeWorkDetails}
      />
    </div>
  );
}
