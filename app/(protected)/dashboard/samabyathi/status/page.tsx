"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Fingerprint,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/utils";

export default function SamabyathiStatusPage() {
  const [appNumber, setAppNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appNumber.trim()) {
      toast.error("Please enter an application number");
      return;
    }

    setLoading(true);
    setStatusData(null);
    try {
      const res = await fetch(
        `/api/samabathy/status?applicationNumber=${encodeURIComponent(appNumber.trim())}`,
      );
      const data = await res.json();

      if (res.ok) {
        setStatusData(data);
      } else {
        toast.error(data.error || "Application not found");
      }
    } catch (error) {
      toast.error("An error occurred while fetching status");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case "PENDING":
        return <Clock className="h-8 w-8 text-orange-500" />;
      case "UNDER_REVIEW":
        return <Clock className="h-8 w-8 text-yellow-500" />;
      default:
        return <AlertCircle className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
            Approved
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200">
            Pending Sanction
          </Badge>
        );
      case "UNDER_REVIEW":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">
            Under Review
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Check Application Status</CardTitle>
            <CardDescription>
              Enter your Samabyathi application number to check the current
              status of your request.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="e.g., SAM/2026/0001"
                value={appNumber}
                onChange={(e) => setAppNumber(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Check Status
              </Button>
            </form>
          </CardContent>
        </Card>

        {statusData && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-xl">Application Details</CardTitle>
                <CardDescription>
                  Application Number:{" "}
                  <span className="font-mono font-bold text-primary">
                    {statusData.applicationNumber}
                  </span>
                </CardDescription>
              </div>
              {getStatusIcon(statusData.status)}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Applicant Name
                  </p>
                  <p className="font-medium">{statusData.applicantName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div>{getStatusBadge(statusData.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deceased Name</p>
                  <p className="font-medium">{statusData.deceasedName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submitted On</p>
                  <p className="font-medium">
                    {formatDate(statusData.createdAt)}
                  </p>
                </div>
              </div>

              <div className="bg-muted/30 p-3 rounded-md border border-muted-foreground/10 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1 mb-1">
                    <CreditCard className="h-3 w-3" /> Voter ID
                  </p>
                  <p className="font-mono text-sm font-semibold">
                    {statusData.voterId || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1 mb-1">
                    <Fingerprint className="h-3 w-3" /> Aadhaar
                  </p>
                  <p className="font-mono text-sm font-semibold">
                    {statusData.aadhaarNumber || "N/A"}
                  </p>
                </div>
              </div>

              {statusData.status === "APPROVED" &&
                statusData.sanctionAmount && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">
                      Sanctioned Amount
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      ₹ {statusData.sanctionAmount}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Please contact your Gram Panchayat office for disbursement
                      details.
                    </p>
                  </div>
                )}

              {statusData.status === "PENDING" && (
                <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-lg">
                  <p className="text-sm text-orange-700 font-medium">
                    Verified & Pending Sanction
                  </p>
                  <p className="text-sm text-orange-600 mt-1">
                    Your application has been verified by the administration. It
                    is now in the queue for fund allotment and sanction.
                  </p>
                </div>
              )}

              {statusData.status === "UNDER_REVIEW" && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                  <p className="text-sm text-yellow-700 font-medium">
                    Under Review
                  </p>
                  <p className="text-sm text-yellow-600 mt-1">
                    Your application is currently being reviewed by the
                    administration. You will be notified once the review is
                    complete.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
