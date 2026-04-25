"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import {
  BarChart3,
  Plus,
  Eye,
  FileSpreadsheet,
  Calendar,
  Clock,
  AlertTriangle,
  Info,
  FileText,
} from "lucide-react";
import {
  createComparativeStatement,
  exportComparativeStatement,
  generateComparativeStatementPDFAction,
} from "@/lib/actions/comparative-statements";
import { useCurrentUser } from "@/hooks/use-current-user";
import { formatCurrency, formatDate } from "@/lib/utils/date";
import { AddBidsDialog } from "@/components/add-bids-dialog";
import { generateComparativeStatementPDF } from "@/lib/utils/pdf-generator";

interface QuotationWithBids {
  id: string;
  nitNo: string;
  workName: string;
  estimatedAmount: number;
  nitDate: Date;
  submissionDate: Date;
  openingDate: Date;
  publishedAt: Date | null;
  daysPublished: number;
  bids: Array<{
    id: string;
    amount: number;
    rank: number;
    agencyDetails: {
      id: string;
      name: string;
      agencyType: string;
    };
  }>;
  hasComparative: boolean;
  lowestBid: number;
  hasBids: boolean;
}

interface ComparativeStatementClientProps {
  quotations: QuotationWithBids[];
}

export function ComparativeStatementClient({
  quotations,
}: ComparativeStatementClientProps) {
  const [selectedQuotation, setSelectedQuotation] =
    useState<QuotationWithBids | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [remarks, setRemarks] = useState("");
  const { toast } = useToast();
  const user = useCurrentUser();

  const handleCreateComparative = async (quotationId: string) => {
    if (!user || !user.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create comparative statements",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const result = await createComparativeStatement(
        quotationId,
        user.id,
        remarks
      );

      if (result.success) {
        toast({
          title: "Success",
          description:
            result.message || "Comparative statement created successfully",
        });
        setRemarks("");
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create comparative statement",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewComparative = (quotation: QuotationWithBids) => {
    setSelectedQuotation(quotation);
  };

  const handleExport = async (quotationId: string) => {
    setIsExporting(true);
    try {
      const result = await exportComparativeStatement(quotationId);

      if (result.success) {
        // Create and download CSV file
        const csvContent = generateCSV(result.data);
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `comparative-statement-${result.data.quotation.nitNo}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Success",
          description: "Comparative statement exported successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to export comparative statement",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during export",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleGeneratePDF = async (quotationId: string) => {
    setIsGeneratingPDF(true);
    try {
      const result = await generateComparativeStatementPDFAction(quotationId);

      if (result.success) {
        // Generate PDF using the client-side library
        const pdf = generateComparativeStatementPDF(result.data);

        // Download the PDF
        pdf.save(`comparative-statement-${result.data.quotation.nitNo}.pdf`);

        toast({
          title: "Success",
          description: "PDF generated and downloaded successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate PDF",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during PDF generation",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const generateCSV = (data: any) => {
    const headers = [
      "Rank",
      "Bidder Name",
      "Bid Amount",
      "Difference from Estimate",
      "Percentage Difference",
    ];
    const rows = data.bids.map((bid: any) => [
      bid.rank,
      bid.bidderName,
      bid.bidAmount,
      bid.differenceFromEstimate,
      `${bid.percentageDifference.toFixed(2)}%`,
    ]);

    const csvContent = [
      `Quotation: ${data.quotation.workName}`,
      `NIT No: ${data.quotation.nitNo}`,
      `Estimated Amount: ${formatCurrency(data.quotation.estimatedAmount)}`,
      `Published Date: ${formatDate(data.quotation.publishedAt)}`,
      "",
      headers.join(","),
      ...rows.map((row: any) => row.join(",")),
    ].join("\n");

    return csvContent;
  };

  const totalQuotations = quotations.length;
  const quotationsWithBids = quotations.filter((q) => q.hasBids);
  const quotationsWithoutBids = quotations.filter((q) => !q.hasBids);
  const completedStatements = quotations.filter((q) => q.hasComparative).length;
  const totalBids = quotations.reduce((sum, q) => sum + q.bids.length, 0);

  if (quotations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Comparative Statement
          </CardTitle>
          <CardDescription>
            Create and manage comparative statements for quotations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No published quotations found
            </p>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                To create comparative statements, you need:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Published quotations</li>
                <li>Quotations with received bids</li>
              </ul>
            </div>
            <div className="mt-6 space-x-2">
              <Button asChild>
                <Link href="/admindashboard/manage-qatation/view">
                  View All Quotations
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admindashboard/manage-qatation/create">
                  Create New Quotation
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Comparative Statement
          </CardTitle>
          <CardDescription>
            Create and manage comparative statements for published quotations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {quotationsWithoutBids.length > 0 && (
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                {quotationsWithoutBids.length} published quotation(s) dont have
                bids yet. Comparative statements can only be created for
                quotations with bids.
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NIT/NIQ No.</TableHead>
                  <TableHead>Work Name</TableHead>
                  <TableHead>Published Date</TableHead>
                  <TableHead>Days Published</TableHead>
                  <TableHead>Estimated Amount</TableHead>
                  <TableHead>Bids Status</TableHead>
                  <TableHead>Lowest Bid</TableHead>
                  <TableHead>Comparative Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotations.map((quotation) => (
                  <TableRow
                    key={quotation.id}
                    className={!quotation.hasBids ? "bg-muted/30" : ""}
                  >
                    <TableCell className="font-medium">
                      {quotation.nitNo}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{quotation.workName}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          Opening: {formatDate(quotation.openingDate)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          {quotation.publishedAt
                            ? formatDate(quotation.publishedAt)
                            : "Not published"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <Badge variant="outline" className="text-xs">
                          {quotation.daysPublished} days
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(quotation.estimatedAmount)}
                    </TableCell>
                    <TableCell>
                      {quotation.hasBids ? (
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-800"
                        >
                          {quotation.bids.length} bids
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          No bids
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {quotation.hasBids ? (
                        <div>
                          <div className="font-medium text-green-600">
                            {formatCurrency(quotation.lowestBid)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {quotation.lowestBid < quotation.estimatedAmount
                              ? "Below"
                              : "Above"}{" "}
                            estimate
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {quotation.hasBids ? (
                        <Badge
                          variant={
                            quotation.hasComparative ? "default" : "secondary"
                          }
                          className={
                            quotation.hasComparative
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          }
                        >
                          {quotation.hasComparative ? "Completed" : "Pending"}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground"
                        >
                          Not Available
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        {quotation.hasBids ? (
                          <>
                            {quotation.hasComparative ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleViewComparative(quotation)
                                    }
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-5xl">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Comparative Statement - {quotation.nitNo}
                                    </DialogTitle>
                                    <DialogDescription>
                                      {quotation.workName}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="mt-4">
                                    <div className="mb-4 grid grid-cols-3 gap-4 text-sm bg-muted/50 p-4 rounded-lg">
                                      <div>
                                        <strong>Estimated Amount:</strong>{" "}
                                        {formatCurrency(
                                          quotation.estimatedAmount
                                        )}
                                      </div>
                                      <div>
                                        <strong>Total Bids:</strong>{" "}
                                        {quotation.bids.length}
                                      </div>
                                      <div>
                                        <strong>Published Date:</strong>{" "}
                                        {quotation.publishedAt
                                          ? formatDate(quotation.publishedAt)
                                          : "N/A"}
                                      </div>
                                      <div>
                                        <strong>Submission Date:</strong>{" "}
                                        {formatDate(quotation.submissionDate)}
                                      </div>
                                      <div>
                                        <strong>Opening Date:</strong>{" "}
                                        {formatDate(quotation.openingDate)}
                                      </div>
                                      <div>
                                        <strong>Days Published:</strong>{" "}
                                        {quotation.daysPublished} days
                                      </div>
                                    </div>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Rank</TableHead>
                                          <TableHead>Bidder Name</TableHead>
                                          <TableHead>Bidder Type</TableHead>
                                          <TableHead>Bid Amount</TableHead>
                                          <TableHead>
                                            Difference from Estimate
                                          </TableHead>
                                          <TableHead>Percentage</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {quotation.bids.map((bid) => {
                                          const difference =
                                            bid.amount -
                                            quotation.estimatedAmount;
                                          const percentage =
                                            (difference /
                                              quotation.estimatedAmount) *
                                            100;
                                          return (
                                            <TableRow key={bid.id}>
                                              <TableCell>
                                                <Badge
                                                  variant={
                                                    bid.rank === 1
                                                      ? "default"
                                                      : "secondary"
                                                  }
                                                  className={
                                                    bid.rank === 1
                                                      ? "bg-green-100 text-green-800"
                                                      : ""
                                                  }
                                                >
                                                  #{bid.rank}
                                                </Badge>
                                              </TableCell>
                                              <TableCell className="font-medium">
                                                {bid.agencyDetails.name}
                                              </TableCell>
                                              <TableCell>
                                                <Badge variant="outline">
                                                  {bid.agencyDetails.agencyType}
                                                </Badge>
                                              </TableCell>
                                              <TableCell className="font-medium">
                                                {formatCurrency(bid.amount)}
                                              </TableCell>
                                              <TableCell
                                                className={
                                                  difference < 0
                                                    ? "text-green-600 font-medium"
                                                    : "text-red-600 font-medium"
                                                }
                                              >
                                                {difference < 0 ? "-" : "+"}
                                                {formatCurrency(
                                                  Math.abs(difference)
                                                )}
                                              </TableCell>
                                              <TableCell
                                                className={
                                                  percentage < 0
                                                    ? "text-green-600 font-medium"
                                                    : "text-red-600 font-medium"
                                                }
                                              >
                                                {percentage > 0 ? "+" : ""}
                                                {percentage.toFixed(2)}%
                                              </TableCell>
                                            </TableRow>
                                          );
                                        })}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm">
                                    <Plus className="h-4 w-4 mr-1" />
                                    Create
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      Create Comparative Statement
                                    </DialogTitle>
                                    <DialogDescription>
                                      Create comparative statement for{" "}
                                      {quotation.nitNo} - {quotation.workName}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="bg-muted/50 p-3 rounded-lg text-sm">
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <strong>Published:</strong>{" "}
                                          {quotation.publishedAt
                                            ? formatDate(quotation.publishedAt)
                                            : "N/A"}
                                        </div>
                                        <div>
                                          <strong>Days Published:</strong>{" "}
                                          {quotation.daysPublished} days
                                        </div>
                                        <div>
                                          <strong>Total Bids:</strong>{" "}
                                          {quotation.bids.length}
                                        </div>
                                        <div>
                                          <strong>Lowest Bid:</strong>{" "}
                                          {formatCurrency(quotation.lowestBid)}
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <Label htmlFor="remarks">
                                        Remarks (Optional)
                                      </Label>
                                      <Textarea
                                        id="remarks"
                                        placeholder="Enter any remarks or notes about this comparative statement..."
                                        value={remarks}
                                        onChange={(e) =>
                                          setRemarks(e.target.value)
                                        }
                                      />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <DialogTrigger asChild>
                                        <Button variant="outline">
                                          Cancel
                                        </Button>
                                      </DialogTrigger>
                                      <Button
                                        onClick={() =>
                                          handleCreateComparative(quotation.id)
                                        }
                                        disabled={isCreating}
                                      >
                                        {isCreating
                                          ? "Creating..."
                                          : "Create Statement"}
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExport(quotation.id)}
                              disabled={isExporting}
                            >
                              <FileSpreadsheet className="h-4 w-4 mr-1" />
                              CSV
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGeneratePDF(quotation.id)}
                              disabled={isGeneratingPDF}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                          </>
                        ) : (
                          <div className="flex gap-2">
                            <AddBidsDialog
                              quotation={{
                                id: quotation.id,
                                nitNo: quotation.nitNo,
                                workName: quotation.workName,
                                estimatedAmount: quotation.estimatedAmount,
                              }}
                              onBidsAdded={() => window.location.reload()}
                            />
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/quotations/view/${quotation.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">
                  {totalQuotations}
                </div>
                <p className="text-sm text-muted-foreground">
                  Published Quotations
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">
                  {quotationsWithBids.length}
                </div>
                <p className="text-sm text-muted-foreground">With Bids</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-yellow-600">
                  {quotationsWithoutBids.length}
                </div>
                <p className="text-sm text-muted-foreground">Without Bids</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-purple-600">
                  {completedStatements}
                </div>
                <p className="text-sm text-muted-foreground">
                  Completed Statements
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-orange-600">
                  {totalBids}
                </div>
                <p className="text-sm text-muted-foreground">Total Bids</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
