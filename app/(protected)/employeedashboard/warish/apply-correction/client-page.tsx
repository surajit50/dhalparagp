"use client";

import { useState } from "react";
import CorrectionRequestReview from "@/components/warishcorrection/correction-request-review";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [pendingRequests, setPendingRequests] = useState(
    initialPendingRequests
  );
  const [approvedRequests, setApprovedRequests] = useState(
    initialApprovedRequests
  );
  const [rejectedRequests, setRejectedRequests] = useState(
    initialRejectedRequests
  );
  const [stats, setStats] = useState(initialStats);

  const refreshData = async () => {
    try {
      // Fetch updated data
      const response = await fetch("/api/admin/correction-requests");
      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data.pendingRequests);
        setApprovedRequests(data.approvedRequests);
        setRejectedRequests(data.rejectedRequests);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to refresh data:", error);
      // Fallback to page reload
      window.location.reload();
    }
  };

  const handleRequestReviewed = () => {
    refreshData();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Admin - Correction Requests
        </h1>
        <p className="text-muted-foreground mt-2">
          Review and manage all correction requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.pending || 0) +
                (stats.approved || 0) +
                (stats.rejected || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Badge
              variant="outline"
              className="text-yellow-600 border-yellow-600"
            >
              {stats.pending || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Badge
              variant="outline"
              className="text-green-600 border-green-600"
            >
              {stats.approved || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.approved || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <Badge variant="outline" className="text-red-600 border-red-600">
              {stats.rejected || 0}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.rejected || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different request statuses */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <CorrectionRequestReview
            requests={pendingRequests}
            onRequestReviewed={handleRequestReviewed}
          />
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <CorrectionRequestReview
            requests={approvedRequests}
            onRequestReviewed={handleRequestReviewed}
          />
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <CorrectionRequestReview
            requests={rejectedRequests}
            onRequestReviewed={handleRequestReviewed}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
