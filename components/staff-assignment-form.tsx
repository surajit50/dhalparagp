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
import FormSubmitButton from "@/components/FormSubmitButton";

interface Staff {
  id: string;
  name: string;
}

interface StaffAssignmentFormProps {
  applicationId: string;
  staffMembers: Staff[];
}

export default function StaffAssignmentForm({
  applicationId,
  staffMembers,
}: StaffAssignmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleAssignment(formData: FormData) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/assign-staff", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        router.refresh();
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
    <form action={handleAssignment} className="flex gap-2">
      <input type="hidden" name="applicationId" value={applicationId} />
      <Select name="staffId" required disabled={isSubmitting}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select staff" />
        </SelectTrigger>
        <SelectContent>
          {staffMembers.map((staff) => (
            <SelectItem key={staff.id} value={staff.id}>
              {staff.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormSubmitButton disabled={isSubmitting}>
        {isSubmitting ? "Assigning..." : "Assign"}
      </FormSubmitButton>
    </form>
  );
}
