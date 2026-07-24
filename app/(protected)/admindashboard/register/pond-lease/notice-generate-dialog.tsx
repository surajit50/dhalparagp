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

export function NoticeGenerateDialog({ lease }: { lease: any }) {
  const [open, setOpen] = useState(false);
  const [noticeType, setNoticeType] = useState<"REMINDER" | "EXPIRY">(
    "REMINDER",
  );

  const handleDownload = () => {
    generateLeaseNoticePDF(lease, noticeType);
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
          <div className="flex gap-2 pr-6">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
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
              <p className="text-xs text-orange-700 leading-relaxed">
                Choose the notice type and preview the content on the right.
              </p>
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
