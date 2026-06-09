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
import { ArrowLeft, Upload, Eye, Users } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils/date";
import { QuoatationPrint } from "@/components/PrintTemplet/quoatation-print";

export default async function PublishedQuotationsPage() {
  const publishedQuotations = await db.quotation.findMany({
    where: {
      status: {
        in: ["PUBLISHED", "CLOSED"],
      },
    },
    include: {
      bids: {
        include: {
          agencyDetails: true,
        },
      },
    },
  });

  const totalBidders = publishedQuotations.reduce(
    (sum, q) => sum + (q.bids?.length || 0),
    0
  );

  const stats = {
    active: publishedQuotations.filter((q) => q.status === "PUBLISHED").length,
    totalBidders,
    closed: publishedQuotations.filter((q) => q.status === "CLOSED").length,
  };

  return (
    <div className="min-h-screen bg-muted/40 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admindashboard/manage-qatation">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Upload className="h-6 w-6 text-primary" />
              Published Quotations
            </CardTitle>
            <CardDescription>
              Manage all published and closed quotation notices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.active}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Active Quotations
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.totalBidders}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Bidders</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.closed}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Closed Quotations
                  </p>
                </CardContent>
              </Card>
            </div>

            {publishedQuotations.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NIT/NIQ No.</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Work/Item Name</TableHead>
                      <TableHead>Estimated Amount</TableHead>
                      <TableHead>Published Date</TableHead>
                      <TableHead>Submission Date</TableHead>
                      <TableHead>Bidders</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {publishedQuotations.map((quotation) => (
                      <TableRow key={quotation.id}>
                      <TableCell className="font-medium">
                        {quotation.nitNo}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            quotation.quotationType === "WORK"
                              ? "bg-orange-100 text-orange-800 hover:bg-orange-100"
                              : quotation.quotationType === "SUPPLY"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-purple-100 text-purple-800 hover:bg-purple-100"
                          }
                        >
                          {quotation.quotationType === "WORK"
                            ? "Work"
                            : quotation.quotationType === "SUPPLY"
                            ? "Supply"
                            : "Sale"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {quotation.workName}
                      </TableCell>
                      <TableCell>
                        ₹{quotation.estimatedAmount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        {quotation.publishedAt
                          ? formatDate(quotation.publishedAt)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {formatDate(quotation.submissionDate)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{quotation.bids?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            quotation.status === "PUBLISHED"
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-800 hover:bg-slate-100"
                          }
                        >
                          {quotation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link
                              href={`/admindashboard/manage-qatation/view/${quotation.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <div className="[&>div]:p-0">
                            <QuoatationPrint quotation={quotation} />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No Published Quotations
                </h3>
                <p className="text-muted-foreground mb-4">
                  There are no published or closed quotations available yet.
                </p>
                <Button asChild>
                  <Link href="/admindashboard/manage-qatation/publish">
                    Go to Publish Drafts
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
