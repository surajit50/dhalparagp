"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { useState, useEffect } from "react";

import {
  Loader2,
  Building,
  AlertCircle,
  CheckCircle2,
  Percent,
} from "lucide-react";

import { FaRupeeSign } from "react-icons/fa";

import type { AddFinancialDetailsType } from "@/types";
import { addFinancialDetails } from "@/action/bookNitNuber";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const bidSchema = z.object({
  bids: z.array(
    z.object({
      agencyId: z.string(),
      lessPercentage: z.string(),
      bidAmount: z.string(),
    }),
  ),
});

type BidFormValues = z.infer<typeof bidSchema>;

interface BidFormDialogProps {
  work: AddFinancialDetailsType;
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function BidFormDialog({
  work,
  trigger,
  onSuccess,
}: BidFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const form = useForm<BidFormValues>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      bids: work.biddingAgencies.map((agency) => ({
        agencyId: agency.id,
        lessPercentage: "",
        bidAmount: agency.biddingAmount?.toString() || "",
      })),
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        bids: work.biddingAgencies.map((agency) => ({
          agencyId: agency.id,
          lessPercentage: "",
          bidAmount: agency.biddingAmount?.toString() || "",
        })),
      });
      setError("");
      setSuccess("");
    }
  }, [open, work.biddingAgencies, form]);

  /* ---------------------------
Calculate Bid Amount
----------------------------*/

  const calculateBidAmount = (index: number, less: string) => {
    const percent = Number.parseFloat(less);

    if (!isNaN(percent)) {
      const amount = work.finalEstimateAmount * (1 - percent / 100);

      form.setValue(`bids.${index}.bidAmount`, amount.toFixed(2));
    }
  };

  /* ---------------------------
Ranking Logic (L1 L2 L3)
----------------------------*/

  const calculateBidRanking = () => {
    const bids = form.getValues().bids;

    const ranked = bids
      .map((bid) => {
        const agency = work.biddingAgencies.find((a) => a.id === bid.agencyId);

        return {
          agencyId: bid.agencyId,
          agencyName: agency?.agencydetails?.name ?? "Unknown",
          amount: Number.parseFloat(bid.bidAmount),
        };
      })
      .filter((b) => !isNaN(b.amount) && b.amount > 0)
      .sort((a, b) => a.amount - b.amount);

    return ranked.map((b, i) => ({
      ...b,
      rank: `L${i + 1}`,
    }));
  };

  const rankedBids = calculateBidRanking();

  /* ---------------------------
Submit
----------------------------*/

  // Improved onSubmit in BidFormDialog
  const onSubmit = async (data: BidFormValues) => {
    setError("");
    setSuccess("");
    setIsPending(true);

    try {
      const results = await Promise.all(
        data.bids.map((bid) =>
          addFinancialDetails(bid.agencyId, bid.bidAmount, work.id),
        ),
      );

      const firstError = results.find((r) => r.error);
      if (firstError) {
        const errMsg = firstError.error || "Failed to submit some bids";
        setError(errMsg);
        toast.error(errMsg);
        setIsPending(false);
        return;
      }

      setSuccess("Financial bids submitted successfully");
      toast.success("Financial bids submitted successfully");

      // Wait a bit to show success message then close and refresh
      setTimeout(() => {
        setOpen(false);
        onSuccess?.();
        router.refresh();
        // Reset internal feedback states after close
        setTimeout(() => {
          setError("");
          setSuccess("");
          setIsPending(false);
        }, 300);
      }, 1500);
    } catch (err) {
      const errMsg = "An unexpected error occurred. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
      console.error(err);
      setIsPending(false);
    }
  };

  /* ---------------------------
UI
----------------------------*/

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Financial Bid Evaluation
          </DialogTitle>

          <DialogDescription>
            {work.ApprovedActionPlanDetails.activityDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estimate Summary */}

          <div className="grid grid-cols-3 gap-4">
            <div className="border rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Estimate Value</p>
              <p className="font-semibold text-green-700">
                ₹{work.finalEstimateAmount.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="border rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                Participating Agencies
              </p>
              <p className="font-semibold">{work.biddingAgencies.length}</p>
            </div>

            <div className="border rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Entered Bids</p>
              <p className="font-semibold">{rankedBids.length}</p>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Bid Table */}

            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-100">
                  <TableRow>
                    <TableHead>Agency</TableHead>
                    <TableHead>Discount %</TableHead>
                    <TableHead>Bid Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {work.biddingAgencies.map((agency, index) => {
                    const bidAmount = Number.parseFloat(
                      form.watch(`bids.${index}.bidAmount`),
                    );

                    const isValid = !isNaN(bidAmount) && bidAmount > 0;

                    const rank = rankedBids.find(
                      (r) => r.agencyId === agency.id,
                    );

                    return (
                      <TableRow
                        key={agency.id}
                        className={rank?.rank === "L1" ? "bg-green-50" : ""}
                      >
                        <TableCell className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-orange-600" />

                          {agency.agencydetails.name}

                          {rank && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-semibold

${
  rank.rank === "L1"
    ? "bg-green-200 text-green-800"
    : rank.rank === "L2"
      ? "bg-orange-200 text-orange-800"
      : "bg-gray-200 text-gray-700"
}

`}
                            >
                              {rank.rank}
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="relative">
                            <Percent className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                            <Input
                              className="pl-8"
                              placeholder="0"
                              {...form.register(`bids.${index}.lessPercentage`)}
                              onChange={(e) => {
                                form.setValue(
                                  `bids.${index}.lessPercentage`,
                                  e.target.value,
                                );

                                calculateBidAmount(index, e.target.value);
                              }}
                            />
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="relative">
                            <FaRupeeSign className="absolute left-2 top-1/2 -translate-y-1/2" />

                            <Input
                              className="pl-7"
                              placeholder="0"
                              {...form.register(`bids.${index}.bidAmount`)}
                            />
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          {isValid ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-amber-500 mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Ranking Confirmation */}

            {rankedBids.length > 0 && (
              <div className="border rounded-lg p-4 bg-slate-50 mt-6">
                <h3 className="font-semibold mb-3 text-sm">
                  Bid Ranking Confirmation
                </h3>

                <div className="space-y-2">
                  {rankedBids.slice(0, 3).map((bid) => (
                    <div
                      key={bid.agencyId}
                      className={`flex items-center justify-between p-3 rounded-lg border

${
  bid.rank === "L1"
    ? "bg-green-50 border-green-300"
    : bid.rank === "L2"
      ? "bg-orange-50 border-orange-200"
      : "bg-gray-50"
}

`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold

${
  bid.rank === "L1"
    ? "bg-green-600 text-white"
    : bid.rank === "L2"
      ? "bg-orange-600 text-white"
      : "bg-gray-500 text-white"
}

`}
                        >
                          {bid.rank}
                        </span>

                        <span className="font-medium">{bid.agencyName}</span>
                      </div>

                      <span className="font-semibold text-sm">
                        ₹{bid.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  Please verify the ranking before submitting financial bids.
                </p>
              </div>
            )}

            {/* Error and Success Messages */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm mt-4 border border-red-100">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 text-green-700 text-sm mt-4 border border-green-100">
                <CheckCircle2 className="h-4 w-4" />
                {success}
              </div>
            )}

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                Submit Bids
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
