"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Printer, Download, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateLeaseNoticePDF } from "@/lib/pdf-lib";

export function BulkReprintNoticeDialog({ 
  leases,
  onOpenChange
}: { 
  leases: any[],
  onOpenChange?: (open: boolean) => void 
}) {
  const [open, setOpen] = useState(false);
  const [noticeType, setNoticeType] = useState<"REMINDER" | "EXPIRY">("REMINDER");

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  // Only leases that have a notice count > 0 or a last notice date are eligible for reprint
  const eligibleLeases = leases.filter(lease => {
    const hasNotice = (lease.noticeCount && lease.noticeCount > 0) || lease.lastNoticeDate;
    return !!hasNotice;
  });
  
  const ineligibleCount = leases.length - eligibleLeases.length;

  const handleDownload = () => {
    if (eligibleLeases.length === 0) return;
    
    // For a REPRINT, we want it to print the EXACT LAST notice number, which is `lease.noticeCount`.
    // So we need to pass a cloned lease with noticeCount - 1 to the generator so it prints the correct number.
    const reprintLeases = eligibleLeases.map(lease => ({
      ...lease,
      noticeCount: Math.max(0, lease.noticeCount - 1),
      isReprint: true,
    }));

    generateLeaseNoticePDF(reprintLeases, noticeType);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 transition-colors">
          <Printer className="h-4 w-4" />
          Reprint {leases.length} Notice{leases.length > 1 ? "s" : ""}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
          <div>
            <DialogTitle>Reprint Bulk Notices</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 p-3 bg-blue-50/50 text-blue-700 border border-blue-100 rounded-md">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
              <p className="text-sm">You are reprinting notices for <strong>{eligibleLeases.length}</strong> eligible lease{eligibleLeases.length !== 1 ? "s" : ""}.</p>
            </div>
            {ineligibleCount > 0 && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 border border-red-100 rounded-md">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm">
                  <strong>{ineligibleCount}</strong> lease{ineligibleCount > 1 ? "s were" : " was"} excluded because they have no previous notices to reprint.
                </p>
              </div>
            )}
            
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mt-2">
              <p className="text-xs text-blue-700 leading-relaxed">
                You are reprinting previously sent notices. This action will <strong>not</strong> increment the notice count or change the 7-day rule timer.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
              Select Notice Type
            </h3>
            <RadioGroup
              value={noticeType}
              onValueChange={(value) =>
                setNoticeType(value as "REMINDER" | "EXPIRY")
              }
              className="gap-3"
            >
              <div className="flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <RadioGroupItem value="REMINDER" id="breprint-r1" />
                <Label htmlFor="breprint-r1" className="cursor-pointer font-medium">
                  Payment Reminder
                </Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <RadioGroupItem value="EXPIRY" id="breprint-r2" />
                <Label htmlFor="breprint-r2" className="cursor-pointer font-medium">
                  Lease Expiry
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleDownload} className="gap-2" disabled={eligibleLeases.length === 0}>
              <Download className="h-4 w-4" />
              Download Merged PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
