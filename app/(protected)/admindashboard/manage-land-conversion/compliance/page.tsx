"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  getComplianceItems,
  updateComplianceStatus,
} from "@/action/land-conversion-actions";

interface ComplianceItem {
  id: string;
  applicationNo: string;
  applicantName: string;
  condition: string;
  status: "DUE" | "COMPLIED" | "VIOLATION";
}

export default function ComplianceCheckPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<ComplianceItem[]>([]);
  const [selected, setSelected] = useState<ComplianceItem | null>(null);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const result = await getComplianceItems();
      if (result.success && result.data) {
        setItems(result.data);
      } else if (!result.success) {
        toast({
          title: "Failed to load compliance items",
          description: result.error ?? "Please try again.",
          variant: "destructive",
        });
      }
    });
  }, [toast]);

  const markStatus = (status: "COMPLIED" | "VIOLATION") => {
    if (!selected) return;

    startTransition(async () => {
      const result = await updateComplianceStatus(selected.id, status, note);
      if (!result.success) {
        toast({
          title: "Failed to update compliance",
          description: result.error ?? "Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: status === "COMPLIED" ? "Compliance Recorded" : "Violation Flagged",
        description:
          status === "COMPLIED"
            ? "Condition marked as complied."
            : "Violation recorded and escalated.",
      });
      setNote("");
      setSelected(null);

      const refreshed = await getComplianceItems();
      if (refreshed.success && refreshed.data) {
        setItems(refreshed.data);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      <div className="bg-[#1e40af] text-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <AlertTriangle className="h-7 w-7" />
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
            <h2 className="text-gray-700 font-semibold">Compliance Check</h2>
            <p className="text-sm text-gray-600">
              Track and enforce NOC conditions after issuance.
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
                      <Badge
                        variant={
                          item.status === "VIOLATION" ? "destructive" : "default"
                        }
                      >
                        {item.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Panel</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selected ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label>Condition</Label>
                            <p>{selected.condition}</p>
                          </div>
                          <div>
                            <Label>Status</Label>
                            <Badge className="w-fit">{selected.status}</Badge>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="note">Observation/Note</Label>
                          <Textarea
                            id="note"
                            rows={4}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Enter observation details..."
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={() => markStatus("COMPLIED")}
                            disabled={isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Complied
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => markStatus("VIOLATION")}
                            disabled={isPending}
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Flag Violation
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Select an item from the list.
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
