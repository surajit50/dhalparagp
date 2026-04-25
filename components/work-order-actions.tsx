"use client";

import { CheckCircle, Bell } from "lucide-react";
import { useTransition, useState } from "react";

import {
  markAsReceived,
  sendReceivedRemainder,
  sendReminderEmail,
} from "@/action/emailnotification";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
} from "./ui/dialog";

interface WorkOrderActionsProps {
  workOrderId: string;
  isDelivered: boolean;
}

export function WorkOrderActions({
  workOrderId,
  isDelivered,
}: WorkOrderActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [receivedDate, setReceivedDate] = useState<string>("");
  const [dialogAction, setDialogAction] = useState<null | (() => void)>(null);

  const createFormData = () => {
    const formData = new FormData();
    formData.append("workOrderId", workOrderId);
    formData.append("receiveddate", receivedDate);
    return formData;
  };

  const handleMarkAsReceived = async () => {
    startTransition(async () => {
      try {
        const result = await markAsReceived(createFormData());
        await sendReceivedRemainder(createFormData());
        setMessage({
          type: "success",
          text: result.success || "Successfully marked as received",
        });
      } catch (error) {
        setMessage({
          type: "error",
          text: "Failed to mark as received",
        });
      }
    });
  };

  const handleSendReminder = async () => {
    startTransition(async () => {
      try {
        const result = await sendReminderEmail(createFormData());
        setMessage({
          type: "success",
          text: result.success || "Reminder sent successfully",
        });
      } catch (error) {
        setMessage({
          type: "error",
          text: "Failed to send reminder",
        });
      }
    });
  };

  const handleReceivedReminder = async () => {
    startTransition(async () => {
      try {
        const result = await sendReceivedRemainder(createFormData());
        setMessage({
          type: "success",
          text: result.success || "Received reminder sent successfully",
        });
      } catch (error) {
        setMessage({
          type: "error",
          text: "Failed to send received reminder",
        });
      }
    });
  };

  const openConfirmationDialog = (action: () => void) => {
    setDialogAction(() => action);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      {!isDelivered ? (
        <>
          <div className="flex flex-col gap-2">
            <Input
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              className="border rounded-md px-2 py-1"
              placeholder="Select received date"
            />
            <Button
              onClick={() => openConfirmationDialog(handleMarkAsReceived)}
              disabled={isPending || !receivedDate}
              className="bg-green-600 hover:bg-green-700 text-white flex gap-1"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {isPending ? "Processing..." : "Mark Received"}
            </Button>
          </div>
          <Button
            onClick={() => openConfirmationDialog(handleSendReminder)}
            disabled={isPending}
            className="flex gap-1 bg-red-300 text-white hover:bg-red-400"
          >
            <Bell className="mr-2 h-4 w-4" />
            {isPending ? "Sending..." : "Remind"}
          </Button>
        </>
      ) : (
        <Button
          onClick={() => openConfirmationDialog(handleReceivedReminder)}
          disabled={isPending}
          className="flex gap-1 bg-red-300 text-white hover:bg-red-400"
        >
          <Bell className="mr-2 h-4 w-4" />
          {isPending ? "Sending..." : "Remind"}
        </Button>
      )}

      {/* Dialog for confirmation */}
      <Dialog open={!!dialogAction} onOpenChange={() => setDialogAction(null)}>
        <DialogContent>
          <p>Are you sure you want to proceed with this action?</p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogAction(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (dialogAction) dialogAction();
                setDialogAction(null);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show success/error messages */}
      {message && (
        <div
          className={`w-full mt-2 text-sm ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
