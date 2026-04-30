"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export type Mistri = {
  id: string;
  name: string;
  mobileNumber: string | null;
  address: string | null;
  isActive: boolean;
  bankName: string | null;
  accountNumber: string | null;
  ifscCode: string | null;
};

export const columns: ColumnDef<Mistri>[] = [
  {
    accessorKey: "name",
    header: "Mistri Name",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-bold text-slate-900">{row.getValue("name")}</span>
        <span className="text-xs text-slate-500">{row.original.address || "No address provided"}</span>
      </div>
    ),
  },
  {
    accessorKey: "mobileNumber",
    header: "Contact Details",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-slate-50 rounded-md">
          <MoreHorizontal className="h-3.5 w-3.5 text-slate-400 rotate-90" />
        </div>
        <span className="font-medium text-slate-700">{row.getValue("mobileNumber") || "N/A"}</span>
      </div>
    ),
  },
  {
    accessorKey: "bankName",
    header: "Bank & Payment",
    cell: ({ row }) => {
      const mistri = row.original;
      if (!mistri.bankName && !mistri.accountNumber) return <span className="text-slate-400 italic text-xs">No bank details</span>;
      return (
        <div className="flex flex-col bg-slate-50/50 p-2 rounded-lg border border-slate-100 max-w-[180px]">
          <span className="font-bold text-slate-700 text-[11px] truncate">{mistri.bankName || "Unknown Bank"}</span>
          <span className="text-slate-600 text-[11px] font-mono tracking-tighter">{mistri.accountNumber || "N/A"}</span>
          <span className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest mt-0.5">{mistri.ifscCode || "N/A"}</span>
        </div>
      );
    }
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant="secondary" className={`${
          isActive
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-rose-50 text-rose-600 border-rose-200"
        } px-3 py-1 rounded-full font-medium`}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const mistri = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-slate-100 rounded-full transition-colors">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-5 w-5 text-slate-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 p-2 rounded-xl shadow-xl border-slate-200">
            <DropdownMenuLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 py-2">Actions</DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem asChild>
              <Link href={`/admindashboard/tubewell/mistri/${mistri.id}/edit`} className="cursor-pointer text-slate-600 focus:bg-slate-50 rounded-lg p-2.5 transition-colors">
                <Edit className="h-4 w-4 mr-3 text-sky-600" /> <span className="font-medium">Edit Details</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
