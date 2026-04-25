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
import { ArrowLeft, Upload, Download, Eye, Users } from "lucide-react";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils/date";
import { QuoatationPrint } from "@/components/PrintTemplet/quoatation-print";

// Mock data for published quotations

export default async function PublishedQuotationsPage() {
  const publishedQuotations = await db.quotation.findMany({
    include: {
      bids: {
        include: {
          agencyDetails: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-muted/40 py-8">
      <div className="container mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Upload className="h-6 w-6" />
              Published Quotations
            </CardTitle>
            <CardDescription>
              Manage all published quotation notices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">
                    {
                      publishedQuotations.filter((q) => q.status == "PUBLISHED")
                        .length
                    }
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Active Quotations
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600"></div>
                  <p className="text-sm text-muted-foreground">Total Bidders</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-purple-600">
                    {
                      publishedQuotations.filter((q) => q.status === "CLOSED")
                        .length
                    }
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Closed Quotations
                  </p>
                </CardContent>
              </Card>
            </div>

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
                      <TableCell>{quotation.workName}</TableCell>
                      <TableCell>
                        ₹{quotation.estimatedAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {formatDate(quotation.submissionDate)}
                      </TableCell>
                      <TableCell>
                        {formatDate(quotation.submissionDate)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                        </div>
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                            <QuoatationPrint quotation={quotation} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
