"use client"

import { ColumnDef } from "@tanstack/react-table";
import { NitDetail } from "@/types/nitDetails";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileX,
  Calendar,
  Hash,
} from "lucide-react";

import { formatDate } from "@/utils/utils";

export const columns: ColumnDef<NitDetail>[] = [

  {
    id: "index",
    header: () => (
      <span className="font-semibold">Sl No</span>
    ),
    cell: ({ row }) => (
      <span className="font-medium">
        {row.index + 1}
      </span>
    ),
  },


  {
    accessorKey: "memoNumber",

    header: () => (
      <div className="flex items-center gap-2 font-semibold">
        <Hash className="w-4 h-4" />
        NIT Memo Number
      </div>
    ),

    cell: ({ row }) => (
      <span className="font-semibold text-primary">
        {row.original.memoNumber}
      </span>
    ),
  },


  {
    accessorKey: "publishingDate",

    header: () => (
      <div className="flex items-center gap-2 font-semibold">
        <Calendar className="w-4 h-4" />
        Publishing Date
      </div>
    ),

    cell: ({ row }) => (
      <span>
        {formatDate(row.original.publishingDate)}
      </span>
    ),
  },


  {
    accessorKey: "endTime",

    header: () => (
      <div className="flex items-center gap-2 font-semibold">
        <Calendar className="w-4 h-4" />
        Closing Date
      </div>
    ),

    cell: ({ row }) => (
      <span className="text-red-600 font-medium">
        {formatDate(row.original.endTime)}
      </span>
    ),
  },


  {
    accessorKey: "publishhardcopy",

    header: () => (
      <span className="font-semibold">
        Tender Document
      </span>
    ),

    cell: ({ row }) => {

      const doc = row.original.publishhardcopy;

      if (!doc)
        return (
          <span className="text-muted-foreground">
            Not Available
          </span>
        );

      return (
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 text-white shadow-sm"
          asChild
        >
          <a href={doc} download>

            <Download className="w-4 h-4 mr-2" />

            Download PDF

          </a>

        </Button>
      );

    },
  },

];
