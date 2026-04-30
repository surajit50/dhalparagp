"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, File, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentUploadSectionProps {
  idProofFile: File | null;
  landDocFile: File | null;
  setIdProofFile: (file: File | null) => void;
  setLandDocFile: (file: File | null) => void;
  uploadingDoc: "ID_PROOF" | "LAND_DOCUMENT" | null;
}

export default function DocumentUploadSection({
  idProofFile,
  landDocFile,
  setIdProofFile,
  setLandDocFile,
  uploadingDoc,
}: DocumentUploadSectionProps) {
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
            <div className="text-sm font-medium leading-none flex items-center justify-between">
              <span>ID proof (PDF or image) *</span>
              {idProofFile && (
                <span className="text-xs text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Selected
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setIdProofFile(f);
                    e.target.value = "";
                  }}
                  disabled={!!uploadingDoc}
                  className="max-w-xs bg-white"
                />
                {uploadingDoc === "ID_PROOF" && (
                  <span className="text-sm text-blue-600 animate-pulse font-medium">
                    Uploading...
                  </span>
                )}
              </div>
              {idProofFile && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 p-2 rounded border border-slate-200 w-fit max-w-full">
                  <File className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate max-w-[150px]">
                    {idProofFile.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-slate-400 hover:text-red-500"
                    onClick={() => setIdProofFile(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium leading-none flex items-center justify-between">
              <span>Land document (PDF or image) *</span>
              {landDocFile && (
                <span className="text-xs text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Selected
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setLandDocFile(f);
                    e.target.value = "";
                  }}
                  disabled={!!uploadingDoc}
                  className="max-w-xs bg-white"
                />
                {uploadingDoc === "LAND_DOCUMENT" && (
                  <span className="text-sm text-blue-600 animate-pulse font-medium">
                    Uploading...
                  </span>
                )}
              </div>
              {landDocFile && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 p-2 rounded border border-slate-200 w-fit max-w-full">
                  <File className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate max-w-[150px]">
                    {landDocFile.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 text-slate-400 hover:text-red-500"
                    onClick={() => setLandDocFile(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
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
