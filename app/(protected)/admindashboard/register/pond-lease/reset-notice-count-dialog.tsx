"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { resetNoticeCount } from "./actions";
import { toast } from "sonner";

export function ResetNoticeCountDialog({ lease }: { lease: any }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    setIsLoading(true);
    try {
      await resetNoticeCount(lease.id);
      toast.success("Notice count has been reset to zero.");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to reset notice count.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasNotice = (lease.noticeCount && lease.noticeCount > 0) || lease.lastNoticeDate;
  if (!hasNotice) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-blue-600 focus:text-blue-700 focus:bg-blue-50">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Notice Count
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Notice Count</DialogTitle>
          <DialogDescription>
            Are you sure you want to reset the notice count? Use this option if the party has responded to the notices (e.g. by making a payment or an agreement) and you want to start the notice cycle from zero again.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleReset} disabled={isLoading} variant="default" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Yes, Reset Count
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
