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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Send,
  Clock,
  Loader2,
  Eye,
  Search,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  getApprovedApplications,
  issueNOC,
} from "@/action/land-conversion-actions";
import LandConversionLayout from "../components/LandConversionLayout";
import { Input } from "@/components/ui/input";

interface ApprovedItem {
  id: string;
  applicationNo: string;
  applicantName: string;
}

/** Returns a YYYY-MM-DD string exactly 6 months from today */
function sixMonthsFromToday(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return d.toISOString().split("T")[0];
}

/** Pretty-prints a YYYY-MM-DD string as DD/MM/YYYY */
function formatDisplay(iso: string) {
  if (!iso) return "";
  const [y, m, day] = iso.split("-");
  return `${day}/${m}/${y}`;
}

export default function NOCIssuancePage() {
  const { toast } = useToast();
  const [items, setItems] = useState<ApprovedItem[]>([]);
  const [selected, setSelected] = useState<ApprovedItem | null>(null);
  const [expiryDate, setExpiryDate] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function load() {
    setIsLoading(true);
    const result = await getApprovedApplications();
    if (result.success && result.data) {
      setItems(result.data);
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

  // Auto-set expiry to 6 months from today whenever an application is selected
  useEffect(() => {
    if (selected) {
      setExpiryDate(sixMonthsFromToday());
    } else {
      setExpiryDate("");
    }
  }, [selected]);

  const handleIssueNOC = () => {
    if (!selected) return;
    if (!expiryDate) {
      toast({
        title: "Expiry date required",
        description: "Please set an expiry date for the NOC.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await issueNOC(selected.id, new Date(expiryDate));
      if (!result.success) {
        toast({
          title: "Failed to issue NOC",
          description: result.error ?? "Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "NOC Issued Successfully",
        description: `Certificate generated for ${selected.applicationNo}.`,
      });
      setExpiryDate("");
      setSelected(null);
      await load();
    });
  };

  const filtered = items.filter(
    (it) =>
      it.applicationNo.toLowerCase().includes(search.toLowerCase()) ||
      it.applicantName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <LandConversionLayout
      title="NOC Issuance"
      description="Generate and issue the final land conversion NOC certificate."
      icon={FileText}
    >
      <div className="space-y-6">
        {/* ─── ISSUANCE TABLE ─── */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-base text-gray-800">
                  Ready for NOC Issuance
                </CardTitle>
                <CardDescription>
                  {filtered.length} approved application(s) awaiting NOC
                  generation
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by App No or name..."
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
                <FileText className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-medium">No applications ready</p>
                <p className="text-xs text-gray-400 mt-1">
                  No approved applications pending NOC issuance.
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
                    {filtered.map((it, idx) => (
                      <TableRow
                        key={it.id}
                        className={`cursor-pointer transition-colors ${
                          selected?.id === it.id
                            ? "bg-green-50 hover:bg-green-50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          setSelected(selected?.id === it.id ? null : it)
                        }
                      >
                        <TableCell className="text-gray-500 text-sm">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="font-mono font-semibold text-orange-800 text-sm">
                          {it.applicationNo}
                        </TableCell>
                        <TableCell className="font-medium text-gray-800 text-sm">
                          {it.applicantName}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 text-xs"
                          >
                            APPROVED
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(selected?.id === it.id ? null : it);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Issue NOC
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

        {/* ─── ISSUANCE PANEL ─── */}
        {selected && (
          <Card className="border-green-200 shadow-sm">
            <CardHeader className="bg-green-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-green-900">
                    Certificate Generation —{" "}
                    <span className="font-mono">{selected.applicationNo}</span>
                  </CardTitle>
                  <CardDescription className="text-green-700">
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
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 p-3 bg-green-50/50 rounded-lg border border-green-100 text-sm">
                <div>
                  <span className="text-green-700 font-semibold block uppercase text-[10px] mb-1">
                    Application No
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    {selected.applicationNo}
                  </span>
                </div>
                <div>
                  <span className="text-green-700 font-semibold block uppercase text-[10px] mb-1">
                    Applicant Name
                  </span>
                  <span className="font-bold text-slate-800">
                    {selected.applicantName}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium text-sm">
                  NOC Validity Period (Expiry Date)
                </Label>
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg max-w-xs">
                  <Clock className="h-4 w-4 text-green-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-green-900 text-sm">
                      {formatDisplay(expiryDate)}
                    </p>
                    <p className="text-xs text-green-700">
                      6 months from today (auto-calculated)
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  The NOC will automatically be marked as expired after this date.
                </p>
              </div>

              <div className="pt-2 border-t">
                <Button
                  className="w-full bg-orange-700 hover:bg-orange-800 h-11 text-sm font-semibold shadow"
                  onClick={handleIssueNOC}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Generate &amp; Issue NOC Certificate
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </LandConversionLayout>
  );
}
