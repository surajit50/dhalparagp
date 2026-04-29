"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
  Calendar,
  CheckCircle,
  XCircle,
  MapPin,
  Loader2,
  Eye,
  Search,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  getInspections,
  completeInspection,
} from "@/action/land-conversion-actions";
import LandConversionLayout from "../components/LandConversionLayout";

interface InspectionItem {
  id: string;
  applicationId: string;
  siteAddress: string;
  scheduledDate: string;
  inspectorName: string;
  status: string;
}

export default function SiteInspectionPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<InspectionItem[]>([]);
  const [selected, setSelected] = useState<InspectionItem | null>(null);
  const [report, setReport] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function load() {
    setIsLoading(true);
    const result = await getInspections();
    if (result.success && result.data) {
      setItems(
        result.data.map((it) => ({
          id: it.id,
          applicationId: it.application.applicationNo,
          siteAddress:
            it.siteAddress ||
            `${it.application.mouza}, JL-${it.application.jlNo}, Plot-${it.application.plotNo}`,
          scheduledDate: new Date(it.scheduledDate).toLocaleDateString("en-IN"),
          inspectorName: it.inspectorName,
          status: it.status,
        }))
      );
    } else if (!result.success) {
      toast({
        title: "Failed to load inspections",
        description: result.error ?? "Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const handleCompleteInspection = (approve: boolean) => {
    if (!selected) return;
    if (!report.trim()) {
      toast({
        title: "Report required",
        description: "Please write the inspection findings before submitting.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await completeInspection(selected.id, report, approve);
      if (!result.success) {
        toast({
          title: "Failed to update inspection",
          description: result.error ?? "Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: approve ? "Inspection Completed" : "Inspection Rejected",
        description: approve
          ? "Findings recorded and sent for approval."
          : "Inspection rejected with remarks.",
      });
      setReport("");
      setSelected(null);
      await load();
    });
  };

  const filtered = items.filter(
    (it) =>
      it.applicationId.toLowerCase().includes(search.toLowerCase()) ||
      it.inspectorName.toLowerCase().includes(search.toLowerCase()) ||
      it.siteAddress.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <LandConversionLayout
      title="Site Inspection"
      description="Schedule and record field inspection details for land conversion."
      icon={MapPin}
    >
      <div className="space-y-6">
        {/* ─── INSPECTIONS TABLE ─── */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-base text-gray-800">
                  Scheduled Inspections
                </CardTitle>
                <CardDescription>
                  {filtered.length} inspection(s) pending completion
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by App No, inspector..."
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
                <span className="text-sm">Loading inspections...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <MapPin className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-medium">No inspections found</p>
                <p className="text-xs text-gray-400 mt-1">
                  No inspections are currently scheduled.
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
                        Site Address
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600 uppercase">
                        Inspector
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center">
                        Scheduled Date
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
                    {filtered.map((it, idx) => (
                      <TableRow
                        key={it.id}
                        className={`cursor-pointer transition-colors ${
                          selected?.id === it.id
                            ? "bg-blue-50 hover:bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          setSelected(selected?.id === it.id ? null : it)
                        }
                      >
                        <TableCell className="text-gray-500 text-sm">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="font-mono font-semibold text-blue-800 text-sm">
                          {it.applicationId}
                        </TableCell>
                        <TableCell className="text-gray-700 text-sm max-w-[200px] truncate">
                          {it.siteAddress}
                        </TableCell>
                        <TableCell className="text-gray-700 text-sm">
                          {it.inspectorName}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          <span className="flex items-center justify-center gap-1 text-gray-600">
                            <Calendar className="h-3.5 w-3.5" />
                            {it.scheduledDate}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                          >
                            {it.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(selected?.id === it.id ? null : it);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Report
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

        {/* ─── REPORT PANEL ─── */}
        {selected && (
          <Card className="border-blue-200 shadow-sm">
            <CardHeader className="bg-blue-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-blue-900">
                    Inspection Report —{" "}
                    <span className="font-mono">{selected.applicationId}</span>
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Inspector: {selected.inspectorName} · Scheduled:{" "}
                    {selected.scheduledDate}
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
              <div className="grid grid-cols-3 gap-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-sm">
                <div>
                  <Label className="text-blue-700 font-semibold text-[10px] uppercase block mb-1">
                    Application No
                  </Label>
                  <span className="font-mono font-bold text-slate-800">
                    {selected.applicationId}
                  </span>
                </div>
                <div>
                  <Label className="text-blue-700 font-semibold text-[10px] uppercase block mb-1">
                    Scheduled Date
                  </Label>
                  <span className="font-medium text-slate-800">
                    {selected.scheduledDate}
                  </span>
                </div>
                <div>
                  <Label className="text-blue-700 font-semibold text-[10px] uppercase block mb-1">
                    Inspector
                  </Label>
                  <span className="font-medium text-slate-800">
                    {selected.inspectorName}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-blue-700 font-semibold text-[10px] uppercase block mb-1">
                  Site Address
                </Label>
                <p className="text-sm text-gray-700 p-2 bg-gray-50 rounded border border-gray-200">
                  {selected.siteAddress}
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="report"
                  className="text-gray-700 font-medium text-sm"
                >
                  Findings &amp; Recommendations{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="report"
                  rows={5}
                  value={report}
                  onChange={(e) => setReport(e.target.value)}
                  placeholder="Describe observations, setbacks, access, surrounding land use, and any issues found during inspection..."
                  className="focus:ring-blue-500 border-gray-300 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2 border-t">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 h-10"
                  onClick={() => handleCompleteInspection(true)}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Complete &amp; Submit
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 h-10"
                  onClick={() => handleCompleteInspection(false)}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Report Rejection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </LandConversionLayout>
  );
}
