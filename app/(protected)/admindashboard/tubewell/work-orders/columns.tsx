"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  FileText,
  Printer,
  CheckCircle2,
  Trash2,
  PackagePlus,
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { format } from "date-fns";
import { deleteWorkOrder } from "@/action/tubewell";
import { toast } from "sonner";
import { useState } from "react";
import { CompleteWorkOrderDialog } from "./complete-work-order-dialog";
import { AdjustStockDialog } from "./adjust-stock-dialog";
import { TubewellWorkOrderWithRelations } from "@/types";

export type WorkOrder = TubewellWorkOrderWithRelations;

// ──────────────────────────────────────────────────────────
// Status badge
// ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "ISSUED":
      return (
        <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200/50 px-3 py-1 rounded-full font-medium">
          Issued
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200/50 px-3 py-1 rounded-full font-medium">
          In Progress
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200/50 px-3 py-1 rounded-full font-medium">
          Completed
        </Badge>
      );
    case "CANCELLED":
      return <Badge variant="destructive" className="px-3 py-1 rounded-full font-medium">Cancelled</Badge>;
    default:
      return <Badge variant="outline" className="px-3 py-1 rounded-full font-medium">{status}</Badge>;
  }
};

// ──────────────────────────────────────────────────────────
// Cell action
// ──────────────────────────────────────────────────────────
interface CellActionProps {
  order: WorkOrder;
  allMaterials: Array<{
    id: string;
    name: string;
    stock: number;
    unit: string;
    rate: number;
  }>;
}

const CellAction = ({ order, allMaterials }: CellActionProps) => {
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);

  const isActive =
    order.status === "ISSUED" || order.status === "IN_PROGRESS";

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this work order? This will restore stock for all materials.",
      )
    )
      return;
    try {
      await deleteWorkOrder(order.id);
      toast.success("Work Order deleted and stock restored!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete work order");
    }
  };

  return (
    <>
      <CompleteWorkOrderDialog
        isOpen={isCompleteOpen}
        onClose={() => setIsCompleteOpen(false)}
        orderId={order.id}
        orderNumber={order.orderNumber}
        location={order.request?.address}
        mouza={order.request?.mouza}
      />

      <AdjustStockDialog
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        order={order}
        allMaterials={allMaterials}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {isActive && (
            <>
              <DropdownMenuItem
                onClick={() => setIsCompleteOpen(true)}
                className="cursor-pointer text-green-600"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Completed
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setIsAdjustOpen(true)}
                className="cursor-pointer text-orange-600"
              >
                <PackagePlus className="h-4 w-4 mr-2" /> Adjust Stock
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {order.status === "COMPLETED" && (
            <DropdownMenuItem asChild>
              <Link
                href={`/admindashboard/tubewell/bills/create?orderId=${order.id}`}
                className="cursor-pointer text-orange-600"
              >
                <FileText className="h-4 w-4 mr-2" /> Generate Bill
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild>
            <Link
              href={`/admindashboard/tubewell/work-orders/${order.id}/print`}
              className="cursor-pointer"
            >
              <Printer className="h-4 w-4 mr-2" /> Print Order
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="cursor-pointer text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete Order
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

// ──────────────────────────────────────────────────────────
// Column factory — pass allMaterials so CellAction can use it
// ──────────────────────────────────────────────────────────
export function createColumns(
  allMaterials: Array<{
    id: string;
    name: string;
    stock: number;
    unit: string;
    rate: number;
  }>
): ColumnDef<WorkOrder>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px] rounded-md border-slate-300"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px] rounded-md border-slate-300"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "orderNumber",
      header: "Order Details",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">#{row.getValue("orderNumber")}</span>
          <span className="text-xs text-slate-500 font-medium">{format(new Date(row.original.issueDate), "dd MMM yyyy")}</span>
        </div>
      ),
    },
    {
      accessorKey: "mistri.name",
      header: "Assigned Mistri",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900">{row.original.mistri.name}</span>
          <span className="text-xs text-slate-500">{row.original.mistri.mobileNumber || "No mobile"}</span>
        </div>
      ),
    },
    {
      accessorKey: "request.address",
      header: "Location",
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <span className="text-sm text-slate-700 font-medium line-clamp-2" title={row.original.request?.address}>
            {row.original.request?.address || "N/A"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      id: "actions",
      cell: ({ row }) => <CellAction order={row.original} allMaterials={allMaterials} />,
    },
  ];
}

// Keep a static export for backward-compatibility (no adjust stock features)
export const columns: ColumnDef<WorkOrder>[] = createColumns([]);
