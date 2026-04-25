"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";

import Link from "next/link";
import { formatDate } from "@/utils/utils";
import { useLinkageTable } from "@/hooks/use-linkage-table";
import LinkageActionCell from "@/components/LinkageActionCell";

type CertificateItem = {
  id: string;
  applicationNo: string;
  applicantName: string;
  certificateNo: string;
  issueDate: Date;
  beneficiariesCount: number;
  pdfUrl: string | null;
};

export default function LinkagePrintListClient() {
  const {
    q,
    setQ,
    page,
    setPage,
    pageSize,
    items,
    total,
    loading,
    totalPages,
  } = useLinkageTable<CertificateItem>({
    apiEndpoint: "/api/linkage/certificates",
    initialItems: [],
  });
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <Card className="overflow-hidden rounded-sm border border-slate-300 shadow-sm">
      <div className="border-b-2 border-slate-700 bg-white px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 text-slate-700" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-600">
                Government Of West Bengal
              </p>
              <h2 className="text-lg font-semibold text-slate-900">
                Linkage Certificate Register
              </h2>
              <p className="text-xs text-slate-600">
                Official record for generated linkage certificates
              </p>
            </div>
          </div>
          <div>
            <Badge className="rounded-sm border border-slate-400 bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-800">
              Total Records: {total}
            </Badge>
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="border-b border-slate-300 bg-slate-50 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by applicant name or certificate number"
              className="rounded-sm border-slate-300 bg-white pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-100">
              <TableRow>
                <TableHead className="w-12 border-r border-slate-300 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                  Sl.
                </TableHead>
                <TableHead className="border-r border-slate-300 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                  Application No.
                </TableHead>
                <TableHead className="border-r border-slate-300 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                  Applicant Name
                </TableHead>
                <TableHead className="border-r border-slate-300 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                  Certificate No.
                </TableHead>
                <TableHead className="border-r border-slate-300 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                  Date Of Issue
                </TableHead>
                <TableHead className="border-r border-slate-300 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                  Beneficiaries
                </TableHead>
                <TableHead className="text-center text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                  Official Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id} className="hover:bg-slate-50/70">
                  <TableCell className="border-r border-slate-200 text-center font-medium">
                    {start + index}
                  </TableCell>

                  <TableCell className="border-r border-slate-200 font-medium text-slate-800">
                    {item.applicationNo}
                  </TableCell>
                  <TableCell className="border-r border-slate-200">
                    {item.applicantName}
                  </TableCell>
                  <TableCell className="border-r border-slate-200 font-semibold">
                    {item.certificateNo}
                  </TableCell>

                  <TableCell className="border-r border-slate-200">
                    {item.issueDate
                      ? formatDate(new Date(item.issueDate))
                      : "—"}
                  </TableCell>

                  <TableCell className="border-r border-slate-200 text-center">
                    <Badge
                      variant="outline"
                      className="rounded-sm border-slate-300 text-slate-700"
                    >
                      {item.beneficiariesCount}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center">
                    {item.pdfUrl ? (
                      <a href={item.pdfUrl} target="_blank" rel="noreferrer">
                        <Button
                          size="sm"
                          className="h-8 rounded-sm border border-emerald-700 bg-emerald-700 px-3 text-xs font-semibold uppercase tracking-wide text-white hover:bg-emerald-800"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </a>
                    ) : (
                      <LinkageActionCell certificateId={item.id} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {loading && (
          <div className="py-6 text-center text-sm text-slate-600">
            Loading official certificate records...
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="py-8 text-center text-sm text-slate-500">
            No certificate records found for the current search.
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-300 bg-slate-50 p-4">
          <div className="text-sm text-slate-700">
            Showing records {start} to {end} of {total}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page <= 1}
              className="rounded-sm border-slate-300"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <div className="mx-2 text-xs text-slate-500">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="rounded-sm border-slate-300"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
