"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, XCircle, MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  getInspections,
  completeInspection,
} from "@/action/land-conversion-actions";
import LandConversionLayout from "../components/LandConversionLayout";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
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
      setIsLoading(false);
    }
    load();
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
    <LandConversionLayout
      title="Site Inspection"
      description="Schedule and record field inspection details for land conversion."
      icon={MapPin}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            Scheduled Inspections ({items.length})
          </h3>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p className="text-sm">Loading inspections...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed">
              <p className="text-sm text-gray-500">No inspections scheduled</p>
            </div>
          ) : (
            items.map((it) => (
              <Card
                key={it.id}
                className={`cursor-pointer transition-all ${
                  selected?.id === it.id
                    ? "border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500"
                    : "hover:bg-gray-50 border-gray-200"
                }`}
                onClick={() => setSelected(it)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-1">
                    <CardTitle className="text-sm font-bold text-blue-900 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {it.siteAddress}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] h-5 bg-blue-50 text-blue-700 border-blue-200">
                      {it.status}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {it.scheduledDate}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      • {it.inspectorName}
                    </span>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
        <div className="lg:col-span-2">
          <Card className="border-blue-100 shadow-sm">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg">Inspection Report</CardTitle>
              <CardDescription>
                Submit findings after completing the physical site visit.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {selected ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100 text-sm">
                    <div>
                      <Label className="text-blue-700 font-semibold">Application No</Label>
                      <p className="font-mono font-bold">{selected.applicationId}</p>
                    </div>
                    <div>
                      <Label className="text-blue-700 font-semibold">Scheduled Date</Label>
                      <p className="font-medium">{selected.scheduledDate}</p>
                    </div>
                    <div>
                      <Label className="text-blue-700 font-semibold">Inspector</Label>
                      <p className="font-medium">{selected.inspectorName}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="report" className="text-gray-700 font-medium">
                      Findings & Recommendations *
                    </Label>
                    <Textarea
                      id="report"
                      rows={6}
                      value={report}
                      onChange={(e) => setReport(e.target.value)}
                      placeholder="Describe observations, setbacks, access, surrounding land use, and any issues found during inspection..."
                      className="focus:ring-blue-500 border-gray-300"
                    />
                  </div>
                  <div className="flex gap-4 pt-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 h-11"
                      onClick={() => handleCompleteInspection(true)}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Complete & Submit
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 h-11"
                      onClick={() => handleCompleteInspection(false)}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Report Rejection
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <MapPin className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">Select a scheduled inspection to record findings</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </LandConversionLayout>
  );
}
