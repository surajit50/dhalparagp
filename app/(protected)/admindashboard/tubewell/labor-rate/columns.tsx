"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Coins, FileText, MoreHorizontal, Trash } from "lucide-react";
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
import { deleteTubewellLaborRate } from "@/action/tubewell-labor-rate";
import { toast } from "sonner";
import { formatDate } from "@/utils/utils";

export type LaborRate = {
    id: string;
    workType: string;
    rate: number;
    effectiveFrom: Date;
    resolutionNumber: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export const columns: ColumnDef<LaborRate>[] = [
    {
        accessorKey: "createdAt",
        header: "Revision Date",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-bold text-slate-900">{formatDate(row.getValue("createdAt"))}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-tight">Active since</span>
            </div>
        ),
    },
    {
        accessorKey: "rate",
        header: "Labor Rate (₹)",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("rate"));
            const formatted = new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
            }).format(amount);
            return (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                        <Coins className="h-4 w-4" />
                    </div>
                    <span className="text-lg font-extrabold text-slate-900">{formatted}</span>
                </div>
            );
        },
    },
    {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
            const isFirst = row.index === 0;
            return (
                <Badge variant="secondary" className={`${
                    isFirst 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                    : "bg-slate-50 text-slate-500 border-slate-200"
                } px-3 py-1 rounded-full font-bold`}>
                    {isFirst ? "Current Active" : "Historical"}
                </Badge>
            );
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const rate = row.original;
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
                        <DropdownMenuItem className="cursor-not-allowed opacity-50 text-slate-400 rounded-lg p-2.5">
                            <FileText className="h-4 w-4 mr-3" /> <span className="font-medium">View History</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
