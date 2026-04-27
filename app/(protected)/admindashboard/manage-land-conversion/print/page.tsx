"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Search,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getIssuedCertificatesForPrint,
  generateAndStoreCertificatePdf,
} from "@/action/land-conversion-actions";
import { formatDate } from "@/utils/utils";

type CertificateItem = {
  id: string;
  applicationId: string;
  applicationNo: string;
  applicantName: string;
  certificateNo: string;
  memoNumber: string;
  issueDate: Date;
  pdfUrl: string | null;
};

export default function LandConversionPrintPage() {
  const { toast } = useToast();
  const [allItems, setAllItems] = useState<CertificateItem[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(false);
  const [printingId, setPrintingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const result = await getIssuedCertificatesForPrint();
        if (!active) return;

        if (result.success && result.data) {
          setAllItems(result.data);
        } else {
          toast({
            title: "Failed to load certificates",
            description: result.error ?? "Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        if (!active) return;
        console.error("Error loading certificates:", error);
        toast({
          title: "Failed to load certificates",
          description: "Unexpected error. Please try again.",
          variant: "destructive",
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [toast]);

  const filtered = allItems.filter((item) => {
    const query = q.trim().toLowerCase();
    if (!query) return true;
    return (
      item.applicantName.toLowerCase().includes(query) ||
      item.applicationNo.toLowerCase().includes(query) ||
      item.certificateNo.toLowerCase().includes(query) ||
      item.memoNumber.toLowerCase().includes(query)
    );
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const currentItems = filtered.slice(startIndex, startIndex + pageSize);
  const start = total === 0 ? 0 : startIndex + 1;
  const end = Math.min(startIndex + currentItems.length, total);

  const handleDownload = async (certificateId: string) => {
    setPrintingId(certificateId);
    try {
      const existing = allItems.find((item) => item.id === certificateId);
      if (existing?.pdfUrl) {
        window.open(existing.pdfUrl, "_blank", "noopener,noreferrer");
        return;
      }

      const result = await generateAndStoreCertificatePdf(certificateId);
      if (!result.success || !result.data) {
        toast({
          title: "Failed to generate certificate",
          description: result.error ?? "Please try again.",
          variant: "destructive",
        });
        return;
      }
      setAllItems((prev) =>
        prev.map((item) =>
          item.id === certificateId ? { ...item, pdfUrl: result.data!.pdfUrl } : item,
        ),
      );
      window.open(result.data.pdfUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Error generating land conversion certificate PDF:", error);
      toast({
        title: "Failed to generate certificate",
        description:
          error instanceof Error
            ? error.message
            : "Unexpected error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPrintingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <div className="bg-[#1e40af] text-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <FileText className="h-7 w-7" />
          <div>
            <h1 className="text-lg font-semibold">
              Land Conversion Management System
            </h1>
            <p className="text-xs text-blue-100">Government of West Bengal</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white border border-gray-300 shadow-sm">
          <div className="bg-[#e2e8f0] px-4 py-3 border-b flex items-center justify-between">
            <div>
              <h2 className="text-gray-700 font-semibold">
                Print Land Conversion Certificates
              </h2>
              <p className="text-sm text-gray-600">
                Search and download issued land conversion certificates.
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-800 border border-blue-300">
              Total: {total}
            </Badge>
          </div>

          <CardContent className="p-0">
            <div className="p-4 border-b bg-blue-50">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  value={q}
                  onChange={(e) => {
                    setPage(1);
                    setQ(e.target.value);
                  }}
                  placeholder="Search by applicant, application no, certificate no or memo no..."
                  className="pl-9 border-blue-200 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-blue-50">
                  <TableRow>
                    <TableHead className="text-blue-900 font-semibold w-12">
                      Sl No
                    </TableHead>
                    <TableHead className="text-blue-900 font-semibold">
                      Applicant Name
                    </TableHead>
                    <TableHead className="text-blue-900 font-semibold">
                      Application No
                    </TableHead>
                    <TableHead className="text-blue-900 font-semibold">
                      Certificate No
                    </TableHead>
                    <TableHead className="text-blue-900 font-semibold">
                      Memo No
                    </TableHead>
                    <TableHead className="text-blue-900 font-semibold">
                      Issue Date
                    </TableHead>
                    <TableHead className="text-blue-900 font-semibold text-center">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        Loading certificates...
                      </TableCell>
                    </TableRow>
                  ) : currentItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        No certificates found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{startIndex + index + 1}</TableCell>
                        <TableCell>{item.applicantName}</TableCell>
                        <TableCell>{item.applicationNo}</TableCell>
                        <TableCell>{item.certificateNo}</TableCell>
                        <TableCell>{item.memoNumber}</TableCell>
                        <TableCell>
                          {item.issueDate
                            ? formatDate(new Date(item.issueDate))
                            : ""}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(item.id)}
                            disabled={printingId === item.id}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {printingId === item.id
                              ? "Generating..."
                              : "Download"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t bg-blue-50">
              <div className="text-sm text-gray-600">
                Showing {start}–{end} of {total} certificates
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );
}
