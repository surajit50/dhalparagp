"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  Save,
  Search,
  Info,
  AlertTriangle,
  CheckCircle2,
  Building2,
  FileText,
  Calendar,
  IndianRupee,
  ClipboardList,
  ChevronDown,
  BadgeCheck,
  Globe,
  FileEdit,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import type { EligibleEarnestMoneyCandidate } from "@/lib/earnest-money";
import { formatDate } from "@/utils/utils";

// ─── Schema ──────────────────────────────────────────────────────────────────

const formSchema = z.object({
  bidderId: z.string().min(1, "Please select a bidder / agency"),
  paymentMethod: z.enum(["CASH", "CHEQUE", "ONLINE_TRANSFER"], {
    required_error: "Please select earnest money mode",
  }),
  registerStatus: z.enum(
    ["RECEIVED", "HELD", "REFUND_DUE", "ADJUSTED"],
    { required_error: "Please select a status" }
  ),
  amountReceived: z.coerce
    .number({ invalid_type_error: "Must be a valid number" })
    .positive("Amount must be greater than 0"),
  receiptNumber: z.string().optional(),
  receiptDate: z.string().min(1, "Receipt date is required"),
  remarks: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Props ───────────────────────────────────────────────────────────────────

interface ClientNewEmdPageProps {
  candidates: EligibleEarnestMoneyCandidate[];
  blockedOnlineWorksCount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const STATUS_OPTIONS = [
  { value: "RECEIVED", label: "Received", color: "bg-emerald-500" },
  { value: "HELD", label: "Held", color: "bg-amber-500" },
  { value: "REFUND_DUE", label: "Refund Due", color: "bg-blue-500" },
  { value: "ADJUSTED", label: "Adjusted", color: "bg-purple-500" },
] as const;

const PAYMENT_METHOD_OPTIONS = [
  { value: "CASH", label: "Cash" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "ONLINE_TRANSFER", label: "Online Transfer / NEFT / RTGS" },
] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export default function ClientNewEmdPage({
  candidates,
  blockedOnlineWorksCount,
}: ClientNewEmdPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCandidate, setSelectedCandidate] =
    useState<EligibleEarnestMoneyCandidate | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bidderId: "",
      paymentMethod: undefined,
      registerStatus: undefined,
      amountReceived: 0,
      receiptNumber: "",
      receiptDate: "",
      remarks: "",
    },
  });

  // Filter candidates by search
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return candidates;
    return candidates.filter(
      (c) =>
        c.bidderName.toLowerCase().includes(q) ||
        String(c.nitNumber || "").includes(q) ||
        c.nameOfWork.toLowerCase().includes(q)
    );
  }, [candidates, search]);

  // Group by NIT number for display
  const grouped = useMemo(() => {
    const map = new Map<string, EligibleEarnestMoneyCandidate[]>();
    filtered.forEach((c) => {
      const key = c.nitNumber ? String(c.nitNumber) : "unknown";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });
    return map;
  }, [filtered]);

  const handleSelectCandidate = (c: EligibleEarnestMoneyCandidate) => {
    setSelectedCandidate(c);
    form.setValue("bidderId", c.bidderId);
    form.setValue("amountReceived", c.availableEarnestMoneyAmount);
    // Clear receipt fields
    form.setValue("receiptNumber", "");
    form.setValue("receiptDate", "");
    form.setValue("remarks", "");
    form.clearErrors();
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        bidderId: values.bidderId,
        paymentMethod: values.paymentMethod,
        registerStatus: values.registerStatus,
        amountReceived: values.amountReceived,
        receiptNumber: values.receiptNumber?.trim() || undefined,
        receiptDate: new Date(values.receiptDate).toISOString(),
        remarks: values.remarks?.trim() || undefined,
      };

      const res = await fetch("/api/earnest-money", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Earnest Money Register entry created successfully");
        router.push("/admindashboard/register/earnest-money");
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error || "Failed to create entry");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-50/80 via-slate-50 to-slate-100/50 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-orange-400/10 blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-[100px]" />
      </div>

      <div className="container mx-auto p-4 sm:p-6 lg:p-8 relative z-10 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}

        >
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="rounded-xl hover:bg-white/60 border border-white/40 shadow-sm"
          >
            <Link href="/admindashboard/register/earnest-money">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              New Earnest Money Register Entry
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Select an eligible bidder and fill in the EMD details
            </p>
          </div>
        </motion.div>

        {/* Blocked Online Works Alert */}
        {blockedOnlineWorksCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}

          >
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  {blockedOnlineWorksCount} Online NIT work
                  {blockedOnlineWorksCount !== 1 ? "s" : ""} pending Work Order
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Bidders from these works are not yet eligible for Earnest
                  Money Register entry. They will appear here once a Work Order
                  has been issued.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* No candidates at all */}
        {candidates.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}

          >
            <div className="bg-slate-100 rounded-3xl p-8 text-center max-w-md">
              <CheckCircle2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700">
                All Entries Up to Date
              </h3>
              <p className="text-slate-500 text-sm mt-2">
                No eligible bidders found for new EMD entries. All qualifying
                bidders already have existing register entries, or no Work
                Orders have been issued for Online NIT tenders.
              </p>
              <Button className="mt-6" asChild variant="outline">
                <Link href="/admindashboard/register/earnest-money">
                  Back to Register
                </Link>
              </Button>
            </div>
          </motion.div>
        )}

        {candidates.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Left: Candidate Selection Panel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}

            >
              <Card className="border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[2rem] bg-white/60 backdrop-blur-2xl sticky top-4">
                <CardHeader className="border-b border-slate-100 pb-4">
                  <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <div className="bg-orange-100 p-1.5 rounded-lg">
                      <ClipboardList className="h-4 w-4 text-orange-600" />
                    </div>
                    Eligible Bidders
                    <Badge
                      variant="secondary"
                      className="ml-auto bg-slate-100 text-slate-600 border-0 rounded-lg"
                    >
                      {candidates.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-1">
                    Manual NIT: all bidders eligible. Online NIT: only accepted
                    bidder with Work Order.
                  </CardDescription>
                  {/* Search */}
                  <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search by name, NIT No, or work..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 h-9 text-sm bg-slate-50/80 border-slate-200 rounded-xl focus-visible:ring-1 focus-visible:ring-orange-500"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0 max-h-[70vh] overflow-y-auto">
                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center py-12 text-center px-4">
                      <Search className="h-8 w-8 text-slate-300 mb-2" />
                      <p className="text-sm text-slate-500">No matches found</p>
                    </div>
                  ) : (
                    Array.from(grouped.entries()).map(([nitNo, nitCandidates]) => (
                      <div key={nitNo} className="border-b border-slate-100 last:border-0">
                        {/* NIT Group Header */}
                        <div className="px-4 py-2 bg-slate-50/80 flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            NIT No. {nitNo !== "unknown" ? nitNo : "N/A"}
                          </span>
                          <span className="text-xs text-slate-400">
                            ({nitCandidates.length}{" "}
                            {nitCandidates.length === 1 ? "bidder" : "bidders"})
                          </span>
                        </div>
                        {nitCandidates.map((c) => {
                          const isSelected =
                            selectedCandidate?.bidderId === c.bidderId;
                          const isOnline = c.tenderMode === "ONLINE";
                          return (
                            <button
                              key={c.bidderId}
                              type="button"
                              onClick={() => handleSelectCandidate(c)}
                              className={`w-full text-left px-4 py-3 transition-colors duration-200 group/item ${isSelected
                                  ? "bg-orange-50 border-l-2 border-orange-500"
                                  : "hover:bg-slate-50 border-l-2 border-transparent"
                                }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm font-semibold truncate ${isSelected
                                        ? "text-orange-700"
                                        : "text-slate-800"
                                      }`}
                                  >
                                    {c.bidderName}
                                  </p>
                                  <p className="text-xs text-slate-500 truncate mt-0.5">
                                    {c.nameOfWork}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <span
                                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${isOnline
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
                                    {isOnline && c.workOrderMemoNumber && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                        <BadgeCheck className="h-2.5 w-2.5" />
                                        WO: {c.workOrderMemoNumber}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-sm font-bold text-slate-900">
                                    {formatCurrency(c.availableEarnestMoneyAmount)}
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    EMD Amount
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Right: Entry Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}

            >
              <AnimatePresence mode="wait">
                {!selectedCandidate ? (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}

                  >
                    <div className="bg-orange-50 rounded-2xl p-6 text-center max-w-xs">
                      <Building2 className="h-10 w-10 text-orange-300 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-600">
                        Select a Bidder
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Choose an eligible bidder from the left panel to fill in
                        the Earnest Money details.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={selectedCandidate.bidderId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Auto-filled Info Banner */}
                    <div className="bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-[1.5rem] p-5 mb-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Info className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-semibold text-slate-700">
                          Auto-filled from Tender Records
                        </span>
                        <Badge
                          className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full border-0 ${selectedCandidate.tenderMode === "ONLINE"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                            }`}
                        >
                          {selectedCandidate.tenderMode === "ONLINE"
                            ? "Online NIT"
                            : "Manual NIT"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-slate-500 font-medium">NIT No.</p>
                          <p className="font-semibold text-slate-800">
                            {selectedCandidate.nitNumber ?? "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">NIT Date</p>
                          <p className="font-semibold text-slate-800">
                            {selectedCandidate.nitDate
                              ? formatDate(selectedCandidate.nitDate)
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">EMD Amount</p>
                          <p className="font-bold text-orange-600 text-base">
                            {formatCurrency(
                              selectedCandidate.availableEarnestMoneyAmount
                            )}
                          </p>
                        </div>
                        <div className="col-span-2 md:col-span-3">
                          <p className="text-xs text-slate-500 font-medium">Name of Work</p>
                          <p className="font-semibold text-slate-800 leading-snug">
                            {selectedCandidate.nameOfWork}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Agency</p>
                          <p className="font-semibold text-slate-800">
                            {selectedCandidate.bidderName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Address</p>
                          <p className="font-semibold text-slate-800 truncate">
                            {selectedCandidate.bidderAddress || "N/A"}
                          </p>
                        </div>
                        {selectedCandidate.workOrderMemoNumber && (
                          <div>
                            <p className="text-xs text-slate-500 font-medium">Work Order No.</p>
                            <p className="font-semibold text-emerald-700">
                              {selectedCandidate.workOrderMemoNumber}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Form */}
                    <Card className="border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[2rem] bg-white/60 backdrop-blur-2xl">
                      <CardHeader className="border-b border-slate-100 pb-5">
                        <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                          <div className="bg-orange-100 p-1.5 rounded-lg">
                            <FileText className="h-4 w-4 text-orange-600" />
                          </div>
                          Earnest Money Details
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                          Fill in the receipt and payment details for the EMD
                          entry.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <Form {...form}>
                          <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                          >
                            {/* Hidden bidderId */}
                            <input
                              type="hidden"
                              {...form.register("bidderId")}
                            />
                            {form.formState.errors.bidderId && (
                              <p className="text-xs text-red-500">
                                {form.formState.errors.bidderId.message}
                              </p>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                              {/* EMD Mode */}
                              <FormField
                                control={form.control}
                                name="paymentMethod"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-slate-700 font-semibold text-sm">
                                      Earnest Money Mode
                                    </FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-1 focus:ring-orange-500">
                                          <SelectValue placeholder="Select mode" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="rounded-xl">
                                        {PAYMENT_METHOD_OPTIONS.map((o) => (
                                          <SelectItem
                                            key={o.value}
                                            value={o.value}
                                            className="rounded-lg cursor-pointer"
                                          >
                                            {o.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Register Status */}
                              <FormField
                                control={form.control}
                                name="registerStatus"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-slate-700 font-semibold text-sm">
                                      Register Status
                                    </FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus:ring-1 focus:ring-orange-500">
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="rounded-xl">
                                        {STATUS_OPTIONS.map((o) => (
                                          <SelectItem
                                            key={o.value}
                                            value={o.value}
                                            className="rounded-lg cursor-pointer"
                                          >
                                            {o.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Amount Received */}
                              <FormField
                                control={form.control}
                                name="amountReceived"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-slate-700 font-semibold text-sm">
                                      Amount Received (₹)
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                          type="number"
                                          placeholder="0"
                                          {...field}
                                          className="pl-9 h-11 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-1 focus-visible:ring-orange-500"
                                        />
                                      </div>
                                    </FormControl>
                                    <FormDescription className="text-xs text-slate-400">
                                      Available EMD:{" "}
                                      {formatCurrency(
                                        selectedCandidate.availableEarnestMoneyAmount
                                      )}
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Receipt Date */}
                              <FormField
                                control={form.control}
                                name="receiptDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-slate-700 font-semibold text-sm">
                                      Receipt / Challan Date
                                    </FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <Input
                                          type="date"
                                          {...field}
                                          className="pl-9 h-11 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-1 focus-visible:ring-orange-500"
                                        />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Receipt Number */}
                              <FormField
                                control={form.control}
                                name="receiptNumber"
                                render={({ field }) => (
                                  <FormItem className="sm:col-span-2">
                                    <FormLabel className="text-slate-700 font-semibold text-sm">
                                      Receipt / Challan No.{" "}
                                      <span className="text-slate-400 font-normal">
                                        (optional)
                                      </span>
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="e.g. RCT/2024-25/001"
                                        {...field}
                                        className="h-11 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-1 focus-visible:ring-orange-500"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Remarks */}
                              <FormField
                                control={form.control}
                                name="remarks"
                                render={({ field }) => (
                                  <FormItem className="sm:col-span-2">
                                    <FormLabel className="text-slate-700 font-semibold text-sm">
                                      Remarks{" "}
                                      <span className="text-slate-400 font-normal">
                                        (optional)
                                      </span>
                                    </FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Any notes or remarks..."
                                        {...field}
                                        rows={3}
                                        className="rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-1 focus-visible:ring-orange-500 resize-none"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                              <Button
                                type="button"
                                variant="outline"
                                asChild
                                className="rounded-xl h-11 px-5 border-slate-200 text-slate-600 hover:bg-slate-50"
                              >
                                <Link href="/admindashboard/register/earnest-money">
                                  Cancel
                                </Link>
                              </Button>
                              <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl h-11 px-6 shadow-md shadow-orange-500/20 transition-all hover:shadow-lg hover:-translate-y-0.5"
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Entry
                                  </>
                                )}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
