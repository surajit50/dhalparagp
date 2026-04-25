import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { EyeIcon, InfoIcon } from "lucide-react";
import React from "react";
import Link from "next/link";
import { ShowNitDetails } from "@/components/ShowNitDetails";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";

export default async function AddFinancialDetails() {
  const work = await db.worksDetail.findMany({
    where: {
      tenderStatus: "FinancialBidOpening",
    },
    include: {
      ApprovedActionPlanDetails: true,
      nitDetails: true,
      biddingAgencies: {
        where: {
          technicalEvelution: {
            qualify: true,
          },
        },
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
            Financial Bid Opening Process
          </CardTitle>
          <CardDescription className="text-primary-foreground/90 font-medium">
            Manage and monitor financial bid opening activities
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {work.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <InfoIcon className="w-12 h-12 text-muted-foreground" />
            <p className="text-lg text-muted-foreground font-medium">
              No financial bids pending opening
            </p>
            <p className="text-sm text-muted-foreground/80">
              Check back later for updates
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
