"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Building,
} from "lucide-react";

import type { workdetailfinanicalProps } from "@/types";
import { addFinancialDetails } from "@/action/aoc";

/* ---------------- SCHEMA ---------------- */

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

/* ---------------- COMPONENT ---------------- */

export default function FinancialBidDetails({
  work,
}: {
  work: workdetailfinanicalProps;
}) {
  const router = useRouter();
  const [localWork, setLocalWork] = useState(work);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    setLocalWork(work);
  }, [work]);

  /* ---------- HARD LOCK AFTER FINALIZATION ---------- */

  const isFinancialFinalized =
    localWork.tenderStatus === "FINANCIAL_EVAL_DONE" ||
    localWork.tenderStatus === "AWARDED";

  /* ---------- FORM ---------- */

  const form = useForm<BidFormValues>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      bids: localWork.biddingAgencies.map((agency) => ({
        agencyId: agency.id,
        lessPercentage: "",
        bidAmount: agency.biddingAmount
          ? String(agency.biddingAmount)
          : "",
      })),
    },
  });

  /* ---------- RANKING LOGIC ---------- */

  const getSortedBids = () => {
    const bids = form.getValues().bids;
    return bids
      .filter(
        (b) =>
          !isNaN(Number(b.bidAmount)) &&
          Number(b.bidAmount) > 0
      )
      .sort((a, b) => Number(a.bidAmount) - Number(b.bidAmount));
  };

  const sortedBids = getSortedBids();

  /* ---------- VALIDATION CHECKS ---------- */

  const detectDuplicateBids = () => {
    const amounts = sortedBids.map((b) => b.bidAmount);
    return new Set(amounts).size !== amounts.length;
  };

  const detectAbnormalBid = () => {
    return sortedBids.some((bid) => {
      const percentage =
        ((localWork.finalEstimateAmount -
          Number(bid.bidAmount)) /
          localWork.finalEstimateAmount) *
        100;
      return percentage > 20;
    });
  };

  /* ---------- SUBMIT ---------- */

  const onSubmit = (data: BidFormValues) => {
    if (detectDuplicateBids()) {
      setError("Duplicate bid amounts detected.");
      return;
    }

    if (detectAbnormalBid()) {
      setError("Abnormally low bid detected (>20%). Verify before submission.");
      return;
    }

    setShowConfirmation(true);
  };

  const confirmSubmission = async () => {
    const data = form.getValues();
    setShowConfirmation(false);
    setError(undefined);

    startTransition(() => {
      Promise.all(
        data.bids.map((bid) =>
          addFinancialDetails(bid.agencyId, bid.bidAmount, localWork.id),
        ),
      ).then(() => {
        setSuccess("Financial Bids Submitted Successfully");
        router.refresh();
      });
    });
  };

  /* ---------- UI ---------- */

  return (
    <div className="container mx-auto max-w-6xl py-6">

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Financial Bid Evaluation</CardTitle>
          <CardDescription>
            Estimate Value: ₹
            {localWork.finalEstimateAmount.toLocaleString("en-IN")}
          </CardDescription>
        </CardHeader>

        <CardContent>

          {/* LOCK BADGE */}
          {isFinancialFinalized && (
            <Badge className="mb-4 bg-green-600">
              Financial Stage Locked
            </Badge>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)}>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Agency</TableHead>
                  <TableHead>Bid Amount</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {localWork.biddingAgencies.map((agency, index) => {
                  const rankIndex = sortedBids.findIndex(
                    (b) => b.agencyId === agency.id,
                  );

                  const rank =
                    rankIndex === 0
                      ? "L1"
                      : rankIndex === 1
                      ? "L2"
                      : rankIndex === 2
                      ? "L3"
                      : null;

                  return (
                    <TableRow key={agency.id}>
                      <TableCell>
                        {rank && (
                          <span
                            className={
                              rank === "L1"
                                ? "text-green-600 font-bold"
                                : "text-orange-600 font-bold"
                            }
                          >
                            {rank}
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          {agency.agencydetails.name}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Input
                          disabled={isFinancialFinalized}
                          {...form.register(`bids.${index}.bidAmount`)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Comparative Statement */}
            {sortedBids.length > 0 && (
              <Card className="mt-6 border">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">
                    Comparative Statement
                  </h3>
                  {sortedBids.map((bid, i) => {
                    const agency = localWork.biddingAgencies.find(
                      (a) => a.id === bid.agencyId,
                    );
                    return (
                      <div
                        key={bid.agencyId}
                        className="flex justify-between text-sm py-1"
                      >
                        <span>
                          L{i + 1} - {agency?.agencydetails.name}
                        </span>
                        <span>
                          ₹{Number(bid.bidAmount).toLocaleString("en-IN")}
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {!isFinancialFinalized && (
              <div className="flex justify-end mt-6">
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit Financial Bids
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* CONFIRMATION DIALOG */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Confirm Financial Submission
            </DialogTitle>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmSubmission}>
              Confirm & Finalize
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
