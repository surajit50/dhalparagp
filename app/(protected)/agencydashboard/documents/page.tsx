import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getAgencyDashboardData } from "@/lib/agencydata";
import { formatDate } from "@/utils/utils";
import { FileText, Download, Plus } from "lucide-react";
import Link from "next/link";

export default async function MyDocumentsPage() {
  const agencyData = await getAgencyDashboardData();

  // We can show technical evaluation documents, order documents, etc.
  const technicalEvals =
    agencyData?.Bidagency.flatMap((ba) =>
      ba.technicalEvelution ? [ba.technicalEvelution] : [],
    ) || [];
  const orderDocuments = agencyData?.Order.flatMap((o) => o.documents) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Documents</h1>
        <Button asChild className="gap-2">
          <Link href="/agencydashboard/documents/upload">
            <Plus className="h-4 w-4" />
            Upload New Document
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Technical Evaluation Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {technicalEvals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      No technical evaluation documents found.
                    </TableCell>
                  </TableRow>
                ) : (
                  technicalEvals.map((te) => (
                    <TableRow key={te.id}>
                      <TableCell>Technical Evaluation File</TableCell>
                      <TableCell>
                        {te.qualify ? "Qualified" : "Pending/Not Qualified"}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderDocuments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      No order documents found.
                    </TableCell>
                  </TableRow>
                ) : (
                  orderDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{doc.fileUrl}</TableCell>
                      <TableCell>{formatDate(doc.createdAt)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
