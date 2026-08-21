"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addYears, differenceInYears, addMonths, differenceInMonths } from "date-fns";
import { formatDate } from "@/utils/utils";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { FileEdit, Loader2, CalendarIcon, CheckCircle2 } from "lucide-react";

import { PondLeaseSchema, PondLeaseFormValues } from "./schema";
import { updatePondLease } from "./actions";

import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function EditLeaseDialog({ lease }: { lease: any }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Calculate lease years from existing lease data
  const diffMonths = differenceInMonths(
    new Date(lease.leaseEndDate),
    new Date(lease.leaseStartDate)
  );
  let existingLeasePeriod = "1";
  let existingCustomMonths = 0;
  let existingCustomTotal = 0;
  if (diffMonths === 12) existingLeasePeriod = "1";
  else if (diffMonths === 18) existingLeasePeriod = "1.5";
  else if (diffMonths === 24) existingLeasePeriod = "2";
  else if (diffMonths === 36) existingLeasePeriod = "3";
  else {
    existingLeasePeriod = "CUSTOM";
    existingCustomMonths = diffMonths;
    existingCustomTotal = lease.totalAmount;
  }
  const existingLeaseYears = diffMonths > 0 ? diffMonths / 12 : 1;

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
      leaseAmountYearly:
        lease.leaseAmountYearly || lease.totalAmount / existingLeaseYears,
      leaseStartDate: new Date(lease.leaseStartDate),
      leasePeriod: existingLeasePeriod as "1" | "1.5" | "2" | "3" | "CUSTOM",
      customMonths: existingCustomMonths,
      customTotalAmount: existingCustomTotal,
      remarks: lease.remarks || "",
    },
  });

  const leasePeriod = form.watch("leasePeriod");
  const yearlyAmount = form.watch("leaseAmountYearly");
  const leaseStartDate = form.watch("leaseStartDate");

  let leaseYears = parseFloat(leasePeriod || "1");
  const isCustom = leasePeriod === "CUSTOM";
  const customMonths = form.watch("customMonths") || 0;
  if (isCustom) {
    leaseYears = customMonths > 0 ? customMonths / 12 : 0;
  }

  const customTotalAmount = form.watch("customTotalAmount") || 0;
  const totalLeaseAmount = isCustom ? customTotalAmount : (yearlyAmount || 0) * leaseYears;
  const actualYearlyAmount = isCustom ? (leaseYears > 0 ? customTotalAmount / leaseYears : 0) : (yearlyAmount || 0);

  let calculatedEndDate = undefined;
  if (leaseStartDate) {
    if (isCustom) {
      calculatedEndDate = addMonths(leaseStartDate, customMonths);
    } else if (leasePeriod === "1.5") {
      calculatedEndDate = addMonths(leaseStartDate, 18);
    } else {
      calculatedEndDate = addYears(leaseStartDate, parseInt(leasePeriod));
    }
  }

  const onSubmit = (values: PondLeaseFormValues) => {
    startTransition(() => {
      try {
        updatePondLease(lease.id, {
          ...values,
          leaseAmountYearly: actualYearlyAmount,
          leaseEndDate: calculatedEndDate,
          totalAmount: totalLeaseAmount,
          leaseYears,
        });

        toast.success("Pond lease updated successfully");
        setOpen(false);
      } catch {
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
                    Current Total Amount
                  </p>
                  <p className="text-sm font-bold text-orange-600">
                    ₹{lease.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Lease Terms */}
            <div className="bg-muted/40 p-4 rounded-lg space-y-4">
              <h3 className="text-sm font-semibold">Lease Terms</h3>

              <FormField
                control={form.control}
                name="leaseAmountYearly"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yearly Lease Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        className="bg-background font-medium text-lg"
                        placeholder="e.g. 5000"
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="leaseStartDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal bg-background",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                formatDate(field.value)
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            captionLayout="dropdown-buttons"
                            fromYear={1900}
                            toYear={2050}
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="leasePeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lease Duration</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-6 pt-2 flex-wrap"
                        >
                          {["1", "1.5", "2", "3"].map((year) => (
                            <FormItem
                              key={year}
                              className="flex items-center space-x-2"
                            >
                              <FormControl>
                                <RadioGroupItem value={year} />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {year === "1.5" ? "1.5 Years" : `${year} Year${year === "1" ? "" : "s"}`}
                              </FormLabel>
                            </FormItem>
                          ))}
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <RadioGroupItem value="CUSTOM" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Custom
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isCustom && (
                <div className="grid md:grid-cols-2 gap-6 mt-4 p-4 border rounded-md bg-muted/20">
                  <FormField
                    control={form.control}
                    name="customMonths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (Months)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            className="bg-background"
                            placeholder="e.g. 5"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="customTotalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Amount (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            className="bg-background"
                            placeholder="e.g. 5000"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {((leaseYears > 0 || isCustom) && calculatedEndDate) && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-blue-800 dark:text-blue-300">
                      Lease Summary
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Lease Period: {isCustom ? `${customMonths} Months` : `${leaseYears} Year${leaseYears > 1 ? "s" : ""}`}
                    </div>
                    {totalLeaseAmount > 0 && (
                      <div className="text-sm font-medium mt-1">
                        {isCustom ? "Total Amount:" : "Yearly Amount:"} ₹{isCustom ? totalLeaseAmount.toLocaleString() : (yearlyAmount || 0).toLocaleString()}
                        {!isCustom && (
                          <span className="opacity-75 font-normal ml-2">
                            (Total for duration: ₹{totalLeaseAmount.toLocaleString()})
                          </span>
                        )}
                      </div>
                    )}
                    <div className="text-sm text-blue-700/80 dark:text-blue-400 mt-1">
                      End Date: {formatDate(calculatedEndDate)}
                    </div>
                  </div>
                </div>
              )}
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
                    <FormLabel>Father's Name</FormLabel>
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
