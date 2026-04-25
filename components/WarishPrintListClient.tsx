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
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
  FileSignature,
} from "lucide-react";

import { useEffect, useState } from "react";

type CertificateItem = {
  id: string;
  acknowlegment: string;
  applicantName: string;
  nameOfDeceased: string;
  warishRefNo: string | null;
  warishRefDate: Date | null;
  documentUrl: string;
  digitallySigned: boolean;
};

export default function WarishPrintListClient({
  items: initial,
}: {
  items: CertificateItem[];
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [items, setItems] = useState(initial);
  const [total, setTotal] = useState(initial.length);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);

      try {
        const res = await fetch(
          `/api/warish/certificates?q=${q}&page=${page}&pageSize=${pageSize}`,
          { signal: controller.signal },
        );

        if (res.ok) {
          const data = await res.json();
          setItems(data.items);
          setTotal(data.total);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [q, page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  function download(url: string, name: string) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.download = `warish-${name}.pdf`;
    a.click();
  }

  return (
    <Card className="border shadow-md rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6" />
          <div>
            <h2 className="text-lg font-semibold">
              Warish Certificate Print List
            </h2>
            <p className="text-xs text-blue-100">
              Government of West Bengal Portal
            </p>
          </div>
        </div>

        <Badge className="bg-white text-blue-800 font-semibold px-3 py-1">
          Total: {total}
        </Badge>
      </div>

      <CardContent className="p-0">
        {/* Search */}
        <div className="p-4 border-b bg-gray-50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
              placeholder="Search by applicant name..."
              className="pl-9 bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="w-12">Sl</TableHead>
                <TableHead>Acknowledgment</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Deceased</TableHead>
                <TableHead>Certificate No</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">DSC</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell>{start + index}</TableCell>

                  <TableCell className="font-semibold text-green-600 bg-green-50">
                    {item.acknowlegment}
                  </TableCell>

                  <TableCell className="font-medium">
                    {item.applicantName}
                  </TableCell>

                  <TableCell>{item.nameOfDeceased}</TableCell>

                  <TableCell>
                    <Badge className="bg-blue-700 text-white">
                      {item.warishRefNo || "N/A"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {item.warishRefDate
                      ? new Date(item.warishRefDate).toLocaleDateString()
                      : "—"}
                  </TableCell>

                  <TableCell className="text-center">
                    {item.digitallySigned ? (
                      <Badge className="bg-green-100 text-green-800 border border-green-200">
                        <FileSignature className="h-3 w-3 mr-1 inline" />
                        Signed
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-gray-400 border-gray-300"
                      >
                        Not Signed
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      size="sm"
                      className="bg-blue-700 hover:bg-blue-800 text-white"
                      onClick={() =>
                        download(item.documentUrl, item.applicantName)
                      }
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-6 text-sm text-gray-600">
            Loading certificates...
          </div>
        )}

        {/* Empty */}
        {!loading && items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No certificates found
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            Showing {start} to {end} of {total}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
