"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getQuotations } from "@/action/procurement-quotation";
import {
  getBiddersByQuotation,
  generateComparativeStatement,
} from "@/action/procurement-bid";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface Quotation {
  id: string;
  nitNo: string;
  workName: string;
  estimatedAmount: number;
  _count: { bidders: number };
  comparativeStatement?: any;
}

export default function ComparativeStatementPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(
    null,
  );
  const [bidders, setBidders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const fetchQuotations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getQuotations();
      // Only show quotations with at least 3 bidders as per GP rules
      setQuotations(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load quotations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const handleSelectQuotation = useCallback(
    async (q: Quotation) => {
      try {
        setSelectedQuotation(q);
        const bData = await getBiddersByQuotation(q.id);
        setBidders(bData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load bidders",
          variant: "destructive",
        });
      }
    },
    [toast],
  );

  const handleGenerateStatement = useCallback(async () => {
    if (!selectedQuotation || bidders.length < 3) return;

    try {
      setIsGenerating(true);
      const result = await generateComparativeStatement(
        selectedQuotation.id,
        "Auto-generated CS based on bids.",
      );
      if (result.success) {
        toast({
          title: "CS Generated",
          description: "Comparative Statement has been approved and saved.",
        });
        fetchQuotations();
        setSelectedQuotation(null);
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate comparative statement",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [selectedQuotation, bidders, fetchQuotations, toast]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Comparative Statements</h1>
          <p className="text-muted-foreground">
            Analyze bids and select L1, L2, L3 suppliers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quotations List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">Evaluations Pending</h2>
          {quotations
            .filter((q) => !q.comparativeStatement)
            .map((q) => (
              <Card
                key={q.id}
                className={`cursor-pointer transition-colors ${selectedQuotation?.id === q.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                onClick={() => handleSelectQuotation(q)}
              >
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-bold">{q.nitNo}</CardTitle>
                  <CardDescription className="text-xs line-clamp-1">
                    {q.workName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between items-center text-xs">
                    <Badge
                      variant={q._count.bidders >= 3 ? "default" : "secondary"}
                    >
                      {q._count.bidders} Bidders
                    </Badge>
                    <span className="font-medium">
                      ₹{q.estimatedAmount.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}

          {quotations.filter((q) => !q.comparativeStatement).length === 0 &&
            !loading && (
              <p className="text-sm text-muted-foreground italic">
                No pending evaluations.
              </p>
            )}
        </div>

        {/* Evaluation View */}
        <div className="lg:col-span-2">
          {selectedQuotation ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Analysis for {selectedQuotation.nitNo}</CardTitle>
                  <CardDescription>
                    {selectedQuotation.workName}
                  </CardDescription>
                </div>
                {bidders.length >= 3 && (
                  <Button
                    onClick={handleGenerateStatement}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve L1 Selection
                      </>
                    )}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Estimated</p>
                    <p className="text-lg font-bold">
                      ₹{selectedQuotation.estimatedAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center border border-green-100">
                    <p className="text-xs text-green-600">L1 Bid</p>
                    <p className="text-lg font-bold text-green-700">
                      {bidders.length > 0
                        ? `₹${bidders[0].bidAmount.toLocaleString()}`
                        : "-"}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg text-center border border-blue-100">
                    <p className="text-xs text-blue-600">Savings</p>
                    <p className="text-lg font-bold text-blue-700">
                      {bidders.length > 0
                        ? `₹${(selectedQuotation.estimatedAmount - bidders[0].bidAmount).toLocaleString()}`
                        : "-"}
                    </p>
                  </div>
                </div>

                {bidders.length < 3 && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm">
                    <AlertCircle className="h-4 w-4" />
                    As per rules, at least 3 valid bidders are required to
                    generate a Comparative Statement.
                  </div>
                )}

                {/* Comparative Table */}
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="p-2 text-left">Rank</th>
                        <th className="p-2 text-left">Agency</th>
                        <th className="p-2 text-left">Bid Amount</th>
                        <th className="p-2 text-left">Diff from Est</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bidders.map((bid) => {
                        const diff =
                          ((bid.bidAmount - selectedQuotation.estimatedAmount) /
                            selectedQuotation.estimatedAmount) *
                          100;
                        return (
                          <tr
                            key={bid.id}
                            className={`border-b last:border-0 ${bid.rank === 1 ? "bg-green-50/50" : ""}`}
                          >
                            <td className="p-2 font-bold">
                              {bid.rank === 1 ? (
                                <Badge className="bg-green-600">L1</Badge>
                              ) : bid.rank === 2 ? (
                                <Badge className="bg-blue-600">L2</Badge>
                              ) : bid.rank === 3 ? (
                                <Badge className="bg-amber-600">L3</Badge>
                              ) : (
                                bid.rank
                              )}
                            </td>
                            <td className="p-2">
                              <div className="font-medium">
                                {bid.agency.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {bid.agency.phone}
                              </div>
                            </td>
                            <td className="p-2 font-bold">
                              ₹{bid.bidAmount.toLocaleString()}
                            </td>
                            <td
                              className={`p-2 font-medium ${diff < 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {diff > 0 ? "+" : ""}
                              {diff.toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-4 p-4 bg-muted/30 rounded-lg border border-dashed">
                  <TrendingDown className="h-10 w-10 text-muted-foreground opacity-50" />
                  <div className="text-sm">
                    <p className="font-bold">Recommendation Note</p>
                    <p className="text-muted-foreground">
                      Based on the bids received,{" "}
                      <strong>{bidders[0]?.agency.name}</strong> has submitted
                      the lowest valid bid (L1) at{" "}
                      {(
                        (bidders[0]?.bidAmount /
                          selectedQuotation.estimatedAmount) *
                        100
                      ).toFixed(2)}
                      % of the estimated cost. Recommended for issuance of
                      Work/Supply Order.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-20" />
              <p>Select a quotation from the list to start evaluation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
