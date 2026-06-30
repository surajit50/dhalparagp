"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Printer, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react";
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
import Link from "next/link";
import { format } from "date-fns";
import { updateBillStatus } from "@/action/tubewell";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type Bill = {
  id: string;
  billNumber: string;
  workOrders: { orderNumber: string; mistri: { name: string } }[];
  totalMaterialCost: number;
  totalLaborCost: number;
  netAmount: number;
  status: "GENERATED" | "PAID" | "CANCELLED";
  billDate: Date;
};

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "GENERATED":
      return <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200/50 px-3 py-1 rounded-full font-medium">Generated</Badge>;
    case "PAID":
      return <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200/50 px-3 py-1 rounded-full font-medium">Paid</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive" className="px-3 py-1 rounded-full font-medium">Cancelled</Badge>;
    default:
      return <Badge variant="outline" className="px-3 py-1 rounded-full font-medium">{status}</Badge>;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// ── Cell Action component ───────────────────────────────
const CellAction = ({ bill }: { bill: Bill }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDialog, setConfirmDialog] = useState<"paid" | "cancelled" | null>(null);

  const handleStatusChange = (status: "PAID" | "CANCELLED") => {
    startTransition(async () => {
      try {
        await updateBillStatus(bill.id, status);
        toast.success(
          status === "PAID" ? "Bill marked as paid!" : "Bill cancelled."
        );
        router.refresh();
      } catch (error: any) {
        toast.error(error.message || "Failed to update bill");
      } finally {
        setConfirmDialog(null);
      }
    });
  };

  return (
    <>
      {/* Mark as Paid confirmation */}
      <AlertDialog open={confirmDialog === "paid"} onOpenChange={(o) => !o && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Bill as Paid?</AlertDialogTitle>
            <AlertDialogDescription>
              You are marking bill <span className="font-semibold">#{bill.billNumber}</span> ({formatCurrency(bill.netAmount)}) as paid. This action will update the payment status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleStatusChange("PAID")}
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-600"
            >
              {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Confirm Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Bill confirmation */}
      <AlertDialog open={confirmDialog === "cancelled"} onOpenChange={(o) => !o && setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel This Bill?</AlertDialogTitle>
            <AlertDialogDescription>
              You are cancelling bill <span className="font-semibold">#{bill.billNumber}</span>. This action marks the bill as void.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleStatusChange("CANCELLED")}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
              Cancel Bill
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

          <DropdownMenuItem asChild>
            <Link href={`/admindashboard/tubewell/bills/${bill.id}`} className="cursor-pointer text-slate-600 focus:bg-slate-50 rounded-lg p-2.5 transition-colors">
              <FileText className="h-4 w-4 mr-3 text-orange-600" /> <span className="font-medium">View Details</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href={`/admindashboard/tubewell/bills/${bill.id}/print`} className="cursor-pointer text-slate-600 focus:bg-slate-50 rounded-lg p-2.5 transition-colors">
              <Printer className="h-4 w-4 mr-3 text-orange-600" /> <span className="font-medium">Print Mustor Roll</span>
            </Link>
          </DropdownMenuItem>

          {bill.status === "GENERATED" && (
            <>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem
                onClick={() => setConfirmDialog("paid")}
                className="cursor-pointer text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 rounded-lg p-2.5 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4 mr-3" /> <span className="font-medium">Mark as Paid</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setConfirmDialog("cancelled")}
                className="cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50 rounded-lg p-2.5 transition-colors"
              >
                <XCircle className="h-4 w-4 mr-3" /> <span className="font-medium">Cancel Bill</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const columns: ColumnDef<Bill>[] = [
  {
    accessorKey: "billNumber",
    header: "Bill Details",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-bold text-slate-900">#{row.getValue("billNumber")}</span>
        <span className="text-xs text-slate-500 font-medium">{format(new Date(row.original.billDate), "dd MMM yyyy")}</span>
      </div>
    ),
  },
  {
    accessorFn: (row) => row.workOrders[0]?.mistri.name || "N/A",
    id: "mistri",
    header: "Payment To",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold text-slate-900">{row.getValue("mistri")}</span>
        <span className="text-[10px] text-slate-500 uppercase tracking-tight">Mistri / Mechanic</span>
      </div>
    ),
  },
  {
    accessorFn: (row) => row.workOrders.map(wo => wo.orderNumber).join(", "),
    id: "workOrderNo",
    header: "Work Orders",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1 max-w-[200px]">
        {row.original.workOrders.map((wo, i) => (
          <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-mono">
            #{wo.orderNumber}
          </span>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "netAmount",
    header: "Net Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("netAmount"));
      return (
        <div className="flex flex-col items-start">
          <span className="font-bold text-slate-900">{formatCurrency(amount)}</span>
          <span className="text-[9px] text-slate-400 uppercase font-bold">Incl. all taxes</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction bill={row.original} />,
  },
];
