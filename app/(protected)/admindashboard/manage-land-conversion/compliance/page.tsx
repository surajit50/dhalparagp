"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  AlertTriangle,
  Loader2,
  Eye,
  Search,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  getComplianceItems,
  updateComplianceStatus,
} from "@/action/land-conversion-actions";
import LandConversionLayout from "../components/LandConversionLayout";

interface ComplianceItem {
  id: string;
  applicationNo: string;
  applicantName: string;
  condition: string;
  status: "DUE" | "COMPLIED" | "VIOLATION";
}

function statusBadge(status: ComplianceItem["status"]) {
  const map = {
    DUE: "bg-amber-50 text-amber-700 border-amber-200",
    COMPLIED: "bg-green-50 text-green-700 border-green-200",
    VIOLATION: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <Badge
      variant="outline"
      className={`text-xs font-semibold ${map[status] ?? ""}`}
    >
      {status}
    </Badge>
  );
}

export default function ComplianceCheckPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [selected, setSelected] = useState<ComplianceItem | null>(null);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function load() {
    setIsLoading(true);
    const result = await getComplianceItems();
    if (result.success && result.data) {
      setItems(result.data);
    } else if (!result.success) {
      toast({
        title: "Failed to load compliance items",
        description: result.error ?? "Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const markStatus = (status: "COMPLIED" | "VIOLATION") => {
    if (!selected) return;

    startTransition(async () => {
      const result = await updateComplianceStatus(selected.id, status, note);
      if (!result.success) {
        toast({
          title: "Failed to update compliance",
          description: result.error ?? "Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title:
          status === "COMPLIED" ? "Compliance Recorded" : "Violation Flagged",
        description:
          status === "COMPLIED"
            ? "Condition marked as complied."
            : "Violation recorded and escalated.",
      });
      setNote("");
      setSelected(null);
      await load();
    });
  };

  const filtered = items.filter(
    (item) =>
      item.applicationNo.toLowerCase().includes(search.toLowerCase()) ||
      item.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      item.status.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    due: items.filter((i) => i.status === "DUE").length,
    complied: items.filter((i) => i.status === "COMPLIED").length,
    violation: items.filter((i) => i.status === "VIOLATION").length,
  };

  return (
    <LandConversionLayout
      title="Compliance Check"
      description="Track and enforce NOC conditions after issuance."
      icon={AlertTriangle}
    >
      <div className="space-y-6">
        {/* ─── STATS ─── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-amber-700">{counts.due}</p>
            <p className="text-xs font-medium text-amber-600 uppercase mt-1">
              Due
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-700">
              {counts.complied}
            </p>
            <p className="text-xs font-medium text-green-600 uppercase mt-1">
              Complied
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-700">
              {counts.violation}
            </p>
            <p className="text-xs font-medium text-red-600 uppercase mt-1">
              Violation
            </p>
          </div>
        </div>

        {/* ─── COMPLIANCE TABLE ─── */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-base text-gray-800">
                  Compliance Items
                </CardTitle>
                <CardDescription>
                  {filtered.length} record(s) found
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by App No, name, status..."
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
                <span className="text-sm">Loading compliance items...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <AlertTriangle className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-medium">No compliance records</p>
                <p className="text-xs text-gray-400 mt-1">
                  No NOC conditions pending compliance.
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
                      <TableHead className="text-xs font-semibold text-gray-600 uppercase">
                        Condition
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
                        <TableCell className="text-gray-600 text-sm max-w-[220px] truncate italic">
                          {item.condition}
                        </TableCell>
                        <TableCell className="text-center">
                          {statusBadge(item.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.status === "DUE" && (
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
                              Update
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── COMPLIANCE PANEL ─── */}
        {selected && (
          <Card className="border-amber-200 shadow-sm">
            <CardHeader className="bg-amber-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-amber-900">
                    Compliance Panel —{" "}
                    <span className="font-mono">{selected.applicationNo}</span>
                  </CardTitle>
                  <CardDescription className="text-amber-700">
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
              <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                <Label className="text-amber-700 font-semibold text-[10px] uppercase block mb-1">
                  Condition Description
                </Label>
                <p className="text-gray-800 leading-relaxed text-sm italic">
                  &ldquo;{selected.condition}&rdquo;
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500">Current Status:</span>
                  {statusBadge(selected.status)}
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="note"
                  className="text-gray-700 font-medium text-sm"
                >
                  Observation / Field Note
                </Label>
                <Textarea
                  id="note"
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Describe what was observed during the compliance check..."
                  className="focus:ring-amber-500 border-gray-300 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2 border-t">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 h-10"
                  onClick={() => markStatus("COMPLIED")}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Mark Complied
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 h-10"
                  onClick={() => markStatus("VIOLATION")}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  )}
                  Flag Violation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </LandConversionLayout>
  );
}
