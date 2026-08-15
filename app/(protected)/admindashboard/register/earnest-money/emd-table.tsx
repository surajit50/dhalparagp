"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Search,
  Filter,
  FileText,
  Plus,
  Shield,
  RotateCcw,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  Globe,
  FileEdit,
  IndianRupee,
  Calendar,
  Building2,
  RefreshCw,
  AlertTriangle,
  Layers,
  ClipboardCheck,
  SlidersHorizontal,
  Eye,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate } from "@/utils/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmdTableProps {
  data: any[];
  pendingCandidatesCount?: number;
  blockedOnlineWorksCount?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const REGISTER_STATUSES = [
  {
    value: "RECEIVED",
    label: "Received",
    bg: "bg-emerald-500",
    ring: "ring-emerald-600/20",
    shadow: "shadow-emerald-500/30",
    light: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    value: "HELD",
    label: "Held",
    bg: "bg-amber-500",
    ring: "ring-amber-600/20",
    shadow: "shadow-amber-500/30",
    light: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    value: "REFUND_DUE",
    label: "Refund Due",
    bg: "bg-blue-500",
    ring: "ring-blue-600/20",
    shadow: "shadow-blue-500/30",
    light: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    value: "REFUNDED",
    label: "Refunded",
    bg: "bg-indigo-500",
    ring: "ring-indigo-600/20",
    shadow: "shadow-indigo-500/30",
    light: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    value: "ADJUSTED",
    label: "Adjusted",
    bg: "bg-purple-500",
    ring: "ring-purple-600/20",
    shadow: "shadow-purple-500/30",
    light: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    value: "FORFEITED",
    label: "Forfeited",
    bg: "bg-rose-500",
    ring: "ring-rose-600/20",
    shadow: "shadow-rose-500/30",
    light: "bg-rose-50 text-rose-700 border-rose-200",
  },
] as const;

type RegisterStatusValue = (typeof REGISTER_STATUSES)[number]["value"];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Cash",
  CHEQUE: "Cheque",
  ONLINE_TRANSFER: "Online Transfer",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

function getStatusMeta(status: string | null | undefined) {
  const meta = REGISTER_STATUSES.find((s) => s.value === status);
  return (
    meta ?? {
      value: "HELD",
      label: "Held",
      bg: "bg-amber-500",
      ring: "ring-amber-600/20",
      shadow: "shadow-amber-500/30",
      light: "bg-amber-50 text-amber-700 border-amber-200",
    }
  );
}

function getEffectiveStatus(entry: any): RegisterStatusValue {
  if (entry.registerStatus) return entry.registerStatus;
  switch (entry.paymentstatus) {
    case "paid":
      return "RECEIVED";
    case "refunded":
      return "REFUNDED";
    case "forfeited":
      return "FORFEITED";
    default:
      return "HELD";
  }
}

function getAgencyName(entry: any): string {
  const agency =
    entry.bidderName?.agencydetails ||
    entry.bidderName?.WorksDetail?.biddingAgencies?.[0]?.agencydetails;
  if (!agency?.name) return "Unknown Agency";
  if (agency.agencyType === "FARM" && agency.proprietorName) {
    return `${agency.name} (${agency.proprietorName})`;
  }
  return agency.name;
}

// ─── Metric Card ─────────────────────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  colorClass,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  colorClass: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="relative overflow-hidden border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/60 backdrop-blur-xl hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1.5 group rounded-[2rem]">
        <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div
              className={`h-12 w-12 ${colorClass} rounded-2xl flex items-center justify-center ring-1 group-hover:scale-110 transition-all duration-300`}
            >
              {icon}
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {label}
            </p>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              {value}
            </h3>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string | null | undefined }) {
  const meta = getStatusMeta(status);
  return (
    <Badge
      variant="outline"
      className={`rounded-full px-3 py-1 text-xs font-semibold border-0 shadow-sm ${meta.bg} text-white ${meta.shadow} ring-1 ${meta.ring}`}
    >
      {meta.label}
    </Badge>
  );
}

