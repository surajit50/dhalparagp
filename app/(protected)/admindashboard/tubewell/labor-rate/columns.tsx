"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Coins, MoreHorizontal, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { deleteTubewellLaborRate } from "@/action/tubewell-labor-rate";
import { toast } from "sonner";
import { formatDate } from "@/utils/utils";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type LaborRate = {
  id: string;
  workType: string;
  rate: number;
  effectiveFrom: Date;
  resolutionNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// ── Cell action ─────────────────────────────────────────
const CellAction = ({ rate, isActive }: { rate: LaborRate; isActive: boolean }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteTubewellLaborRate(rate.id);
        toast.success("Labor rate deleted.");
        router.refresh();
      } catch (error: any) {
        toast.error(error.message || "Failed to delete rate");
      } finally {
        setDeleteOpen(false);
      }
    });
  };

  return (
    <>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Labor Rate?</AlertDialogTitle>
            <AlertDialogDescription>
              You are deleting the <span className="font-semibold">{rate.workType}</span> labor rate (₹{rate.rate}). This cannot be undone.
              {isActive && (
                <span className="block mt-2 text-amber-600 font-medium">
                  ⚠️ This is the currently active rate for this work type.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete Rate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-slate-100 rounded-full transition-colors" disabled={isPending}>
            <span className="sr-only">Open menu</span>
            {isPending ? (
              <Loader2 className="h-4 w-4 text-slate-500 animate-spin" />
            ) : (
              <MoreHorizontal className="h-5 w-5 text-slate-500" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 p-2 rounded-xl shadow-xl border-slate-200">
          <DropdownMenuLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 py-2">Actions</DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50 rounded-lg p-2.5 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-3" /> <span className="font-medium">Delete Rate</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const columns: ColumnDef<LaborRate>[] = [
  {
    accessorKey: "workType",
    header: "Work Type",
    cell: ({ row }) => (
      <div className="font-semibold text-slate-800">{row.getValue("workType")}</div>
    ),
  },
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
    cell: ({ row }) => <CellAction rate={row.original} isActive={row.index === 0} />,
  },
];
