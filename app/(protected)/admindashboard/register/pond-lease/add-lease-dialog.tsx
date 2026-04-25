"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addYears, format } from "date-fns";

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

import { Plus, Loader2, CalendarIcon } from "lucide-react";

import { PondLeaseSchema, PondLeaseFormValues } from "./schema";
import { createPondLease } from "./actions";

import { toast } from "sonner";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";

import { cn } from "@/lib/utils";

import { Pond } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function AddLeaseDialog({ ponds }: { ponds: Pond[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PondLeaseFormValues>({
    resolver: zodResolver(PondLeaseSchema),
    defaultValues: {
      pondId: "",
      leasePartyName: "",
      leasePartyMobile: "",
      leasePartyFatherName: "",
      leasePartyAddressLine1: "",
      leasePartyAddressLine2: "",
      leasePartyCity: "",
      leasePartyPin: "",
      leaseAmountYearly: 0,
      leaseStartDate: undefined,
      leasePeriod: "1",
      remarks: "",
    },
  });

  const leasePeriod = form.watch("leasePeriod");
  const yearlyAmount = form.watch("leaseAmountYearly");

  const leaseYears = parseInt(leasePeriod || "1");

  const totalLeaseAmount =
    leaseYears > 0 ? leaseYears * (yearlyAmount || 0) : 0;

  const onSubmit = (values: PondLeaseFormValues) => {
    startTransition(() => {
      try {
        const calculatedEndDate = values.leaseStartDate
          ? addYears(values.leaseStartDate, parseInt(values.leasePeriod))
          : undefined;

        createPondLease({
          ...values,
          leaseEndDate: calculatedEndDate,
          totalAmount: totalLeaseAmount,
          leaseYears,
        });

        toast.success("Pond lease created successfully");

        form.reset();
        setOpen(false);
      } catch {
        toast.error("Failed to create pond lease");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Lease
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl">Create Pond Lease</DialogTitle>
          <DialogDescription>
            Select pond and enter lease details
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Pond Selection */}
            <div className="bg-muted/40 p-4 rounded-lg space-y-4">
              <h3 className="text-sm font-semibold">Pond Information</h3>

              <FormField
                control={form.control}
                name="pondId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Pond</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose pond" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {ponds.map((pond) => (
                          <SelectItem key={pond.id} value={pond.id}>
                            {pond.name} â€” {pond.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="leaseAmountYearly"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yearly Lease Amount (â‚¹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter yearly lease amount"
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
            </div>

            {/* Party Details */}

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

            {/* Lease Period */}
            <div className="bg-muted/40 p-4 rounded-lg space-y-4">
              <h3 className="text-sm font-semibold">Lease Period</h3>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Start Date */}
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
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value
                                ? format(field.value, "dd/MM/yyyy")
                                : "Select date"}

                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>

                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            captionLayout="dropdown-buttons"
                            fromYear={2020}
                            toYear={2040}
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

                {/* Lease Duration */}
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
                          className="flex gap-6 pt-2"
                        >
                          {["1", "2", "3"].map((year) => (
                            <FormItem
                              key={year}
                              className="flex items-center space-x-2"
                            >
                              <FormControl>
                                <RadioGroupItem value={year} />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {year} Year
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Calculation */}
              {leaseYears > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm">
                  <div className="font-semibold text-green-700">
                    Lease Period: {leaseYears} Year
                    {leaseYears > 1 ? "s" : ""}
                  </div>

                  {totalLeaseAmount > 0 && (
                    <div className="text-green-700">
                      Total Lease Amount: â‚¹{totalLeaseAmount.toLocaleString()}
                    </div>
                  )}
                </div>
              )}
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
                Save Lease
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
