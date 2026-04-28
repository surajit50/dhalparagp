"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Send, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  getApprovedApplications,
  issueNOC,
} from "@/action/land-conversion-actions";

import LandConversionLayout from "../components/LandConversionLayout";

interface ApprovedItem {
  id: string;
  applicationNo: string;
  applicantName: string;
}

export default function NOCIssuancePage() {
  const { toast } = useToast();
  const [items, setItems] = useState<ApprovedItem[]>([]);
  const [selected, setSelected] = useState<ApprovedItem | null>(null);
  const [expiryDate, setExpiryDate] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getApprovedApplications();
      if (result.success && result.data) {
        setItems(result.data);
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

  const handleIssueNOC = () => {
    if (!selected) return;
    if (!expiryDate) {
      toast({
        title: "Expiry date required",
        description: "Please set an expiry date for the NOC.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await issueNOC(selected.id, new Date(expiryDate));
      if (!result.success) {
        toast({
          title: "Failed to issue NOC",
          description: result.error ?? "Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "NOC Issued Successfully",
        description: `Certificate generated for ${selected.applicationNo}.`,
      });
      setExpiryDate("");
      setSelected(null);

      const refreshed = await getApprovedApplications();
      if (refreshed.success && refreshed.data) {
        setItems(refreshed.data);
      }
    });
  };

  return (
    <LandConversionLayout
      title="NOC Issuance"
      description="Generate and issue the final land conversion NOC certificate."
      icon={FileText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            Ready for Issuance ({items.length})
          </h3>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p className="text-sm">Loading queue...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed">
              <p className="text-sm text-gray-500">
                No applications ready for issuance
              </p>
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
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-bold text-blue-900">
                      {it.applicationNo}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      APPROVED
                    </Badge>
                  </div>
                  <CardDescription className="font-medium text-gray-700">
                    {it.applicantName}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
        <div className="lg:col-span-2">
          <Card className="border-blue-100 shadow-sm">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg">Certificate Generation</CardTitle>
              <CardDescription>
                Set the validity and generate the NOC document.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {selected ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                    <div>
                      <Label className="text-blue-700 font-semibold text-xs uppercase">
                        Application No
                      </Label>
                      <p className="text-lg font-mono font-bold text-slate-800">
                        {selected.applicationNo}
                      </p>
                    </div>
                    <div>
                      <Label className="text-blue-700 font-semibold text-xs uppercase">
                        Applicant Name
                      </Label>
                      <p className="text-lg font-bold text-slate-800">
                        {selected.applicantName}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="expiry"
                        className="text-gray-700 font-medium"
                      >
                        NOC Validity Period (Expiry Date) *
                      </Label>
                      <div className="relative">
                        <Input
                          id="expiry"
                          type="date"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          disabled={isPending}
                          className="focus:ring-blue-500 border-gray-300 pl-10"
                        />
                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-xs text-muted-foreground italic">
                        The NOC will automatically be marked as expired after
                        this date.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4">
                    <Button
                      className="w-full bg-blue-700 hover:bg-blue-800 h-12 text-base font-semibold shadow-lg"
                      onClick={handleIssueNOC}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5 mr-2" />
                      )}
                      Generate & Issue Certificate
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <FileText className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">
                    Select an approved application to issue NOC
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </LandConversionLayout>
  );
}
