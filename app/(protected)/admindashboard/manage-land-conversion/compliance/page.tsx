"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  getComplianceItems,
  updateComplianceStatus,
} from "@/action/land-conversion-actions";
import LandConversionLayout from "../components/LandConversionLayout";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
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
      setIsLoading(false);
    }
    load();
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
        title:
          status === "COMPLIED" ? "Compliance Recorded" : "Violation Flagged",
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
    <LandConversionLayout
      title="Compliance Check"
      description="Track and enforce NOC conditions after issuance."
      icon={AlertTriangle}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            Pending Conditions ({items.length})
          </h3>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p className="text-sm">Loading conditions...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed">
              <p className="text-sm text-gray-500">
                No conditions pending compliance
              </p>
            </div>
          ) : (
            items.map((item) => (
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
                    <Badge
                      variant={
                        item.status === "VIOLATION" ? "destructive" : "outline"
                      }
                      className={
                        item.status === "DUE"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : item.status === "COMPLIED"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : ""
                      }
                    >
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
              <CardTitle className="text-lg">Compliance Panel</CardTitle>
              <CardDescription>
                Update the compliance status for the selected condition.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {selected ? (
                <>
                  <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                    <div>
                      <Label className="text-blue-700 font-semibold">
                        Condition Description
                      </Label>
                      <p className="text-gray-800 leading-relaxed mt-1 italic">
                        "{selected.condition}"
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="px-3 py-1 bg-white rounded border border-blue-100">
                        <span className="text-blue-600 font-medium">
                          App No:{" "}
                        </span>
                        <span className="font-mono">
                          {selected.applicationNo}
                        </span>
                      </div>
                      <div className="px-3 py-1 bg-white rounded border border-blue-100">
                        <span className="text-blue-600 font-medium">
                          Status:{" "}
                        </span>
                        <Badge variant="outline" className="ml-1 h-5">
                          {selected.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note" className="text-gray-700 font-medium">
                      Observation/Field Note
                    </Label>
                    <Textarea
                      id="note"
                      rows={5}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Describe what was observed during the compliance check..."
                      className="focus:ring-blue-500 border-gray-300"
                    />
                  </div>
                  <div className="flex gap-4 pt-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 h-11"
                      onClick={() => markStatus("COMPLIED")}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Mark Complied
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 h-11"
                      onClick={() => markStatus("VIOLATION")}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 mr-2" />
                      )}
                      Flag Violation
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">
                    Select a compliance item to record observation
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
