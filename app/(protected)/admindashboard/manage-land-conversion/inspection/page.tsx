"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, XCircle, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  getInspections,
  completeInspection,
} from "@/action/land-conversion-actions";

interface InspectionItem {
  id: string;
  applicationId: string;
  siteAddress: string;
  scheduledDate: string;
  inspectorName: string;
  status: string;
}

export default function SiteInspectionPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<InspectionItem[]>([]);
  const [selected, setSelected] = useState<InspectionItem | null>(null);
  const [report, setReport] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await getInspections();
      if (result.success && result.data) {
        setItems(
          result.data.map((it) => ({
            id: it.id,
            applicationId: it.application.applicationNo,
            siteAddress:
              it.siteAddress ||
              `${it.application.mouza}, JL-${it.application.jlNo}, Plot-${it.application.plotNo}`,
            scheduledDate: new Date(it.scheduledDate).toISOString().slice(0, 10),
            inspectorName: it.inspectorName,
            status: it.status,
          })),
        );
      } else if (!result.success) {
        toast({
          title: "Failed to load inspections",
          description: result.error ?? "Please try again.",
          variant: "destructive",
        });
      }
    });
  }, [toast]);

  const handleCompleteInspection = (approve: boolean) => {
    if (!selected) return;
    if (!report.trim()) {
      toast({
        title: "Report required",
        description: "Please write the inspection findings before submitting.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await completeInspection(selected.id, report, approve);
      if (!result.success) {
        toast({
          title: "Failed to update inspection",
          description: result.error ?? "Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: approve ? "Inspection Completed" : "Inspection Rejected",
        description: approve
          ? "Findings recorded and sent for approval."
          : "Inspection rejected with remarks.",
      });
      setReport("");
      setSelected(null);

      const refreshed = await getInspections();
      if (refreshed.success && refreshed.data) {
        setItems(
          refreshed.data.map((it) => ({
            id: it.id,
            applicationId: it.application.applicationNo,
            siteAddress:
              it.siteAddress ||
              `${it.application.mouza}, JL-${it.application.jlNo}, Plot-${it.application.plotNo}`,
            scheduledDate: new Date(it.scheduledDate).toISOString().slice(0, 10),
            inspectorName: it.inspectorName,
            status: it.status,
          })),
        );
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <div className="bg-[#1e40af] text-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <MapPin className="h-7 w-7" />
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
            <h2 className="text-gray-700 font-semibold">Site Inspection</h2>
            <p className="text-sm text-gray-600">
              Schedule and record field inspection details.
            </p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                {items.map((it) => (
                  <Card
                    key={it.id}
                    className={`cursor-pointer ${
                      selected?.id === it.id
                        ? "border-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelected(it)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {it.siteAddress}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {it.scheduledDate} • {it.inspectorName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge>{it.status}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Inspection Report</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selected ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <Label>Application ID</Label>
                            <p>{selected.applicationId}</p>
                          </div>
                          <div>
                            <Label>Scheduled Date</Label>
                            <p>{selected.scheduledDate}</p>
                          </div>
                          <div>
                            <Label>Inspector</Label>
                            <p>{selected.inspectorName}</p>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="report">
                            Findings & Recommendations
                          </Label>
                          <Textarea
                            id="report"
                            rows={5}
                            value={report}
                            onChange={(e) => setReport(e.target.value)}
                            placeholder="Describe observations, setbacks, access, surrounding land use, etc."
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleCompleteInspection(true)}
                            disabled={isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleCompleteInspection(false)}
                            disabled={isPending}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Select a scheduled inspection.
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
