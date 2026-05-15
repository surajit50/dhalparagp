"use client";

import type { WarishApplicationProps } from "@/types";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatDate } from "@/utils/utils";
import { Badge } from "@/components/ui/badge";
import WarishCertificatePDF from "@/components/PrintTemplet/WarishCertificatePDF";
import { Button } from "@/components/ui/button";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
  Filter,
  Users,
  User,
  FileSignature,
} from "lucide-react";

export default function WarishGenerateListClient({
  applications: initial,
}: {
  applications: WarishApplicationProps[];
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(initial.length);
  const [applications, setApplications] =
    useState<WarishApplicationProps[]>(initial);

  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      const url = `/api/warish/generate-ready?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`;
      const res = await fetch(url, { signal: controller.signal });
      if (res.ok) {
        const data = await res.json();
        setApplications(data.items);
        setTotal(data.total);
      }
    };
    run();
    return () => controller.abort();
  }, [q, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-1 shadow-lg border-0 overflow-hidden bg-gradient-to-br from-orange-50 to-orange-50 dark:from-orange-950/20 dark:to-orange-950/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-800/30">
                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white">
                  Ready to Generate Certificates
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Applications ready for certificate generation
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-gray-800 dark:text-white">
                {total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                application{total !== 1 ? "s" : ""} pending
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Card */}
        <Card className="lg:w-96 shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search applications..."
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
                className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <Card className="shadow-lg border-0 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <TableRow className="border-b-2 border-gray-200 dark:border-gray-700">
                  <TableHead className="w-16 text-center font-semibold text-gray-700 dark:text-gray-300 py-4">
                    #
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Deceased Person
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 dark:text-gray-300 py-4">
                    Applicant
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300 py-4">
                    Reference No
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300 py-4">
                    Date
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300 py-4">
                    Status
                  </TableHead>
                  <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300 py-4">
                    DSC
                  </TableHead>
                  <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300 py-4">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.length > 0 ? (
                  applications.map((application, index) => (
                    <TableRow
                      key={application.id}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-colors group"
                    >
                      <TableCell className="text-center font-medium text-gray-600 dark:text-gray-400 py-4">
                        {(page - 1) * pageSize + index + 1}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {application.nameOfDeceased}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="text-gray-700 dark:text-gray-300">
                          {application.applicantName}
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Badge
                          variant="outline"
                          className="font-mono px-3 py-1 text-xs bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800"
                        >
                          {application.warishRefNo || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-gray-600 dark:text-gray-400 py-4">
                        {application.warishRefDate
                          ? formatDate(application.warishRefDate)
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 px-3 py-1">
                          Ready to Generate
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        {application.digitallySigned ? (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800 px-3 py-1">
                            <FileSignature className="h-3 w-3 mr-1" />
                            Signed
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-gray-400 border-gray-200 px-3 py-1"
                          >
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex justify-end">
                          <WarishCertificatePDF
                            applicationDetails={application}
                            mode="uploadAndDownload"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-4 text-gray-500 dark:text-gray-400">
                        <FileText className="h-16 w-16 opacity-40" />
                        <div className="space-y-2">
                          <p className="text-lg font-medium">
                            No applications found
                          </p>
                          <p className="text-sm max-w-sm">
                            {q
                              ? "Try adjusting your search query"
                              : "All applications have been processed"}
                          </p>
                        </div>
                        {q && (
                          <Button
                            variant="outline"
                            onClick={() => setQ("")}
                            className="mt-2"
                          >
                            Clear Search
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {applications.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {(page - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {Math.min(page * pageSize, total)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {total}
                </span>{" "}
                results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="gap-2 border-gray-300 dark:border-gray-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-2 text-sm px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400">Page</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {page}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">of</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="gap-2 border-gray-300 dark:border-gray-600"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
