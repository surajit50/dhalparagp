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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Receipt, Loader2, CalendarIcon } from "lucide-react";

import { PondLeasePaymentSchema, PondLeasePaymentFormValues } from "./schema";

import { addPondLeasePayment } from "./actions";

import { toast } from "sonner";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";

import { format, getYear, addYears } from "date-fns";
import { cn } from "@/lib/utils";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Lease {
  paidAmount(paidAmount: any): unknown;
  id: string;
  pond: { name: string };
  leaseAmountYearly: number;
  leasePeriod: string;
  leaseStartDate: Date;
  pendingAmount: number;
  payments: any[];
}

interface AddPaymentDialogProps {
  lease: Lease;
}

export function AddPaymentDialog({ lease }: AddPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<PondLeasePaymentFormValues>({
    resolver: zodResolver(PondLeasePaymentSchema),
    defaultValues: {
      pondLeaseId: lease.id,
      amountPaid: 0,
      paymentDate: new Date(),
      paymentMethod: "CASH",
      transactionId: "",
      remarks: "",
    },
  });

  const onSubmit = (values: PondLeasePaymentFormValues) => {
    if (values.amountPaid > lease.pendingAmount) {
      toast.error("Amount cannot exceed pending amount");
      return;
    }

    startTransition(async () => {
      try {
        await addPondLeasePayment(values);
        toast.success("Payment recorded successfully");
        setOpen(false);
        form.reset({
          pondLeaseId: lease.id,
          amountPaid: 0,
          paymentDate: new Date(),
          paymentMethod: "CASH",
          transactionId: "",
          remarks: "",
        });
      } catch (error) {
        toast.error("Failed to record payment");
      }
    });
  };

  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  const leaseYears = parseInt(lease.leasePeriod || "1");
  const totalPaidAcrossAllYears = Number(lease.paidAmount) || 0;
  const yearlyAmount = Number(lease.leaseAmountYearly) || 0;
  let remainingPaidAmount = totalPaidAcrossAllYears;

  const yearlyDues = Array.from({ length: leaseYears }, (_, i) => {
    const yearStart = addYears(new Date(lease.leaseStartDate), i);

    const paidForThisYear = Math.min(remainingPaidAmount, yearlyAmount);
    remainingPaidAmount -= paidForThisYear;

    const pendingForYear = yearlyAmount - paidForThisYear;

    return {
      year: getYear(yearStart),
      due: yearlyAmount,
      paid: paidForThisYear,
      pending: pendingForYear,
    };
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Receipt className="h-4 w-4 mr-2" />
          Add Payment
        </DropdownMenuItem>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Payment Details & History</DialogTitle>
          <DialogDescription>
            Manage payments for <strong>{lease.pond.name}</strong>. Total
            pending amount:{" "}
            <span className="font-semibold text-red-600">
              {currency.format(lease.pendingAmount)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-y-auto pr-2">
          {/* Left Side: Payment Form */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg border-b pb-2">
              Record New Payment
            </h3>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="amountPaid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Paid (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min={0.01}
                          max={lease.pendingAmount}
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
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Payment Date</FormLabel>
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
                                : "Pick a date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            captionLayout="dropdown-buttons"
                            fromYear={new Date(
                              lease.leaseStartDate,
                            ).getFullYear()}
                            toYear={new Date().getFullYear()}
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() ||
                              date < new Date(lease.leaseStartDate)
                            }
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
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="CHEQUE">Cheque</SelectItem>
                          <SelectItem value="ONLINE_TRANSFER">
                            Online Transfer
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transactionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction ID / Cheque No.</FormLabel>
                      <FormControl>
                        <Input placeholder="Reference number" {...field} />
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
                        <Input placeholder="Additional notes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={isPending} className="w-full">
                    {isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Record Payment
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>

          {/* Right Side: History & Breakdown */}
          <div className="space-y-6">
            <h3 className="font-semibold text-lg border-b pb-2">
              Year-wise Dues
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Year</TableHead>
                  <TableHead className="text-right">Yearly Due</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yearlyDues.map((due) => (
                  <TableRow key={due.year}>
                    <TableCell className="font-medium">{due.year}</TableCell>
                    <TableCell className="text-right">
                      {currency.format(due.due)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {currency.format(due.paid)}
                    </TableCell>
                    <TableCell className="text-right text-red-600 font-semibold">
                      {currency.format(due.pending)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <h3 className="font-semibold text-lg border-b pb-2 pt-4">
              Payment History
            </h3>
            <div className="max-h-60 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lease.payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No payments recorded yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    lease.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {format(new Date(payment.paymentDate), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>{payment.paymentMethod}</TableCell>
                        <TableCell className="text-right font-medium">
                          {currency.format(payment.amountPaid)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
