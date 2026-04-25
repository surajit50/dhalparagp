"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { CheckCircle, CalendarIcon, Banknote, Landmark, CreditCard, Receipt } from "lucide-react";
import { updateDepositStatus } from "@/action/deposits";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Refined schema with stricter validation rules
const formSchema = z
  .object({
    paymentMethod: z.enum(["CHEQUE", "ONLINE_TRANSFER", "CASH"], {
      required_error: "Please select a payment method",
    }),
    chequeNumber: z.string().optional(),
    chequeDate: z.date().optional(),
    transactionId: z.string().optional(),
    paymentDate: z.date({
      required_error: "Payment date is required",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === "CHEQUE") {
      if (!data.chequeNumber || data.chequeNumber.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["chequeNumber"],
          message: "Cheque number is required",
        });
      }
      if (!data.chequeDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["chequeDate"],
          message: "Cheque date is required",
        });
      }
    }
    if (data.paymentMethod === "ONLINE_TRANSFER" && (!data.transactionId || data.transactionId.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["transactionId"],
        message: "Transaction ID is required",
      });
    }
  });

export function MarkPaidButton({ depositId }: { depositId: string }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentMethod: undefined,
      chequeNumber: "",
      transactionId: "",
      paymentDate: new Date(), // Default to today to save clicks
    },
  });

  const paymentMethod = form.watch("paymentMethod");

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        await updateDepositStatus({
          depositId,
          ...values,
          chequeNumber: values.paymentMethod === "CHEQUE" ? values.chequeNumber : undefined,
          chequeDate: values.paymentMethod === "CHEQUE" ? values.chequeDate : undefined,
          transactionId: values.paymentMethod === "ONLINE_TRANSFER" ? values.transactionId : undefined,
        });
        setOpen(false);
        form.reset();
      } catch (error) {
        console.error("Failed to mark as paid:", error);
        // You can add toast notification here
      }
    });
  }

  // Reset form when dialog closes without submitting
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(() => form.reset(), 200); // Small delay to allow exit animation
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-9 px-4 gap-2 bg-white border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all rounded-xl shadow-sm"
        >
          <CheckCircle className="h-4 w-4" />
          <span className="font-medium">Mark Paid</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <DialogHeader className="px-6 py-5 bg-slate-50 border-b border-slate-100">
          <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <div className="bg-indigo-100 p-1.5 rounded-lg">
              <Receipt className="h-5 w-5 text-indigo-600" />
            </div>
            Record Payment
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Enter the transaction details to mark this deposit as paid.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6 bg-white">
            
            {/* Payment Method Selector */}
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-sm font-semibold text-slate-700">Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-slate-50/50 border-slate-200 rounded-xl focus:ring-indigo-500 transition-all">
                        <SelectValue placeholder="Select how it was paid" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                      <SelectItem value="CHEQUE" className="py-3 cursor-pointer focus:bg-indigo-50">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-50 p-1.5 rounded-md"><Landmark className="h-4 w-4 text-blue-600" /></div>
                          <span className="font-medium text-slate-700">Cheque</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ONLINE_TRANSFER" className="py-3 cursor-pointer focus:bg-indigo-50">
                        <div className="flex items-center gap-3">
                          <div className="bg-emerald-50 p-1.5 rounded-md"><CreditCard className="h-4 w-4 text-emerald-600" /></div>
                          <span className="font-medium text-slate-700">Online Transfer</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="CASH" className="py-3 cursor-pointer focus:bg-indigo-50">
                        <div className="flex items-center gap-3">
                          <div className="bg-amber-50 p-1.5 rounded-md"><Banknote className="h-4 w-4 text-amber-600" /></div>
                          <span className="font-medium text-slate-700">Cash</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-rose-500 text-xs" />
                </FormItem>
              )}
            />

            {/* Conditional Fields based on Payment Method */}
            {paymentMethod && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                {paymentMethod === "CHEQUE" && (
                  <>
                    <FormField
                      control={form.control}
                      name="chequeNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-slate-700">Cheque Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. 123456"
                              {...field}
                              className="h-11 bg-white border-slate-200 rounded-lg focus-visible:ring-indigo-500"
                            />
                          </FormControl>
                          <FormMessage className="text-rose-500 text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="chequeDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-sm font-semibold text-slate-700">Cheque Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "h-11 w-full pl-3 text-left font-normal bg-white border-slate-200 rounded-lg hover:bg-white hover:text-slate-900",
                                    !field.value && "text-slate-400"
                                  )}
                                >
                                  {field.value ? format(field.value, "PPP") : <span>Select date on cheque</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 text-slate-400" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-xl border-slate-200 shadow-xl" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className="p-3"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage className="text-rose-500 text-xs" />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {paymentMethod === "ONLINE_TRANSFER" && (
                  <FormField
                    control={form.control}
                    name="transactionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">Transaction ID (UTR)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. SBIN00012345678"
                            {...field}
                            className="h-11 bg-white border-slate-200 rounded-lg focus-visible:ring-indigo-500"
                          />
                        </FormControl>
                        <FormMessage className="text-rose-500 text-xs" />
                      </FormItem>
                    )}
                  />
                )}
                
                {paymentMethod === "CASH" && (
                   <p className="text-sm text-slate-500 italic text-center py-2">
                     Ensure you have provided a physical receipt for this cash transaction.
                   </p>
                )}
              </div>
            )}

            {/* Payment Date */}
            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-sm font-semibold text-slate-700">Date Received</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-11 w-full pl-3 text-left font-normal bg-white border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-indigo-500 transition-all",
                            !field.value && "text-slate-400"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Select received date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 text-slate-400" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl border-slate-200 shadow-xl" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-rose-500 text-xs" />
                </FormItem>
              )}
            />

            {/* Submit Action */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isPending || !paymentMethod}
                className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:hover:shadow-sm"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Confirm Payment Received
                  </>
                )}
              </Button>
            </div>
            
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
