"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { sendNoticeEmail } from "@/action/send-notice-email";

interface NoticeMessageDialogProps {
  notice: any;
}

type EmailType = "award" | "confirmation" | "startWork";

export function NoticeMessageDialog({ notice }: NoticeMessageDialogProps) {
  const [open, setOpen] = useState(false);
  const [emailType, setEmailType] = useState<EmailType>("award");
  const [isSending, setIsSending] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    nitNumber: notice.reference.split("/")[0] || "",
    nitDate: new Date(notice.createdAt).toISOString().split("T")[0],
    workslno: "1",
    workOrderNumber: notice.reference,
    workOrderDate: new Date().toISOString().split("T")[0],
    workDescription: notice.description,
    estimatedAmount: "0",
    completionPeriod: "30 Days",
    startDate: new Date().toISOString().split("T")[0],
    completionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  const handleSend = async () => {
    if (!notice.agency?.email) {
      toast.error("Agency email not found");
      return;
    }

    setIsSending(true);
    try {
      const result = await sendNoticeEmail(notice.id, emailType, formData);
      if (result.success) {
        toast.success("Email sent successfully");
        setOpen(false);
      } else {
        toast.error(result.error || "Failed to send email");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSending(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Send Email Notification">
          <Mail className="h-4 w-4 text-orange-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Email Notification</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Email Template</Label>
            <Select
              value={emailType}
              onValueChange={(v) => setEmailType(v as EmailType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select email template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="award">Award Notification</SelectItem>
                <SelectItem value="confirmation">Work Order Confirmation</SelectItem>
                <SelectItem value="startWork">Start Work Notice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
            {emailType === "award" && (
              <>
                <div className="space-y-2">
                  <Label>NIT Number</Label>
                  <Input
                    value={formData.nitNumber}
                    onChange={(e) => updateFormData("nitNumber", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>NIT Date</Label>
                  <Input
                    type="date"
                    value={formData.nitDate}
                    onChange={(e) => updateFormData("nitDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Work Sl No</Label>
                  <Input
                    type="number"
                    value={formData.workslno}
                    onChange={(e) => updateFormData("workslno", e.target.value)}
                  />
                </div>
              </>
            )}

            {emailType === "confirmation" && (
              <>
                <div className="space-y-2">
                  <Label>Work Order Number</Label>
                  <Input
                    value={formData.workOrderNumber}
                    onChange={(e) => updateFormData("workOrderNumber", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Work Order Date</Label>
                  <Input
                    type="date"
                    value={formData.workOrderDate}
                    onChange={(e) => updateFormData("workOrderDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>NIT Reference</Label>
                  <Input
                    value={formData.nitNumber}
                    onChange={(e) => updateFormData("nitNumber", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Amount (₹)</Label>
                  <Input
                    type="number"
                    value={formData.estimatedAmount}
                    onChange={(e) => updateFormData("estimatedAmount", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Completion Period</Label>
                  <Input
                    value={formData.completionPeriod}
                    onChange={(e) => updateFormData("completionPeriod", e.target.value)}
                  />
                </div>
              </>
            )}

            {emailType === "startWork" && (
              <>
                <div className="space-y-2">
                  <Label>Work Order Number</Label>
                  <Input
                    value={formData.workOrderNumber}
                    onChange={(e) => updateFormData("workOrderNumber", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Work Description</Label>
                  <Input
                    value={formData.workDescription}
                    onChange={(e) => updateFormData("workDescription", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => updateFormData("startDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Completion Date</Label>
                  <Input
                    type="date"
                    value={formData.completionDate}
                    onChange={(e) => updateFormData("completionDate", e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Notification"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
