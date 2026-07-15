"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addYears } from "date-fns";

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
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { FileEdit, Loader2 } from "lucide-react";

import { PondLeaseSchema, PondLeaseFormValues } from "./schema";
import { updatePondLease } from "./actions";

import { toast } from "sonner";

export function EditLeaseDialog({ lease }: { lease: any }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PondLeaseFormValues>({
    resolver: zodResolver(PondLeaseSchema),
    defaultValues: {
      pondId: lease.pondId,
      leasePartyName: lease.leasePartyName,
      leasePartyMobile: lease.leasePartyMobile,
      leasePartyFatherName: lease.leasePartyFatherName || "",
      leasePartyAddressLine1: lease.leasePartyAddressLine1 || "",
      leasePartyAddressLine2: lease.leasePartyAddressLine2 || "",
      leasePartyCity: lease.leasePartyCity || "",
      leasePartyPin: lease.leasePartyPin || "",
      leaseAmountYearly: lease.totalAmount || (lease.leaseAmountYearly * (lease.leaseYears || 1)),
      leaseStartDate: new Date(lease.leaseStartDate),
      leasePeriod: (lease.leaseYears === 1 ||
      lease.leaseYears === 2 ||
      lease.leaseYears === 3
        ? String(lease.leaseYears)
        : "1") as "1" | "2" | "3",
      remarks: lease.remarks || "",
    },
  });

  const leasePeriod = form.watch("leasePeriod");
  const yearlyAmount = form.watch("leaseAmountYearly");

  const leaseYears = parseInt(leasePeriod || "1");

  const totalLeaseAmount = yearlyAmount || 0;
  const actualYearlyAmount = leaseYears > 0 ? totalLeaseAmount / leaseYears : 0;

  const onSubmit = (values: PondLeaseFormValues) => {
    startTransition(() => {
      try {
        const calculatedEndDate = values.leaseStartDate
          ? addYears(values.leaseStartDate, parseInt(values.leasePeriod))
          : undefined;

        updatePondLease(lease.id, {
          ...values,
          leaseAmountYearly: actualYearlyAmount,
          leaseEndDate: calculatedEndDate,
          totalAmount: totalLeaseAmount,
          leaseYears,
        });

        toast.success("Pond lease updated successfully");
        setOpen(false);
      } catch (error) {
        toast.error("Failed to update pond lease");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <FileEdit className="h-4 w-4 mr-2" />
          Edit Details
        </DropdownMenuItem>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl">Edit Pond Lease</DialogTitle>
          <DialogDescription>
            Update the details for this lease record.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Pond Information */}
            <div className="bg-muted/40 p-4 rounded-lg space-y-4">
              <h3 className="text-sm font-semibold">Pond Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                    Selected Pond
                  </p>
                  <p className="text-sm font-medium">{lease.pond.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {lease.pond.location}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                    Total Amount
                  </p>
                  <p className="text-sm font-bold text-orange-600">
                    ₹{(lease.totalAmount || (lease.leaseAmountYearly * (lease.leaseYears || 1))).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Party Details */}
            <div className="bg-muted/40 p-4 rounded-lg space-y-4">
              <h3 className="text-sm font-semibold">Lease Party Details</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="leasePartyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Party Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="leasePartyMobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="10 digit mobile"
                          maxLength={10}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="leasePartyFatherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Father&apos;s Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Father's Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="leasePartyAddressLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="Address Line 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="leasePartyAddressLine2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2</FormLabel>
                    <FormControl>
                      <Input placeholder="Address Line 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="leasePartyCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City/Town</FormLabel>
                      <FormControl>
                        <Input placeholder="City/Town" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="leasePartyPin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PIN Code</FormLabel>
                      <FormControl>
                        <Input placeholder="PIN Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Remarks */}
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
