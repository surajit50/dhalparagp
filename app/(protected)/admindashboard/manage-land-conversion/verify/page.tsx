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
  Search,
  CheckCircle,
  XCircle,
  FileSearch,
  Loader2,
  ExternalLink,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  getPendingVerifications,
  verifyDocuments,
} from "@/action/land-conversion-actions";
import LandConversionLayout from "../components/LandConversionLayout";

interface VerificationItem {
  id: string;
  applicationNo: string;
  applicantName: string;
  mouza: string;
  documents: { id: string; name: string; url: string; status: string }[];
}

export default function DocumentVerificationPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [selected, setSelected] = useState<VerificationItem | null>(null);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    setIsLoading(true);
    const result = await getPendingVerifications();
    if (result.success && result.data) {
      setItems(
        result.data.map((it) => ({
          id: it.id,
          applicationNo: it.applicationNo,
          applicantName: it.applicantName,
          mouza: it.mouza,
          documents: it.documents.map((d) => ({
            id: d.id,
            name: d.name,
            url: d.url,
            status: d.status,
          })),
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

  const handleVerify = (approve: boolean) => {
    if (!selected) return;

    startTransition(async () => {
      const result = await verifyDocuments(selected.id, approve);
      if (!result.success) {
        toast({
          title: "Verification failed",
          description: result.error ?? "Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: approve ? "Documents Verified" : "Documents Rejected",
        description: approve
          ? "Application moved to site inspection."
          : "Application rejected due to document issues.",
      });
      setSelected(null);
      await load();
    });
  };

  const filteredItems = items.filter(
    (it) =>
      it.applicationNo.toLowerCase().includes(search.toLowerCase()) ||
      it.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      it.mouza.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <LandConversionLayout
      title="Document Verification"
      description="Verify uploaded documents and proof of ownership."
      icon={FileSearch}
    >
      <div className="space-y-6">
        {/* ─── QUEUE TABLE ─── */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-base text-gray-800">
                  Pending Verification Queue
                </CardTitle>
                <CardDescription>
                  {filteredItems.length} application(s) awaiting document check
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by ID, name or mouza..."
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
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <FileSearch className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-medium">No applications found</p>
                <p className="text-xs text-gray-400 mt-1">
                  All documents verified or no pending queue.
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
                        Mouza
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center">
                        Documents
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
                    {filteredItems.map((it, idx) => (
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
                          {it.applicationNo}
                        </TableCell>
                        <TableCell className="font-medium text-gray-800 text-sm">
                          {it.applicantName}
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {it.mouza}
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-600">
                          {it.documents.length} doc(s)
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 text-xs"
                          >
                            PENDING
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(
                                selected?.id === it.id ? null : it
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

        {/* ─── DETAIL PANEL ─── */}
        {selected && (
          <Card className="border-blue-200 shadow-sm">
            <CardHeader className="bg-blue-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base text-blue-900">
                    Verification Panel —{" "}
                    <span className="font-mono">{selected.applicationNo}</span>
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    {selected.applicantName} · Mouza: {selected.mouza}
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
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FileSearch className="h-4 w-4" />
                Uploaded Documents ({selected.documents.length})
              </h4>

              {/* Documents table */}
              <div className="overflow-x-auto rounded-md border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="text-xs font-semibold uppercase text-gray-500">
                        Document Type
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-gray-500 text-center">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-gray-500 text-right">
                        View
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.documents.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-gray-400 text-sm py-6"
                        >
                          No documents uploaded yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      selected.documents.map((doc) => (
                        <TableRow key={doc.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-sm text-gray-800">
                            {doc.name.replace(/_/g, " ")}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                doc.status === "VERIFIED"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {doc.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              asChild
                            >
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                Open
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2 border-t">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 h-10"
                  onClick={() => handleVerify(true)}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve All Documents
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 h-10"
                  onClick={() => handleVerify(false)}
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
