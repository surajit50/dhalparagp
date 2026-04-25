import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  FileTextIcon,
  HashIcon,
  BriefcaseIcon,
  Building2,
  FileCheck,
  Clock,
} from "lucide-react";
import { db } from "@/lib/db";
import { gpcode } from "@/constants/gpinfor";
import { TenderStatus } from "@prisma/client";

export const ShowWorkDetails = async ({
  worksDetailId,
}: {
  worksDetailId: string;
}) => {
  const workdetails = await db.worksDetail.findUnique({
    where: { id: worksDetailId },
    include: {
      ApprovedActionPlanDetails: { select: { activityDescription: true } },
      nitDetails: true,
    },
  });

  if (!workdetails) {
    return (
      <Card className="w-full border-dashed border-muted-foreground/30">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <FileCheck className="h-14 w-14 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground text-sm">
            Work details not found
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);

  /* ---------------------------------- */
  /* Tender Status Styling (Type Safe)  */
  /* ---------------------------------- */

  const statusStyles: Record<TenderStatus, string> = {
    publish: "bg-blue-50 text-blue-700 border-blue-200",
    published: "bg-emerald-50 text-emerald-700 border-emerald-200",
    ToBeOpened: "bg-yellow-50 text-yellow-700 border-yellow-200",
    TechnicalBidOpening: "bg-indigo-50 text-indigo-700 border-indigo-200",
    TechnicalEvaluation: "bg-purple-50 text-purple-700 border-purple-200",
    FinancialBidOpening: "bg-cyan-50 text-cyan-700 border-cyan-200",
    FinancialEvaluation: "bg-teal-50 text-teal-700 border-teal-200",
    AOC: "bg-emerald-100 text-emerald-800 border-emerald-300",
    Retender: "bg-orange-50 text-orange-700 border-orange-200",
    Cancelled: "bg-red-50 text-red-700 border-red-200",
  };

  const statusLabels: Record<TenderStatus, string> = {
    publish: "Published",
    published: "Published",
    ToBeOpened: "To Be Opened",
    TechnicalBidOpening: "Technical Bid Opening",
    TechnicalEvaluation: "Technical Evaluation",
    FinancialBidOpening: "Financial Bid Opening",
    FinancialEvaluation: "Financial Evaluation",
    AOC: "Award of Contract",
    Retender: "Re-Tender",
    Cancelled: "Cancelled",
  };

  const statusColor = statusStyles[workdetails.tenderStatus];
  const readableStatus = statusLabels[workdetails.tenderStatus];

  return (
    <Card className="w-full shadow-md border overflow-hidden">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white py-4 px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Work Details
          </CardTitle>

          <Badge className={`border ${statusColor}`}>
            {readableStatus}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Grid Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* NIT Info */}
          <div className="flex gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileTextIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">NIT Number</p>
              <p className="text-sm font-semibold">
                {workdetails.nitDetails
                  ? `${workdetails.nitDetails.memoNumber}/${gpcode}/${workdetails.nitDetails.memoDate.getFullYear()}`
                  : "N/A"}
              </p>
              {workdetails.nitDetails && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <CalendarIcon className="h-3 w-3" />
                  {formatDate(workdetails.nitDetails.memoDate)}
                </div>
              )}
            </div>
          </div>

          {/* Work Serial */}
          <div className="flex gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <HashIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Work Serial</p>
              <p className="text-sm font-semibold">
                {workdetails.workslno}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3" />
                {readableStatus}
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <BriefcaseIcon className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Work Description
            </p>
          </div>

          <div className="bg-muted/40 border rounded-xl p-4 text-sm leading-relaxed">
            {workdetails.ApprovedActionPlanDetails?.activityDescription ||
              "No description available"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
