"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { PencilIcon } from "lucide-react";
import WorkOrderModificationDialog from "./WorkOrderModificationDialog";

interface WorkOrderModificationTableProps {
  workOrders: any[];
}

export default function WorkOrderModificationTable({
  workOrders,
}: WorkOrderModificationTableProps) {
  const [data, setData] = useState<any[]>(workOrders);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Filter data based on search and handle pagination
  useEffect(() => {
    const filtered = workOrders.filter((item) => {
      const aoc = Array.isArray(item.AwardofContract)
        ? item.AwardofContract[0]
        : item.AwardofContract;

      const searchLower = search.toLowerCase();
      const nitMatch = String(item.nitDetails?.memoNumber || "")
        .toLowerCase()
        .includes(searchLower);
      const workNoMatch = String(item.workslno || "")
        .toLowerCase()
        .includes(searchLower);
      const memoMatch = String(aoc?.workodermenonumber || "")
        .toLowerCase()
        .includes(searchLower);

      return nitMatch || workNoMatch || memoMatch;
    });

    const itemsPerPage = 20;
    const total = Math.ceil(filtered.length / itemsPerPage);
    setTotalPages(total === 0 ? 1 : total);

    const start = (page - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);
    setData(paginated);
  }, [search, page, workOrders]);

  return (
    <div className="space-y-4 rounded-lg border bg-white shadow">
      {/* Header */}
      <div className="bg-orange-700 text-white px-4 py-3 font-semibold">
        Work Order Modification
      </div>

      {/* Search */}
      <div className="p-4">
        <Input
          placeholder="Search by NIT / Memo / Work No"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-orange-50">
            <TableRow>
              <TableHead>Sl</TableHead>
              <TableHead>NIT Number</TableHead>
              <TableHead>Work No</TableHead>
              <TableHead>Memo Number</TableHead>
              <TableHead>Memo Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No Data Found
                </TableCell>
              </TableRow>
            )}

            {data.map((item, index) => {
              const aoc = Array.isArray(item.AwardofContract)
                ? item.AwardofContract[0]
                : item.AwardofContract;

              return (
                <TableRow key={item.id}>
                  <TableCell>{(page - 1) * 20 + index + 1}</TableCell>

                  <TableCell>{item.nitDetails?.memoNumber ?? "-"}</TableCell>

                  <TableCell>{item.workslno ?? "-"}</TableCell>

                  <TableCell>{aoc?.workodermenonumber ?? "-"}</TableCell>

                  <TableCell>
                    {aoc?.workordeermemodate
                      ? new Date(aoc.workordeermemodate).toLocaleDateString(
                          "en-IN",
                        )
                      : "-"}
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={
                        aoc?.isdelivery
                          ? "bg-green-600 text-white"
                          : "bg-yellow-500 text-white"
                      }
                    >
                      {aoc?.isdelivery ? "Delivered" : "Pending"}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      className="bg-orange-700 hover:bg-orange-800 text-white"
                      onClick={() => {
                        setSelectedId(item.id);
                        setOpen(true);
                      }}
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Modify
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}

      <div className="flex justify-between items-center p-4">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </Button>

        <span className="text-sm">
          Page {page} of {totalPages}
        </span>

        <Button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>

      {/* Dialog */}

      {selectedId && (
        <WorkOrderModificationDialog
          open={open}
          onOpenChange={setOpen}
          workId={selectedId}
        />
      )}
    </div>
  );
}
