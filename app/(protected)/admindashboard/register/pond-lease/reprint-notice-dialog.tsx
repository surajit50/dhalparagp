"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PondLeaseNoticePrint } from "./pond-lease-notice-print";
import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateLeaseNoticePDF } from "@/lib/pdf-lib";

export function ReprintNoticeDialog({ lease }: { lease: any }) {
  const [open, setOpen] = useState(false);
  const [noticeType, setNoticeType] = useState<"REMINDER" | "EXPIRY">("REMINDER");

  const handleDownload = () => {
    // We pass lease as is. For reprint, we might want to temporarily decrement noticeCount 
    // by 1 because the PDF generator adds 1 to the count internally?
    // Wait, pdf-lib does: const currentNoticeCount = (lease.noticeCount || 0) + 1;
    // For a REPRINT, we want it to print the EXACT LAST notice number, which is `lease.noticeCount`.
    // So we need to pass a cloned lease with noticeCount - 1 to the generator so it prints the correct number.
    const leaseClone = { ...lease, noticeCount: Math.max(0, lease.noticeCount - 1) };
    generateLeaseNoticePDF(leaseClone, noticeType);
    setOpen(false);
  };

  const hasNotice = (lease.noticeCount && lease.noticeCount > 0) || lease.lastNoticeDate;
  if (!hasNotice) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Printer className="h-4 w-4 mr-2" />
          Reprint Previous Notice
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <DialogTitle>Reprint Previous Notice</DialogTitle>
          </div>
          <div className="flex gap-2 pr-6">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download Reprint PDF
            </Button>
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
                  <RadioGroupItem value="REMINDER" id="rp1" />
                  <Label htmlFor="rp1" className="cursor-pointer font-medium">
                    Payment Reminder
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <RadioGroupItem value="EXPIRY" id="rp2" />
                  <Label htmlFor="rp2" className="cursor-pointer font-medium">
                    Lease Expiry
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-xs text-blue-700 leading-relaxed">
                You are reprinting the previously sent notice. This action will <strong>not</strong> increment the notice count or change the 7-day rule timer.
              </p>
            </div>
          </div>
          <div className="md:col-span-2">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
              Preview
            </h3>
            {/* The preview component doesn't add +1, but wait, let's check pond-lease-notice-print.tsx later */}
            <PondLeaseNoticePrint lease={{ ...lease, noticeCount: Math.max(0, lease.noticeCount - 1) }} noticeType={noticeType} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
