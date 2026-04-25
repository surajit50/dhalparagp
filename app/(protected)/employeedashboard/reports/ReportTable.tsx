"use client";

import type React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { workdetailsreporttype } from "@/types/worksdetails";
import { formatCurrency, formatDate } from "@/utils/utils";
import { FileText, Building2, CheckCircle, IndianRupee, AlertCircle } from "lucide-react";

type ReportTableProps = {
  data: workdetailsreporttype[];
  isLoading: boolean;
};

export default function ReportTable({ data, isLoading }: ReportTableProps) {
  if (isLoading) return <ReportSkeleton />;

  // Calculate financial metrics
  const totalWorks = data.length;
  const completedWorks = data.filter(row => row.completionDate).length;
  const totalWorkOrderValue = data.reduce((sum, row) => 
    sum + (row.AwardofContract?.workorderdetails[0]?.Bidagency?.biddingAmount || 0), 0);
  const totalBillValue = data.reduce((sum, row) => 
    sum + row.paymentDetails.reduce((total, item) => total + (item.grossBillAmount || 0), 0), 0);
  const completionPercentage = totalWorks ? (completedWorks / totalWorks) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-lg">
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Project Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<IndianRupee className="h-5 w-5 text-blue-600" />}
              title="Total Work Order Value"
              value={formatCurrency(totalWorkOrderValue)}
              currency
            />
            <StatCard
              icon={<IndianRupee className="h-5 w-5 text-green-600" />}
              title="Total Bill Value"
              value={formatCurrency(totalBillValue)}
              currency
            />
            <StatCard
              icon={<CheckCircle className="h-5 w-5 text-purple-600" />}
              title="Completion Progress"
              value={`${completionPercentage.toFixed(1)}%`}
              progress={<Progress value={completionPercentage} className="h-2 mt-2" />}
            />
            <StatCard
              icon={<Building2 className="h-5 w-5 text-orange-600" />}
              title="Works Status"
              value={`${completedWorks}/${totalWorks}`}
              subtitle="Completed/Total Works"
            />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Report Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-lg">
          <CardTitle className="text-white">Detailed Work Report</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[1200px]">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[50px] px-6">#</TableHead>
                  <TableHead className="px-6">NIT Details</TableHead>
                  <TableHead className="px-6">Work Details</TableHead>
                  <TableHead className="px-6">Agency</TableHead>
                  <TableHead className="px-6">Work Order</TableHead>
                  <TableHead className="px-6 text-right">Order Value</TableHead>
                  <TableHead className="px-6 text-right">Billed Amount</TableHead>
                  <TableHead className="px-6">Progress</TableHead>
                  <TableHead className="px-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, i) => {
                  const workOrderValue = row.AwardofContract?.workorderdetails[0]?.Bidagency?.biddingAmount || 0;
                  const billedAmount = row.paymentDetails.reduce((total, item) => total + (item.grossBillAmount || 0), 0);
                  const billingProgress = workOrderValue ? (billedAmount / workOrderValue) * 100 : 0;

                  return (
                    <TableRow key={row.id} className="hover:bg-muted/25">
                      <TableCell className="px-6 font-medium">{i + 1}</TableCell>
                      
                      <TableCell className="px-6">
                        <div className="flex flex-col">
                          <span className="font-medium">{row.nitDetails.memoNumber}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(row.nitDetails.memoDate)}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="px-6">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {row.ApprovedActionPlanDetails.activityCode}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {row.ApprovedActionPlanDetails.activityDescription}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="px-6">
                        {row.AwardofContract?.workodermenonumber || '-'}
                      </TableCell>

                      <TableCell className="px-6">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {row.AwardofContract?.workordeermemodate ? 
                            formatDate(row.AwardofContract.workordeermemodate) : 'N/A'}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="px-6 text-right font-semibold text-green-700">
                        {formatCurrency(workOrderValue)}
                      </TableCell>

                      <TableCell className="px-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-semibold text-blue-700">
                            {formatCurrency(billedAmount)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({billingProgress.toFixed(1)}%)
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="px-6">
                        <Progress 
                          value={billingProgress} 
                          className="h-2"
                          
                        />
                      </TableCell>

                      <TableCell className="px-6">
                        <StatusBadge 
                          isCompleted={!!row.completionDate} 
                          date={row.completionDate}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  currency,
  progress
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  currency?: boolean;
  progress?: React.ReactNode;
}) {
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
            <span className="text-sm font-medium">{title}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${currency ? 'text-green-700' : ''}`}>
              {value}
            </span>
            {subtitle && <span className="text-sm text-muted-foreground">{subtitle}</span>}
          </div>
        </div>
      </div>
      {progress && <div className="mt-3">{progress}</div>}
    </div>
  );
}

function StatusBadge({ isCompleted, date }: { isCompleted: boolean; date?: Date | null }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm"
         style={{ 
           backgroundColor: isCompleted ? '#e6f4ea' : '#e8f4ff',
           color: isCompleted ? '#0a5c36' : '#1a4480'
         }}>
      {isCompleted ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <span>
        {isCompleted ? 
          `Completed ${date ? formatDate(date) : ''}` : 
          'In Progress'}
      </span>
    </div>
  );
}

function ReportSkeleton() {
  // Updated skeleton to match new layout
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <div className="h-16 bg-muted/50 rounded-t-lg" />
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-0 shadow-lg">
        <div className="h-16 bg-muted/50 rounded-t-lg" />
        <CardContent className="p-0">
          <div className="h-[500px] bg-muted animate-pulse" />
        </CardContent>
      </Card>
    </div>
  );
}
