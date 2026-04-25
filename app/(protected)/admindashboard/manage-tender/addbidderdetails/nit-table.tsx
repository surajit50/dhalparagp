"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import NitTableRow from "./nit-table-row";

interface ApprovedActionPlanDetails {
  activityDescription: string;
}

interface WorksDetail {
  id: string;
  ApprovedActionPlanDetails: ApprovedActionPlanDetails;
}

interface NitItem {
  id: string;
  memoNumber: number;
  memoDate: string | null;
  technicalBidOpeningDate: string | null;
  financialBidOpeningDate: string | null;
  WorksDetail: WorksDetail[];
}

interface NitTableProps {
  data: NitItem[];
}

export default function NitTable({ data }: NitTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return data.flatMap((item) =>
      item.WorksDetail.filter((work) =>
        work.ApprovedActionPlanDetails.activityDescription
          .toLowerCase()
          .includes(lowercasedSearchTerm)
      ).map((work) => ({ ...item, work }))
    );
  }, [data, searchTerm]);

  return (
    <div className="bg-background rounded-lg shadow-lg overflow-hidden">
      <div className="p-4">
        <Input
          type="search"
          placeholder="Search by work name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm mb-4"
          aria-label="Search by work name"
        />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">NIT Number</TableHead>
              <TableHead>Work Name</TableHead>
              <TableHead className="w-[100px]">Memo Date</TableHead>
              <TableHead className="w-[150px]">Technical Bid Opening</TableHead>
              <TableHead className="w-[150px]">Financial Bid Opening</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <NitTableRow
                  key={`${item.id}-${item.work.id}`}
                  item={item}
                  worklist={item.work}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
