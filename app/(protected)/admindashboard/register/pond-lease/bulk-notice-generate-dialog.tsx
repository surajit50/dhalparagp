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
import { FileText, Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateLeaseNoticePDF } from "@/lib/pdf-lib";

export function BulkNoticeGenerateDialog({ 
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

  const handleDownload = () => {
    generateLeaseNoticePDF(leases, noticeType);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 transition-colors">
          <FileText className="h-4 w-4" />
          Print {leases.length} Selected Notice{leases.length > 1 ? "s" : ""}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
          <div>
            <DialogTitle>Generate Bulk Notices</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-2">
          <div className="flex items-center gap-2 p-3 bg-blue-50/50 text-blue-700 border border-blue-100 rounded-md">
            <CheckCircle2 className="h-5 w-5 text-blue-500" />
            <p className="text-sm">You are generating notices for <strong>{leases.length}</strong> selected lease{leases.length > 1 ? "s" : ""}.</p>
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
                <RadioGroupItem value="REMINDER" id="bulk-r1" />
                <Label htmlFor="bulk-r1" className="cursor-pointer font-medium">
                  Payment Reminder
                </Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <RadioGroupItem value="EXPIRY" id="bulk-r2" />
                <Label htmlFor="bulk-r2" className="cursor-pointer font-medium">
                  Lease Expiry
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleDownload} className="gap-2">
              <Download className="h-4 w-4" />
              Download Merged PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
