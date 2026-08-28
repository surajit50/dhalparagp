"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  FileText,
  Plus,
  FolderOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  Hammer,
} from "lucide-react";

interface DashboardProps {
  stats: {
    total: number;
    draft: number;
    approved: number;
    ongoing: number;
    completed: number;
    certificatesGenerated: number;
    certificatesPending: number;
  };
  recentWorks: Array<{
    id: string;
    workId: string;
    workName: string;
    financialYear: string;
    gramPanchayat: string;
    estimatedCost: number;
    workStatus: string;
    certificates: Array<{ status: string }>;
  }>;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  APPROVED: "bg-blue-100 text-blue-800",
  ONGOING: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-green-100 text-green-800",
};

const statusIcons: Record<string, React.ReactNode> = {
  DRAFT: <FileText className="h-4 w-4" />,
  APPROVED: <CheckCircle className="h-4 w-4" />,
  ONGOING: <Hammer className="h-4 w-4" />,
  COMPLETED: <CheckCircle className="h-4 w-4" />,
};

export default function NregaDashboard({ stats, recentWorks }: DashboardProps) {
  const statCards = [
    { label: "Total Works", value: stats.total, icon: FolderOpen, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Draft", value: stats.draft, icon: FileText, color: "text-gray-600", bg: "bg-gray-50" },
    { label: "Approved", value: stats.approved, icon: CheckCircle, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Ongoing", value: stats.ongoing, icon: Hammer, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Certificates Generated", value: stats.certificatesGenerated, icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Certificates Pending", value: stats.certificatesPending, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            MGNREGA / VB-GRAMG Work System
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Work Management and Certificate Generation
          </p>
        </div>
        <Link href="/employeedashboard/nrega/works/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Work
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {statCards.map((card) => (
          <Card key={card.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className={`inline-flex items-center justify-center p-2 rounded-lg ${card.bg} mb-2`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/employeedashboard/nrega/works">
          <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50">
            <CardContent className="p-4 flex items-center gap-3">
              <FolderOpen className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-sm">All Works</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/employeedashboard/nrega/works/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50">
            <CardContent className="p-4 flex items-center gap-3">
              <Plus className="h-5 w-5 text-green-600" />
              <span className="font-medium text-sm">New Work</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/employeedashboard/nrega/master-data">
          <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <span className="font-medium text-sm">Master Data</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/employeedashboard/nrega/settings">
          <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary/50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-sm">Settings</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Works Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Works</CardTitle>
        </CardHeader>
        <CardContent>
          {recentWorks.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No works created yet.</p>
              <Link href="/employeedashboard/nrega/works/new">
                <Button variant="outline" className="mt-3 gap-2" size="sm">
                  <Plus className="h-4 w-4" />
                  Create First Work
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-semibold">Work ID</th>
                    <th className="pb-2 font-semibold">Work Name</th>
                    <th className="pb-2 font-semibold">FY</th>
                    <th className="pb-2 font-semibold">GP</th>
                    <th className="pb-2 font-semibold text-right">Est. Cost</th>
                    <th className="pb-2 font-semibold">Status</th>
                    <th className="pb-2 font-semibold">Certificates</th>
                    <th className="pb-2 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentWorks.map((work) => {
                    const certsDone = work.certificates.filter(
                      (c) => c.status === "COMPLETED" || c.status === "PRINTED"
                    ).length;
                    const certsTotal = work.certificates.length;

                    return (
                      <tr key={work.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-2.5 font-mono text-xs">{work.workId}</td>
                        <td className="py-2.5 max-w-[200px] truncate">{work.workName}</td>
                        <td className="py-2.5">{work.financialYear}</td>
                        <td className="py-2.5">{work.gramPanchayat}</td>
                        <td className="py-2.5 text-right font-medium">
                          ₹{work.estimatedCost.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${statusColors[work.workStatus] || ""}`}
                          >
                            <span className="flex items-center gap-1">
                              {statusIcons[work.workStatus]}
                              {work.workStatus}
                            </span>
                          </Badge>
                        </td>
                        <td className="py-2.5">
                          <span className="text-xs">
                            {certsTotal > 0 ? `${certsDone}/${certsTotal}` : "—"}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <div className="flex gap-1">
                            <Link href={`/employeedashboard/nrega/works/${work.id}`}>
                              <Button variant="outline" size="sm" className="text-xs h-7">
                                View
                              </Button>
                            </Link>
                            <Link href={`/employeedashboard/nrega/works/${work.id}/certificates`}>
                              <Button variant="outline" size="sm" className="text-xs h-7">
                                Certificates
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
