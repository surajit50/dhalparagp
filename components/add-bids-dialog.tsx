/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plus, Minus } from "lucide-react";
import {
  addBidsToQuotation,
  getAvailableBidders,
} from "@/lib/actions/add-bids";
import { useCurrentUser } from "@/hooks/use-current-user";

interface Bidder {
  id: string;
  name: string;
  type: string;
  contactPerson: string;
  phone: string;
}

interface BidEntry {
  bidderId: string;
  amount: string;
  percentage: string;
  inputMode: "manual" | "percentage";
  remarks: string;
}

interface QuotationInfo {
  id: string;
  nitNo: string;
  workName: string;
  estimatedAmount: number;
}

interface AddBidsDialogProps {
  quotation: QuotationInfo;
  onBidsAdded: () => void;
}

const MINIMUM_BIDDERS_REQUIRED = 3;

export function AddBidsDialog({ quotation, onBidsAdded }: AddBidsDialogProps) {
  const { toast } = useToast();
  const user = useCurrentUser();

  const createEmptyBid = (): BidEntry => ({
    bidderId: "",
    amount: "",
    percentage: "",
    inputMode: "manual",
    remarks: "",
  });

  const [open, setOpen] = useState(false);
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [bids, setBids] = useState<BidEntry[]>([
    createEmptyBid(),
    createEmptyBid(),
    createEmptyBid(),
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) loadBidders();
    else {
      setBids([createEmptyBid(), createEmptyBid(), createEmptyBid()]);
    }
  }, [open]);

  const loadBidders = async () => {
    setIsLoading(true);
    try {
      const result = await getAvailableBidders();
      if (result.success) setBidders(result.data || []);
      else throw new Error();
    } catch {
      toast({
        title: "Error",
        description: "Failed to load bidders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAmountFromPercentage = (percentage: string) => {
    const percentValue = Number.parseFloat(percentage);
    if (isNaN(percentValue) || percentValue <= 0) return "";
    return (quotation.estimatedAmount * (percentValue / 100)).toFixed(2);
  };

  const calculatePercentageFromAmount = (amount: string) => {
    const amountValue = Number.parseFloat(amount);
    if (isNaN(amountValue) || quotation.estimatedAmount <= 0) return "";
    return ((amountValue / quotation.estimatedAmount) * 100).toFixed(2);
  };

  const getEffectiveAmount = (bid: BidEntry) => {
    if (bid.inputMode === "percentage" && bid.percentage)
      return calculateAmountFromPercentage(bid.percentage);
    return bid.amount;
  };

  const updateBid = (index: number, field: keyof BidEntry, value: string) => {
    const updated = [...bids];
    const bid = { ...updated[index] };

    if (field === "inputMode") {
      bid.inputMode = value as any;
      if (value === "percentage" && bid.amount)
        bid.percentage = calculatePercentageFromAmount(bid.amount);
      if (value === "manual" && bid.percentage)
        bid.amount = calculateAmountFromPercentage(bid.percentage);
    }

    if (field === "amount") {
      const num = Number.parseFloat(value);
      if (!isNaN(num) && num > 0) {
        bid.amount = value;
        bid.percentage = calculatePercentageFromAmount(value);
      } else {
        bid.amount = "";
        bid.percentage = "";
      }
    }

    if (field === "percentage") {
      const num = Number.parseFloat(value);
      if (!isNaN(num) && num > 0) {
        bid.percentage = value;
        bid.amount = calculateAmountFromPercentage(value);
      } else {
        bid.percentage = "";
        bid.amount = "";
      }
    }

    if (field === "bidderId") bid.bidderId = value;
    if (field === "remarks") bid.remarks = value;

    updated[index] = bid;
    setBids(updated);
  };

  const getValidBidsCount = () =>
    bids.filter((b) => {
      const amt = Number.parseFloat(getEffectiveAmount(b));
      return b.bidderId && !isNaN(amt) && amt > 0;
    }).length;

  const isMinimumRequirementMet = () =>
    getValidBidsCount() >= MINIMUM_BIDDERS_REQUIRED;

  const getSortedValidBids = () =>
    bids
      .map((bid, index) => ({
        ...bid,
        amount: Number.parseFloat(getEffectiveAmount(bid)),
        index,
      }))
      .filter((b) => !isNaN(b.amount))
      .sort((a, b) => a.amount - b.amount);

  const validateBids = () => {
    const errors: string[] = [];
    const used = new Set<string>();

    const validBids = bids.filter((b) => {
      const amt = Number.parseFloat(getEffectiveAmount(b));
      return b.bidderId && !isNaN(amt) && amt > 0;
    });

    if (validBids.length < MINIMUM_BIDDERS_REQUIRED)
      errors.push(`Minimum ${MINIMUM_BIDDERS_REQUIRED} bidders required.`);

    bids.forEach((b, i) => {
      const amt = Number.parseFloat(getEffectiveAmount(b));

      if (!b.bidderId) errors.push(`Bid ${i + 1}: Select bidder`);
      else if (used.has(b.bidderId))
        errors.push(`Bid ${i + 1}: Duplicate bidder`);
      else used.add(b.bidderId);

      if (isNaN(amt) || amt <= 0)
        errors.push(`Bid ${i + 1}: Enter valid amount`);
    });

    return errors;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (!user?.id) return;

    const errors = validateBids();
    if (errors.length) {
      toast({
        title: "Validation Error",
        description: errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const data = bids.map((b) => ({
        bidderId: b.bidderId,
        amount: Number.parseFloat(getEffectiveAmount(b)),
        remarks: b.remarks || undefined,
      }));

      const result = await addBidsToQuotation(quotation.id, data, user.id);

      if (result.success) {
        toast({ title: "Success", description: "Bids added successfully" });
        setOpen(false);
        onBidsAdded();
      } else throw new Error();
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit bids",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Bids
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Bids</DialogTitle>
          <DialogDescription>
            Minimum {MINIMUM_BIDDERS_REQUIRED} bidders required
          </DialogDescription>
        </DialogHeader>

        {bids.map((bid, index) => {
          const sorted = getSortedValidBids();
          const rankIndex = sorted.findIndex((b) => b.index === index);
          const rank = rankIndex >= 0 ? `L${rankIndex + 1}` : null;

          return (
            <Card key={index} className="mb-4">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Bid #{index + 1}</span>
                    {rank && (
                      <Badge className="bg-indigo-100 text-indigo-700">
                        {rank}
                      </Badge>
                    )}
                  </div>
                  {bids.length > 3 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setBids(bids.filter((_, i) => i !== index))
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <Select
                  value={bid.bidderId}
                  onValueChange={(v) => updateBid(index, "bidderId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bidder" />
                  </SelectTrigger>
                  <SelectContent>
                    {bidders.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {bid.inputMode === "manual" ? (
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={bid.amount}
                    onChange={(e) => updateBid(index, "amount", e.target.value)}
                  />
                ) : (
                  <Input
                    type="number"
                    placeholder="Percentage"
                    value={bid.percentage}
                    onChange={(e) =>
                      updateBid(index, "percentage", e.target.value)
                    }
                  />
                )}

                <Textarea
                  placeholder="Remarks"
                  value={bid.remarks}
                  onChange={(e) => updateBid(index, "remarks", e.target.value)}
                />
              </CardContent>
            </Card>
          );
        })}

        <Separator />

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setBids([...bids, createEmptyBid()])}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Row
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              isLoading ||
              !isMinimumRequirementMet() ||
              validateBids().length > 0
            }
          >
            Submit Bids
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
