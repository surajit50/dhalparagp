"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import CorrectionRequestReview from "@/components/warishcorrection/correction-request-review";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { StatsCard } from "./components/stats-card";
import type { CorrectionRequest } from "./types";
import { cn } from "@/lib/utils";

interface ClientPageProps {
  initialPendingRequests: CorrectionRequest[];
  initialApprovedRequests: CorrectionRequest[];
  initialRejectedRequests: CorrectionRequest[];
  initialStats: Record<string, number>;
}

export default function AdminCorrectionRequestsClientPage({
  initialPendingRequests,
  initialApprovedRequests,
  initialRejectedRequests,
  initialStats,
}: ClientPageProps) {
  const [allRequests, setAllRequests] = useState<CorrectionRequest[]>([
    ...initialPendingRequests,
    ...initialApprovedRequests,
    ...initialRejectedRequests,
  ]);
  
  const [stats, setStats] = useState(initialStats);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filtering states
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>("all");

  const router = useRouter();

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/admin/correction-requests");
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      
      const data = await response.json();
      const newPending = data.pendingRequests || [];
      const newApproved = data.approvedRequests || [];
      const newRejected = data.rejectedRequests || [];
      
      setAllRequests([...newPending, ...newApproved, ...newRejected]);
      setStats(data.stats || {});
      
      router.refresh();
    } catch (error) {
      console.error("Failed to refresh data:", error);
      router.refresh(); // Fallback to full page reload
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRequestReviewed = () => {
    refreshData();
  };

  // Filter logic
  const filteredRequests = useMemo(() => {
    return allRequests.filter((request) => {
      // Status Match
      if (statusFilter !== "all" && request.status !== statusFilter) return false;

      // Target Type Match
      if (targetTypeFilter !== "all" && request.targetType !== targetTypeFilter) return false;

      // Search Query Match
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        
        // Check basic fields
        const basicMatch = 
          request.fieldToModify?.toLowerCase().includes(query) ||
          request.requestedBy.toLowerCase().includes(query) ||
          request.currentValue?.toLowerCase().includes(query) ||
          request.proposedValue?.toLowerCase().includes(query) ||
          request.warishApplication?.acknowlegment.toLowerCase().includes(query) ||
          request.warishApplication?.applicantName.toLowerCase().includes(query);

        if (basicMatch) return true;

        // Check multi-field modifications if they exist
        if (request.modifications && Array.isArray(request.modifications)) {
          return request.modifications.some(mod => 
            mod.field.toLowerCase().includes(query) ||
            String(mod.oldValue || "").toLowerCase().includes(query) ||
            String(mod.newValue || "").toLowerCase().includes(query)
          );
        }

        return false;
      }

      return true;
    }).sort((a, b) => new Date(b.requestedDate).getTime() - new Date(a.requestedDate).getTime());
  }, [allRequests, statusFilter, targetTypeFilter, searchQuery]);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Correction Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review, approve, or reject data correction requests.
          </p>
        </div>

        <Button 
          variant="outline" 
          onClick={refreshData} 
          disabled={isRefreshing}
          className="shadow-sm hover:bg-muted/50"
        >
          {isRefreshing ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {isRefreshing ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      {/* Stats Cards - Interactive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => setStatusFilter("all")} className="cursor-pointer group">
          <StatsCard
            title="Total Requests"
            value={
              (stats.pending || 0) + (stats.approved || 0) + (stats.rejected || 0)
            }
            description="All-time submissions"
            icon={<FileText className="h-5 w-5 text-primary" />}
            borderColorClass="border-primary/20 group-hover:border-primary/50"
            iconBgClass="bg-primary/10 group-hover:bg-primary/20"
          />
        </div>

        <div onClick={() => setStatusFilter("pending")} className="cursor-pointer group">
          <StatsCard
            title="Pending Review"
            value={stats.pending || 0}
            description="Awaiting action"
            icon={<Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />}
            iconBgClass="bg-yellow-100 dark:bg-yellow-900/40 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/60"
            valueColorClass="text-yellow-600 dark:text-yellow-500"
            borderColorClass={cn(
              "border-yellow-200 dark:border-yellow-900/50 group-hover:border-yellow-400 dark:group-hover:border-yellow-700",
              statusFilter === 'pending' && "ring-2 ring-yellow-500/20 shadow-md transform scale-[1.02]"
            )}
          />
        </div>

        <div onClick={() => setStatusFilter("approved")} className="cursor-pointer group">
          <StatsCard
            title="Approved"
            value={stats.approved || 0}
            description="Successfully updated"
            icon={<CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />}
            iconBgClass="bg-green-100 dark:bg-green-900/40 group-hover:bg-green-200 dark:group-hover:bg-green-900/60"
            valueColorClass="text-green-600 dark:text-green-500"
            borderColorClass={cn(
              "border-green-200 dark:border-green-900/50 group-hover:border-green-400 dark:group-hover:border-green-700",
              statusFilter === 'approved' && "ring-2 ring-green-500/20 shadow-md transform scale-[1.02]"
            )}
          />
        </div>

        <div onClick={() => setStatusFilter("rejected")} className="cursor-pointer group">
          <StatsCard
            title="Rejected"
            value={stats.rejected || 0}
            description="Denied requests"
            icon={<XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />}
            iconBgClass="bg-red-100 dark:bg-red-900/40 group-hover:bg-red-200 dark:group-hover:bg-red-900/60"
            valueColorClass="text-red-600 dark:text-red-500"
            borderColorClass={cn(
              "border-red-200 dark:border-red-900/50 group-hover:border-red-400 dark:group-hover:border-red-700",
              statusFilter === 'rejected' && "ring-2 ring-red-500/20 shadow-md transform scale-[1.02]"
            )}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
           <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, field, or ID..."
              className="pl-9 bg-muted/30 border-muted-foreground/20 focus-visible:bg-background transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             <div className="flex items-center gap-2">
                 <SlidersHorizontal className="w-4 h-4 text-muted-foreground hidden sm:block" />
                 <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[160px] bg-muted/30 border-muted-foreground/20">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Status:</span>
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
             </div>

             <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
              <SelectTrigger className="w-full sm:w-[160px] bg-muted/30 border-muted-foreground/20">
                 <div className="flex items-center gap-2 truncate">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Type:</span>
                    <SelectValue />
                 </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="application">Application</SelectItem>
                <SelectItem value="detail">Detailed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results List */}
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="px-1 pt-0 pb-4">
            <div className="flex justify-between items-end">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  Requests
                  <Badge variant="secondary" className="px-2 py-0.5 text-xs font-normal">
                    {filteredRequests.length}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {statusFilter === 'all' 
                    ? "Showing all correction requests sorted by date" 
                    : `Showing ${statusFilter} requests`
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0">
             {/* We can re-use the list view or table view here based on preference. 
                 Start with table view for density, or list view for detail. 
                 Using table view as it was default for admin. */}
            <CorrectionRequestReview
              requests={filteredRequests}
              onRequestReviewed={handleRequestReviewed}
              viewMode="table"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