// ─── Update Status Dialog ─────────────────────────────────────────────────────

function UpdateStatusDialog({
  entry,
  open,
  onClose,
  onSuccess,
}: {
  entry: any;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [status, setStatus] = useState<RegisterStatusValue>(
    getEffectiveStatus(entry)
  );
  const [paymentMethod, setPaymentMethod] = useState<string>(
    entry.paymentMethod || "ONLINE_TRANSFER"
  );
  const [amountReceived, setAmountReceived] = useState<string>(
    String(entry.amountReceived || entry.earnestMoneyAmount || "")
  );
  const [receiptNumber, setReceiptNumber] = useState<string>(
    entry.receiptNumber || ""
  );
  const [receiptDate, setReceiptDate] = useState<string>(
    entry.receiptDate
      ? new Date(entry.receiptDate).toISOString().split("T")[0]
      : ""
  );
  const [remarks, setRemarks] = useState<string>(entry.remarks || "");
  const [loading, setLoading] = useState(false);

  const needsReceiptInfo = ["RECEIVED", "REFUNDED", "ADJUSTED"].includes(status);
  const needsRefundInfo = ["REFUNDED"].includes(status);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const body: any = {
        registerStatus: status,
        paymentMethod,
        amountReceived: Number(amountReceived),
        receiptNumber: receiptNumber.trim() || null,
        receiptDate: receiptDate ? new Date(receiptDate).toISOString() : null,
        remarks: remarks.trim() || null,
      };

      const res = await fetch(`/api/earnest-money/${entry.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Failed to update entry");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-orange-500" />
            Update EMD Status
          </DialogTitle>
          <DialogDescription>
            Update the Earnest Money Register entry for{" "}
            <strong>{getAgencyName(entry)}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Register Status
            </label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as RegisterStatusValue)}
            >
              <SelectTrigger className="rounded-xl h-11 border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {REGISTER_STATUSES.map((s) => (
                  <SelectItem
                    key={s.value}
                    value={s.value}
                    className="rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${s.bg}`}
                      />
                      {s.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment method */}
          {needsReceiptInfo && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Payment Method
              </label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="rounded-xl h-11 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([v, l]) => (
                    <SelectItem
                      key={v}
                      value={v}
                      className="rounded-lg cursor-pointer"
                    >
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Amount Received (₹)
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="number"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                className="pl-9 rounded-xl h-11 border-slate-200"
              />
            </div>
          </div>

          {/* Receipt Number */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Receipt / Challan No.
              <span className="text-slate-400 font-normal ml-1">(optional)</span>
            </label>
            <Input
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              placeholder="Receipt or challan number"
              className="rounded-xl h-11 border-slate-200"
            />
          </div>

          {/* Receipt Date */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              {needsRefundInfo ? "Refund Date" : "Receipt Date"}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="date"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                className="pl-9 rounded-xl h-11 border-slate-200"
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              Remarks
              <span className="text-slate-400 font-normal ml-1">(optional)</span>
            </label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Notes or reason for status change..."
              rows={2}
              className="rounded-xl border-slate-200 resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-slate-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl shadow-md shadow-orange-500/20"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Update Entry"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Detail View Dialog ──────────────────────────────────────────────────────

function DetailDialog({
  entry,
  open,
  onClose,
}: {
  entry: any;
  open: boolean;
  onClose: () => void;
}) {
  const nitDetails = entry.bidderName?.WorksDetail?.nitDetails;
  const worksDetail = entry.bidderName?.WorksDetail;
  const agencyName = getAgencyName(entry);
  const status = getEffectiveStatus(entry);
  const meta = getStatusMeta(status);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-orange-500" />
            EMD Entry Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Status Banner */}
          <div
            className={`flex items-center gap-3 rounded-xl p-4 border ${meta.light}`}
          >
            <StatusBadge status={status} />
            <div>
              <p className="text-sm font-semibold">Current Status: {meta.label}</p>
              {entry.updatedAt && (
                <p className="text-xs opacity-70">
                  Last updated: {formatDate(entry.updatedAt)}
                </p>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: "NIT No.", value: entry.nitNumber ?? nitDetails?.memoNumber ?? "N/A" },
              {
                label: "NIT Date",
                value:
                  entry.nitDate
                    ? formatDate(entry.nitDate)
                    : nitDetails?.memoDate
                    ? formatDate(nitDetails.memoDate)
                    : "N/A",
              },
              {
                label: "Name of Work",
                value:
                  entry.nameOfWork ||
                  worksDetail?.ApprovedActionPlanDetails?.activityDescription ||
                  "N/A",
                span: true,
              },
              { label: "Bidder / Agency", value: agencyName },
              {
                label: "Address",
                value:
                  entry.bidderAddress ||
                  entry.bidderName?.agencydetails?.contactDetails ||
                  "N/A",
              },
              {
                label: "Tender Mode",
                value:
                  entry.tenderMode === "ONLINE"
                    ? "Online NIT"
                    : entry.tenderMode === "MANUAL"
                    ? "Manual NIT"
                    : "N/A",
              },
              {
                label: "EMD Amount",
                value: formatCurrency(entry.earnestMoneyAmount),
              },
              {
                label: "Amount Received",
                value: entry.amountReceived
                  ? formatCurrency(entry.amountReceived)
                  : "—",
              },
              { label: "EMD Mode", value: PAYMENT_METHOD_LABELS[entry.paymentMethod] || "—" },
              {
                label: "Receipt No.",
                value: entry.receiptNumber || "—",
              },
              {
                label: "Receipt Date",
                value: entry.receiptDate ? formatDate(entry.receiptDate) : "—",
              },
              {
                label: "Work Order No.",
                value: entry.workOrderMemoNumber || "—",
              },
              {
                label: "Work Order Date",
                value: entry.workOrderMemoDate
                  ? formatDate(entry.workOrderMemoDate)
                  : "—",
              },
              {
                label: "Remarks",
                value: entry.remarks || "—",
                span: true,
              },
              {
                label: "Created On",
                value: entry.createdAt ? formatDate(entry.createdAt) : "—",
              },
            ].map(({ label, value, span }) => (
              <div key={label} className={span ? "col-span-2" : ""}>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                <p className="font-semibold text-slate-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-slate-200"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Table Component ─────────────────────────────────────────────────────

export function EmdTable({
  data,
  pendingCandidatesCount = 0,
  blockedOnlineWorksCount = 0,
}: EmdTableProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Dialog state
  const [updateEntry, setUpdateEntry] = useState<any>(null);
  const [viewEntry, setViewEntry] = useState<any>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, modeFilter]);

  // Filtered data
  const filteredData = useMemo(() => {
    return data.filter((entry) => {
      const effectiveStatus = getEffectiveStatus(entry);
      const statusMatch =
        statusFilter === "all" || effectiveStatus === statusFilter;
      const tenderMode = entry.tenderMode || "MANUAL";
      const modeMatch = modeFilter === "all" || tenderMode === modeFilter;

      const nitDetails = entry.bidderName?.WorksDetail?.nitDetails;
      const agencyName = getAgencyName(entry);
      const nitNumber = String(
        entry.nitNumber ?? nitDetails?.memoNumber ?? ""
      );
      const workName =
        entry.nameOfWork ||
        entry.bidderName?.WorksDetail?.ApprovedActionPlanDetails
          ?.activityDescription ||
        "";

      const searchMatch =
        searchQuery === "" ||
        agencyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nitNumber.includes(searchQuery) ||
        workName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.receiptNumber || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return statusMatch && modeMatch && searchMatch;
    });
  }, [data, statusFilter, modeFilter, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // Metrics
  const metrics = useMemo(() => {
    const totals = {
      total: 0,
      received: 0,
      held: 0,
      refundDue: 0,
      refunded: 0,
      adjusted: 0,
      forfeited: 0,
      totalCount: filteredData.length,
    };
    filteredData.forEach((entry) => {
      const amount = entry.earnestMoneyAmount || 0;
      const status = getEffectiveStatus(entry);
      totals.total += amount;
      if (status === "RECEIVED") totals.received += amount;
      else if (status === "HELD") totals.held += amount;
      else if (status === "REFUND_DUE") totals.refundDue += amount;
      else if (status === "REFUNDED") totals.refunded += amount;
      else if (status === "ADJUSTED") totals.adjusted += amount;
      else if (status === "FORFEITED") totals.forfeited += amount;
    });
    return totals;
  }, [filteredData]);

  // PDF Export
  const exportToPDF = () => {
    try {
      const doc = new jsPDF("landscape", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Earnest Money Register", pageWidth / 2, 18, {
        align: "center",
      });

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Generated: ${new Date().toLocaleDateString("en-IN")} | Filter: ${statusFilter === "all" ? "All Statuses" : statusFilter} | Mode: ${modeFilter === "all" ? "All Modes" : modeFilter}`,
        pageWidth / 2,
        26,
        { align: "center" }
      );

      const tableData = filteredData.map((entry, idx) => {
        const nitDetails = entry.bidderName?.WorksDetail?.nitDetails;
        const nitNo = entry.nitNumber ?? nitDetails?.memoNumber ?? "N/A";
        const nitDate = entry.nitDate
          ? new Date(entry.nitDate).toLocaleDateString("en-IN")
          : nitDetails?.memoDate
          ? new Date(nitDetails.memoDate).toLocaleDateString("en-IN")
          : "N/A";
        const nameOfWork =
          entry.nameOfWork ||
          entry.bidderName?.WorksDetail?.ApprovedActionPlanDetails
            ?.activityDescription ||
          "N/A";
        const agencyName = getAgencyName(entry);
        const mode =
          entry.tenderMode === "ONLINE"
            ? "Online"
            : entry.tenderMode === "MANUAL"
            ? "Manual"
            : "N/A";
        const effectiveStatus = getEffectiveStatus(entry);
        const statusMeta = getStatusMeta(effectiveStatus);

        return [
          idx + 1,
          nitNo,
          nitDate,
          nameOfWork.substring(0, 50) + (nameOfWork.length > 50 ? "..." : ""),
          agencyName,
          mode,
          `Rs. ${entry.earnestMoneyAmount?.toLocaleString("en-IN") || 0}`,
          entry.receiptNumber || "—",
          entry.receiptDate
            ? new Date(entry.receiptDate).toLocaleDateString("en-IN")
            : "—",
          entry.workOrderMemoNumber || "—",
          statusMeta.label,
          entry.remarks || "—",
        ];
      });

      autoTable(doc, {
        head: [
          [
            "Sl",
            "NIT No",
            "NIT Date",
            "Name of Work",
            "Bidder Name",
            "Mode",
            "EMD Amount",
            "Receipt No",
            "Receipt Date",
            "WO No",
            "Status",
            "Remarks",
          ],
        ],
        body: tableData,
        startY: 32,
        theme: "striped",
        headStyles: { fillColor: [234, 88, 12], fontSize: 7, fontStyle: "bold" },
        bodyStyles: { fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 16 },
          2: { cellWidth: 18 },
          3: { cellWidth: 45 },
          4: { cellWidth: 35 },
          5: { cellWidth: 14 },
          6: { cellWidth: 20 },
          7: { cellWidth: 22 },
          8: { cellWidth: 20 },
          9: { cellWidth: 22 },
          10: { cellWidth: 18 },
          11: { cellWidth: 20 },
        },
      });

      doc.save(`earnest-money-register-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF export error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/60 backdrop-blur-2xl p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3 text-slate-900">
              <span className="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-2xl text-white shadow-lg shadow-orange-500/30 ring-1 ring-white/50">
                <Shield className="h-6 w-6" strokeWidth={2.5} />
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
                Earnest Money Register
              </span>
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium ml-[3.25rem]">
              Official register of earnest money deposits for GP tender works.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <Button
              className="bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:shadow transition-all duration-300 rounded-xl px-5 h-11 font-medium"
              onClick={exportToPDF}
            >
              <Download className="h-4 w-4 mr-2 text-orange-500" />
              Export PDF
            </Button>
            <Button
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl shadow-md shadow-orange-500/20 h-11 px-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              asChild
            >
              <Link href="/admindashboard/register/earnest-money/new">
                <Plus className="mr-2 h-4 w-4" />
                New Entry
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Pending Alert ───────────────────────────────────────────────── */}
      {pendingCandidatesCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-2xl p-4 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-800">
                {pendingCandidatesCount} bidder
                {pendingCandidatesCount !== 1 ? "s" : ""} eligible for EMD
                entry
              </p>
              <p className="text-xs text-orange-700 mt-0.5">
                There are bidders who qualify for an Earnest Money Register
                entry but have not yet been recorded.
                {blockedOnlineWorksCount > 0
                  ? ` Additionally, ${blockedOnlineWorksCount} online NIT work(s) are awaiting Work Order issuance.`
                  : ""}
              </p>
            </div>
            <Button
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-9 px-4 text-xs shrink-0"
              asChild
            >
              <Link href="/admindashboard/register/earnest-money/new">
                Add Now
              </Link>
            </Button>
          </div>
        </motion.div>
      )}

      {/* ── Metric Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          icon={<IndianRupee className="h-6 w-6 text-slate-600" />}
          label="Total EMD"
          value={formatCurrency(metrics.total)}
          colorClass="bg-slate-50/80 ring-slate-100"
          delay={0.1}
        />
        <MetricCard
          icon={<CheckCircle2 className="h-6 w-6 text-emerald-600" />}
          label="Received"
          value={formatCurrency(metrics.received)}
          colorClass="bg-emerald-50/80 ring-emerald-100"
          delay={0.15}
        />
        <MetricCard
          icon={<Layers className="h-6 w-6 text-amber-600" />}
          label="Held"
          value={formatCurrency(metrics.held)}
          colorClass="bg-amber-50/80 ring-amber-100"
          delay={0.2}
        />
        <MetricCard
          icon={<AlertCircle className="h-6 w-6 text-blue-600" />}
          label="Refund Due"
          value={formatCurrency(metrics.refundDue)}
          colorClass="bg-blue-50/80 ring-blue-100"
          delay={0.25}
        />
        <MetricCard
          icon={<RotateCcw className="h-6 w-6 text-indigo-600" />}
          label="Refunded"
          value={formatCurrency(metrics.refunded)}
          colorClass="bg-indigo-50/80 ring-indigo-100"
          delay={0.3}
        />
        <MetricCard
          icon={<AlertOctagon className="h-6 w-6 text-rose-600" />}
          label="Forfeited"
          value={formatCurrency(metrics.forfeited)}
          colorClass="bg-rose-50/80 ring-rose-100"
          delay={0.35}
        />
      </div>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex flex-col md:flex-row gap-3 bg-white/60 backdrop-blur-xl p-2.5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search agency, NIT no, work name, receipt no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-slate-50/50 border-0 rounded-xl focus-visible:ring-1 focus-visible:ring-orange-500 w-full hover:bg-slate-50 transition-colors"
            />
          </div>
          <div className="flex gap-3 items-center">
            <div className="h-8 w-[1px] bg-slate-200 hidden md:block" />
            {/* Tender Mode Filter */}
            <Select value={modeFilter} onValueChange={setModeFilter}>
              <SelectTrigger className="w-[140px] h-12 border-0 bg-transparent hover:bg-slate-50 rounded-xl focus:ring-1 focus:ring-orange-500 shadow-none font-medium text-slate-600">
                <Globe className="h-4 w-4 mr-1.5 text-slate-400" />
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                <SelectItem value="all" className="rounded-lg cursor-pointer">
                  All Modes
                </SelectItem>
                <SelectItem
                  value="MANUAL"
                  className="rounded-lg cursor-pointer"
                >
                  Manual NIT
                </SelectItem>
                <SelectItem
                  value="ONLINE"
                  className="rounded-lg cursor-pointer"
                >
                  Online NIT
                </SelectItem>
              </SelectContent>
            </Select>
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] h-12 border-0 bg-transparent hover:bg-slate-50 rounded-xl focus:ring-1 focus:ring-orange-500 shadow-none font-medium text-slate-600">
                <Filter className="h-4 w-4 mr-1.5 text-slate-400" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                <SelectItem value="all" className="rounded-lg cursor-pointer">
                  All Statuses
                </SelectItem>
                {REGISTER_STATUSES.map((s) => (
                  <SelectItem
                    key={s.value}
                    value={s.value}
                    className="rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${s.bg}`}
                      />
                      {s.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* ── Register Table ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[2rem] overflow-hidden bg-white/60 backdrop-blur-2xl">
          <CardHeader className="border-b border-slate-100 py-5 bg-white/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-xl">
                  <ClipboardCheck className="h-4 w-4 text-orange-600" />
                </div>
                Register Entries
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg font-medium text-sm border-0"
              >
                {filteredData.length} entries
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <Search className="h-10 w-10 text-slate-300 mb-3" />
                <h3 className="text-base font-semibold text-slate-700">
                  No Records Found
                </h3>
                <p className="text-slate-400 text-sm max-w-sm mt-1">
                  No entries match your current filters. Try adjusting the
                  search or status filter.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                      <TableRow className="hover:bg-transparent">
                        {[
                          { label: "Sl No", w: "w-[60px]" },
                          { label: "NIT No." },
                          { label: "NIT Date" },
                          { label: "Name of Work" },
                          { label: "Bidder Name" },
                          { label: "Mode" },
                          { label: "EMD Amount", right: true },
                          { label: "Receipt No." },
                          { label: "Receipt Date" },
                          { label: "Work Order No." },
                          { label: "Status" },
                          { label: "Remarks" },
                          { label: "Actions", right: true },
                        ].map(({ label, w, right }) => (
                          <TableHead
                            key={label}
                            className={`px-4 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 ${w || ""} ${right ? "text-right" : ""}`}
                          >
                            {label}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((entry, idx) => {
                        const nitDetails =
                          entry.bidderName?.WorksDetail?.nitDetails;
                        const worksDetail = entry.bidderName?.WorksDetail;
                        const agencyName = getAgencyName(entry);
                        const effectiveStatus = getEffectiveStatus(entry);
                        const isOnline = entry.tenderMode === "ONLINE";
                        const hasWorkOrder =
                          entry.bidderName?.workorderdetails?.length > 0;
                        const nitNo =
                          entry.nitNumber ??
                          nitDetails?.memoNumber ??
                          "—";
                        const nitDate =
                          entry.nitDate
                            ? formatDate(entry.nitDate)
                            : nitDetails?.memoDate
                            ? formatDate(nitDetails.memoDate)
                            : "—";
                        const nameOfWork =
                          entry.nameOfWork ||
                          worksDetail?.ApprovedActionPlanDetails
                            ?.activityDescription ||
                          "—";

                        return (
                          <TableRow
                            key={entry.id}
                            className="border-b border-slate-100/50 hover:bg-white/80 transition-colors duration-200 group/row"
                          >
                            {/* Sl No */}
                            <TableCell className="px-4 py-4 text-slate-500 font-medium text-sm">
                              {(currentPage - 1) * itemsPerPage + idx + 1}
                            </TableCell>

                            {/* NIT No */}
                            <TableCell className="px-4 py-4">
                              <span className="text-sm font-semibold text-slate-800">
                                {nitNo}
                              </span>
                            </TableCell>

                            {/* NIT Date */}
                            <TableCell className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">
                              {nitDate}
                            </TableCell>

                            {/* Name of Work */}
                            <TableCell className="px-4 py-4 max-w-[200px]">
                              <p
                                className="text-sm text-slate-700 truncate font-medium"
                                title={nameOfWork}
                              >
                                {nameOfWork}
                              </p>
                            </TableCell>

                            {/* Bidder Name */}
                            <TableCell className="px-4 py-4 max-w-[150px]">
                              <div className="flex flex-col gap-0.5">
                                <p
                                  className="text-sm font-semibold text-slate-800 truncate"
                                  title={agencyName}
                                >
                                  {agencyName}
                                </p>
                                {hasWorkOrder && isOnline && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0 border-0 w-fit"
                                  >
                                    WO Issued
                                  </Badge>
                                )}
                              </div>
                            </TableCell>

                            {/* Mode */}
                            <TableCell className="px-4 py-4">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${
                                  isOnline
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {isOnline ? (
                                  <Globe className="h-2.5 w-2.5" />
                                ) : (
                                  <FileEdit className="h-2.5 w-2.5" />
                                )}
                                {isOnline ? "Online" : "Manual"}
                              </span>
                            </TableCell>

                            {/* EMD Amount */}
                            <TableCell className="px-4 py-4 text-right font-bold text-slate-900 text-sm whitespace-nowrap">
                              {formatCurrency(entry.earnestMoneyAmount)}
                            </TableCell>

                            {/* Receipt No */}
                            <TableCell className="px-4 py-4 text-sm text-slate-600">
                              {entry.receiptNumber || (
                                <span className="text-slate-300">—</span>
                              )}
                            </TableCell>

                            {/* Receipt Date */}
                            <TableCell className="px-4 py-4 text-sm text-slate-600 whitespace-nowrap">
                              {entry.receiptDate ? (
                                formatDate(entry.receiptDate)
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </TableCell>

                            {/* Work Order No */}
                            <TableCell className="px-4 py-4 text-sm">
                              {entry.workOrderMemoNumber ? (
                                <span className="text-emerald-700 font-medium">
                                  {entry.workOrderMemoNumber}
                                </span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </TableCell>

                            {/* Status */}
                            <TableCell className="px-4 py-4">
                              <StatusBadge status={effectiveStatus} />
                            </TableCell>

                            {/* Remarks */}
                            <TableCell className="px-4 py-4 max-w-[120px]">
                              <p
                                className="text-xs text-slate-500 truncate"
                                title={entry.remarks || ""}
                              >
                                {entry.remarks || (
                                  <span className="text-slate-300">—</span>
                                )}
                              </p>
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="px-4 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover/row:opacity-100 focus-within:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-3 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-100 text-xs"
                                  onClick={() => setViewEntry(entry)}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                {!["REFUNDED", "FORFEITED"].includes(
                                  effectiveStatus
                                ) && (
                                  <Button
                                    size="sm"
                                    className="h-8 px-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs"
                                    onClick={() => setUpdateEntry(entry)}
                                  >
                                    <SlidersHorizontal className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 bg-slate-50/50">
                    <div className="text-sm text-slate-500">
                      Showing{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * itemsPerPage + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium">
                        {Math.min(
                          currentPage * itemsPerPage,
                          filteredData.length
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">{filteredData.length}</span>{" "}
                      entries
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0 rounded-lg border-slate-200"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium text-slate-600">
                        {currentPage} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0 rounded-lg border-slate-200"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Dialogs ─────────────────────────────────────────────────────── */}
      {updateEntry && (
        <UpdateStatusDialog
          entry={updateEntry}
          open={!!updateEntry}
          onClose={() => setUpdateEntry(null)}
          onSuccess={() => {
            setUpdateEntry(null);
            router.refresh();
          }}
        />
      )}

      {viewEntry && (
        <DetailDialog
          entry={viewEntry}
          open={!!viewEntry}
          onClose={() => setViewEntry(null)}
        />
      )}
    </div>
  );
}
