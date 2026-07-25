"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { PondLeaseStatusUpdateSchema, PondLeaseStatusUpdateValues } from "./schema";
import { updateLeaseStatusWithResolution } from "./actions";

interface UpdateLeaseStatusDialogProps {
  lease: any;
  statusType: "COMPLETED" | "CANCELLED";
}

export function UpdateLeaseStatusDialog({ lease, statusType }: UpdateLeaseStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PondLeaseStatusUpdateValues>({
    resolver: zodResolver(PondLeaseStatusUpdateSchema),
    defaultValues: {
      id: lease.id,
      status: statusType,
      remarks: "",
      documentUrl: "",
      documentKey: "",
    },
  });

  const onSubmit = (values: PondLeaseStatusUpdateValues) => {
    startTransition(async () => {
      try {
        await updateLeaseStatusWithResolution(values);
        toast.success(`Lease marked as ${statusType.toLowerCase()} successfully`);
        setOpen(false);
        form.reset();
      } catch (error: any) {
        toast.error(error.message || `Failed to mark lease as ${statusType.toLowerCase()}`);
      }
    });
  };

  const isCompleted = statusType === "COMPLETED";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem 
          onSelect={(e) => e.preventDefault()}
          className={!isCompleted ? "text-red-600 focus:text-red-600 focus:bg-red-50" : ""}
        >
          {isCompleted ? <CheckCircle className="h-4 w-4 mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
          {isCompleted ? "Mark Completed" : "Cancel Lease"}
        </DropdownMenuItem>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {isCompleted ? "Mark Lease as Completed" : "Cancel Lease Agreement"}
          </DialogTitle>
          <DialogDescription>
            You must upload a valid resolution document to {isCompleted ? "complete" : "cancel"} this lease for <strong>{lease.pond.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder={isCompleted ? "Reason for completion..." : "Reason for cancellation..."} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documentUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resolution Document (PDF only) <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append("file", file);
                          
                          try {
                            const res = await fetch("/api/upload", {
                              method: "POST",
                              body: formData,
                            });
                            const data = await res.json();
                            if (data.fileUrl) {
                              form.setValue("documentUrl", data.fileUrl);
                              form.setValue("documentKey", data.publicId);
                              toast.success("Document uploaded to Cloudinary successfully");
                            } else {
                              toast.error("Upload failed");
                            }
                          } catch (err) {
                            toast.error("Upload failed");
                          }
                        } else {
                          form.setValue("documentUrl", "");
                          form.setValue("documentKey", "");
                        }
                      }}
                    />
                  </FormControl>
                  {form.watch("documentUrl") && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      Document ready.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                Back
              </Button>
              <Button type="submit" disabled={isPending || !form.watch("documentUrl")} variant={isCompleted ? "default" : "destructive"} className="gap-2">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isCompleted ? "Confirm Completion" : "Confirm Cancellation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
