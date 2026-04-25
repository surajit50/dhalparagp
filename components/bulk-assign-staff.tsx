"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, CheckCircle2 } from "lucide-react";

interface Staff {
  id: string;
  name: string;
}

interface BulkAssignStaffProps {
  selectedIds: string[];
  staffMembers: Staff[];
  onClose: () => void;
}

export default function BulkAssignStaff({
  selectedIds,
  staffMembers,
  onClose,
}: BulkAssignStaffProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const router = useRouter();

  async function handleBulkAssignment() {
    if (!selectedStaffId) {
      toast.error("Please select a staff member");
      return;
    }

    if (selectedIds.length === 0) {
      toast.error("No applications selected");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("applicationIds", selectedIds.join(","));
      formData.append("staffId", selectedStaffId);

      const response = await fetch("/api/bulk-assign-staff", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        router.refresh();
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to assign staff. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Bulk Assign to Staff
          </DialogTitle>
          <DialogDescription>
            Assign {selectedIds.length} selected application(s) to a staff member.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Staff Member
              </label>
              <Select
                value={selectedStaffId}
                onValueChange={setSelectedStaffId}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {selectedIds.length} application(s) will be assigned
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkAssignment}
            disabled={isSubmitting || !selectedStaffId}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Assigning..." : "Assign to Staff"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

