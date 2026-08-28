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
import { FileText, Eye, Edit } from "lucide-react";
import Link from "next/link";
import { NregaWork } from "@prisma/client"; // assuming we can just use the type or define a partial one

// Define a type for the work based on what the page uses
type WorkWithCertificates = {
  id: string;
  workId: string;
  workName: string;
  financialYear: string;
  gramSansadName: string | null;
  estimatedCost: number;
  workStatus: string;
  certificates: { status: string }[];
};

interface WorksTableProps {
  works: WorkWithCertificates[];
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  APPROVED: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  ONGOING: "bg-amber-100 text-amber-800 hover:bg-amber-200",
  COMPLETED: "bg-green-100 text-green-800 hover:bg-green-200",
};

export function WorksTable({ works }: WorksTableProps) {
  if (works.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-md border border-dashed">
        <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="text-lg font-medium text-foreground">No works found</p>
        <p className="text-sm">Adjust your filters to see more results.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Work ID</TableHead>
              <TableHead className="min-w-[200px]">Work Name</TableHead>
              <TableHead className="w-[100px]">FY</TableHead>
              <TableHead className="w-[140px]">Gram Sansad</TableHead>
              <TableHead className="text-right">Est. Cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Certificates</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {works.map((work) => {
              const certsDone = work.certificates.filter(
                (c) => c.status === "COMPLETED" || c.status === "PRINTED"
              ).length;
              const certsTotal = work.certificates.length;

              return (
                <TableRow key={work.id}>
                  <TableCell className="font-mono text-xs">
                    {work.workId}
                  </TableCell>
                  <TableCell className="max-w-[250px]">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block truncate cursor-help">
                          {work.workName}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" align="start" className="max-w-xs">
                        <p>{work.workName}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{work.financialYear}</TableCell>
                  <TableCell>{work.gramSansadName || "—"}</TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{work.estimatedCost.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] sm:text-xs ${
                        statusColors[work.workStatus] || "bg-gray-100"
                      }`}
                    >
                      {work.workStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {certsTotal > 0 ? (
                      <Badge variant="outline" className="font-medium">
                        {certsDone}/{certsTotal}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                          >
                            <Link href={`/employeedashboard/nrega/works/${work.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View Work</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                          >
                            <Link
                              href={`/employeedashboard/nrega/works/${work.id}/edit`}
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Work</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                          >
                            <Link
                              href={`/employeedashboard/nrega/works/${work.id}/certificates`}
                            >
                              <FileText className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Certificates</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
