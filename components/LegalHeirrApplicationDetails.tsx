
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { UserCheck, UserX, Users, FileText } from "lucide-react";
import { WarishDetailProps, WarishApplicationProps } from "@/types";
import { capitalizeFirstLetter, formatText } from "@/utils/formatText";
import { cn } from "@/lib/utils";

const countAllHeirs = (details: WarishDetailProps[]): number => {
  return details.reduce((acc, detail) => {
    return acc + 1 + countAllHeirs(detail.children);
  }, 0);
};

const getSerialNumber = (depth: number, index: number): string => {
  if (depth === 0) return `${index + 1}`;
  if (depth === 1) return String.fromCharCode(65 + index);
  return String.fromCharCode(97 + index);
};

const renderWarishDetails = (
  details: WarishDetailProps[],
  depth = 0,
  parentIndex = ""
): React.ReactNode[] => {
  return details.flatMap((detail, index) => {
    const currentIndex = parentIndex
      ? `${parentIndex}.${getSerialNumber(depth, index)}`
      : getSerialNumber(depth, index);

    return [
      <TableRow
        key={detail.id}
        className={cn(
          "transition-all duration-200 hover:bg-muted/40",
          depth > 0 && "text-sm"
        )}
      >
        <TableCell className="font-mono text-right w-[80px] text-muted-foreground">
          {currentIndex}
        </TableCell>

        <TableCell>
          <div
            className="flex items-center gap-3 relative"
            style={{ paddingLeft: `${depth * 20}px` }}
          >
            {depth > 0 && (
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-border" />
            )}

            {detail.livingStatus === "alive" ? (
              <UserCheck className="h-4 w-4 text-emerald-500" />
            ) : (
              <UserX className="h-4 w-4 text-red-500" />
            )}

            <span className="font-medium">
              {formatText(detail.name)}
            </span>
          </div>
        </TableCell>

        <TableCell>
          <Badge
            className={cn(
              "capitalize",
              detail.gender === "male"
                ? "bg-orange-100 text-orange-700"
                : "bg-pink-100 text-pink-700"
            )}
          >
            {detail.gender}
          </Badge>
        </TableCell>

        <TableCell className="text-muted-foreground">
          {formatText(detail.relation)}
        </TableCell>

        <TableCell>
          <Badge
            className={cn(
              detail.livingStatus === "alive"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            )}
          >
            {capitalizeFirstLetter(detail.livingStatus)}
          </Badge>
        </TableCell>

        <TableCell className="text-muted-foreground">
          {detail.hasbandName
            ? formatText(detail.hasbandName)
            : "—"}
        </TableCell>
      </TableRow>,
      ...(detail.children.length > 0
        ? renderWarishDetails(detail.children, depth + 1, currentIndex)
        : []),
    ];
  });
};

export default function LegalHeirrApplicationDetails({
  application,
  rootWarishDetails,
}: {
  application: WarishApplicationProps;
  rootWarishDetails: WarishDetailProps[];
}) {
  const totalHeirs = countAllHeirs(rootWarishDetails);

  return (
    <Card className="w-full shadow-lg border border-border rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <div className="p-2 bg-background rounded-xl shadow-sm">
              <Users className="h-5 w-5 text-primary" />
            </div>
            Legal Heirs Details
          </CardTitle>

          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Total Heirs: {totalHeirs}
            </Badge>

            <Badge
              className={cn(
                application.warishApplicationStatus === "approved"
                  ? "bg-emerald-100 text-emerald-700"
                  : application.warishApplicationStatus === "rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
              )}
            >
              {capitalizeFirstLetter(
                application.warishApplicationStatus
              )}
            </Badge>
          </div>
        </div>

        <Separator className="mt-3" />

        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <FileText className="h-4 w-4" />
          Deceased:{" "}
          <span className="font-medium text-foreground">
            {formatText(application.nameOfDeceased)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="text-center w-[80px]">
                  Sl No.
                </TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Relation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Spouse Name</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {renderWarishDetails(rootWarishDetails)}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
