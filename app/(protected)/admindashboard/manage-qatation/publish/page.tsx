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
  ArrowLeft,
  Upload,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  Calendar,
  IndianRupee,
} from "lucide-react";
import { getQuotations } from "@/lib/actions/quotations";
import { formatDate, formatCurrency } from "@/lib/utils/date";
import { PublishQuotationClient } from "./publish-client";
import { QuoatationPrint } from "@/components/PrintTemplet/quoatation-print";

export default async function PublishQuotationPage() {
  const result = await getQuotations({ status: "DRAFT" });
  const draftQuotations = result.success ? result.data : [];

  const stats = {
    total: draftQuotations?.length || 0,
    readyToPublish:
      draftQuotations?.filter(
        (q) =>
          Boolean(q.nitNo) &&
          Boolean(q.workName) &&
          Boolean(q.estimatedAmount) &&
          Boolean(q.submissionDate) &&
          Boolean(q.openingDate)
      ).length || 0,
    needsReview:
      draftQuotations?.filter(
        (q) =>
          !Boolean(q.nitNo) ||
          !Boolean(q.workName) ||
          !Boolean(q.estimatedAmount) ||
          !Boolean(q.submissionDate) ||
          !Boolean(q.openingDate)
      ).length || 0,
  };

  return (
    <div className="min-h-screen bg-muted/40 py-8">
      <div className="container mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Upload className="h-6 w-6" />
              Publish Quotations
            </CardTitle>
            <CardDescription>
              Review and publish draft quotations. Verify all details before
              publishing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.total}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total Draft Quotations
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.readyToPublish}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ready to Publish
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.needsReview}
                  </div>
                  <p className="text-sm text-muted-foreground">Needs Review</p>
                </CardContent>
              </Card>
            </div>

            {draftQuotations && draftQuotations.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NIT/NIQ No.</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Work/Item Name</TableHead>
                      <TableHead>Estimated Amount</TableHead>
                      <TableHead>Submission Date</TableHead>
                      <TableHead>Opening Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {draftQuotations.map((quotation) => {
                      const isComplete = Boolean(
                        quotation.nitNo &&
                          quotation.workName &&
                          quotation.estimatedAmount &&
                          quotation.submissionDate &&
                          quotation.openingDate
                      );

                      const missingFields = [];
                      if (!quotation.nitNo) missingFields.push("NIT No.");
                      if (!quotation.workName) missingFields.push("Work Name");
                      if (!quotation.estimatedAmount)
                        missingFields.push("Estimated Amount");
                      if (!quotation.submissionDate)
                        missingFields.push("Submission Date");
                      if (!quotation.openingDate)
                        missingFields.push("Opening Date");

                      return (
                        <TableRow key={quotation.id}>
                          <TableCell className="font-medium">
                            {quotation.nitNo || (
                              <span className="text-red-500 text-sm">
                                Not Set
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                quotation.quotationType === "WORK"
                                  ? "bg-blue-100 text-blue-800"
                                  : quotation.quotationType === "SUPPLY"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-orange-100 text-orange-800"
                              }
                            >
                              {quotation.quotationType === "WORK"
                                ? "Work"
                                : quotation.quotationType === "SUPPLY"
                                ? "Supply"
                                : "Sale"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {quotation.workName || (
                              <span className="text-red-500 text-sm">
                                Not Set
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {quotation.estimatedAmount ? (
                              <div className="flex items-center gap-1">
                                <IndianRupee className="h-3 w-3" />
                                {formatCurrency(quotation.estimatedAmount)}
                              </div>
                            ) : (
                              <span className="text-red-500 text-sm">
                                Not Set
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {quotation.submissionDate ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(quotation.submissionDate)}
                              </div>
                            ) : (
                              <span className="text-red-500 text-sm">
                                Not Set
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {quotation.openingDate ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(quotation.openingDate)}
                              </div>
                            ) : (
                              <span className="text-red-500 text-sm">
                                Not Set
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {isComplete ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Ready
                              </Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Incomplete
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" asChild>
                                <Link
                                  href={`/admindashboard/manage-qatation/view/${quotation.id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                              <Button size="sm" variant="outline" asChild>
                                <Link
                                  href={`/admindashboard/manage-qatation/modify?id=${quotation.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </Button>
                              <PublishQuotationClient
                                quotationId={quotation.id}
                                isComplete={isComplete}
                                missingFields={missingFields}
                              />
                            </div>
                            <QuoatationPrint quotation={quotation} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Draft Quotations
                </h3>
                <p className="text-muted-foreground mb-4">
                  There are no draft quotations available to publish.
                </p>
                <Button asChild>
                  <Link href="/admindashboard/manage-qatation/create">
                    Create New Quotation
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
