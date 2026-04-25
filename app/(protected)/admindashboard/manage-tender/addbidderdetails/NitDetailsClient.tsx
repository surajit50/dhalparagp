"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatDate } from "@/utils/utils";
import { ShowNitDetails } from "@/components/ShowNitDetails";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Define types based on the data structure used in page.tsx
interface WorkDetail {
  id: string;
  workslno: string | number;
  tenderStatus: string;
  ApprovedActionPlanDetails: {
    activityDescription: string;
  } | null;
}

interface NitDetail {
  id: string;
  memoNumber: string | number;
  memoDate: Date | string;
  technicalBidOpeningDate: Date | string | null;
  createdAt: Date | string;
  WorksDetail: WorkDetail[];
}

interface NitDetailsClientProps {
  data: NitDetail[];
}

export const NitDetailsClient = ({ data }: NitDetailsClientProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter logic
  const filteredData = data.filter((item) => {
    const searchLower = searchTerm.toLowerCase();

    // Check Memo Number
    if (item.memoNumber.toString().toLowerCase().includes(searchLower))
      return true;

    // Check Work Details
    const hasMatchingWork = item.WorksDetail.some((work) => {
      // Check Work Description
      if (
        work.ApprovedActionPlanDetails?.activityDescription
          ?.toLowerCase()
          .includes(searchLower)
      )
        return true;

      // Check Work Serial Number
      if (work.workslno.toString().toLowerCase().includes(searchLower))
        return true;

      return false;
    });

    return hasMatchingWork;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Link
                href="/admindashboard/home"
                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              NIT Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage tender processes, view details, and add bidder information.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Link href="/admindashboard/manage-tender/create-nit">
              <Button
                size="sm"
                className="h-9 gap-2 bg-[#0f172a] hover:bg-[#1e293b]"
              >
                <Plus className="h-3.5 w-3.5" />
                Create New NIT
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Section */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by NIT No, Work Description, or Work Sl No..."
                  className="pl-9 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 whitespace-nowrap">
                <Filter className="h-4 w-4" />
                <span>
                  Showing {filteredData.flatMap((d) => d.WorksDetail).length}{" "}
                  works from {filteredData.length} NITs
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Section - NIC Style */}
        <div className="rounded-lg border border-gray-300 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#1e40af] hover:bg-[#1e40af] border-b border-gray-300">
                  <TableHead className="w-[250px] text-white font-semibold h-12 border-r border-blue-800/30">
                    NIT Information
                  </TableHead>
                  <TableHead className="min-w-[400px] text-white font-semibold h-12 border-r border-blue-800/30">
                    Work Description
                  </TableHead>
                  <TableHead className="w-[180px] text-white font-semibold h-12 border-r border-blue-800/30">
                    Important Dates
                  </TableHead>
                  <TableHead className="w-[150px] text-white font-semibold text-center h-12 border-r border-blue-800/30">
                    Status
                  </TableHead>
                  <TableHead className="w-[150px] text-white font-semibold text-right h-12">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.flatMap((item) =>
                    item.WorksDetail.map((worklist, index) => (
                      <TableRow
                        key={`${item.id}-${index}`}
                        className="hover:bg-blue-50/50 transition-colors border-b border-gray-200 group"
                      >
                        <TableCell className="align-top py-4 border-r border-gray-100 bg-gray-50/30 font-medium">
                          <ShowNitDetails
                            nitdetails={item.memoNumber}
                            memoDate={new Date(item.memoDate)}
                            workslno={worklist.workslno}
                          />
                        </TableCell>
                        <TableCell className="align-top py-4 border-r border-gray-100 max-w-[400px]">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-900 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                              {worklist.ApprovedActionPlanDetails
                                ?.activityDescription || "N/A"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="align-top py-4 border-r border-gray-100">
                          <div className="flex flex-col gap-1.5 text-xs">
                            <div className="flex flex-col">
                              <span className="text-gray-500 font-medium">
                                Bid Opening
                              </span>
                              <span className="text-gray-900">
                                {item.technicalBidOpeningDate
                                  ? formatDateTime(
                                      new Date(item.technicalBidOpeningDate),
                                    ).dateOnly
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-500 font-medium">
                                Created
                              </span>
                              <span className="text-gray-900">
                                {
                                  formatDateTime(new Date(item.createdAt))
                                    .dateOnly
                                }
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="align-top py-4 text-center border-r border-gray-100">
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"
                          >
                            In Progress
                          </Badge>
                        </TableCell>
                        <TableCell className="align-top py-4 text-right">
                          <Link
                            href={`/admindashboard/manage-tender/addbidderdetails/${worklist.id}`}
                          >
                            <Button
                              size="sm"
                              className="bg-white text-blue-700 border-2 border-blue-600 hover:bg-blue-50 shadow-sm font-semibold"
                            >
                              <Plus className="mr-1.5 h-4 w-4" />
                              Add Bidder
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    )),
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-[300px] text-center">
                      <div className="flex flex-col items-center justify-center space-y-3 text-gray-500">
                        <div className="p-4 rounded-full bg-gray-100">
                          <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-900">
                          No results found
                        </p>
                        <p className="text-sm">
                          Try adjusting your search terms or filters
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => setSearchTerm("")}
                          className="mt-2"
                        >
                          Clear Search
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};
