"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { renewWarishApplication } from "@/action/renew-warish-application";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, FileText, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";

export type WarishApplication = {
  id: string;
  applicantName: string;
  warishRefNo?: string | null;
  warishRefDate?: Date | null;
  renewdate?: Date | null;
  approvalYear?: string | null;
};

const RenewButton = ({ id }: { id: string }) => {
  const [isRenewing, setIsRenewing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleRenew = async () => {
    setIsRenewing(true);
    try {
      const result = await renewWarishApplication(id);
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
          variant: "default",
        });
        // Refresh the page to update the table
        window.location.reload();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to renew application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRenewing(false);
      setShowConfirmation(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowConfirmation(true)}
        disabled={isRenewing}
        size="sm"
        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
      >
        {isRenewing ? (
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Renewing...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Renew</span>
          </div>
        )}
      </Button>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white bg-opacity-20 rounded-full">
                  <RefreshCw className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Confirm Renewal</h3>
                  <p className="text-blue-100 text-sm">Application renewal confirmation</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to renew this application? This action will:
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Update the renewal date</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Reset the approval status</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Generate a new reference number</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-red-700">
                      This action cannot be undone.
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => setShowConfirmation(false)}
                  variant="outline"
                  disabled={isRenewing}
                  className="border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRenew}
                  disabled={isRenewing}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium"
                >
                  {isRenewing ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4" />
                      <span>Confirm Renewal</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const columns: ColumnDef<WarishApplication>[] = [
  {
    accessorKey: "applicantName",
    header: "Applicant Name",
    cell: ({ row }) => (
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-full">
          <User className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{row.original.applicantName}</p>
          <p className="text-sm text-gray-500">Applicant</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "warishRefNo",
    header: "Reference Number",
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <FileText className="h-4 w-4 text-gray-400" />
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {row.original.warishRefNo || "N/A"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "warishRefDate",
    header: "Reference Date",
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <Calendar className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-600">
          {row.original.warishRefDate
            ? format(row.original.warishRefDate, "dd/MM/yyyy")
            : "N/A"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "renewdate",
    header: "Renewal Date",
    cell: ({ row }) => (
      <div className="flex items-center space-x-2">
        <Calendar className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-600">
          {row.original.renewdate
            ? format(row.original.renewdate, "dd/MM/yyyy")
            : "N/A"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "approvalYear",
    header: "Approval Year",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.original.approvalYear || "N/A"}
      </Badge>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const today = new Date();
      const currentYear = today.getFullYear().toString();
      const isOverdue =
        row.original.renewdate && row.original.renewdate < today;
      const isDifferentYear =
        row.original.approvalYear !== undefined &&
        row.original.approvalYear !== currentYear;

      if (isOverdue && isDifferentYear) {
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Overdue & Different Year
          </Badge>
        );
      } else if (isOverdue) {
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Overdue
          </Badge>
        );
      } else if (isDifferentYear) {
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Different Year
          </Badge>
        );
      } else {
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Up to Date
          </Badge>
        );
      }
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <RenewButton id={row.original.id} />,
  },
];
