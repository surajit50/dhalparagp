"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PondLeaseNoticePrint } from "./pond-lease-notice-print";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateLeaseNoticePDF } from "@/lib/pdf-lib";
import { updateNoticeCount } from "./actions";
import { toast } from "sonner";
import { differenceInDays } from "date-fns";

export function NoticeGenerateDialog({ lease }: { lease: any }) {
  const [open, setOpen] = useState(false);
  const [noticeType, setNoticeType] = useState<"REMINDER" | "EXPIRY">(
    "REMINDER",
  );

  const referenceDate = lease.noticeReceivedDate || lease.lastNoticeDate;
  const daysSinceLastNotice = referenceDate 
    ? differenceInDays(new Date(), new Date(referenceDate)) 
    : null;
  const canSendNotice = daysSinceLastNotice === null || daysSinceLastNotice >= 7;

  const handleDownload = async () => {
    try {
      await updateNoticeCount(lease.id);
      generateLeaseNoticePDF(lease, noticeType);
      toast.success("Notice generated successfully");
      setOpen(false); // Close dialog so state refreshes properly
    } catch (error) {
      toast.error("Failed to update notice count");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <FileText className="h-4 w-4 mr-2" />
          Generate Notice
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <DialogTitle>Generate Lease Notice</DialogTitle>
          </div>
          <div className="flex flex-col items-end gap-1 pr-6">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleDownload} className="gap-2" disabled={!canSendNotice}>
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          <div className="md:col-span-1 space-y-6">
            <div>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
                Notice Type
              </h3>
              <RadioGroup
                value={noticeType}
                onValueChange={(value) =>
                  setNoticeType(value as "REMINDER" | "EXPIRY")
                }
                className="gap-4"
              >
                <div className="flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <RadioGroupItem value="REMINDER" id="r1" />
                  <Label htmlFor="r1" className="cursor-pointer font-medium">
                    Payment Reminder
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <RadioGroupItem value="EXPIRY" id="r2" />
                  <Label htmlFor="r2" className="cursor-pointer font-medium">
                    Lease Expiry
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
              <p className="text-xs text-orange-700 leading-relaxed mb-2">
                Choose the notice type and preview the content on the right.
              </p>
              {((lease.noticeCount && lease.noticeCount > 0) || lease.lastNoticeDate) && (
                <div className="mt-2 pt-2 border-t border-orange-200">
                  <p className="text-xs font-semibold text-orange-800">
                    Notice Sent: {lease.noticeCount || 1} times
                  </p>
                  {lease.lastNoticeDate && (
                    <p className="text-xs text-orange-700">
                      Last Sent: {new Date(lease.lastNoticeDate).toLocaleDateString()}
                    </p>
                  )}
                  {lease.noticeReceivedDate && (
                    <p className="text-xs text-green-700 mt-1">
                      Received: {new Date(lease.noticeReceivedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
              
              {!canSendNotice && (
                <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-md">
                  <p className="text-xs text-red-600 font-medium">
                    ⚠️ A notice was {lease.noticeReceivedDate ? 'received' : 'sent'} recently. Please wait {7 - (daysSinceLastNotice || 0)} more day(s) before sending another.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
              Preview
            </h3>
            <PondLeaseNoticePrint lease={lease} noticeType={noticeType} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
