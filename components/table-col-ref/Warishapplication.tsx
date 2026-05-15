"use client";

import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  UserIcon,
  MapPin,
  UserRound,
  Clipboard,
} from "lucide-react";
import { WarishApplicationProps } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import WarishActionCell from "./WarishActionCell";

export const warishcolref: ColumnDef<WarishApplicationProps>[] = [
  {
    accessorKey: "acknowlegment",
    header: "Application ID",
    cell: ({ row }) => (
      <div className="flex items-center group">
        <Clipboard className="mr-2 h-4 w-4 text-muted-foreground" />
        <Badge
          variant="outline"
          className="font-mono hover:bg-accent transition-colors cursor-pointer"
          onClick={() =>
            navigator.clipboard.writeText(row.original.acknowlegment)
          }
        >
          {row.original.acknowlegment}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "applicantName",
    header: "Applicant Name",
    cell: ({ row }) => (
      <div className="flex items-center">
        <UserRound className="mr-2 h-4 w-4 text-primary" />
        <span className="font-medium">{row.original.applicantName}</span>
      </div>
    ),
  },
  {
    accessorKey: "nameOfDeceased",
    header: "Deceased Name",
    cell: ({ row }) => (
      <div className="flex items-center">
        <UserIcon className="mr-2 h-4 w-4 text-destructive" />
        <span className="text-foreground/90">
          {row.original.nameOfDeceased}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "fatherName",
    header: "Father's Name",
    cell: ({ row }) => (
      <div className="flex items-center">
        <UserRound className="mr-2 h-4 w-4 text-orange-500" />
        <span className="text-muted-foreground">
          {row.original.fatherName === "NA" ? "N/A" : row.original.fatherName}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "villageName",
    header: "Village",
    cell: ({ row }) => (
      <div className="flex items-center">
        <MapPin className="mr-2 h-4 w-4 text-green-500" />
        <span className="text-muted-foreground">
          {row.original.villageName}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Application Date",
    cell: ({ row }) => (
      <div className="flex items-center group">
        <CalendarIcon className="mr-2 h-4 w-4 text-purple-500" />
        <div className="flex flex-col">
          <span className="text-sm">
            {format(new Date(row.original.createdAt), "dd/MM/yy")}
          </span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(row.original.createdAt), "hh:mm a")}
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <WarishActionCell applicationId={row.original.id} />,
  },
];
