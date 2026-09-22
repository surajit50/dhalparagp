"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileText, Eye, Edit, Copy, FolderOpen } from "lucide-react";
import Link from "next/link";
import { cn, formatCurrency } from "@/lib/utils";
import {
  WORK_STATUS_COLORS,
  WORK_STATUS_ICONS,
  calculateCertificateProgress,
} from "@/lib/utils/nrega";

type WorkWithCertificates = {
  id: string;
  workId: string;
  workName: string;
  financialYear: string;
  gramSansadName: string | null;
  gramPanchayat?: string;
  estimatedCost: number;
  workStatus: string;
  certificates: { status: string }[];
};

interface WorksTableProps {
  works: WorkWithCertificates[];
  onDuplicate?: (id: string) => void;
}

export function WorksTable({ works, onDuplicate }: WorksTableProps) {
  if (works.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-muted/60">
        <div className="mx-auto mb-4 p-4 bg-muted/40 rounded-full w-fit">
          <FolderOpen className="h-10 w-10 opacity-40" />
        </div>
        <p className="text-lg font-semibold text-foreground mb-1">No works found</p>
        <p className="text-sm">Try adjusting filters or create a new work entry.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[130px] font-semibold">Work ID</TableHead>
                <TableHead className="min-w-[240px] font-semibold">Work Details</TableHead>
                <TableHead className="w-[100px] font-semibold">FY</TableHead>
                <TableHead className="w-[150px] font-semibold">Location</TableHead>
                <TableHead className="text-right font-semibold whitespace-nowrap">Est. Cost</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-center font-semibold">Cert Progress</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {works.map((work) => {
                const certProgress = calculateCertificateProgress(work.certificates);
                const statusColor = WORK_STATUS_COLORS[work.workStatus] || "bg-gray-100 text-gray-800";
                const StatusIcon = WORK_STATUS_ICONS[work.workStatus];

                return (
                  <TableRow key={work.id} className="group hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <span className="font-mono text-xs font-medium text-muted-foreground">
                        {work.workId}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="font-medium truncate max-w-[260px] cursor-help">
                              {work.workName}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" align="start" className="max-w-sm p-3">
                            <p className="font-medium mb-1">{work.workName}</p>
                            {work.gramPanchayat && (
                              <p className="text-xs text-muted-foreground">GP: {work.gramPanchayat}</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{work.financialYear}</TableCell>
                    <TableCell>
                      <div className="text-sm space-y-0.5">
                        <div className="font-medium">{work.gramSansadName || work.gramPanchayat || "—"}</div>
                        {work.gramSansadName && work.gramPanchayat && (
                          <div className="text-xs text-muted-foreground">{work.gramPanchayat}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold tabular-nums">
                        {formatCurrency(work.estimatedCost)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn("text-[10px] sm:text-xs font-medium px-2 py-0.5", statusColor)}
                      >
                        <span className="flex items-center gap-1">
                          {StatusIcon && <StatusIcon className="h-3 w-3" />}
                          {work.workStatus.charAt(0) + work.workStatus.slice(1).toLowerCase()}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {certProgress.applicable > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-center gap-1">
                            <Badge
                              variant={certProgress.progress === 100 ? "default" : "outline"}
                              className={cn(
                                "text-[10px] font-semibold h-5",
                                certProgress.progress === 100 && "bg-green-600 hover:bg-green-700"
                              )}
                            >
                              {certProgress.completed}/{certProgress.applicable}
                            </Badge>
                          </div>
                          <div className="w-full max-w-[80px] mx-auto bg-muted rounded-full h-1">
                            <div
                              className={cn(
                                "h-1 rounded-full transition-all",
                                certProgress.progress === 100 ? "bg-green-500" :
                                certProgress.progress > 50 ? "bg-blue-500" : "bg-amber-500"
                              )}
                              style={{ width: `${certProgress.progress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-blue-100 hover:text-blue-700"
                              asChild
                            >
                              <Link href={`/employeedashboard/nrega/works/${work.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">View Details</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-amber-100 hover:text-amber-700"
                              asChild
                            >
                              <Link href={`/employeedashboard/nrega/works/${work.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">Edit Work</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-green-100 hover:text-green-700"
                              asChild
                            >
                              <Link href={`/employeedashboard/nrega/works/${work.id}/certificates`}>
                                <FileText className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">Certificates</TooltipContent>
                        </Tooltip>

                        {onDuplicate && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-purple-100 hover:text-purple-700"
                                onClick={() => onDuplicate(work.id)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Duplicate</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  );
}
