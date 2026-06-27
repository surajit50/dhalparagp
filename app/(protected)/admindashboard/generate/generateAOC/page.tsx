import { DataTable } from "@/components/data-table";
import React from "react";
import { columns } from "./columns";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, ChevronRight, FileCheck2 } from "lucide-react";

const Page = async () => {
  const data = await db.aOC.findMany({
    include: {
      WorksDetail: {
        include: {
          ApprovedActionPlanDetails: true,
          nitDetails: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Page Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-12 sm:px-12 rounded-b-[40px] shadow-2xl">
        <div className="absolute -top-32 -right-32 h-96 w-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 container mx-auto space-y-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-violet-400">Award of Contract Records</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-violet-500/20 ring-1 ring-violet-500/40 text-violet-400">
                  <Award className="h-7 w-7" />
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight">
                  Award of Contract
                </h1>
              </div>
              <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
                View and manage all awarded contracts across works. Track AOC records and associated work details.
              </p>
            </div>
            <Badge
              variant="secondary"
              className="text-base px-4 py-2 bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-2xl"
            >
              <FileCheck2 className="w-4 h-4 mr-2" />
              {data.length} Record{data.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-8 py-10">
        <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-5 px-6">
            <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Award className="w-5 h-5 text-violet-500" />
              AOC Records
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable columns={columns} data={data} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;
