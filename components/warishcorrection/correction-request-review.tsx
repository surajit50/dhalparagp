"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Info,
  MoreHorizontal,
  ArrowRight,
  User,
  CalendarDays,
  Check,
  X,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface CorrectionRequest {
  id: string;
  fieldToModify?: string | null;
  currentValue?: string | null;
  proposedValue?: string | null;
  modifications?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }> | null;
  reasonForModification: string;
  requestedBy: string;
  requestedDate: Date;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string | null;
  reviewedDate?: Date | null;
  reviewComments?: string | null;
  targetType: "application" | "detail";
  warishApplicationId?: string | null;
  warishDetailId?: string | null;
  warishApplication?: {
    id: string;
    acknowlegment: string;
    applicantName: string;
  } | null;
}

interface CorrectionRequestReviewProps {
  requests: CorrectionRequest[];
  onRequestReviewed: () => void;
  viewMode?: "list" | "table";
}

export default function CorrectionRequestReview({
  requests,
  onRequestReviewed,
  viewMode = "list",
}: CorrectionRequestReviewProps) {
  const [reviewingRequest, setReviewingRequest] = useState<string | null>(null);
  const [reviewComments, setReviewComments] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<CorrectionRequest | null>(null);

  const handleReview = async (requestId: string, approve: boolean) => {
    if (!reviewComments.trim() && !approve) {
      toast({
        title: "Error",
        description: "Please provide comments when rejecting a request",
        variant: "destructive",
      });
      return;
    }

    setReviewingRequest(requestId);
    try {
      const response = await fetch(
        `/api/warish-correction-requests/${requestId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            approve,
            reviewedBy: "Admin", // Should be from context in real app
            reviewComments: reviewComments.trim() || undefined,
          }),
        },
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      toast({
        title: "Success",
        description: data.message,
      });

      setReviewComments("");
      setIsDialogOpen(false);
      onRequestReviewed();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to review request",
        variant: "destructive",
      });
    } finally {
      setReviewingRequest(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-200/50 gap-1 pr-2"
          >
            <Clock className="w-3 h-3" />
            Pending Review
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200/50 gap-1 pr-2"
          >
            <CheckCircle className="w-3 h-3" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-200/50 gap-1 pr-2"
          >
            <XCircle className="w-3 h-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatFieldName = (fieldName: string) => {
    return fieldName
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "MMM dd, yyyy");
  };

  const formatDateTime = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return format(dateObj, "MMM dd, yyyy 'at' h:mm a");
  };

  const openReviewDialog = (request: CorrectionRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  if (requests.length === 0) {
    return (
      <Card className="bg-muted/5 border-dashed">
        <CardContent className="p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
          <div className="bg-muted rounded-full p-4 mb-4">
            <Info className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            No correction requests found
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            There are no correction requests to display at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Review Dialog Component
  const ReviewDialog = () => (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setSelectedRequest(null);
          setReviewComments("");
        }
      }}
    >
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0 border-none shadow-2xl">
        <DialogHeader className="p-6 pb-4 bg-muted/30 border-b">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle className="text-xl">
              Correction Request Review
            </DialogTitle>
            {selectedRequest && getStatusBadge(selectedRequest.status)}
          </div>
          <div className="flex text-xs text-muted-foreground gap-3 mt-1">
            <span className="font-mono bg-muted px-1.5 py-0.5 rounded border">
              ID: {selectedRequest?.id.slice(0, 8)}...
            </span>
            <span>
              submitted on{" "}
              {selectedRequest && formatDate(selectedRequest.requestedDate)}
            </span>
          </div>
        </DialogHeader>

        {selectedRequest && (
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Correction Target
                </Label>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="text-xs h-6 px-2 capitalize font-medium bg-blue-100 text-blue-700 border-blue-200"
                  >
                    {selectedRequest.targetType}
                  </Badge>
                  {selectedRequest.warishApplication && (
                    <span className="text-sm font-medium">
                      {selectedRequest.warishApplication.applicantName}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Requested By
                </Label>
                <div className="flex items-center justify-end gap-2 text-sm font-medium">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  {selectedRequest.requestedBy}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="font-semibold text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Field Modifications
              </Label>

              <div className="space-y-3">
                {selectedRequest.modifications &&
                selectedRequest.modifications.length > 0 ? (
                  selectedRequest.modifications.map((mod, i) => (
                    <div
                      key={i}
                      className="border rounded-lg overflow-hidden shadow-sm"
                    >
                      <div className="bg-muted/30 px-3 py-1.5 border-b text-xs font-semibold flex items-center justify-between">
                        <span>{formatFieldName(mod.field)}</span>
                      </div>
                      <div className="grid grid-cols-2">
                        <div className="p-3 bg-red-50/30 dark:bg-red-950/5 border-r border-border/40">
                          <span className="text-[10px] uppercase text-red-600/70 font-bold block mb-1">
                            Current
                          </span>
                          <div className="text-sm text-muted-foreground line-through decoration-red-400/30 truncate">
                            {mod.oldValue ? (
                              formatFieldName(String(mod.oldValue))
                            ) : (
                              <span className="italic opacity-50">Empty</span>
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-green-50/30 dark:bg-green-950/5">
                          <span className="text-[10px] uppercase text-green-600/70 font-bold block mb-1">
                            Proposed
                          </span>
                          <div className="text-sm font-medium text-foreground truncate">
                            {formatFieldName(String(mod.newValue))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback for old requests
                  <div className="border rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-muted/30 px-3 py-1.5 border-b text-xs font-semibold">
                      {selectedRequest.fieldToModify
                        ? formatFieldName(selectedRequest.fieldToModify)
                        : "Field"}
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="p-3 bg-red-50/30 border-r border-border/40">
                        <span className="text-[10px] uppercase text-red-600/70 font-bold block mb-1">
                          Current
                        </span>
                        <div className="text-sm text-muted-foreground line-through decoration-red-400/30">
                          {selectedRequest.currentValue
                            ? formatFieldName(selectedRequest.currentValue)
                            : "Empty"}
                        </div>
                      </div>
                      <div className="p-3 bg-green-50/30">
                        <span className="text-[10px] uppercase text-green-600/70 font-bold block mb-1">
                          Proposed
                        </span>
                        <div className="text-sm font-medium text-foreground">
                          {selectedRequest.proposedValue
                            ? formatFieldName(selectedRequest.proposedValue)
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-medium text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                Reason for Modification
              </Label>
              <div className="p-4 bg-muted/30 border rounded-lg text-sm text-muted-foreground italic">
                &quot;{selectedRequest.reasonForModification}&quot;
              </div>
            </div>

            {selectedRequest.status !== "pending" && (
              <div className="bg-muted/40 p-4 rounded-lg border space-y-3">
                <h4 className="font-medium text-sm border-b pb-2 mb-2">
                  Review Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">
                      Reviewed By
                    </span>
                    <span className="font-medium">
                      {selectedRequest.reviewedBy || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">
                      Review Date
                    </span>
                    <span className="font-medium">
                      {selectedRequest.reviewedDate
                        ? formatDateTime(selectedRequest.reviewedDate)
                        : "N/A"}
                    </span>
                  </div>
                  {selectedRequest.reviewComments && (
                    <div className="col-span-2 bg-background p-3 rounded border text-sm mt-1">
                      <span className="text-muted-foreground text-xs block mb-1 font-semibold">
                        Reviewer Comments
                      </span>
                      <p className="text-foreground/90">
                        {selectedRequest.reviewComments}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {selectedRequest.status === "pending" && (
              <div className="space-y-3 pt-2 border-t mt-2">
                <Label
                  htmlFor="reviewComments"
                  className="font-medium text-sm text-foreground"
                >
                  Review Comments{" "}
                  <span className="text-muted-foreground font-normal">
                    (Required for rejection)
                  </span>
                </Label>
                <Textarea
                  id="reviewComments"
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Add your review notes here..."
                  className="min-h-[100px] resize-none focus-visible:ring-offset-0"
                />
              </div>
            )}
          </div>
        )}

        <div className="p-6 pt-2 border-t bg-muted/10 sticky bottom-0">
          <DialogFooter className="gap-2 sm:gap-3 w-full sm:justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
              className="text-muted-foreground"
            >
              Close
            </Button>

            {selectedRequest?.status === "pending" && (
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="destructive"
                  onClick={() =>
                    selectedRequest && handleReview(selectedRequest.id, false)
                  }
                  disabled={reviewingRequest === selectedRequest?.id}
                  className="flex-1 sm:flex-none"
                >
                  {reviewingRequest === selectedRequest?.id
                    ? "Rejecting..."
                    : "Reject Request"}
                </Button>
                <Button
                  onClick={() =>
                    selectedRequest && handleReview(selectedRequest.id, true)
                  }
                  disabled={reviewingRequest === selectedRequest?.id}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none shadow-sm"
                >
                  {reviewingRequest === selectedRequest?.id
                    ? "Approving..."
                    : "Approve Request"}
                </Button>
              </div>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Table View Implementation
  if (viewMode === "table") {
    return (
      <>
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Current Value</TableHead>
                <TableHead>Proposed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>
                        {request.modifications &&
                        request.modifications.length > 1
                          ? `${request.modifications.length} Fields`
                          : request.modifications?.[0]
                            ? formatFieldName(request.modifications[0].field)
                            : request.fieldToModify
                              ? formatFieldName(request.fieldToModify)
                              : "Multiple Fields"}
                      </span>
                      <span className="text-[10px] text-muted-foreground capitalize bg-muted px-1.5 py-0.5 rounded w-fit mt-0.5 border">
                        {request.targetType}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="font-medium">{request.requestedBy}</span>
                      {request.warishApplication && (
                        <span
                          className="text-xs text-muted-foreground truncate max-w-[120px]"
                          title={request.warishApplication.acknowlegment}
                        >
                          App: {request.warishApplication.acknowlegment}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {format(new Date(request.requestedDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">
                    {request.modifications?.[0]
                      ? String(request.modifications[0].oldValue || "-")
                      : request.currentValue || "-"}
                    {request.modifications &&
                      request.modifications.length > 1 &&
                      " ..."}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate font-medium text-green-600 dark:text-green-400 text-sm">
                    {request.modifications?.[0]
                      ? String(request.modifications[0].newValue)
                      : request.proposedValue || "N/A"}
                    {request.modifications &&
                      request.modifications.length > 1 &&
                      " ..."}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => openReviewDialog(request)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            navigator.clipboard.writeText(request.id)
                          }
                        >
                          Copy Request ID
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <ReviewDialog />
      </>
    );
  }

  // List View Implementation (Default)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Recent Requests
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track your correction requests.
          </p>
        </div>
        <Badge
          variant="outline"
          className="px-3 py-1 bg-background text-sm font-medium"
        >
          {requests.length} Total
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requests.map((request) => (
          <Card
            key={request.id}
            className={cn(
              "group transition-all hover:shadow-md cursor-pointer border-l-4 overflow-hidden",
              request.status === "pending"
                ? "border-l-yellow-500 hover:border-l-yellow-600"
                : request.status === "approved"
                  ? "border-l-green-500 hover:border-l-green-600"
                  : "border-l-red-500 hover:border-l-red-600",
            )}
            onClick={() => openReviewDialog(request)}
          >
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                <div className="flex-1 p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                          {request.modifications &&
                          request.modifications.length > 1
                            ? `${request.modifications.length} Corrections Requested`
                            : request.modifications?.[0]
                              ? formatFieldName(request.modifications[0].field)
                              : request.fieldToModify
                                ? formatFieldName(request.fieldToModify)
                                : "Correction Request"}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-5 px-1.5 font-normal capitalize bg-muted/50 border shadow-none"
                        >
                          {request.targetType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" /> {request.requestedBy}
                        <span>•</span>
                        <CalendarDays className="h-3 w-3" />{" "}
                        {formatDate(request.requestedDate)}
                      </div>
                    </div>
                    <div className="sm:hidden">
                      {getStatusBadge(request.status)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm bg-muted/20 p-3 rounded-lg border border-border/50">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider block mb-0.5">
                        Current
                      </span>
                      <div
                        className="truncate text-muted-foreground line-through decoration-border/60"
                        title={request.currentValue ?? undefined}
                      >
                        {request.currentValue || (
                          <span className="italic opacity-50">Empty</span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] uppercase text-green-600/70 font-semibold tracking-wider block mb-0.5">
                        Proposed
                      </span>
                      <div
                        className="truncate font-medium text-foreground"
                        title={request.proposedValue ?? undefined}
                      >
                        {request.proposedValue}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex flex-col items-end justify-between p-5 border-l bg-muted/5 w-[140px] shrink-0">
                  {getStatusBadge(request.status)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground group-hover:text-primary h-8 px-2 hover:bg-primary/5 w-full mt-auto"
                  >
                    Details <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <ReviewDialog />
    </div>
  );
}

function ChevronRight({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
