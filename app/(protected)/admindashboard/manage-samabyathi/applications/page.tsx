import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default async function ApplicationsPage() {
  const data = await db.samabyathiApplication.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Samabyathi Applications</h1>
        <Button asChild className="gap-2">
          <Link href="/admindashboard/manage-samabyathi/applications/new">
            <PlusCircle className="h-4 w-4" />
            New Application
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Village</TableHead>
                  <TableHead>Deceased</TableHead>
                  <TableHead>Date of Death</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No applications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.applicantName}</TableCell>
                      <TableCell>{item.villageName}</TableCell>
                      <TableCell>{item.deceasedName}</TableCell>
                      <TableCell>
                        {new Date(item.dateOfDeath).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.status === "APPROVED" || item.status === "PAID" ? "default" : "secondary"}
                          className={item.status === "APPROVED" || item.status === "PAID" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        ₹{item.sanctionAmount || 0}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}