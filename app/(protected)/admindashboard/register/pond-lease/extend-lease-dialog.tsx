"use client";

import { useState, useTransition, useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarRange, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  PondLeaseExtensionSchema,
  PondLeaseExtensionFormValues,
} from "./schema";
import { extendPondLease } from "./actions";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { formatDate } from "@/utils/utils";

interface ExtendLeaseDialogProps {
  lease: any;
}

export function ExtendLeaseDialog({ lease }: ExtendLeaseDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PondLeaseExtensionFormValues>({
    resolver: zodResolver(PondLeaseExtensionSchema),
    defaultValues: {
      pondLeaseId: lease.id,
      extensionPeriod: "1",
      extensionAmount: 0,
      remarks: "",
    },
  });

  const extensionPeriod = form.watch("extensionPeriod");
  const yearlyAmount = Number(lease.leaseAmountYearly) || 0;

  useEffect(() => {
    let calculatedAmount = 0;
    if (extensionPeriod === "6M") {
      calculatedAmount = yearlyAmount / 2;
    } else {
      calculatedAmount = yearlyAmount * parseInt(extensionPeriod);
    }
    form.setValue("extensionAmount", calculatedAmount);
  }, [extensionPeriod, yearlyAmount, form]);

  const onSubmit = (values: PondLeaseExtensionFormValues) => {
    startTransition(async () => {
      try {
        await extendPondLease(values);
        toast.success("Lease extended successfully");
        setOpen(false);
        form.reset();
      } catch (error: any) {
        toast.error(error.message || "Failed to extend lease");
      }
    });
  };

  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <CalendarRange className="h-4 w-4 mr-2" />
          Extend Lease
        </DropdownMenuItem>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Extend Lease Period</DialogTitle>
          <DialogDescription>
            Extend the lease for <strong>{lease.pond.name}</strong>. Current
            expiry: {formatDate(new Date(lease.leaseEndDate))}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg space-y-1">
              <div className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Lease Basis
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Yearly Lease Amount:</span>
                <span className="font-bold text-slate-900">
                  {currency.format(yearlyAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm pt-1 border-t border-orange-200 mt-1">
                <span className="text-orange-700 font-medium">
                  Calculated Extension Fee:
                </span>
                <span className="text-lg font-extrabold text-orange-800">
                  {currency.format(form.watch("extensionAmount"))}
                </span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="extensionPeriod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Extension Duration</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="6M" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          6 Months
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="1" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          1 Year
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="2" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          2 Years
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="3" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          3 Years
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="extensionAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Extension Fee / Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={1}
                      placeholder="0.00"
                      {...field}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Input placeholder="Reason for extension..." {...field} />
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
                  <FormLabel>Extension Document (PDF only)</FormLabel>
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
                              toast.success("Document uploaded successfully");
                            } else {
                              toast.error("Upload failed");
                            }
                          } catch (err) {
                            toast.error("Upload failed");
                          }
                        } else {
                          form.setValue("documentUrl", undefined);
                          form.setValue("documentKey", undefined);
                        }
                      }}
                    />
                  </FormControl>
                  {form.watch("documentUrl") && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      Document uploaded successfully.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Extend Lease
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
