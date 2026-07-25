"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  MapPin,
  Phone,
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  IndianRupee,
} from "lucide-react";
import { formatDate } from "@/utils/utils";
import { cn } from "@/lib/utils";

interface LeaseCardProps {
  lease: any;
  index: number;
  progress: number;
  daysLeft: number;
  isExpiringSoon: boolean;
  isOverdue: boolean;
  paidPercentage: number;
  formatRemainingTime: (end: Date, today: Date) => string;
  onDelete: (id: string) => Promise<void>;
  onStatusUpdate: (id: string, status: string) => Promise<void>;
  onVerify: (id: string) => Promise<void>;
  children?: React.ReactNode;
}

export function LeaseCardView({
  lease,
  index,
  progress,
  daysLeft,
  isExpiringSoon,
  isOverdue,
  paidPercentage,
  formatRemainingTime,
  children,
}: LeaseCardProps) {
  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  const today = new Date();
  const start = new Date(lease.leaseStartDate);
  const end = new Date(lease.leaseEndDate);

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500/10 text-green-600 border-green-200/50";
      case "EXPIRED":
        return "bg-amber-500/10 text-amber-600 border-amber-200/50";
      case "COMPLETED":
        return "bg-blue-500/10 text-blue-600 border-blue-200/50";
      case "CANCELLED":
        return "bg-slate-500/10 text-slate-600 border-slate-200/50";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-200/50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle2 className="h-4 w-4" />;
      case "EXPIRED":
        return <AlertTriangle className="h-4 w-4" />;
      case "COMPLETED":
        return <CheckCircle2 className="h-4 w-4" />;
      case "CANCELLED":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 bg-muted/30 border-b">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-foreground line-clamp-1">
              {lease.pond.name}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="line-clamp-1">{lease.pond.location}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn("gap-1 text-xs", getStatusClasses(lease.status))}>
              {getStatusIcon(lease.status)}
              <span>{lease.status}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-4 space-y-4">
        {/* Lease Party Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
              Party Name
            </p>
            <p className="text-sm font-medium">{lease.leasePartyName}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              Contact
            </p>
            <p className="text-sm font-medium">{lease.leasePartyMobile}</p>
          </div>
        </div>

        {/* Timeline Info */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Lease Period
          </p>
          <div className="text-sm space-y-2">
            <div className="flex justify-between text-xs">
              <span>{formatDate(start)}</span>
              <span>{formatDate(end)}</span>
            </div>
            <Progress
              value={progress}
              className={`h-2 ${isExpiringSoon ? "[&>div]:bg-orange-500" : isOverdue ? "[&>div]:bg-red-500" : ""}`}
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{Math.round(progress)}% complete</span>
              <span className="font-medium">
                {formatRemainingTime(end, today)}
              </span>
            </div>
          </div>
        </div>

        {/* Financial Info */}
        <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Amount:</span>
            <span className="font-semibold">{currency.format(lease.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Paid:</span>
            <span className="text-green-600 font-medium">
              {currency.format(lease.paidAmount)}
            </span>
          </div>
          {lease.pendingAmount > 0 && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending:</span>
                <span className="text-red-600 font-bold">
                  {currency.format(lease.pendingAmount)}
                </span>
              </div>
              <div className="pt-1">
                <Progress
                  value={paidPercentage}
                  className="h-1.5 [&>div]:bg-green-500"
                />
              </div>
            </>
          )}
        </div>

        {/* Notice Info */}
        {((lease.noticeCount && lease.noticeCount > 0) || lease.lastNoticeDate) && (
          <div className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-2 rounded border border-orange-100">
            <div className="flex items-center gap-1">
              <FileWarning className="h-3 w-3" />
              {lease.noticeCount || 1} Notice{(lease.noticeCount || 1) > 1 ? "s" : ""} Sent
            </div>
            {lease.noticeReceivedDate && (
              <div className="text-[10px] text-green-700 flex items-center gap-1 border-t border-orange-200 pt-1 mt-1">
                <CheckCircle2 className="h-3 w-3" />
                Received: {new Date(lease.noticeReceivedDate).toLocaleDateString()}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 border-t flex gap-2">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
