import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";
import { db } from "@/lib/db";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";

export default async function ModifyFinancialBidsPage() {
  const work = await db.worksDetail.findMany({
    where: {
      tenderStatus: "FinancialEvaluation",
    },
    include: {
      ApprovedActionPlanDetails: true,
      nitDetails: true,
      biddingAgencies: {
        include: {
          agencydetails: true,
          technicalEvelution: {
            include: {
              credencial: true,
              validityofdocument: true,
            },
          },
        },
      },
      AwardofContract: true,
    },
  });

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="bg-primary/90 text-primary-foreground px-6 py-5">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Financial Bid Modification
          </CardTitle>
          <CardDescription className="text-primary-foreground/90 font-medium">
            Review and modify submitted financial bids
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {work.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <InfoIcon className="w-12 h-12 text-muted-foreground" />
            <p className="text-lg text-muted-foreground font-medium">
              No tenders available for financial modification
            </p>
            <p className="text-sm text-muted-foreground/80">
              Once bids are submitted, they will appear here for modification
            </p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <DataTable columns={columns} data={work} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

