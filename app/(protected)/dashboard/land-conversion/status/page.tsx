import { getUserLandConversionApplications } from "@/action/land-conversion-actions";
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
import {
  Trees,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const LandConversionStatusPage = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const result = await getUserLandConversionApplications(user.id!);
  const applications = result.success ? result.data : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return (
          <Badge
            variant="secondary"
            className="bg-gray-100 text-gray-700 hover:bg-gray-100"
          >
            <FileText className="w-3 h-3 mr-1" /> Draft
          </Badge>
        );
      case "SUBMITTED":
        return (
          <Badge
            variant="secondary"
            className="bg-orange-100 text-orange-700 hover:bg-orange-100"
          >
            <Clock className="w-3 h-3 mr-1" /> Submitted
          </Badge>
        );
      case "VERIFICATION_PENDING":
        return (
          <Badge
            variant="secondary"
            className="bg-orange-50 text-orange-700 hover:bg-orange-50"
          >
            <Clock className="w-3 h-3 mr-1" /> Verification Pending
          </Badge>
        );
      case "VERIFIED":
        return (
          <Badge
            variant="secondary"
            className="bg-orange-100 text-orange-700 hover:bg-orange-100"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
          </Badge>
        );
      case "VERIFICATION_REJECTED":
        return (
          <Badge
            variant="destructive"
            className="bg-red-50 text-red-700 hover:bg-red-50"
          >
            <XCircle className="w-3 h-3 mr-1" /> Documents Rejected
          </Badge>
        );
      case "INSPECTION_PENDING":
        return (
          <Badge
            variant="secondary"
            className="bg-amber-50 text-amber-700 hover:bg-amber-50"
          >
            <Clock className="w-3 h-3 mr-1" /> Inspection Scheduled
          </Badge>
        );
      case "INSPECTION_COMPLETED":
        return (
          <Badge
            variant="secondary"
            className="bg-amber-100 text-amber-700 hover:bg-amber-100"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" /> Inspection Done
          </Badge>
        );
      case "INSPECTION_REJECTED":
        return (
          <Badge
            variant="destructive"
            className="bg-red-50 text-red-700 hover:bg-red-50"
          >
            <XCircle className="w-3 h-3 mr-1" /> Inspection Rejected
          </Badge>
        );
      case "APPROVAL_PENDING":
        return (
          <Badge
            variant="secondary"
            className="bg-purple-50 text-purple-700 hover:bg-purple-50"
          >
            <Clock className="w-3 h-3 mr-1" /> Approval Pending
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-700 hover:bg-green-100"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="destructive"
            className="bg-red-100 text-red-700 hover:bg-red-100"
          >
            <XCircle className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        );
      case "ISSUED":
        return (
          <Badge
            variant="default"
            className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" /> Certificate Issued
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="destructive"
            className="bg-gray-100 text-gray-700 hover:bg-gray-100"
          >
            <XCircle className="w-3 h-3 mr-1" /> Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Land Conversion Status
          </h1>
          <p className="text-muted-foreground">
            Track your Land Conversion NOC applications
          </p>
        </div>
        <Link href="/dashboard/land-conversion/apply">
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Trees className="w-4 h-4 mr-2" />
            New Application
          </Button>
        </Link>
      </div>

      <Card shadow-md>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>My Applications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {applications && applications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-semibold text-slate-700">
                    Application No
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Mouza / Plot
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Applied On
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow
                    key={app.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <TableCell className="font-medium text-orange-700">
                      {app.applicationNo}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{app.mouza}</div>
                      <div className="text-xs text-slate-500">
                        Plot: {app.plotNo}, JL: {app.jlNo}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {format(new Date(app.createdAt), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell className="text-right"></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16 space-y-4">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Trees className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-slate-700">
                  No applications found
                </p>
                <p className="text-sm text-slate-500">
                  You haven't submitted any land conversion applications yet.
                </p>
              </div>
              <Link href="/dashboard/land-conversion/apply">
                <Button variant="outline" className="mt-2">
                  Submit your first application
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LandConversionStatusPage;
