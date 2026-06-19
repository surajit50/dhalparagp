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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Plus, Loader2, CalendarIcon, CheckCircle2 } from "lucide-react";

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
            <Tabs defaultValue="pond" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50">
                <TabsTrigger value="pond">1. Pond & Lease Terms</TabsTrigger>
                <TabsTrigger value="party">2. Lessee Details</TabsTrigger>
                <TabsTrigger value="period">3. Duration & Remarks</TabsTrigger>
              </TabsList>

              {/* STEP 1: Pond Selection */}
              <TabsContent value="pond" className="space-y-4">
                <div className="bg-muted/30 p-5 rounded-lg border border-border/50 space-y-5">
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
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Choose pond" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            {ponds.map((pond) => (
                              <SelectItem key={pond.id} value={pond.id}>
                                {pond.name} — {pond.location}
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
                        <FormLabel>Yearly Lease Amount (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="bg-background font-medium text-lg"
                            placeholder="e.g. 50000"
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
              </TabsContent>

              {/* STEP 2: Party Details */}
              <TabsContent value="party" className="space-y-4">
                <div className="bg-muted/30 p-5 rounded-lg border border-border/50 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="leasePartyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Party Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Full Name" {...field} className="bg-background" />
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
                              className="bg-background"
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
                          <Input placeholder="Father's Name" {...field} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="leasePartyAddressLine1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line 1</FormLabel>
                          <FormControl>
                            <Input placeholder="Village/Street" {...field} className="bg-background" />
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
                            <Input placeholder="Post Office/Landmark" {...field} className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="leasePartyCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City/Town</FormLabel>
                          <FormControl>
                            <Input placeholder="City/Town" {...field} className="bg-background" />
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
                            <Input placeholder="PIN Code" {...field} className="bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* STEP 3: Lease Period */}
              <TabsContent value="period" className="space-y-4">
                <div className="bg-muted/30 p-5 rounded-lg border border-border/50 space-y-6">
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

                  {leaseYears > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-semibold text-blue-800 dark:text-blue-300">
                          Summary
                        </div>
                        <div className="text-sm text-blue-700/80 dark:text-blue-400 mt-1">
                          Lease Period: {leaseYears} Year{leaseYears > 1 ? "s" : ""}
                        </div>
                        {totalLeaseAmount > 0 && (
                          <div className="text-sm font-medium text-blue-700 dark:text-blue-400 mt-1">
                            Total Lease Amount: ₹{totalLeaseAmount.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="remarks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Remarks (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional notes..." {...field} className="bg-background resize-none h-20" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="pt-2 border-t mt-6">
              <Button type="submit" disabled={isPending} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit & Save Lease
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
