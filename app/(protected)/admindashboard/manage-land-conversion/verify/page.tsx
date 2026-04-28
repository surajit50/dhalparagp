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
import { Badge } from "@/components/ui/badge";
import {
  Search,
  CheckCircle,
  XCircle,
  FileSearch,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  getPendingVerifications,
  verifyDocuments,
} from "@/action/land-conversion-actions";

import LandConversionLayout from "../components/LandConversionLayout";

interface VerificationItem {
  id: string;
  applicationNo: string;
  applicantName: string;
  mouza: string;
  documents: { id: string; name: string; url: string; status: string }[];
}

export default function DocumentVerificationPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [selected, setSelected] = useState<VerificationItem | null>(null);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getPendingVerifications();
      if (result.success && result.data) {
        setItems(
          result.data.map((it) => ({
            id: it.id,
            applicationNo: it.applicationNo,
            applicantName: it.applicantName,
            mouza: it.mouza,
            documents: it.documents.map((d) => ({
              id: d.id,
              name: d.name,
              url: d.url,
              status: d.status,
            })),
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

  const handleVerify = (approve: boolean) => {
    if (!selected) return;

    startTransition(async () => {
      const result = await verifyDocuments(selected.id, approve);
      if (!result.success) {
        toast({
          title: "Verification failed",
          description: result.error ?? "Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: approve ? "Documents Verified" : "Documents Rejected",
        description: approve
          ? "Application moved to site inspection."
          : "Application rejected due to document issues.",
      });
      setSelected(null);

      const refreshed = await getPendingVerifications();
      if (refreshed.success && refreshed.data) {
        setItems(
          refreshed.data.map((it) => ({
            id: it.id,
            applicationNo: it.applicationNo,
            applicantName: it.applicantName,
            mouza: it.mouza,
            documents: it.documents.map((d) => ({
              id: d.id,
              name: d.name,
              url: d.url,
              status: d.status,
            })),
          })),
        );
      }
    });
  };

  const filteredItems = items.filter(
    (it) =>
      it.applicationNo.toLowerCase().includes(search.toLowerCase()) ||
      it.applicantName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <LandConversionLayout
      title="Document Verification"
      description="Verify uploaded documents and proof of ownership."
      icon={FileSearch}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by ID or name..."
              className="pl-10 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
              Pending Queue ({filteredItems.length})
            </h3>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p className="text-sm">Loading queue...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed">
                <p className="text-sm text-gray-500">No applications found</p>
              </div>
            ) : (
              filteredItems.map((it) => (
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
                        className="bg-amber-50 text-amber-700 border-amber-200"
                      >
                        PENDING
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
        </div>
        <div className="lg:col-span-2">
          <Card className="border-blue-100 shadow-sm">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-lg">Verification Panel</CardTitle>
              <CardDescription>
                Review each document carefully before marking as verified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {selected ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100 text-sm">
                    <div>
                      <span className="text-blue-700 font-semibold block uppercase text-[10px]">
                        Application No
                      </span>
                      <span className="font-mono font-bold">
                        {selected.applicationNo}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-700 font-semibold block uppercase text-[10px]">
                        Mouza
                      </span>
                      <span className="font-medium">{selected.mouza}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <FileSearch className="h-4 w-4" />
                      Uploaded Documents
                    </h4>
                    <div className="grid gap-2">
                      {selected.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-white border rounded-md hover:border-blue-300 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded">
                              <FileSearch className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {doc.name}
                              </p>
                              <Badge
                                variant="outline"
                                className="text-[10px] h-4 mt-1"
                              >
                                {doc.status}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            asChild
                          >
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4 border-t">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 h-11"
                      onClick={() => handleVerify(true)}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      All Documents Verified
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 h-11"
                      onClick={() => handleVerify(false)}
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
                  <FileSearch className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">
                    Select an application from the queue to verify documents
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
