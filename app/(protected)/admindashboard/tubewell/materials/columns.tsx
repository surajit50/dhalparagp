"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Plus, History } from "lucide-react";
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

export type Material = {
    id: string;
    name: string;
    bengaliName?: string | null;
    unit: string;
    stock: number;
    rate: number;
    isActive: boolean;
};

export const columns: ColumnDef<Material>[] = [
    {
        accessorKey: "name",
        header: "Material Name",
        cell: ({ row }) => {
            const material = row.original;
            return (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{material.name}</span>
                    {material.bengaliName && (
                        <span className="text-xs text-slate-500 font-medium italic">{material.bengaliName}</span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "stock",
        header: "Current Stock",
        cell: ({ row }) => {
            const stock = row.getValue("stock") as number;
            const isLow = stock <= 10;
            return (
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={`${
                        isLow 
                        ? "bg-rose-50 text-rose-700 border-rose-200" 
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    } px-3 py-1 rounded-full font-bold`}>
                        {stock} {row.original.unit}
                    </Badge>
                    {isLow && (
                        <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" title="Low Stock Alert"></span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "rate",
        header: "Unit Rate",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("rate"));
            const formatted = new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
            }).format(amount);
            return <div className="font-bold text-slate-900">{formatted}</div>;
        },
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.getValue("isActive") as boolean;
            return (
                <Badge variant="secondary" className={`${
                    isActive 
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200" 
                    : "bg-slate-50 text-slate-600 border-slate-200"
                } px-3 py-1 rounded-full font-medium`}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const material = row.original;

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
                            <Link href={`/admindashboard/tubewell/materials/${material.id}/edit`} className="cursor-pointer text-slate-600 focus:bg-slate-50 rounded-lg p-2.5 transition-colors">
                                <Edit className="h-4 w-4 mr-3 text-sky-600" /> <span className="font-medium">Edit Details</span>
                            </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem asChild>
                            <Link href={`/admindashboard/tubewell/materials/${material.id}/stock`} className="cursor-pointer text-slate-600 focus:bg-slate-50 rounded-lg p-2.5 transition-colors">
                                <Plus className="h-4 w-4 mr-3 text-emerald-600" /> <span className="font-medium">Add Stock</span>
                            </Link>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem asChild>
                            <Link href={`/admindashboard/tubewell/materials/${material.id}/logs`} className="cursor-pointer text-slate-600 focus:bg-slate-50 rounded-lg p-2.5 transition-colors">
                                <History className="h-4 w-4 mr-3 text-indigo-600" /> <span className="font-medium">Stock History</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
