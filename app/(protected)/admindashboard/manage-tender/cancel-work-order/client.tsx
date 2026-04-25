"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { WorkOrder } from "@/types/workOrder";
import { db } from "@/lib/db";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface CancelWorkOrderClientProps {
  initialWorkOrders: WorkOrder[];
}

export function CancelWorkOrderClient({
  initialWorkOrders,
}: CancelWorkOrderClientProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const cancellationReasons = [
    "Contractor Performance Issues",
    "Budget Constraints",
    "Project Scope Changes",
    "Force Majeure",
    "Regulatory Compliance Issues",
    "Other",
  ];

  const resetForm = () => {
    setSelectedOrder(null);
    setCancelReason("");
    setRemarks("");
    setSelectedFile(null);
    setIsLoading(false);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleCancelClick = (order: WorkOrder) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("File upload failed");
      }

      const data = await response.json();
      return data.fileUrl;
    } catch (error) {
      console.error("File upload error:", error);
      throw new Error("Failed to upload file");
    }
  };

  const handleCancelWorkOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please select a cancellation reason");
      return;
    }

    if (!selectedOrder) {
      toast.error("No work order selected");
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      let documentUrl = "";

      // Upload file if selected
      if (selectedFile) {
        try {
          documentUrl = await uploadFile(selectedFile);
        } catch (error) {
          toast.error("Failed to upload file. Please try again.");
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch("/api/work-orders/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workOrderId: selectedOrder.id,
          cancelReason: cancelReason,
          remarks: remarks,
          documents: documentUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to cancel work order");
      }

      toast.success("Work order cancelled successfully");
      handleDialogClose();
      router.refresh();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to cancel work order";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cancel Work Orders</h1>
        <div className="text-sm text-gray-500">
          Total Orders: {initialWorkOrders.length}
        </div>
      </div>

      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Work Order ID</TableHead>
              <TableHead>Agency Name</TableHead>
              <TableHead>Work Status</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialWorkOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.Bidagency?.agencydetails.name}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {order.Bidagency?.WorksDetail?.workStatus}
                  </span>
                </TableCell>
                <TableCell>
                  {order.Bidagency?.WorksDetail?.AwardofContract
                    ?.workordeermemodate
                    ? new Date(
                        order.Bidagency.WorksDetail.AwardofContract?.workordeermemodate
                      ).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  ₹
                  {
                    order.Bidagency?.WorksDetail?.AwardofContract
                      ?.workorderdetails[0].Bidagency?.biddingAmount
                  }
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancelClick(order)}
                  >
                    Cancel Order
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Work Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cancellation Reason</label>
              <Select value={cancelReason} onValueChange={setCancelReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {cancellationReasons.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Remarks</label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter additional remarks (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document">Upload Supporting Document</Label>
              <Input
                id="document"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              {selectedFile && (
                <p className="text-sm text-gray-500">
                  Selected file: {selectedFile.name}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleDialogClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelWorkOrder}
              disabled={isLoading}
            >
              {isLoading ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
