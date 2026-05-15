"use client";

import type React from "react";
import { useState, useMemo } from "react";
import type { WorksDetailWithRelations } from "@/lib/types";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

type BidType = {
  id: string;
  agencydetails: {
    id: string;
    name: string;
    agencyType: "FARM" | "INDIVIDUAL";
    mobileNumber: string | null;
  };
  biddingAmount: number | null;
};

type AOCFormProps = {
  works: WorksDetailWithRelations[];
};

export default function AOCForm({ works }: AOCFormProps) {
  const { toast } = useToast();

  const [selectedWorkId, setSelectedWorkId] = useState("");
  const [selectedBidId, setSelectedBidId] = useState("");
  const [aocMemoNumber, setAocMemoNumber] = useState("");
  const [aocMemoDate, setAocMemoDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);

  const selectedWork = works.find((w) => w.id === selectedWorkId);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const bids: BidType[] = selectedWork?.biddingAgencies || [];

  const sortedBids = useMemo(() => {
    return [...bids].sort(
      (a, b) =>
        (a.biddingAmount ?? Number.POSITIVE_INFINITY) -
        (b.biddingAmount ?? Number.POSITIVE_INFINITY),
    );
  }, [bids]);

  const lowestBid = sortedBids[0]?.biddingAmount ?? 0;

  const getRank = (index: number) => {
    if (index === 0) return "L1";
    if (index === 1) return "L2";
    if (index === 2) return "L3";
    return index + 1;
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  const handleWorkChange = (value: string) => {
    setSelectedWorkId(value);
    setSelectedBidId("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedWorkId || !selectedBidId || !aocMemoNumber || !aocMemoDate) {
      toast({
        title: "Missing Fields",
        description: "Please complete all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const selectedBid = bids.find((b) => b.id === selectedBidId);

      const response = await fetch("/api/aoc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workId: selectedWorkId,
          bidId: selectedBidId,
          bidAmount: selectedBid?.biddingAmount,
          aocMemoNumber,
          aocMemoDate: format(aocMemoDate, "yyyy-MM-dd"),
        }),
      });

      if (!response.ok) throw new Error("Failed to create AOC");

      toast({
        title: "Success",
        description: "AOC created successfully",
      });

      setSelectedWorkId("");
      setSelectedBidId("");
      setAocMemoNumber("");
      setAocMemoDate(new Date());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create AOC",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Create Acceptance of Contract</h1>
        <p className="text-muted-foreground">
          Select work and winning bidder to issue AOC
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* WORK SELECTION */}
        <div className="bg-white border rounded-xl shadow-sm">
          <div className="p-6 space-y-4">
            <Label>Select Work *</Label>

            <Select value={selectedWorkId} onValueChange={handleWorkChange}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select work project" />
              </SelectTrigger>

              <SelectContent>
                {works.map((work) => (
                  <SelectItem key={work.id} value={work.id}>
                    {work.nitDetails?.memoNumber} —{" "}
                    {work.ApprovedActionPlanDetails?.activityDescription?.slice(
                      0,
                      60,
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedWork && (
              <div className="bg-orange-50 border rounded-lg p-4 text-sm">
                <div>
                  <strong>Memo:</strong> {selectedWork.nitDetails?.memoNumber}
                </div>

                <div className="mt-2">
                  <strong>Description:</strong>{" "}
                  {selectedWork.ApprovedActionPlanDetails?.activityDescription}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BIDDER SECTION */}
        {selectedWork && (
          <div className="bg-white border rounded-xl shadow-sm">
            <div className="p-6">
              <div className="flex justify-between mb-4">
                <Label>Bidder Ranking</Label>

                <Badge variant="secondary">{bids.length} bids received</Badge>
              </div>

              <RadioGroup
                value={selectedBidId}
                onValueChange={setSelectedBidId}
                className="space-y-3"
              >
                {sortedBids.map((bid, index) => {
                  const rank = getRank(index);
                  const isLowest = index === 0;
                  const difference = (bid.biddingAmount ?? 0) - lowestBid;

                  return (
                    <label
                      key={bid.id}
                      className={cn(
                        "flex justify-between items-center border-2 rounded-lg p-4 cursor-pointer",
                        selectedBidId === bid.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:bg-gray-50",
                        isLowest && "ring-2 ring-green-100",
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <RadioGroupItem value={bid.id} />

                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {bid.agencydetails.name}

                            {isLowest && (
                              <CheckCircledIcon className="text-green-600" />
                            )}
                          </div>

                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">
                              {bid.agencydetails.agencyType}
                            </Badge>

                            <Badge>{rank}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {bid.biddingAmount
                            ? formatCurrency(bid.biddingAmount)
                            : "N/A"}
                        </div>

                        {difference > 0 && (
                          <div className="text-xs text-gray-500">
                            + {formatCurrency(difference)}
                          </div>
                        )}

                        {isLowest && (
                          <div className="text-green-600 text-xs">
                            Lowest Bid
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>
          </div>
        )}

        {/* AOC DETAILS */}
        <div className="bg-white border rounded-xl shadow-sm">
          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>AOC Memo Number *</Label>

              <Input
                value={aocMemoNumber}
                onChange={(e) => setAocMemoNumber(e.target.value)}
                placeholder="AOC/2026/001"
              />
            </div>

            <div className="space-y-2">
              <Label>Memo Date *</Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />

                    {aocMemoDate ? format(aocMemoDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={aocMemoDate}
                    onSelect={setAocMemoDate}
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={
              loading ||
              !selectedWorkId ||
              !selectedBidId ||
              !aocMemoNumber ||
              !aocMemoDate
            }
            className="px-8"
          >
            {loading ? "Processing..." : "Create AOC"}
          </Button>
        </div>
      </form>
    </div>
  );
}
