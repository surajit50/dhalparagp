"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, FileText, Settings2, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
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
import { format } from "date-fns";
import { updateRepairRequestStatus } from "@/action/tubewell";
import { toast } from "sonner";
import { useTransition } from "react";

export type RepairRequest = {
    id: string;
    citizenName: string;
    mobileNumber: string | null;
    address: string;
    problemDetails: string | null;
    status: "PENDING" | "APPROVED" | "WORK_ORDER_ISSUED" | "COMPLETED" | "REJECTED";
    createdAt: Date;
};

const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case "PENDING": 
            return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200/50 px-3 py-1 rounded-full font-medium">Pending Approval</Badge>;
        case "APPROVED": 
            return <Badge variant="secondary" className="bg-sky-50 text-sky-700 border-sky-200/50 px-3 py-1 rounded-full font-medium">Approved (Ready for WO)</Badge>;
        case "WORK_ORDER_ISSUED": 
            return <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200/50 px-3 py-1 rounded-full font-medium">Work Order Issued</Badge>;
        case "COMPLETED": 
            return <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200/50 px-3 py-1 rounded-full font-medium">Completed</Badge>;
        case "REJECTED": 
            return <Badge variant="destructive" className="px-3 py-1 rounded-full font-medium">Rejected</Badge>;
        default: 
            return <Badge variant="outline" className="px-3 py-1 rounded-full font-medium">{status}</Badge>;
    }
};

export const columns: ColumnDef<RepairRequest>[] = [
    {
        accessorKey: "createdAt",
        header: "Date Reported",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900">{format(new Date(row.getValue("createdAt")), "dd MMM yyyy")}</span>
                <span className="text-xs text-slate-500">{format(new Date(row.getValue("createdAt")), "hh:mm a")}</span>
            </div>
        ),
    },
    {
        accessorKey: "citizenName",
        header: "Citizen Details",
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-bold text-slate-900">{row.getValue("citizenName")}</span>
                <span className="text-xs text-slate-500">{row.original.mobileNumber || "No mobile"}</span>
            </div>
        ),
    },
    {
        accessorKey: "address",
        header: "Location & Problem",
        cell: ({ row }) => (
            <div className="flex flex-col max-w-[250px]">
                <span className="text-sm text-slate-700 font-medium truncate" title={row.getValue("address")}>
                    {row.getValue("address")}
                </span>
                <span className="text-xs text-slate-500 line-clamp-1 italic">
                    {row.original.problemDetails || "No details provided"}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Current Status",
        cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const request = row.original;

            const handleStatusUpdate = async (status: any) => {
                try {
                    await updateRepairRequestStatus(request.id, status);
                    toast.success("Status updated!");
                } catch {
                    toast.error("Failed to update status");
                }
            };

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

                        {request.status === "PENDING" && (
                            <>
                                <DropdownMenuItem onClick={() => handleStatusUpdate("APPROVED")} className="cursor-pointer text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 rounded-lg p-2.5 transition-colors">
                                    <CheckCircle2 className="h-4 w-4 mr-3" /> <span className="font-medium">Approve Request</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusUpdate("REJECTED")} className="cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50 rounded-lg p-2.5 transition-colors">
                                    <XCircle className="h-4 w-4 mr-3" /> <span className="font-medium">Reject</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-1" />
                            </>
                        )}

                        {request.status === "APPROVED" && (
                            <DropdownMenuItem asChild>
                                <Link href={`/admindashboard/tubewell/work-orders/create?reqId=${request.id}`} className="cursor-pointer text-sky-600 focus:text-sky-700 focus:bg-sky-50 rounded-lg p-2.5 transition-colors">
                                    <Settings2 className="h-4 w-4 mr-3" /> <span className="font-medium">Issue Work Order</span>
                                </Link>
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuItem asChild>
                            <Link href={`/admindashboard/tubewell/requests/${request.id}`} className="cursor-pointer text-slate-600 focus:bg-slate-50 rounded-lg p-2.5 transition-colors">
                                <FileText className="h-4 w-4 mr-3" /> <span className="font-medium">View Full Details</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
