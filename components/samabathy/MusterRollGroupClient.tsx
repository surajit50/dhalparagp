"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markMusterRollCompleted } from "@/app/actions/mark-muster-completed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  User,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Receipt,
  FilePlus2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import GenerateMusterButton from "./GenerateMusterButton";
import PdfmeDownloadButton from "./PdfmeDownloadButton";

interface MusterRollData {
  id: string;
  allottedAmount: number;
  paymentStatus: string;
  musterRollNo: string | null;
  createdAt: Date;
  application: {
    applicantName: string;
    villageName: string;
    deceasedName: string;
    dateOfDeath: Date;
  };
}

// Helper to map payment status to a badge variant and icon
const statusMeta: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary"; Icon: React.ElementType }> = {
  COMPLETED: { label: "Completed", variant: "success", Icon: CheckCircle },
  PENDING: { label: "Pending", variant: "warning", Icon: Clock },
  FAILED: { label: "Failed", variant: "destructive", Icon: XCircle },
};

export default function MusterRollGroupClient({ data }: { data: MusterRollData[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [completeTarget, setCompleteTarget] = useState<string | null>(null);

  // Group muster rolls by musterRollNo (or "Legacy" if null)
  const grouped = data.reduce((acc: Record<string, MusterRollData[]>, item) => {
    const key = item.musterRollNo || "Legacy";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const handleComplete = async (musterRollNo: string) => {
    setLoading(musterRollNo);
    try {
      // Validate muster roll group exists
      const group = grouped[musterRollNo];
      if (!group || group.length === 0) {
        toast.error("Muster roll group not found");
        return;
      }

      // Get all muster roll IDs for this group
      const ids = group.map(item => item.id);
      
      if (ids.length === 0) {
        toast.error("No valid muster rolls to complete");
        return;
      }

      // Call server action
      const result = await markMusterRollCompleted(ids);

      if (!result.success) {
        toast.error(result.error || result.message);
        console.error("[v0] Server action error:", result);
        return;
      }

      toast.success(result.message);
      router.refresh();
    } catch (error) {
      // Handle specific error types
      if (error instanceof TypeError) {
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
          toast.error("Network error - please check your connection");
        } else {
          toast.error("Connection error - please try again");
        }
      } else if (error instanceof Error) {
        toast.error(error.message || "Failed to complete muster roll");
        console.error("[v0] Error details:", error);
      } else {
        toast.error("An unexpected error occurred");
        console.error("[v0] Unknown error:", error);
      }
    } finally {
      setLoading(null);
      setCompleteTarget(null);
    }
  };

  // Empty state - beautifully illustrated
  if (!data.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="rounded-full bg-muted p-4 mb-6">
            <FilePlus2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No muster rolls yet</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Generate a muster roll to group payments by batch. Once generated,
            you can download PDFs and mark them as completed.
          </p>
          <GenerateMusterButton />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([musterRollNo, group]) => {
        const totalAmount = group.reduce((sum, item) => sum + item.allottedAmount, 0);
        const allCompleted = group.every((item) => item.paymentStatus === "COMPLETED");
        const anyPending = group.some((item) => item.paymentStatus !== "COMPLETED");

        return (
          <Card key={musterRollNo} className="overflow-hidden transition-shadow hover:shadow-md">
            {/* Group Header */}
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/30 px-6 py-4">
              <div className="flex items-center gap-3">
                <Receipt className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-bold tracking-tight">
                      {musterRollNo}
                    </CardTitle>
                    {allCompleted && (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle className="h-3 w-3" /> Completed
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {group.length} {group.length === 1 ? "person" : "people"} · Total: ₹
                    {totalAmount.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <PdfmeDownloadButton musterRollNo={musterRollNo} data={group} />

                {anyPending && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setCompleteTarget(musterRollNo)}
                    disabled={loading === musterRollNo}
                    className="gap-1"
                  >
                    {loading === musterRollNo ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">
                      {loading === musterRollNo ? "Completing…" : "Complete"}
                    </span>
                  </Button>
                )}
              </div>
            </CardHeader>

            {/* Table - responsive with horizontal scroll */}
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10 hover:bg-muted/10">
                      <TableHead className="w-12 text-center">#</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead className="hidden md:table-cell">Village</TableHead>
                      <TableHead>Deceased</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.map((item, idx) => {
                      const meta = statusMeta[item.paymentStatus] || {
                        label: item.paymentStatus,
                        variant: "secondary" as const,
                        Icon: Clock,
                      };
                      const { Icon: StatusIcon } = meta;

                      return (
                        <TableRow key={item.id} className="hover:bg-muted/5">
                          <TableCell className="text-center text-muted-foreground">
                            {idx + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{item.application.applicantName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {item.application.villageName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <span className="font-medium">{item.application.deceasedName}</span>
                              <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(item.application.dateOfDeath), "dd MMM yyyy")}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums">
                            ₹{item.allottedAmount.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={meta.variant} className="gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {meta.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Group footer - quick summary */}
              <div className="flex justify-between items-center px-6 py-3 bg-muted/20 text-sm text-muted-foreground">
                <span>
                  {group.length} record{group.length !== 1 ? "s" : ""}
                </span>
                <span className="font-semibold text-foreground">
                  Total: ₹{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Confirmation dialog for completion */}
      <AlertDialog
        open={!!completeTarget}
        onOpenChange={(open) => {
          if (!open) setCompleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as completed?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark all {completeTarget ? grouped[completeTarget]?.length : 0} payments in{" "}
              <strong>{completeTarget}</strong> as completed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => completeTarget && handleComplete(completeTarget)}
              className="bg-green-600 hover:bg-green-700"
            >
              Yes, complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
