"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  CheckCircle,
  XCircle,
  UserCheck,
  Loader2,
  Eye,
  Search,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  getApplicationsForApproval,
  approveApplication,
} from "@/action/land-conversion-actions";
import LandConversionLayout from "../components/LandConversionLayout";

interface ApprovalItem {
  id: string;
  applicantName: string;
  applicationNo: string;
  status: string;
}

export default function ApprovalWorkflowPage() {
  const { toast } = useToast();
  const [queue, setQueue] = useState<ApprovalItem[]>([]);
  const [selected, setSelected] = useState<ApprovalItem | null>(null);
  const [comments, setComments] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function load() {
    setIsLoading(true);
    const result = await getApplicationsForApproval();
    if (result.success && result.data) {
      setQueue(
        result.data.map((a) => ({
          id: a.id,
          applicantName: a.applicantName,
          applicationNo: a.applicationNo,
          status: a.status,
        }))
      );
    } else if (!result.success) {
      toast({
        title: "Failed to load applications",
        description: result.error ?? "Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const takeAction = (approve: boolean) => {
    if (!selected) return;
    if (!approve && !comments.trim()) {
      toast({
        title: "Comments required",
        description: "Please add rejection comments before rejecting.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await approveApplication(selected.id, comments, approve);
      if (!result.success) {
        toast({
          title: "Failed to update application",
          description: result.error ?? "Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: approve ? "Approved" : "Rejected",
        description: approve
          ? "Application moved to NOC issuance."
          : "Application rejected.",
      });
      setComments("");
      setSelected(null);
      await load();
    });
  };

  const filtered = queue.filter(
    (item) =>
      item.applicationNo.toLowerCase().includes(search.toLowerCase()) ||
      item.applicantName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <LandConversionLayout
      title="Approval Workflow"
      description="Review inspection reports and decide on application approval."
      icon={UserCheck}
    >
      <div className="space-y-6">
        {/* ─── QUEUE TABLE ─── */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-base text-gray-800">
                  Pending Approval Queue
                </CardTitle>
                <CardDescription>
                  {filtered.length} application(s) awaiting approval decision
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by ID or name..."
                    className="pl-9 h-9 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={load}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-sm">Loading queue...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <UserCheck className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-medium">No applications pending</p>
                <p className="text-xs text-gray-400 mt-1">
                  All applications have been processed.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="text-xs font-semibold text-gray-600 uppercase w-10">
                        #
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600 uppercase">
                        Application No
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600 uppercase">
                        Applicant Name
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600 uppercase text-right">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((item, idx) => (
                      <TableRow
                        key={item.id}
                        className={`cursor-pointer transition-colors ${
                          selected?.id === item.id
                            ? "bg-orange-50 hover:bg-orange-50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          setSelected(selected?.id === item.id ? null : item)
                        }
                      >
                        <TableCell className="text-gray-500 text-sm">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="font-mono font-semibold text-orange-800 text-sm">
                          {item.applicationNo}
                        </TableCell>
                        <TableCell className="font-medium text-gray-800 text-sm">
                          {item.applicantName}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className="bg-orange-50 text-orange-700 border-orange-200 text-xs"
                          >
                            {item.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(
                                selected?.id === item.id ? null : item
                              );
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── DECISION PANEL ─── */}
        {selected && (
          <Card className="border-orange-200 shadow-sm">
            <CardHeader className="bg-orange-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-orange-900">
                    Decision Panel —{" "}
                    <span className="font-mono">{selected.applicationNo}</span>
                  </CardTitle>
                  <CardDescription className="text-orange-700">
                    {selected.applicantName}
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setSelected(null)}
                >
                  ✕ Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Summary row */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-orange-50/50 rounded-lg border border-orange-100 text-sm">
                <div>
                  <span className="text-orange-700 font-semibold block uppercase text-[10px] mb-1">
                    Application No
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {selected.applicationNo}
                  </span>
                </div>
                <div>
                  <span className="text-orange-700 font-semibold block uppercase text-[10px] mb-1">
                    Applicant Name
                  </span>
                  <span className="font-bold text-slate-800">
                    {selected.applicantName}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="comments"
                  className="text-gray-700 font-medium text-sm"
                >
                  Approval / Rejection Comments{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="comments"
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Provide detailed reasons for your decision..."
                  disabled={isPending}
                  className="focus:ring-orange-500 border-gray-300 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2 border-t">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 h-10"
                  onClick={() => takeAction(true)}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve Application
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 h-10"
                  onClick={() => takeAction(false)}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Reject Application
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </LandConversionLayout>
  );
}
