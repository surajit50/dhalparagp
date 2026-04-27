"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  getApplicationsForIssuance,
  issueCertificate,
} from "@/action/land-conversion-actions";

interface IssueItem {
  id: string;
  applicationNo: string;
  applicantName: string;
  status: string;
}

export default function IssueNOCPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<IssueItem[]>([]);
  const [selected, setSelected] = useState<IssueItem | null>(null);
  const [memoNumber, setMemoNumber] = useState("");
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [signatoryName, setSignatoryName] = useState("");
  const [signatoryDesignation, setSignatoryDesignation] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await getApplicationsForIssuance();
      if (result.success && result.data) {
        setItems(
          result.data.map((a) => ({
            id: a.id,
            applicationNo: a.applicationNo,
            applicantName: a.applicantName,
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

  const issueNoc = () => {
    if (!selected) {
      toast({
        title: "Select an application",
        description: "Choose one approved application from the list to issue certificate.",
        variant: "destructive",
      });
      return;
    }

    if (!memoNumber.trim() || !issueDate) {
      toast({
        title: "Missing required details",
        description: "Memo number and issue date are mandatory.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await issueCertificate(
        selected.id,
        memoNumber,
        issueDate,
        signatoryName,
        signatoryDesignation,
      );
      if (!result.success) {
        toast({
          title: "Failed to issue NOC",
          description: result.error ?? "Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "NOC Issued",
        description: `NOC issued for ${selected.applicationNo}`,
      });
      setMemoNumber("");
      setIssueDate(new Date().toISOString().slice(0, 10));
      setSignatoryName("");
      setSignatoryDesignation("");
      setSelected(null);

      const refreshed = await getApplicationsForIssuance();
      if (refreshed.success && refreshed.data) {
        setItems(
          refreshed.data.map((a) => ({
            id: a.id,
            applicationNo: a.applicationNo,
            applicantName: a.applicantName,
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
          <FileText className="h-7 w-7" />
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
            <h2 className="text-gray-700 font-semibold">NOC Issuance</h2>
            <p className="text-sm text-gray-600">
              Generate and issue conversion NOC.
            </p>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-3">
                {items.map((item) => (
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
                    <CardTitle>Issue NOC</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selected ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="memoNumber">Memo Number *</Label>
                            <Input
                              id="memoNumber"
                              value={memoNumber}
                              onChange={(e) => setMemoNumber(e.target.value)}
                              placeholder="e.g., 123/LC/2025"
                            disabled={isPending}
                            />
                          </div>
                          <div>
                            <Label htmlFor="issueDate">Issue Date *</Label>
                            <Input
                              id="issueDate"
                              type="date"
                              value={issueDate}
                              onChange={(e) => setIssueDate(e.target.value)}
                            disabled={isPending}
                            />
                          </div>
                        <div>
                          <Label htmlFor="signatoryName">Signatory Name</Label>
                          <Input
                            id="signatoryName"
                            value={signatoryName}
                            onChange={(e) => setSignatoryName(e.target.value)}
                            placeholder="e.g., Prodhan"
                            disabled={isPending}
                          />
                        </div>
                        <div>
                          <Label htmlFor="signatoryDesignation">Signatory Designation</Label>
                          <Input
                            id="signatoryDesignation"
                            value={signatoryDesignation}
                            onChange={(e) => setSignatoryDesignation(e.target.value)}
                            placeholder="e.g., Gram Panchayat Head"
                            disabled={isPending}
                          />
                        </div>
                        </div>
                        <div className="flex gap-3">
                          <Button onClick={issueNoc} disabled={isPending}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {isPending ? "Issuing..." : "Issue NOC"}
                          </Button>
                          <Button variant="outline" disabled>
                            <Download className="h-4 w-4 mr-2" />
                            Preview (Coming Soon)
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Select an approved application to issue NOC.
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
