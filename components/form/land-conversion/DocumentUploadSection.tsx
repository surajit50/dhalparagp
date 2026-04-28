"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, File } from "lucide-react";

interface DocumentUploadSectionProps {
  createdApplicationId: string;
  uploadingDoc: "ID_PROOF" | "LAND_DOCUMENT" | null;
  handleDocumentUpload: (type: "ID_PROOF" | "LAND_DOCUMENT", file: File) => Promise<void>;
}

export default function DocumentUploadSection({
  createdApplicationId,
  uploadingDoc,
  handleDocumentUpload,
}: DocumentUploadSectionProps) {
  if (!createdApplicationId) return null;

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-blue-600" />
          Upload documents
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Upload ID proof and land documents for this application.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="text-sm font-medium leading-none">ID proof (PDF or image)</div>
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleDocumentUpload("ID_PROOF", f);
                  e.target.value = "";
                }}
                disabled={!!uploadingDoc}
                className="max-w-xs bg-white"
              />
              {uploadingDoc === "ID_PROOF" && (
                <span className="text-sm text-blue-600 animate-pulse font-medium">Uploading...</span>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium leading-none">Land document (PDF or image)</div>
            <div className="flex items-center gap-3">
              <Input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleDocumentUpload("LAND_DOCUMENT", f);
                  e.target.value = "";
                }}
                disabled={!!uploadingDoc}
                className="max-w-xs bg-white"
              />
              {uploadingDoc === "LAND_DOCUMENT" && (
                <span className="text-sm text-blue-600 animate-pulse font-medium">Uploading...</span>
              )}
            </div>
          </div>
        </div>
        <div className="p-3 rounded-md bg-amber-50 border border-amber-100 flex items-center gap-2">
          <File className="h-4 w-4 text-amber-600" />
          <p className="text-xs text-amber-700">
            Max 5MB per file. Supported formats: PDF, JPEG, PNG, WebP.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
