"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { markMusterRollCompleted } from "@/app/actions/mark-muster-completed";
import { Card, CardContent } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Users,
  IndianRupee,
  Search,
  Filter,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";
import PdfmeDownloadButton from "./PdfmeDownloadButton";

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
    aadhaarNumber: string | null;
    relation: string;
  };
}

const statusMeta: Record<string, any> = {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");

  const grouped = useMemo(() => {
    return data.reduce((acc: Record<string, MusterRollData[]>, item) => {
      const key = item.musterRollNo || "Legacy";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [data]);

  const filteredGroups = useMemo(() => {
    return Object.entries(grouped)
      .filter(([musterRollNo, group]) => {
        // Filter by Status Tab
        const isCompleted = group.every((i) => i.paymentStatus === "COMPLETED");
        const statusMatch =
          activeTab === "ALL" ||
          (activeTab === "COMPLETED" && isCompleted) ||
          (activeTab === "PENDING" && !isCompleted);

        // Filter by Search Query
        const searchMatch =
          musterRollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.some(
            (i) =>
              i.application.applicantName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              i.application.villageName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()),
          );

        return statusMatch && searchMatch;
      })
      .sort(
        (a, b) => b[1][0].createdAt.getTime() - a[1][0].createdAt.getTime(),
      );
  }, [grouped, searchQuery, activeTab]);

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
      {/* � FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by MR No, Name or Village..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-50 border-none focus-visible:ring-orange-500 rounded-xl"
          />
        </div>

        <Tabs
          defaultValue="ALL"
          onValueChange={setActiveTab}
          className="w-full md:w-auto"
        >
          <TabsList className="bg-slate-100 p-1 rounded-xl w-full">
            <TabsTrigger value="ALL" className="rounded-lg px-4">
              All
            </TabsTrigger>
            <TabsTrigger value="PENDING" className="rounded-lg px-4">
              Pending
            </TabsTrigger>
            <TabsTrigger value="COMPLETED" className="rounded-lg px-4">
              Completed
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Filter className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-600">
            No muster rolls found
          </h3>
          <p className="text-slate-400 text-sm">
            Try adjusting your search or filters
          </p>
          {(searchQuery || activeTab !== "ALL") && (
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery("");
                setActiveTab("ALL");
              }}
              className="mt-4 text-orange-600 font-semibold"
            >
              Clear all filters
            </Button>
          )}
        </div>
      ) : (
        <Accordion type="multiple" className="space-y-4">
          {filteredGroups.map(([musterRollNo, group], index) => {
            const totalAmount = group.reduce((s, i) => s + i.allottedAmount, 0);

            const completedCount = group.filter(
              (i) => i.paymentStatus === "COMPLETED",
            ).length;

            const percent = Math.round((completedCount / group.length) * 100);
            const isFullyCompleted = percent === 100;

            return (
              <motion.div
                key={musterRollNo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AccordionItem value={musterRollNo} className="border-none">
                  <Card className="rounded-2xl overflow-hidden border bg-white shadow-sm hover:shadow-md transition-all">
                    {/* 🔷 HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-center p-5 bg-slate-50/50 border-b">
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <AccordionTrigger className="hover:no-underline py-0">
                          <div className="flex flex-col items-start text-left">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                              {musterRollNo}
                              {isFullyCompleted && (
                                <CheckCircle className="h-5 w-5 text-emerald-500" />
                              )}
                            </h3>

                            <div className="flex gap-4 text-sm text-slate-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" /> {group.length}
                              </span>
                              <span className="flex items-center gap-1">
                                <IndianRupee className="h-4 w-4" /> ₹
                                {totalAmount.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </AccordionTrigger>

                        {/* 🔥 PROGRESS (Hidden on mobile, shown on desktop) */}
                        <div className="hidden md:block min-w-[150px] ml-4">
                          <div className="h-1.5 bg-slate-200 rounded-full w-full">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isFullyCompleted
                                  ? "bg-emerald-500"
                                  : "bg-orange-500"
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium uppercase tracking-wider">
                            {percent}% completed
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3 md:mt-0 w-full md:w-auto justify-end">
                        <PdfmeDownloadButton
                          musterRollNo={musterRollNo}
                          createdAt={group[0].createdAt}
                          data={group}
                        />

                        {!isFullyCompleted && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleComplete(musterRollNo);
                            }}
                            disabled={loading === musterRollNo}
                            className="bg-gradient-to-r from-orange-600 to-orange-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                          >
                            {loading === musterRollNo ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Complete"
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* 📊 TABLE */}
                    <AccordionContent>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader className="bg-slate-50/50">
                            <TableRow>
                              <TableHead className="w-12">#</TableHead>
                              <TableHead>Beneficiary</TableHead>
                              <TableHead>Village</TableHead>
                              <TableHead>Deceased</TableHead>
                              <TableHead className="text-right">
                                Amount
                              </TableHead>
                              <TableHead className="w-32">Status</TableHead>
                            </TableRow>
                          </TableHeader>

                          <TableBody>
                            {group.map((item, i) => {
                              const meta =
                                statusMeta[item.paymentStatus] ||
                                statusMeta.PENDING;

                              return (
                                <TableRow
                                  key={item.id}
                                  className="hover:bg-orange-50/40 transition-colors"
                                >
                                  <TableCell className="font-medium text-slate-400">
                                    {i + 1}
                                  </TableCell>

                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold border shadow-sm">
                                        {item.application.applicantName.charAt(
                                          0,
                                        )}
                                      </div>
                                      <span className="font-medium text-slate-700">
                                        {item.application.applicantName}
                                      </span>
                                    </div>
                                  </TableCell>

                                  <TableCell className="text-slate-600">
                                    {item.application.villageName}
                                  </TableCell>

                                  <TableCell>
                                    <div className="font-medium text-slate-700">
                                      {item.application.deceasedName}
                                    </div>
                                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                      <Clock className="h-3 w-3" />
                                      {format(
                                        new Date(item.application.dateOfDeath),
                                        "dd MMM yyyy",
                                      )}
                                    </div>
                                  </TableCell>

                                  <TableCell className="text-right font-bold text-slate-900">
                                    ₹
                                    {item.allottedAmount.toLocaleString(
                                      "en-IN",
                                    )}
                                  </TableCell>

                                  <TableCell>
                                    <Badge
                                      variant={meta.variant}
                                      className="rounded-lg px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider"
                                    >
                                      {meta.label}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              </motion.div>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
