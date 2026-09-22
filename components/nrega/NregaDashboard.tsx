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
  Database,
  Settings,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import {
  WORK_STATUS_COLORS,
  WORK_STATUS_ICONS,
  calculateCertificateProgress,
} from "@/lib/utils/nrega";


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

export default function NregaDashboard({ stats, recentWorks }: DashboardProps) {
  const completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100
    ) : 0;

  const statCards = [
    { label: "Total Works", value: stats.total, icon: FolderOpen, color: "text-blue-600", bg: "bg-gradient-to-br from-blue-50 to-blue-100/50", ring: "ring-blue-200/50" },
    { label: "Draft", value: stats.draft, icon: FileText, color: "text-slate-600", bg: "bg-gradient-to-br from-slate-50 to-slate-100/50", ring: "ring-slate-200/50" },
    { label: "Approved", value: stats.approved, icon: CheckCircle, color: "text-indigo-600", bg: "bg-gradient-to-br from-indigo-50 to-indigo-100/50", ring: "ring-indigo-200/50" },
    { label: "Ongoing", value: stats.ongoing, icon: Hammer, color: "text-amber-600", bg: "bg-gradient-to-br from-amber-50 to-amber-100/50", ring: "ring-amber-200/50" },
    { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-green-600", bg: "bg-gradient-to-br from-green-50 to-green-100/50", ring: "ring-green-200/50" },
    { label: "Certs Generated", value: stats.certificatesGenerated, icon: FileText, color: "text-emerald-600", bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50", ring: "ring-emerald-200/50" },
    { label: "Certs Pending", value: stats.certificatesPending, icon: AlertCircle, color: "text-rose-600", bg: "bg-gradient-to-br from-rose-50 to-rose-100/50", ring: "ring-rose-200/50" },
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
          <Card
            key={card.label}
            className={cn(
              "hover:shadow-md transition-all hover:-translate-y-0.5 duration-200 ring-1 ring-transparent hover:shadow-lg/40",
              card.ring
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className={cn("inline-flex items-center justify-center p-2 rounded-lg ring-1", card.bg, card.ring)">
                  <card.icon className={cn("h-5 w-5", card.color)} />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight tabular-nums">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completion Progress Summary */}
      {stats.total > 0 && (
        <Card className="bg-gradient-to-r from-muted/40 via-background to-muted/40">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Overall Completion</p>
                  <p className="text-xs text-muted-foreground">
                    {stats.completed} of {stats.total} works completed
                  </p>
                </div>
              </div>
              <div className="flex-1 sm:max-w-md space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Progress</span>
                  <span>{completionRate}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(completionRate, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/employeedashboard/nrega/works" className="group">
          <Card className="h-full hover:shadow-md transition-all cursor-pointer hover:border-primary/50 hover:-translate-y-0.5 duration-200">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <span className="font-semibold text-sm">All Works</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/employeedashboard/nrega/works/new" className="group">
          <Card className="h-full hover:shadow-md transition-all cursor-pointer hover:border-green-500/50 hover:-translate-y-0.5 duration-200 ring-1 ring-green-200/50">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50 text-green-600 group-hover:bg-green-100 transition-colors">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="font-semibold text-sm">New Work</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/employeedashboard/nrega/master-data" className="group">
          <Card className="h-full hover:shadow-md transition-all cursor-pointer hover:border-primary/50 hover:-translate-y-0.5 duration-200">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                  <Database className="h-5 w-5" />
                </div>
                <span className="font-semibold text-sm">Master Data</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/employeedashboard/nrega/settings" className="group">
          <Card className="h-full hover:shadow-md transition-all cursor-pointer hover:border-primary/50 hover:-translate-y-0.5 duration-200">
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                  <Settings className="h-5 w-5" />
                </div>
                <span className="font-semibold text-sm">Settings</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Works Table */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Recent Works
          </CardTitle>
          {recentWorks.length > 0 && (
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/employeedashboard/nrega/works">
                View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {recentWorks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="mx-auto mb-4 p-4 bg-muted/40 rounded-full w-fit">
                <FolderOpen className="h-10 w-10 opacity-40" />
              </div>
              <p className="font-semibold text-foreground mb-1">No works created yet.</p>
              <p className="text-sm mb-4">Get started by creating your first MGNREGA work entry.</p>
              <Link href="/employeedashboard/nrega/works/new">
                <Button className="gap-2" size="sm">
                  <Plus className="h-4 w-4" />
                  Create First Work
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Work ID</th>
                    <th className="py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Work Name</th>
                    <th className="py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">FY</th>
                    <th className="py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">GP</th>
                    <th className="py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide text-right">Est. Cost</th>
                    <th className="py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Status</th>
                    <th className="py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide text-center">Certs</th>
                    <th className="py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentWorks.map((work) => {
                    const certProgress = calculateCertificateProgress(work.certificates);
                    const statusColor = WORK_STATUS_COLORS[work.workStatus] || "";
                    const StatusIcon = WORK_STATUS_ICONS[work.workStatus];

                    return (
                      <tr key={work.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3">
                          <span className="font-mono text-xs font-medium">{work.workId}</span>
                        </td>
                        <td className="py-3">
                          <div className="max-w-[220px] truncate font-medium">{work.workName}</div>
                        </td>
                        <td className="py-3 text-sm">{work.financialYear}</td>
                        <td className="py-3 text-sm">{work.gramPanchayat}</td>
                        <td className="py-3 text-right font-semibold tabular-nums">
                          {formatCurrency(work.estimatedCost)}
                        </td>
                        <td className="py-3">
                          <Badge
                            variant="secondary"
                            className={cn("text-xs font-medium", statusColor)}
                          >
                            <span className="flex items-center gap-1">
                              {StatusIcon && <StatusIcon className="h-3 w-3" />}
                              {work.workStatus.charAt(0) + work.workStatus.slice(1).toLowerCase()}
                            </span>
                          </Badge>
                        </td>
                        <td className="py-3 text-center">
                          {certProgress.applicable > 0 ? (
                            <Badge variant={certProgress.progress === 100 ? "default" : "outline"} className="text-[11px] font-semibold">
                              {certProgress.completed}/{certProgress.applicable}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="flex justify-end gap-1.5">
                            <Link href={`/employeedashboard/nrega/works/${work.id}`}>
                              <Button variant="outline" size="sm" className="text-xs h-7">
                                View
                              </Button>
                            </Link>
                            <Link href={`/employeedashboard/nrega/works/${work.id}/certificates`}>
                              <Button variant="outline" size="sm" className="text-xs h-7">
                                Certs
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
