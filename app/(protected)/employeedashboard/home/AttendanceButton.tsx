"use client";

import { useState, useTransition } from "react";
import { Fingerprint, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleAttendance } from "./actions";
import { toast } from "sonner";

interface AttendanceButtonProps {
  isCheckedIn: boolean;
  hasCheckedOut: boolean;
}

export function AttendanceButton({ isCheckedIn, hasCheckedOut }: AttendanceButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    if (hasCheckedOut) {
      toast.error("You have already checked out for today.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await toggleAttendance();
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success(isCheckedIn ? "Checked out successfully!" : "Checked in successfully!");
        }
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <Button 
      onClick={handleToggle}
      disabled={isPending || hasCheckedOut}
      variant={isCheckedIn ? "destructive" : "default"} 
      className={`gap-2 shadow-sm ${isCheckedIn ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Fingerprint className="h-4 w-4" />
      )}
      {hasCheckedOut ? "Shift Completed" : isCheckedIn ? "Check Out" : "Check In"}
    </Button>
  );
}
