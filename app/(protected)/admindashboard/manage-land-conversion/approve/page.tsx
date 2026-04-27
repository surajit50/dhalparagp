"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, UserCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  getApplicationsForApproval,
  approveApplication,
} from "@/action/land-conversion-actions";

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

  useEffect(() => {
    startTransition(async () => {
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
    });
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
    <div className="min-h-screen bg-[#f1f5f9]">
      <div className="bg-[#1e40af] text-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <UserCheck className="h-7 w-7" />
          <div>
            <h1 className="text-lg font-semibold">
              Land Conversion Management System
            </h1>
            <p className="text-xs text-blue-100">
              Government of West Bengal
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white border border-gray-300 shadow-sm">
          <div className="bg-[#e2e8f0] px-4 py-3 border-b">
            <h2 className="text-gray-700 font-semibold">
              Approval Workflow
            </h2>
            <p className="text-sm text-gray-600">
              Review inspection reports and decide.
            </p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-3">
                {queue.map((item) => (
                  <Card
                    key={item.id}
                    className={`cursor-pointer ${
                      selected?.id === item.id
                        ? "border-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelected(item)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        {item.applicationNo}
                      </CardTitle>
                      <CardDescription>{item.applicantName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge>{item.status}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Decision Panel</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selected ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label>Application No</Label>
                            <p>{selected.applicationNo}</p>
                          </div>
                          <div>
                            <Label>Applicant</Label>
                            <p>{selected.applicantName}</p>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="comments">Comments</Label>
                          <Textarea
                            id="comments"
                            rows={4}
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Add approval/rejection comments"
                            disabled={isPending}
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={() => takeAction(true)}
                            disabled={isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => takeAction(false)}
                            disabled={isPending}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Select an application from the list.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
