"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markMusterRollCompleted } from "@/app/actions/mark-muster-completed";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Receipt,
  Users,
  IndianRupee,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";
import PdfmeDownloadButton from "./PdfmeDownloadButton";
import GenerateMusterButton from "./GenerateMusterButton";

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

const statusMeta: Record<string, any> = {
  COMPLETED: { label: "Completed", variant: "success", Icon: CheckCircle },
  PENDING: { label: "Pending", variant: "warning", Icon: Clock },
  FAILED: { label: "Failed", variant: "destructive", Icon: XCircle },
};

export default function MusterRollGroupClient({ data }: { data: MusterRollData[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const grouped = data.reduce((acc: Record<string, MusterRollData[]>, item) => {
    const key = item.musterRollNo || "Legacy";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const handleComplete = async (musterRollNo: string) => {
    setLoading(musterRollNo);

    try {
      const ids = grouped[musterRollNo].map((i) => i.id);
      const result = await markMusterRollCompleted(ids);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    } catch {
      toast.error("Error completing muster");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* 🔥 HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">
          Muster Roll Batches
        </h2>
        <GenerateMusterButton />
      </div>

      {Object.entries(grouped).map(([musterRollNo, group], index) => {
        const totalAmount = group.reduce((s, i) => s + i.allottedAmount, 0);

        const completedCount = group.filter(
          (i) => i.paymentStatus === "COMPLETED"
        ).length;

        const percent = Math.round((completedCount / group.length) * 100);

        return (
          <motion.div
            key={musterRollNo}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="rounded-2xl overflow-hidden border bg-white shadow hover:shadow-xl transition-all">

              {/* 🔷 HEADER */}
              <div className="flex flex-col md:flex-row justify-between items-center p-5 bg-slate-50 border-b">

                <div>
                  <h3 className="font-bold text-lg">{musterRollNo}</h3>

                  <div className="flex gap-4 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" /> {group.length}
                    </span>
                    <span className="flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" /> ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* 🔥 PROGRESS */}
                  <div className="mt-3">
                    <div className="h-2 bg-slate-200 rounded-full">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {percent}% completed
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3 md:mt-0">
                  <PdfmeDownloadButton musterRollNo={musterRollNo} data={group} />

                  <Button
                    onClick={() => handleComplete(musterRollNo)}
                    disabled={loading === musterRollNo}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl"
                  >
                    {loading === musterRollNo ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Complete"
                    )}
                  </Button>
                </div>
              </div>

              {/* 📊 TABLE */}
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Beneficiary</TableHead>
                      <TableHead>Village</TableHead>
                      <TableHead>Deceased</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {group.map((item, i) => {
                      const meta = statusMeta[item.paymentStatus] || statusMeta.PENDING;

                      return (
                        <TableRow key={item.id} className="hover:bg-blue-50/40">

                          <TableCell>{i + 1}</TableCell>

                          {/* 👤 NAME + AVATAR */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-sm font-bold">
                                {item.application.applicantName.charAt(0)}
                              </div>
                              {item.application.applicantName}
                            </div>
                          </TableCell>

                          <TableCell>{item.application.villageName}</TableCell>

                          <TableCell>
                            {item.application.deceasedName}
                            <div className="text-xs text-slate-400">
                              {format(new Date(item.application.dateOfDeath), "dd MMM yyyy")}
                            </div>
                          </TableCell>

                          <TableCell className="text-right font-bold">
                            ₹{item.allottedAmount.toLocaleString("en-IN")}
                          </TableCell>

                          <TableCell>
                            <Badge variant={meta.variant}>
                              {meta.label}
                            </Badge>
                          </TableCell>

                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>

            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
