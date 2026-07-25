"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarCheck, CalendarIcon } from "lucide-react";
import { markNoticeReceived } from "./actions";
import { toast } from "sonner";

export function MarkNoticeReceivedDialog({ lease }: { lease: any }) {
  const [open, setOpen] = useState(false);
  const [receivedDate, setReceivedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receivedDate) {
      toast.error("Please select a valid date");
      return;
    }
    
    setIsLoading(true);
    try {
      await markNoticeReceived(lease.id, new Date(receivedDate));
      toast.success("Notice marked as received!");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to update status");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Only show this option if a notice has actually been sent and not already marked as received
  const hasNotice = (lease.noticeCount && lease.noticeCount > 0) || lease.lastNoticeDate;
  if (!hasNotice || lease.noticeReceivedDate) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <CalendarCheck className="h-4 w-4 mr-2" />
          Mark Notice Received
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Notice as Received</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="receivedDate">Date Received by Party</Label>
            <div className="relative">
              <Input
                id="receivedDate"
                type="date"
                required
                value={receivedDate}
                max={format(new Date(), "yyyy-MM-dd")}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="pl-10"
              />
              <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Selecting this date will lock the notice generation for the next 7 days starting from this date.
            </p>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              <CalendarCheck className="h-4 w-4" />
              Save Received Date
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
