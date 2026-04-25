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
import { UserCog, User } from "lucide-react";

interface Staff {
  id: string;
  name: string;
}

interface ReassignStaffProps {
  applicationId: string;
  currentStaffId: string | null;
  currentStaffName: string | null;
  staffMembers: Staff[];
  onSuccess?: () => void;
}

export default function ReassignStaff({
  applicationId,
  currentStaffId,
  currentStaffName,
  staffMembers,
  onSuccess,
}: ReassignStaffProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();

  // Filter out current staff from the list
  const availableStaff = staffMembers.filter(
    (staff) => staff.id !== currentStaffId
  );

  async function handleReassignment() {
    if (!selectedStaffId) {
      toast.error("Please select a staff member");
      return;
    }

    if (selectedStaffId === currentStaffId) {
      toast.error("Please select a different staff member");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("applicationId", applicationId);
      formData.append("staffId", selectedStaffId);

      const response = await fetch("/api/assign-staff", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          `Staff reassigned successfully${currentStaffName ? ` from ${currentStaffName}` : ""}`
        );
        router.refresh();
        setShowDialog(false);
        setSelectedStaffId("");
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to reassign staff. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDialog(true)}
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
      >
        <UserCog className="mr-2 h-4 w-4" />
        Reassign
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-blue-600" />
              Reassign Staff
            </DialogTitle>
            <DialogDescription>
              {currentStaffName
                ? `Currently assigned to: ${currentStaffName}. Select a new staff member to reassign this application.`
                : "Select a staff member to assign this application."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              {currentStaffName && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User className="h-4 w-4" />
                    <span>
                      <strong>Current Staff:</strong> {currentStaffName}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select New Staff Member
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
                    {availableStaff.length > 0 ? (
                      availableStaff.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-gray-500">
                        No other staff members available
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                setSelectedStaffId("");
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReassignment}
              disabled={isSubmitting || !selectedStaffId || availableStaff.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Reassigning..." : "Reassign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

