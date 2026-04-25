"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Calendar as CalendarIcon,
  CheckCircle,
  Receipt,
  Calculator,
  FileText,
  TrendingDown,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { formatDate } from "@/utils/utils";
import { formSchema, type FormValues } from "@/schema/formSchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "sonner";
import {
  addPaymentDetails,
  updatePaymentDetails,
} from "@/action/payment-details";
import { cn } from "@/lib/utils";

interface AddPaymentDetailsFormProps {
  workId: string;
  awardedCost: number;
  onSuccess: () => void;
  // Optional props for edit mode
  initialValues?: Partial<FormValues>;
  paymentDetailsId?: string;
}

export function AddPaymentDetailsForm({
  workId,
  awardedCost,
  onSuccess,
  initialValues,
  paymentDetailsId,
}: AddPaymentDetailsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [securityDepositPercentage, setSecurityDepositPercentage] =
    useState<number>(10);
  const [grossAmountExceedsAwarded, setGrossAmountExceedsAwarded] =
    useState(false);

  // Compute initial security deposit percentage if editing
  useEffect(() => {
    if (
      initialValues?.grossBillAmount &&
      initialValues?.securityDeposit &&
      initialValues.grossBillAmount > 0
    ) {
      const computedPercentage = Math.round(
        (initialValues.securityDeposit / initialValues.grossBillAmount) * 100,
      );
      setSecurityDepositPercentage(computedPercentage);
    }
  }, [initialValues]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grossBillAmount: initialValues?.grossBillAmount ?? 0,
      lessIncomeTax: initialValues?.lessIncomeTax ?? 0,
      lessLabourWelfareCess: initialValues?.lessLabourWelfareCess ?? 0,
      lessTdsCgst: initialValues?.lessTdsCgst ?? 0,
      lessTdsSgst: initialValues?.lessTdsSgst ?? 0,
      mbrefno: initialValues?.mbrefno ?? "",
      securityDeposit: initialValues?.securityDeposit ?? 0,
      billPaymentDate: initialValues?.billPaymentDate ?? new Date(),
      workcompletaitiondate: initialValues?.workcompletaitiondate ?? undefined,
      eGramVoucher: initialValues?.eGramVoucher ?? "",
      eGramVoucherDate: initialValues?.eGramVoucherDate ?? new Date(),
      gpmsVoucherNumber: initialValues?.gpmsVoucherNumber ?? "",
      gpmsVoucherDate: initialValues?.gpmsVoucherDate ?? new Date(),
      billType: initialValues?.billType ?? undefined,
      netAmount: initialValues?.netAmount ?? 0,
    },
  });

  // Format currency function
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Watch relevant fields for calculations
  const [grossAmount, incomeTax, labourCess, tdsCgst, tdsSgst] = useWatch({
    control: form.control,
    name: [
      "grossBillAmount",
      "lessIncomeTax",
      "lessLabourWelfareCess",
      "lessTdsCgst",
      "lessTdsSgst",
    ],
  });

  // Check if gross amount exceeds awarded cost
  useEffect(() => {
    setGrossAmountExceedsAwarded(grossAmount > awardedCost);
  }, [grossAmount, awardedCost]);

  // Calculate derived values
  const securityDeposit = Math.round(
    (grossAmount * securityDepositPercentage) / 100,
  );
  const netAmount = Math.round(
    grossAmount - incomeTax - labourCess - tdsCgst - tdsSgst - securityDeposit,
  );
  const totalDeduction =
    incomeTax + labourCess + tdsCgst + tdsSgst + securityDeposit;

  // Update form values when calculations change
  useEffect(() => {
    form.setValue("securityDeposit", securityDeposit, { shouldValidate: true });
    form.setValue("netAmount", netAmount, { shouldValidate: true });
  }, [securityDeposit, netAmount, form]);

  // Handle percentage-based deduction changes
  const handlePercentageChange = (
    fieldName: keyof Pick<
      FormValues,
      "lessIncomeTax" | "lessLabourWelfareCess" | "lessTdsCgst" | "lessTdsSgst"
    >,
    percentageValue: string,
  ) => {
    const percentage = Number.parseFloat(percentageValue);
    if (!isNaN(percentage)) {
      const calculatedValue = Math.round((grossAmount * percentage) / 100);
      form.setValue(fieldName, calculatedValue, { shouldValidate: true });
    }
  };

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    // Double-check the validation before submitting
    if (values.grossBillAmount > awardedCost) {
      setError("Gross bill amount cannot exceed the awarded contract value.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      let response;
      if (paymentDetailsId) {
        // Update existing payment
        response = await updatePaymentDetails(values, workId, paymentDetailsId);
      } else {
        // Create new payment
        response = await addPaymentDetails(values, workId);
      }

      if (response?.error) {
        setError(response.error);
        toast.error(
          paymentDetailsId
            ? "Failed to update payment details"
            : "Failed to add payment details",
          {
            description: response.error,
          },
        );
        return;
      }

      // Only reset the form if it's a new entry (optional)
      if (!paymentDetailsId) {
        form.reset();
      }

      toast.success(
        paymentDetailsId
          ? "Payment details updated successfully!"
          : "Payment details added successfully!",
        {
          description: `Reference: ${values.mbrefno} - Amount: ₹${values.netAmount.toLocaleString()}`,
        },
      );

      onSuccess();
    } catch (err) {
      setError(
        paymentDetailsId
          ? "Failed to update payment details. Please try again."
          : "Failed to submit payment details. Please try again.",
      );
      toast.error(
        paymentDetailsId
          ? "Failed to update payment details"
          : "Failed to add payment details",
        {
          description: "Please try again later",
        },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-0 w-full">
      <CardContent className="p-4">
        {error && (
          <Alert
            variant="destructive"
            className="mb-4 border-red-200 bg-red-50"
          >
            <AlertTitle className="text-red-800">Error</AlertTitle>
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Bill Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                  <Receipt className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Bill Information
                  </h3>
                  <p className="text-xs text-gray-500">
                    Enter basic bill details
                  </p>
                </div>
              </div>

              {/* Awarded Cost Display */}
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Awarded Contract Value:
                  </span>
                  <span className="text-lg font-bold text-green-700">
                    {formatCurrency(awardedCost)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This is the total value of the awarded contract for reference
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="grossBillAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-gray-700">
                        Gross Bill Amount
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            ₹
                          </span>
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="h-10 pl-8"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber || 0)
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-gray-700">
                        Bill Type
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select Bill Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {["1st RA", "2nd RA", "3rd RA", "Final Bill"].map(
                            (type) => (
                              <SelectItem
                                key={type}
                                value={type}
                                className="text-sm"
                              >
                                {type}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="billPaymentDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs font-medium text-gray-700">
                        Bill Payment Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "h-10 justify-start text-left font-normal",
                                !field.value && "text-gray-500",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                              {field.value ? (
                                formatDate(field.value)
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              form.setValue(
                                "eGramVoucherDate",
                                date || new Date(),
                              );
                              form.setValue(
                                "gpmsVoucherDate",
                                date || new Date(),
                              );
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workcompletaitiondate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs font-medium text-gray-700">
                        Work Completion Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "h-10 justify-start text-left font-normal",
                                !field.value && "text-gray-500",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                              {field.value ? (
                                formatDate(field.value)
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mbrefno"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-xs font-medium text-gray-700">
                        MB Reference No
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter MB reference number"
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Warning message if gross amount exceeds awarded cost */}
              {grossAmountExceedsAwarded && (
                <Alert
                  variant="destructive"
                  className="border-yellow-200 bg-yellow-50"
                >
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">Warning</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    Gross bill amount ({formatCurrency(grossAmount)}) exceeds
                    the awarded contract value ({formatCurrency(awardedCost)}).
                    Please adjust the amount to proceed.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Separator className="my-4" />

            {/* Deductions Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg">
                  <TrendingDown className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Deductions
                  </h3>
                  <p className="text-xs text-gray-500">
                    Tax deductions and charges
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { field: "lessIncomeTax", label: "Income Tax", icon: "📊" },
                  {
                    field: "lessLabourWelfareCess",
                    label: "Labour Welfare Cess",
                    icon: "👷",
                  },
                  { field: "lessTdsCgst", label: "TDS CGST", icon: "🏛️" },
                  { field: "lessTdsSgst", label: "TDS SGST", icon: "🏢" },
                ].map(({ field, label, icon }) => (
                  <div key={field} className="space-y-2">
                    <label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                      <span>{icon}</span>
                      {label}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          ₹
                        </span>
                        <Input
                          {...form.register(field as keyof FormValues, {
                            valueAsNumber: true,
                          })}
                          type="number"
                          placeholder="Amount"
                          className="h-9 pl-8"
                        />
                      </div>
                      <div className="relative w-20">
                        <Input
                          type="number"
                          placeholder="%"
                          className="h-9 pr-8"
                          onChange={(e) =>
                            handlePercentageChange(field as any, e.target.value)
                          }
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Voucher Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Voucher Details
                  </h3>
                  <p className="text-xs text-gray-500">Voucher information</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="eGramVoucher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-gray-700">
                        eGram Voucher
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter voucher number"
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eGramVoucherDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs font-medium text-gray-700">
                        eGram Voucher Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "h-10 justify-start text-left font-normal",
                                !field.value && "text-gray-500",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                              {field.value ? (
                                formatDate(field.value)
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gpmsVoucherNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-gray-700">
                        GPMS Voucher Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter voucher number"
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gpmsVoucherDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-xs font-medium text-gray-700">
                        GPMS Voucher Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "h-10 justify-start text-left font-normal",
                                !field.value && "text-gray-500",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                              {field.value ? (
                                formatDate(field.value)
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="my-4" />

            {/* Security Deposit Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Security Deposit
                  </h3>
                  <p className="text-xs text-gray-500">
                    Security deposit percentage
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {[0, 5, 10].map((percentage) => (
                  <Button
                    key={percentage}
                    type="button"
                    variant={
                      securityDepositPercentage === percentage
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => setSecurityDepositPercentage(percentage)}
                    className={cn(
                      "px-4 py-2",
                      securityDepositPercentage === percentage &&
                        "bg-gradient-to-r from-blue-600 to-indigo-600 text-white",
                    )}
                  >
                    {percentage}%
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Calculated Amounts Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-lg">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Calculated Amounts
                  </h3>
                  <p className="text-xs text-gray-500">
                    Summary of calculations
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-red-600">
                      Total Deductions
                    </span>
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-lg font-bold text-red-700">
                    {formatCurrency(totalDeduction)}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-blue-600">
                      Security Deposit
                    </span>
                    <Shield className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-lg font-bold text-blue-700">
                    {formatCurrency(securityDeposit)}
                  </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 ring-1 ring-emerald-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-emerald-600">
                      Net Amount
                    </span>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-lg font-bold text-emerald-700">
                    {formatCurrency(netAmount)}
                  </div>
                </div>
              </div>
            </div>

            <CardFooter className="px-0 pb-0 pt-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
                disabled={isSubmitting || grossAmountExceedsAwarded}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                {isSubmitting
                  ? "Processing..."
                  : paymentDetailsId
                    ? "Update Payment"
                    : "Add Payment"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
