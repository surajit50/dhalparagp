"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateLeaveStatus } from "@/action/leaveAction";
import { Loader2, Check, X, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface LeaveWithUser {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  reason: string;
  leaveType: string | null;
  durationInDays: number | null;
  createdAt: string;
  User: {
    name: string | null;
    email: string | null;
  };
}

export const LeaveAdminClient = ({ initialLeaves }: { initialLeaves: LeaveWithUser[] }) => {
  const [leaves, setLeaves] = useState(initialLeaves);
  const [isPending, startTransition] = useTransition();
  const [selectedLeave, setSelectedLeave] = useState<LeaveWithUser | null>(null);

  const handleUpdateStatus = (id: string, status: "approved" | "rejected") => {
    startTransition(() => {
      updateLeaveStatus(id, status)
        .then((data) => {
          if (data?.error) {
            toast.error(data.error);
          }
          if (data?.success) {
            toast.success(data.success);
            setLeaves((prev) => prev.filter((l) => l.id !== id));
            setSelectedLeave(null);
          }
        })
        .catch(() => toast.error("Something went wrong!"));
    });
  };

  if (leaves.length === 0) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        No pending leave applications at the moment.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Employee</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Dates</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Type</th>
            <th className="px-4 py-2 text-left font-medium text-gray-700">Reason</th>
            <th className="px-4 py-2 text-right font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {leaves.map((leave) => (
            <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-2">
                <div className="font-medium text-gray-900">{leave.User?.name || "Unknown"}</div>
                <div className="text-xs text-gray-500">{leave.User?.email}</div>
              </td>
              <td className="px-4 py-2">
                <div>{format(new Date(leave.startDate), "dd MMM")} - {format(new Date(leave.endDate), "dd MMM yyyy")}</div>
                <div className="text-xs text-gray-500">{leave.durationInDays} days</div>
              </td>
              <td className="px-4 py-2 text-gray-700">{leave.leaveType || "-"}</td>
              <td className="px-4 py-2">
                <p className="line-clamp-1 text-gray-600 max-w-[200px]">{leave.reason}</p>
              </td>
              <td className="px-4 py-2 text-right space-x-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedLeave(leave)}>
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Leave Application Details</DialogTitle>
                      <DialogDescription>
                        Review the details before approving or rejecting.
                      </DialogDescription>
                    </DialogHeader>
                    {selectedLeave && (
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-semibold text-gray-500">Employee</p>
                            <p>{selectedLeave.User.name}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-500">Leave Type</p>
                            <p>{selectedLeave.leaveType}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-500">From</p>
                            <p>{format(new Date(selectedLeave.startDate), "PPP")}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-500">To</p>
                            <p>{format(new Date(selectedLeave.endDate), "PPP")}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-500">Duration</p>
                            <p>{selectedLeave.durationInDays} days</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-500">Applied On</p>
                            <p>{format(new Date(selectedLeave.createdAt), "PPP")}</p>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-500 text-sm">Reason</p>
                          <p className="text-sm bg-muted p-3 rounded-md mt-1 italic">
                            "{selectedLeave.reason}"
                          </p>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <Button
                            variant="destructive"
                            onClick={() => handleUpdateStatus(selectedLeave.id, "rejected")}
                            disabled={isPending}
                          >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><X className="h-4 w-4 mr-1" /> Reject</>}
                          </Button>
                          <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleUpdateStatus(selectedLeave.id, "approved")}
                            disabled={isPending}
                          >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" /> Approve</>}
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
