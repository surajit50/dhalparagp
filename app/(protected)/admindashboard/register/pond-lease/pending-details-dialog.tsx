"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, addYears, getYear } from "date-fns";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface PendingDetailsDialogProps {
  lease: any;
}

export function PendingDetailsDialog({ lease }: PendingDetailsDialogProps) {
  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  const totalPaidAcrossAllYears = Number(lease.paidAmount) || 0;
  const yearlyAmount = Number(lease.leaseAmountYearly) || 0;
  let remainingPaidAmount = totalPaidAcrossAllYears;

  // Handle leasePeriod which might be a string like "3" or "3 + 1 Year"
  // We need to extract the total number of years for the breakdown
  const leaseStartDate = new Date(lease.leaseStartDate);
  const leaseEndDate = new Date(lease.leaseEndDate);

  // Calculate total years based on start and end date for a more accurate breakdown
  const totalYears = Math.ceil(
    (leaseEndDate.getTime() - leaseStartDate.getTime()) /
      (1000 * 60 * 60 * 24 * 365.25),
  );

  const yearlyBreakdown = Array.from({ length: totalYears }, (_, i) => {
    const yearStart = addYears(leaseStartDate, i);
    const paidForThisYear = Math.min(remainingPaidAmount, yearlyAmount);
    remainingPaidAmount -= paidForThisYear;
    const pendingForYear = yearlyAmount - paidForThisYear;

    return {
      yearLabel: `Year ${i + 1}`,
      calendarYear: getYear(yearStart),
      due: yearlyAmount,
      paid: paidForThisYear,
      pending: pendingForYear,
    };
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="p-0 h-auto text-[10px] font-bold text-orange-600 hover:text-orange-800 flex items-center gap-1"
        >
          <Info className="h-3 w-3" />
          View Year-wise Pending
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Pending Payment Breakdown
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Pond Name
              </p>
              <p className="text-sm font-extrabold text-slate-900">
                {lease.pond.name}
              </p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                Total Pending
              </p>
              <p className="text-lg font-black text-red-600 tracking-tight">
                {currency.format(lease.pendingAmount)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2">
              Year-wise Breakdown
            </div>
            <div className="grid gap-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
              {yearlyBreakdown.map((item, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex justify-between items-center p-3 rounded-lg border transition-all",
                    item.pending > 0
                      ? "bg-red-50/40 border-red-100 hover:bg-red-50/60"
                      : "bg-emerald-50/20 border-emerald-100 opacity-60",
                  )}
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-slate-800">
                      {item.yearLabel}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Financial Year {item.calendarYear}
                    </div>
                  </div>
                  <div className="text-right">
                    {item.pending > 0 ? (
                      <div className="space-y-0.5">
                        <div className="text-xs text-slate-400 line-through opacity-50">
                          {currency.format(item.due)}
                        </div>
                        <div className="text-sm font-black text-red-600">
                          {currency.format(item.pending)}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                        <span className="bg-emerald-100 p-0.5 rounded-full">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>
                        Paid in Full
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100/50">
            <p className="text-[10px] text-orange-700 leading-relaxed font-medium">
              Note: This breakdown uses FIFO logic. Payments are automatically
              applied to the oldest outstanding year first.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
