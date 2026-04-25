"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, UserIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import StaffAssignForm from "@/components/staff-asing-form"
import { WarishApplicationProps } from "@/types";

interface Staff {
  id: string;
  name: string;
}

const columns: ColumnDef<WarishApplicationProps>[] = [
  {
    accessorKey: "index",
    header: "Sl No",
    cell: ({ row }) => (
      <div className="text-center font-medium">{row.index + 1}</div>
    ),
  },
  {
    accessorKey: "acknowlegment",
    header: "Application ID",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.acknowlegment}</Badge>
    ),
  },
  {
    accessorKey: "applicantName",
    header: "Applicant Name",
    cell: ({ row }) => (
      <div className="flex items-center">
        <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
        {row.original.applicantName}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Application Date",
    cell: ({ row }) => (
      <div className="flex items-center">
        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
        {format(new Date(row.original.createdAt), "dd MMM yyyy")}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Assign to Staff",
    cell: ({ row }) => (
      <StaffAssignForm applicationId={row.original.id} staff={[]} />
    ),
  },
];

interface WarishApplicationTableProps {
  initialWarishApplications: WarishApplicationProps[];
  staff: Staff[];
}

export default function WarishApplicationTable({
  initialWarishApplications,
  staff,
}: WarishApplicationTableProps) {
  const [data] = useState<WarishApplicationProps[]>(initialWarishApplications);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Warish Applications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
