"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AgrementCertificate } from "@/components/PrintTemplet/Agrement-certificate";
import { Agreement } from "@/types/agreement";
import { formatDate } from "@/utils/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Search, FileText, ChevronLeft, ChevronRight } from "lucide-react";

interface SearchableAgreementTableProps {
  agreements: Agreement[];
}

function isStringOrNumber(value: unknown): value is string | number {
  return typeof value === "string" || typeof value === "number";
}

export function SearchableAgreementTable({
  agreements,
}: SearchableAgreementTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredAgreements = useMemo(() => {
    return agreements.filter((item) => {
      const memoNumber = item.acceptagency.WorksDetail?.nitDetails.memoNumber;
      if (isStringOrNumber(memoNumber)) {
        return memoNumber
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      }
      return false;
    });
  }, [agreements, searchTerm]);

  const totalPages = Math.ceil(filteredAgreements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAgreements = filteredAgreements.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-primary text-primary-foreground">
        <CardTitle className="text-2xl font-bold flex items-center">
          <FileText className="w-6 h-6 mr-2" />
          Agreement Certificates
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Label
              htmlFor="search"
              className="text-right font-semibold min-w-[100px]"
            >
              Search NIT No:
            </Label>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                type="text"
                placeholder="Enter NIT No..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8"
              />
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[80px] font-bold">Sl No</TableHead>
                  <TableHead className="font-bold">NIT No</TableHead>
                  <TableHead className="font-bold">Work Name</TableHead>
                  <TableHead className="font-bold">Agreement No</TableHead>
                  <TableHead className="font-bold">Agreement Date</TableHead>
                  <TableHead className="font-bold">Agency Name</TableHead>
                  <TableHead className="text-right font-bold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentAgreements.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {startIndex + index + 1}
                    </TableCell>
                    <TableCell>
                      {item.acceptagency.WorksDetail
                        ? `${
                            item.acceptagency.WorksDetail.nitDetails.memoNumber
                          } / ${formatDate(
                            item.acceptagency.WorksDetail.nitDetails.memoDate
                          )}`
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {item.workdetails.activityDescription || "N/A"}
                    </TableCell>
                    <TableCell>{item.aggrementno}</TableCell>
                    <TableCell>{formatDate(item.aggrementdate)}</TableCell>
                    <TableCell>
                      {item.acceptagency.agencydetails.name}
                    </TableCell>
                    <TableCell className="text-right">
                      <AgrementCertificate agrement={item} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredAgreements.length === 0 && (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No agreements found.</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to{" "}
          {Math.min(endIndex, filteredAgreements.length)} of{" "}
          {filteredAgreements.length} entries
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <div className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
