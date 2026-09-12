"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2, MapPin, Eye, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Tubewell } from "@prisma/client";
import { toTitleCase, formatDate } from "@/lib/utils";
import { deleteTubewell } from "@/action/tubewell";
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export type TubewellRow = Tubewell;

const ConditionBadge = ({ condition }: { condition: string }) => {
  switch (condition) {
    case "WORKING":
      return (
        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200/50 px-3 py-1 rounded-full font-medium">
          <CheckCircle2 className="h-3 w-3 mr-1.5 inline" /> Working
        </Badge>
      );
    case "DEFECTIVE":
      return (
        <Badge variant="secondary" className="bg-rose-50 text-rose-700 border-rose-200/50 px-3 py-1 rounded-full font-medium">
          <AlertTriangle className="h-3 w-3 mr-1.5 inline animate-pulse" /> Defective
        </Badge>
      );
    case "ABANDONED":
      return (
        <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200 px-3 py-1 rounded-full font-medium">
          <XCircle className="h-3 w-3 mr-1.5 inline" /> Abandoned
        </Badge>
      );
    default:
      return <Badge variant="outline">{toTitleCase(condition)}</Badge>;
  }
};

const CellAction = ({ tubewell }: { tubewell: TubewellRow }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteTubewell(tubewell.id);
        toast.success("Tubewell removed from register.");
        router.refresh();
      } catch (error: any) {
        toast.error(error.message || "Failed to delete tubewell");
      } finally {
        setDeleteOpen(false);
      }
    });
  };

  const mapsLink = `https://www.google.com/maps?q=${tubewell.latitude},${tubewell.longitude}`;

  return (
    <>
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Tubewell?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete tubewell{" "}
              <span className="font-semibold">{tubewell.tubewellNo ?? "Unnamed"}</span>{" "}
              from the register. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isPending ? "Deleting…" : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-9 w-9 p-0 hover:bg-slate-100 rounded-full transition-colors"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-5 w-5 text-slate-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 p-2 rounded-xl shadow-xl border-slate-200">
          <DropdownMenuLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 py-2">
            Actions
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem asChild>
            <Link
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer text-slate-600 focus:bg-slate-50 rounded-lg p-2.5 transition-colors"
            >
              <MapPin className="h-4 w-4 mr-3 text-blue-600" />{" "}
              <span className="font-medium">View on Map</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href={`/admindashboard/tubewell/register/${tubewell.id}/edit`}
              className="cursor-pointer text-slate-600 focus:bg-slate-50 rounded-lg p-2.5 transition-colors"
            >
              <Edit className="h-4 w-4 mr-3 text-orange-600" />{" "}
              <span className="font-medium">Edit Details</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1" />

          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setDeleteOpen(true);
              }}
              className="cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50 rounded-lg p-2.5 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-3" />{" "}
              <span className="font-medium">Delete Tubewell</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export const columns: ColumnDef<TubewellRow>[] = [
  {
    accessorKey: "tubewellNo",
    header: "Tubewell No.",
    cell: ({ row }) => (
      <div className="font-bold text-slate-900">
        {row.getValue("tubewellNo") ?? (
          <span className="text-slate-400 italic">—</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "tubewellType",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-blue-600 border-blue-200 font-medium">
        {toTitleCase(row.getValue("tubewellType"))}
      </Badge>
    ),
  },
  {
    accessorKey: "mouza",
    header: "Mouza",
    cell: ({ row }) => {
      const mouza = row.getValue("mouza");
      const ward = row.original.ward;
      return (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800">{mouza}</span>
          {ward && <span className="text-xs text-slate-500">Ward: {ward}</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "landmark",
    header: "Landmark",
    cell: ({ row }) => (
      <div
        className="max-w-[220px] truncate text-sm text-slate-700"
        title={row.getValue("landmark")}
      >
        {row.getValue("landmark")}
      </div>
    ),
  },
  {
    accessorKey: "condition",
    header: "Condition",
    cell: ({ row }) => <ConditionBadge condition={row.getValue("condition")} />,
  },
  {
    accessorKey: "createdAt",
    header: "Registered",
    cell: ({ row }) => (
      <span className="text-sm text-slate-600 font-medium">
        {formatDate(row.getValue("createdAt"))}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction tubewell={row.original} />,
  },
];
