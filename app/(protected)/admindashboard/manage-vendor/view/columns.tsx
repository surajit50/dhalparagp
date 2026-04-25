"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { CreateAgencyUserButton } from "./_components/create-user-button";

export type AgencyDetails = {
  id: string;
  name: string;
  mobileNumber: string | null;
  email: string | null;
  pan: string | null;
  tin: string | null;
  gst: string | null;
  contactDetails: string;
  agencyType: "FARM" | "INDIVIDUAL";
  proprietorName: string | null;
};

export const columns: ColumnDef<AgencyDetails>[] = [
  // INDEX
  {
    accessorFn: (_, index) => index + 1,
    header: "#",
    id: "index",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.index + 1}</span>
    ),
  },

  // AGENCY NAME
  {
    accessorKey: "name",
    header: "Agency",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium">{row.original.name}</span>
        <span className="text-xs text-muted-foreground">
          TIN: {row.original.tin || "N/A"}
        </span>
      </div>
    ),
  },

  // AGENCY TYPE
  {
    accessorKey: "agencyType",
    header: "Type",
    cell: ({ row }) => {
      const isFarm = row.original.agencyType === "FARM";

      return (
        <Badge
          variant="secondary"
          className={`text-xs font-medium ${
            isFarm
              ? "bg-green-100 text-green-700 hover:bg-green-100"
              : "bg-blue-100 text-blue-700 hover:bg-blue-100"
          }`}
        >
          {isFarm ? "Farm" : "Individual"}
        </Badge>
      );
    },
  },

  // GST COLUMN (NEW)
  {
    accessorKey: "gst",
    header: "GST",
    cell: ({ row }) => {
      const gst = row.original.gst;

      return gst ? (
        <div className="flex flex-col">
          <Badge
            variant="secondary"
            className="w-fit bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs"
          >
            Registered
          </Badge>
          <span className="text-xs text-muted-foreground mt-1">{gst}</span>
        </div>
      ) : (
        <Badge
          variant="secondary"
          className="bg-gray-100 text-gray-600 hover:bg-gray-100 text-xs"
        >
          Not Registered
        </Badge>
      );
    },
  },

  // PROPRIETOR
  {
    accessorKey: "proprietorName",
    header: "Proprietor",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.agencyType === "FARM"
          ? row.original.proprietorName || "N/A"
          : "-"}
      </span>
    ),
  },

  // CONTACT
  {
    accessorKey: "email",
    header: "Contact",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm">{row.original.email || "N/A"}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.mobileNumber || "N/A"}
        </span>
      </div>
    ),
  },

  // STATUS
  {
    id: "status",
    header: "Status",
    cell: () => (
      <Badge
        variant="outline"
        className="text-xs border-green-300 text-green-600 bg-green-50"
      >
        Active
      </Badge>
    ),
  },

  // ACTIONS
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        {/* Create User Account */}
        <CreateAgencyUserButton
          agencyId={row.original.id}
          agencyName={row.original.name}
          agencyEmail={row.original.email}
          agencyMobile={row.original.mobileNumber}
        />

        {/* Edit */}
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-8 w-8 rounded-lg hover:bg-muted"
        >
          <Link
            href={`/admindashboard/manage-vendor/edit-agency/${row.original.id}`}
            aria-label={`Edit ${row.original.name}`}
          >
            <Edit className="h-4 w-4 text-muted-foreground" />
          </Link>
        </Button>

        {/* Delete */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg hover:bg-red-50"
          aria-label={`Delete ${row.original.name}`}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    ),
  },
];
