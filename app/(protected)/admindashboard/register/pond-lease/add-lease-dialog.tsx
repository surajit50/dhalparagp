"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addYears, addMonths } from "date-fns";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Plus, Loader2, CalendarIcon, CheckCircle2, AlertCircle } from "lucide-react";

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
import {
  calculateRatePerDecimal,
  calculateYearlyLeaseAmount,
  formatPondAreaAcre,
  formatPondLocationDisplay,
  formatRatePerDecimalCalculation,
  formatYearlyFromRateCalculation,
  parsePondAreaDecimal,
} from "@/lib/utils/pond-lease";

type AmountEditSource = "yearly" | "rate" | "total";

export function AddLeaseDialog({ ponds }: { ponds: Pond[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [ratePerDecimal, setRatePerDecimal] = useState(0);
  const [lastEdited, setLastEdited] = useState<AmountEditSource>("yearly");
  const [amountMode, setAmountMode] = useState<"yearly" | "total">("yearly");

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
      leaseStartDate: new Date(),
      leasePeriod: "3",
      remarks: "",
    },
  });

  const leasePeriod = form.watch("leasePeriod");
  const yearlyAmount = form.watch("leaseAmountYearly");
  const selectedPondId = form.watch("pondId");

  const selectedPond = useMemo(
    () => ponds.find((pond) => pond.id === selectedPondId),
    [ponds, selectedPondId],
  );

  const areaDecimal = parsePondAreaDecimal(selectedPond?.area);

  useEffect(() => {
    if (areaDecimal <= 0) return;

    const yearly = form.getValues("leaseAmountYearly") || 0;

    if (lastEdited === "yearly" && yearly > 0) {
      setRatePerDecimal(calculateRatePerDecimal(yearly, areaDecimal));
    } else if (lastEdited === "rate" && ratePerDecimal > 0) {
      form.setValue(
        "leaseAmountYearly",
        calculateYearlyLeaseAmount(areaDecimal, ratePerDecimal),
      );
    }
    // Recalculate when pond/area changes only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaDecimal, selectedPondId]);

  const handleYearlyAmountChange = (value: number) => {
    setLastEdited("yearly");
    form.setValue("leaseAmountYearly", value);

    if (areaDecimal > 0 && value > 0) {
      setRatePerDecimal(calculateRatePerDecimal(value, areaDecimal));
    } else if (value <= 0) {
      setRatePerDecimal(0);
    }
  };

  const handleRatePerDecimalChange = (value: number) => {
    setLastEdited("rate");
    setRatePerDecimal(value);

    if (areaDecimal > 0 && value > 0) {
      form.setValue(
        "leaseAmountYearly",
        calculateYearlyLeaseAmount(areaDecimal, value),
      );
    } else if (value <= 0) {
      form.setValue("leaseAmountYearly", 0);
    }
  };

  const handleTotalAmountChange = (value: number) => {
    setLastEdited("total");
    
    let leaseYears = parseFloat(leasePeriod || "1");
    const isCustom = leasePeriod === "CUSTOM";
    const customMonths = form.watch("customMonths") || 0;
    
    if (isCustom && customMonths > 0) {
      leaseYears = customMonths / 12;
    }

    if (leaseYears > 0 && value > 0) {
      const calculatedYearly = value / leaseYears;
      form.setValue("leaseAmountYearly", calculatedYearly);
      
      if (areaDecimal > 0) {
        setRatePerDecimal(calculateRatePerDecimal(calculatedYearly, areaDecimal));
      }
    }
  };

  let leaseYears = parseFloat(leasePeriod || "1");
  const isCustom = leasePeriod === "CUSTOM";
  const customMonths = form.watch("customMonths") || 0;
  if (isCustom) {
    leaseYears = customMonths > 0 ? customMonths / 12 : 0;
  }

  const customTotalAmount = form.watch("customTotalAmount") || 0;
  
  const totalLeaseAmount = isCustom ? customTotalAmount : (yearlyAmount || 0) * leaseYears;
  const actualYearlyAmount = isCustom ? (leaseYears > 0 ? customTotalAmount / leaseYears : 0) : (yearlyAmount || 0);

  const onSubmit = (values: PondLeaseFormValues) => {
    startTransition(() => {
      try {
        let calculatedEndDate = undefined;
        if (values.leaseStartDate) {
          if (values.leasePeriod === "CUSTOM") {
            calculatedEndDate = addMonths(values.leaseStartDate, values.customMonths || 0);
          } else if (values.leasePeriod === "1.5") {
            calculatedEndDate = addMonths(values.leaseStartDate, 18);
          } else {
            calculatedEndDate = addYears(values.leaseStartDate, parseInt(values.leasePeriod));
          }
        }

        createPondLease({
          ...values,
          leaseAmountYearly: actualYearlyAmount,
          leaseEndDate: calculatedEndDate,
          totalAmount: totalLeaseAmount,
          leaseYears,
        });

        toast.success("Pond lease created successfully");

        form.reset();
        setRatePerDecimal(0);
        setLastEdited("yearly");
        setAmountMode("yearly");
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
                    name="leasePeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lease Period</FormLabel>
                        <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground items-center font-medium">
                          3 Years
                        </div>
                        {/* Hidden input to satisfy form submission */}
                        <input type="hidden" {...field} value="3" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                                {pond.name} — {formatPondLocationDisplay(pond)}
                                {pond.area ? ` (${pond.area} Decimal` : ""}
                                {pond.area &&
                                formatPondAreaAcre(
                                  parsePondAreaDecimal(pond.area),
                                )
                                  ? ` / ${formatPondAreaAcre(parsePondAreaDecimal(pond.area))}`
                                  : ""}
                                {pond.area ? ")" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedPond && (
                    <div className="rounded-md border border-dashed border-blue-200 bg-blue-50/50 px-4 py-3 text-sm">
                      <div className="flex flex-wrap justify-between gap-2">
                        <span className="text-slate-600">
                          Pond Area (Decimal / Satak)
                        </span>
                        <span className="font-semibold text-slate-900">
                          {areaDecimal > 0
                            ? `${areaDecimal} Decimal`
                            : "Not recorded"}
                        </span>
                      </div>
                      {areaDecimal > 0 && (
                        <div className="flex flex-wrap justify-between gap-2 mt-1">
                          <span className="text-slate-600">
                            Total land area
                          </span>
                          <span className="font-semibold text-slate-900">
                            {formatPondAreaAcre(areaDecimal)}
                          </span>
                        </div>
                      )}
                      {!areaDecimal && (
                        <p className="mt-2 text-xs text-amber-700">
                          Add pond area in Decimal from Pond Inventory to
                          calculate between yearly amount and per-decimal rate.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-3 rounded-lg border border-border/50 bg-white p-4">
                    <FormLabel className="text-sm font-semibold">Amount Entry Mode</FormLabel>
                    <RadioGroup value={amountMode} onValueChange={(val) => setAmountMode(val as "yearly" | "total")} className="flex gap-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yearly" id="mode-yearly" />
                        <FormLabel htmlFor="mode-yearly" className="font-normal cursor-pointer">
                          Year-wise Amount
                        </FormLabel>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="total" id="mode-total" />
                        <FormLabel htmlFor="mode-total" className="font-normal cursor-pointer">
                          Total (One-time Payment)
                        </FormLabel>
                      </div>
                    </RadioGroup>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {amountMode === "yearly" 
                      ? "Enter yearly lease amount or rate per decimal — the other value updates automatically."
                      : "Enter total lease amount for the entire period — yearly amount will be calculated automatically."}
                  </p>

                  {amountMode === "yearly" ? (
                    <div className="grid md:grid-cols-2 gap-4">
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
                                  handleYearlyAmountChange(
                                    Number(e.target.value) || 0,
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormItem>
                        <FormLabel>Total Rate per Decimal (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            className="bg-background font-medium text-lg"
                            placeholder="e.g. 50"
                            value={ratePerDecimal || ""}
                            onChange={(e) =>
                              handleRatePerDecimalChange(
                                Number(e.target.value) || 0,
                              )
                            }
                            disabled={areaDecimal <= 0}
                          />
                        </FormControl>
                      </FormItem>
                    </div>
                  ) : (
                    <FormField
                      control={form.control}
                      name="leaseAmountYearly"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Lease Amount (₹) - One Time Payment</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              className="bg-background font-medium text-lg border-green-500 border-2"
                              placeholder="e.g. 15000"
                              value={field.value ? (parseFloat(leasePeriod || "1") > 0 && !isCustom ? (field.value * parseFloat(leasePeriod || "1")) : (isCustom && customMonths > 0 ? field.value * (customMonths / 12) : field.value)) : ""}
                              onChange={(e) =>
                                handleTotalAmountChange(
                                  Number(e.target.value) || 0,
                                )
                              }
                            />
                          </FormControl>
                          <p className="text-xs text-green-700 mt-1">
                            This is a one-time payment for the entire lease period
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {areaDecimal > 0 &&
                    yearlyAmount > 0 &&
                    ratePerDecimal > 0 && (
                      <p className="text-sm text-blue-700 font-medium">
                        {amountMode === "yearly" 
                          ? (lastEdited === "rate"
                              ? formatYearlyFromRateCalculation(
                                  areaDecimal,
                                  ratePerDecimal,
                                  yearlyAmount,
                                ).replace("/year", " total")
                              : formatRatePerDecimalCalculation(
                                  yearlyAmount,
                                  areaDecimal,
                                  ratePerDecimal,
                                ).replace(" per year", ""))
                          : ""}
                      </p>
                    )}
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
                            <Input
                              placeholder="Full Name"
                              {...field}
                              className="bg-background"
                            />
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
                        <FormLabel>Father's Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Father's Name"
                            {...field}
                            className="bg-background"
                          />
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
                            <Input
                              placeholder="Village/Street"
                              {...field}
                              className="bg-background"
                            />
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
                            <Input
                              placeholder="Post Office/Landmark"
                              {...field}
                              className="bg-background"
                            />
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
                            <Input
                              placeholder="City/Town"
                              {...field}
                              className="bg-background"
                            />
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
                            <Input
                              placeholder="PIN Code"
                              {...field}
                              className="bg-background"
                            />
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
                                    ? formatDate(field.value)
                                    : "Select date"}

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

                  {((leaseYears > 0 || isCustom) && (totalLeaseAmount > 0)) && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-semibold text-blue-800 dark:text-blue-300">
                          Lease Summary
                        </div>
                        <div className="text-sm text-blue-700/80 dark:text-blue-400 mt-1">
                          Lease Period: {isCustom ? `${customMonths} Months` : `${leaseYears} Year${leaseYears > 1 ? "s" : ""}`}
                        </div>
                        <div className="text-sm font-medium text-blue-700 dark:text-blue-400 mt-2 p-2 bg-white dark:bg-blue-950 rounded border border-blue-300 dark:border-blue-700">
                          <div className="flex justify-between mb-2">
                            <span>Yearly Amount:</span>
                            <span>₹ {(yearlyAmount || 0).toLocaleString("en-IN")}</span>
                          </div>
                          <div className="border-t border-blue-200 dark:border-blue-700 pt-2 flex justify-between font-bold text-base">
                            <span>Total Lease Amount (One-time Payment):</span>
                            <span className="text-green-700 dark:text-green-400">₹ {totalLeaseAmount.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 italic">
                          The total amount is payable as a one-time payment at the start of the lease period.
                        </p>
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
                          <Textarea
                            placeholder="Additional notes..."
                            {...field}
                            className="bg-background resize-none h-20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="pt-2 border-t mt-6">
              <Button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]"
              >
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
