import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import PrintWarishForm from "@/components/PrintTemplet/printWarishForm";

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Card, CardContent } from "@/components/ui/card";

import {
  FileText,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

import { formatDate } from "@/utils/utils";

const WarishApplicationsPage = async () => {
  const cuser = await currentUser();

  if (!cuser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg font-medium text-gray-600">
          Please log in to view your applications.
        </p>
      </div>
    );
  }

  const warishApplications = await db.warishApplication.findMany({
    where: { userId: cuser.id },
    include: {
      warishDetails: { include: { children: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const transformedApplications = warishApplications.map((application) => ({
    ...application,
    warishDetails: application.warishDetails.map((detail) => ({
      ...detail,
      children: detail.children || [],
    })),
  }));

  const approved = transformedApplications.filter(
    (a) => a.warishApplicationStatus === "approved"
  ).length;

  const rejected = transformedApplications.filter(
    (a) => a.warishApplicationStatus === "rejected"
  ).length;

  const pending = transformedApplications.filter(
    (a) => a.warishApplicationStatus === "submitted"
  ).length;

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Warish Applications
        </h1>
        <p className="text-muted-foreground">
          Track all your submitted applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <FileText className="text-orange-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold">
                {transformedApplications.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <CheckCircle className="text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-xl font-bold">{approved}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <Clock className="text-yellow-600" />
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-xl font-bold">{pending}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <XCircle className="text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-xl font-bold">{rejected}</p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Table */}
      {transformedApplications.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-xl font-medium text-gray-500">
            No applications found
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Submit a new warish application to get started
          </p>
        </Card>
      ) : (
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">

          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Ack Number</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Deceased</TableHead>
                <TableHead>Death Date</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {transformedApplications.map((application) => (
                <TableRow key={application.id} className="hover:bg-muted/50">

                  <TableCell className="font-semibold">
                    {application.acknowlegment}
                  </TableCell>

                  <TableCell>
                    {application.applicantName}
                  </TableCell>

                  <TableCell>
                    {application.nameOfDeceased}
                  </TableCell>

                  <TableCell>
                    {formatDate(application.dateOfDeath)}
                  </TableCell>

                  <TableCell>
                    {formatDate(application.createdAt)}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant={
                        application.warishApplicationStatus === "approved"
                          ? "success"
                          : application.warishApplicationStatus === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                      className="capitalize"
                    >
                      {application.warishApplicationStatus}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right space-x-2">

                    {application.warishApplicationStatus === "submitted" && (
                      <PrintWarishForm warishform={application} />
                    )}

                    {application.warishApplicationStatus === "approved" && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              className="text-green-600"
                            >
                              Collect Certificate
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Visit GP office to collect certificate
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                    {application.warishApplicationStatus === "rejected" && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              className="text-red-600"
                            >
                              View Reason
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {application.adminNoteRemark ||
                              "Incomplete documentation"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}

                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>

        </div>
      )}
    </div>
  );
};

export default WarishApplicationsPage;
