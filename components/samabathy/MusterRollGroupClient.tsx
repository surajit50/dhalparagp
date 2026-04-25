"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markMusterRollCompleted } from "@/app/actions/mark-muster-completed";
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
import { Button } from "@/components/ui/button";
import {
  FileText,
  User,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Receipt,
  FilePlus2,
  Users,
  IndianRupee,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import GenerateMusterButton from "./GenerateMusterButton";
import PdfmeDownloadButton from "./PdfmeDownloadButton";
import { motion, AnimatePresence } from "framer-motion";
import FullPageLoader from "./FullPageLoader";

interface MusterRollData {
  id: string;
  allottedAmount: number;
  paymentStatus: string;
  musterRollNo: string | null;
  createdAt: Date;
  application: {
    applicantName: string;
    villageName: string;
    deceasedName: string;
    dateOfDeath: Date;
  };
}

// Helper to map payment status to a badge variant and icon
const statusMeta: Record<
  string,
  {
    label: string;
    variant: "success" | "warning" | "destructive" | "secondary";
    Icon: React.ElementType;
  }
> = {
  COMPLETED: { label: "Completed", variant: "success", Icon: CheckCircle },
  PENDING: { label: "Pending", variant: "warning", Icon: Clock },
  FAILED: { label: "Failed", variant: "destructive", Icon: XCircle },
};

export default function MusterRollGroupClient({
  data,
}: {
  data: MusterRollData[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [completeTarget, setCompleteTarget] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Group muster rolls by musterRollNo (or "Legacy" if null)
  const grouped = data.reduce((acc: Record<string, MusterRollData[]>, item) => {
    const key = item.musterRollNo || "Legacy";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const handleComplete = async (musterRollNo: string) => {
    setLoading(musterRollNo);
    setProgress(0);

    // Simulate progress for UI feedback
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 10 : prev));
    }, 100);

    try {
      const group = grouped[musterRollNo];
      if (!group || group.length === 0) {
        toast.error("Muster roll group not found");
        return;
      }

      const ids = group.map((item) => item.id);
      const result = await markMusterRollCompleted(ids);

      if (!result.success) {
        toast.error(result.error || result.message);
        return;
      }

      setProgress(100);
      setTimeout(() => {
        toast.success(result.message);
        router.refresh();
      }, 300);
    } catch (error) {
      console.error("[v0] Error completing muster roll:", error);
      toast.error("Failed to complete muster roll");
    } finally {
      clearInterval(interval);
      setLoading(null);
      setCompleteTarget(null);
    }
  };

  // Empty state - beautifully illustrated
  if (!data.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-dashed bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="rounded-full bg-white p-6 shadow-sm border border-slate-100 mb-6">
              <FilePlus2 className="h-10 w-10 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              No muster rolls generated
            </h2>
            <p className="text-slate-500 max-w-md mb-8 text-sm">
              Approved applications will appear here once they are batched into
              muster rolls. Start by clicking the button below.
            </p>
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
              <GenerateMusterButton />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <FullPageLoader
        isLoading={!!loading}
        progress={progress}
        title="Completing Muster Roll"
        description={`Marking all payments in ${loading} as completed...`}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Muster Roll Batches
          </h2>
          <p className="text-sm text-slate-500">
            Manage and process generated muster roll groups
          </p>
        </div>
        <GenerateMusterButton />
      </div>

      <AnimatePresence>
        {Object.entries(grouped).map(([musterRollNo, group], index) => {
          const totalAmount = group.reduce(
            (sum, item) => sum + item.allottedAmount,
            0,
          );
          const allCompleted = group.every(
            (item) => item.paymentStatus === "COMPLETED",
          );
          const anyPending = group.some(
            (item) => item.paymentStatus !== "COMPLETED",
          );

          return (
            <motion.div
              key={musterRollNo}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                {/* Group Header */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-slate-50/80 border-b border-slate-100">
                  <div className="px-6 py-4 flex items-center gap-4 border-b sm:border-b-0 sm:border-r border-slate-100">
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                      <Receipt className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">
                          {musterRollNo}
                        </span>
                        {allCompleted && (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50 gap-1 px-2 py-0">
                            <CheckCircle className="h-3 w-3" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                          <Users className="h-3 w-3" /> {group.length} People
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                          <IndianRupee className="h-3 w-3" /> ₹
                          {totalAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-3 flex items-center gap-3 bg-white/50">
                    <PdfmeDownloadButton
                      musterRollNo={musterRollNo}
                      data={group}
                    />

                    {anyPending && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setCompleteTarget(musterRollNo)}
                        disabled={loading === musterRollNo}
                        className="bg-blue-600 hover:bg-blue-700 shadow-sm gap-2"
                      >
                        {loading === musterRollNo ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {loading === musterRollNo
                            ? "Processing..."
                            : "Mark Completed"}
                        </span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Table */}
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/30 hover:bg-slate-50/30">
                          <TableHead className="w-12 text-center text-[10px] uppercase font-bold text-slate-400">
                            #
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold text-slate-400">
                            Beneficiary Details
                          </TableHead>
                          <TableHead className="hidden md:table-cell text-[10px] uppercase font-bold text-slate-400">
                            Village
                          </TableHead>
                          <TableHead className="text-[10px] uppercase font-bold text-slate-400">
                            Deceased Info
                          </TableHead>
                          <TableHead className="text-right text-[10px] uppercase font-bold text-slate-400">
                            Amount
                          </TableHead>
                          <TableHead className="text-center text-[10px] uppercase font-bold text-slate-400">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.map((item, idx) => {
                          const meta = statusMeta[item.paymentStatus] || {
                            label: item.paymentStatus,
                            variant: "secondary" as const,
                            Icon: Clock,
                          };
                          const { Icon: StatusIcon } = meta;

                          return (
                            <TableRow
                              key={item.id}
                              className="group hover:bg-slate-50/50 transition-colors border-slate-100"
                            >
                              <TableCell className="text-center text-slate-400 font-medium text-xs">
                                {idx + 1}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                    <User className="h-4 w-4" />
                                  </div>
                                  <span className="font-semibold text-slate-700 text-sm">
                                    {item.application.applicantName}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                  {item.application.villageName}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-0.5">
                                  <div className="text-sm font-medium text-slate-700">
                                    {item.application.deceasedName}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                    <Calendar className="h-3 w-3" />
                                    {format(
                                      new Date(item.application.dateOfDeath),
                                      "dd MMM yyyy",
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className="font-bold text-slate-900 text-sm">
                                  ₹{item.allottedAmount.toLocaleString("en-IN")}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  variant={meta.variant}
                                  className={`gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                                    ${
                                      item.paymentStatus === "COMPLETED"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                        : item.paymentStatus === "PENDING"
                                          ? "bg-amber-50 text-amber-700 border-amber-100"
                                          : "bg-rose-50 text-rose-700 border-rose-100"
                                    }`}
                                >
                                  <StatusIcon className="h-3 w-3" />
                                  {meta.label}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Confirmation dialog for completion */}
      <AlertDialog
        open={!!completeTarget}
        onOpenChange={(open) => {
          if (!open) setCompleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as completed?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark all{" "}
              {completeTarget ? grouped[completeTarget]?.length : 0} payments in{" "}
              <strong>{completeTarget}</strong> as completed. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => completeTarget && handleComplete(completeTarget)}
              className="bg-green-600 hover:bg-green-700"
            >
              Yes, complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
