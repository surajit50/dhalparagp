"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, UserCheck, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  getApplicationsForApproval,
  approveApplication,
} from "@/action/land-conversion-actions";
import LandConversionLayout from "../components/LandConversionLayout";

interface ApprovalItem {
  id: string;
  applicantName: string;
  applicationNo: string;
  status: string;
}

export default function ApprovalWorkflowPage() {
  const { toast } = useToast();
  const [queue, setQueue] = useState<ApprovalItem[]>([]);
  const [selected, setSelected] = useState<ApprovalItem | null>(null);
  const [comments, setComments] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getApplicationsForApproval();
      if (result.success && result.data) {
        setQueue(
          result.data.map((a) => ({
            id: a.id,
            applicantName: a.applicantName,
            applicationNo: a.applicationNo,
            status: a.status,
          })),
        );
      } else if (!result.success) {
        toast({
          title: "Failed to load applications",
          description: result.error ?? "Please try again.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }
    load();
  }, [toast]);

  const takeAction = (approve: boolean) => {
    if (!selected) return;
    if (!approve && !comments.trim()) {
      toast({
        title: "Comments required",
        description: "Please add rejection comments before rejecting.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await approveApplication(selected.id, comments, approve);
      if (!result.success) {
        toast({
          title: "Failed to update application",
          description: result.error ?? "Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: approve ? "Approved" : "Rejected",
        description: approve
          ? "Application moved to NOC issuance."
          : "Application rejected.",
      });
      setComments("");
      setSelected(null);

      const refreshed = await getApplicationsForApproval();
      if (refreshed.success && refreshed.data) {
        setQueue(
          refreshed.data.map((a) => ({
            id: a.id,
            applicantName: a.applicantName,
            applicationNo: a.applicationNo,
            status: a.status,
          })),
        );
      }
    });
  };

  return (
    <LandConversionLayout
      title="Approval Workflow"
      description="Review inspection reports and decide on application approval."
      icon={UserCheck}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            Pending Approvals ({queue.length})
          </h3>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p className="text-sm">Loading queue...</p>
            </div>
          ) : queue.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed">
              <p className="text-sm text-gray-500">No applications pending approval</p>
            </div>
          ) : (
            queue.map((item) => (
              <Card
                key={item.id}
                className={`cursor-pointer transition-all ${
                  selected?.id === item.id
                    ? "border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500"
                    : "hover:bg-gray-50 border-gray-200"
                }`}
                onClick={() => setSelected(item)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-bold text-blue-900">
                      {item.applicationNo}
                    </CardTitle>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {item.status}
                    </Badge>
                  </div>
                  <CardDescription className="font-medium text-gray-700">
                    {item.applicantName}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
        <div className="lg:col-span-2">
          <Card className="border-blue-100 shadow-sm">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg">Decision Panel</CardTitle>
              <CardDescription>
                Review details and provide your decision.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {selected ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                    <div>
                      <Label className="text-blue-700 font-semibold">Application No</Label>
                      <p className="text-lg font-mono font-bold text-slate-800">
                        {selected.applicationNo}
                      </p>
                    </div>
                    <div>
                      <Label className="text-blue-700 font-semibold">Applicant Name</Label>
                      <p className="text-lg font-bold text-slate-800">
                        {selected.applicantName}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comments" className="text-gray-700 font-medium">
                      Approval/Rejection Comments *
                    </Label>
                    <Textarea
                      id="comments"
                      rows={5}
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Provide detailed reasons for your decision..."
                      disabled={isPending}
                      className="focus:ring-blue-500 border-gray-300"
                    />
                  </div>
                  <div className="flex gap-4 pt-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 h-11"
                      onClick={() => takeAction(true)}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve Application
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 h-11"
                      onClick={() => takeAction(false)}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Reject Application
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <UserCheck className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">Select an application from the queue to review</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </LandConversionLayout>
  );
}
