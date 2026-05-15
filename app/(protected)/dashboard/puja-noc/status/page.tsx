import { getUserPujaNOCs } from "@/action/puja-noc-actions";
import { currentUser } from "@/lib/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { FileText, Clock, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PujaNocStatusPage = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const result = await getUserPujaNOCs(user.id!);
  const applications = result.success ? result.data : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100"><Clock className="w-3 h-3 mr-1" /> Submitted</Badge>;
      case "APPROVED":
        return <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
      case "REJECTED":
        return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Application Status</h1>
          <p className="text-muted-foreground">Track your Puja NOC applications</p>
        </div>
        <Link href="/dashboard/puja-noc/apply">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <FileText className="w-4 h-4 mr-2" />
            New Application
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {applications && applications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application No</TableHead>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ref No / Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.applicationNo}</TableCell>
                    <TableCell>{app.eventName}</TableCell>
                    <TableCell>{format(new Date(app.startDate), "dd MMM yyyy")}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>
                      {app.status === "APPROVED" ? (
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {app.refNo || "Pending Assignment"}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">
                          {app.remarks || "No remarks yet"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 space-y-3">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No applications found.</p>
              <Link href="/dashboard/puja-noc/apply">
                <Button variant="outline">Submit your first application</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PujaNocStatusPage;
