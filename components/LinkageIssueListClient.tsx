"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  FilePlus,
  User,
  ClipboardList,
} from "lucide-react";
import { issueLinkageCertificate } from "@/action/linkage-actions";
import { toast } from "@/components/ui/use-toast";
import { useFormStatus } from "react-dom";
import { useLinkageTable } from "@/hooks/use-linkage-table";

type LinkageApplication = {
  id: string;
  applicationNo: string;
  applicantName: string;
};

type Props = {
  initialItems: LinkageApplication[];
  gpInfo: {
    nameinprodhan: string;
    gpname: string;
  } | null;
};

export default function LinkageIssueListClient({
  initialItems,
  gpInfo,
}: Props) {
  const {
    q,
    setQ,
    page,
    setPage,
    pageSize,
    items,
    total,
    loading,
    refresh,
    totalPages,
  } = useLinkageTable<LinkageApplication>({
    apiEndpoint: "/api/linkage/issue-ready",
    initialItems,
  });

  const [selectedApp, setSelectedApp] = useState<LinkageApplication | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleIssueSelect = (app: LinkageApplication) => {
    setSelectedApp(app);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-50 dark:from-orange-950/20 dark:to-orange-950/20 col-span-1 md:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-800/30 text-orange-600 dark:text-orange-400">
                <FilePlus className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  Ready for Issuance
                </CardTitle>
                <CardDescription>
                  Linkage applications verified and ready for certificate
                  generation.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">{total}</div>
              <div className="text-sm text-gray-500">pending applications</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-4 w-4" /> Search Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by app no or name..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="bg-white dark:bg-gray-800"
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="shadow-lg border-0 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-100 dark:bg-gray-900">
                <TableRow>
                  <TableHead className="w-16 text-center">#</TableHead>
                  <TableHead>Application No</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length > 0 ? (
                  items.map((app, index) => (
                    <TableRow
                      key={app.id}
                      className="hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-colors"
                    >
                      <TableCell className="text-center text-gray-500">
                        {(page - 1) * pageSize + index + 1}
                      </TableCell>
                      <TableCell className="font-semibold text-orange-700">
                        {app.applicationNo}
                      </TableCell>
                      <TableCell className="font-medium">
                        {app.applicantName}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleIssueSelect(app)}
                          className="bg-orange-700 hover:bg-orange-800 text-white"
                        >
                          <ClipboardList className="h-4 w-4 mr-2" />
                          Issue Now
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-32 text-center text-gray-500 italic"
                    >
                      {loading
                        ? "Loading data..."
                        : "No applications ready for issuance found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {items.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t bg-gray-50/50">
              <div className="text-sm text-gray-500">
                Page {page} of {totalPages} ({total} applications total)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Issue Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <FilePlus className="h-5 w-5 text-orange-600" />
              Issue Professional Linkage Certificate
            </DialogTitle>
          </DialogHeader>

          {selectedApp && (
            <form
              action={async (formData) => {
                const res = await issueLinkageCertificate({
                  applicationId: selectedApp.id,
                  certificateNo: String(formData.get("certificateNo")),
                  memoNo: String(formData.get("memoNo")),
                  referenceNo: String(formData.get("referenceNo")),
                  certificateType: String(formData.get("certificateType")),
                  signedBy: String(formData.get("signedBy")),
                  signedDesignation: String(formData.get("signedDesignation")),
                  certificateBody: String(formData.get("certificateBody")),
                });

                if (res.success) {
                  toast({
                    title: "Certificate Issued",
                    description:
                      "The certificate has been generated successfully.",
                  });
                  setIsDialogOpen(false);
                  refresh();
                } else {
                  toast({
                    title: "Issue Failed",
                    description: res.error,
                    variant: "destructive",
                  });
                }
              }}
              className="space-y-4 py-4"
            >
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 mb-2">
                <p className="text-sm">
                  <strong>Applicant:</strong> {selectedApp.applicantName}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="certificateNo">Certificate No *</Label>
                  <Input
                    id="certificateNo"
                    name="certificateNo"
                    required
                    placeholder="e.g. CERT-2026-001"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="memoNo">Memo No</Label>
                  <Input
                    id="memoNo"
                    name="memoNo"
                    placeholder="e.g. MEMO/123/24"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="referenceNo">Reference No</Label>
                  <Input
                    id="referenceNo"
                    name="referenceNo"
                    placeholder="Reference ID"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="certificateType">Type Heading</Label>
                  <Input
                    id="certificateType"
                    name="certificateType"
                    defaultValue="Legal Heir / Family Linkage Certificate"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="signedBy">Signed By</Label>
                  <Input
                    id="signedBy"
                    name="signedBy"
                    defaultValue={gpInfo?.nameinprodhan || ""}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signedDesignation">Designation</Label>
                  <Input
                    id="signedDesignation"
                    name="signedDesignation"
                    defaultValue="Pradhan"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="certificateBody">
                  Custom Body Text (Optional)
                </Label>
                <Textarea
                  id="certificateBody"
                  name="certificateBody"
                  placeholder="Leave blank to use standard linkage template text..."
                  rows={3}
                />
              </div>

              <DialogFooter className="pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <SubmitButton />
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-orange-700 hover:bg-orange-800"
    >
      {pending ? "Issuing..." : "Issue Professional Certificate"}
    </Button>
  );
}
