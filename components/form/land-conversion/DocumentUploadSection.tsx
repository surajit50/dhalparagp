"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Upload,
  File,
  CheckCircle2,
  X,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentUploadSectionProps {
  idProofFile: File | null;
  landDocFile: File | null;
  setIdProofFile: (file: File | null) => void;
  setLandDocFile: (file: File | null) => void;
  uploadingDoc: "ID_PROOF" | "LAND_DOCUMENT" | null;
  isAdminOrSuperAdmin?: boolean;
}

export default function DocumentUploadSection({
  idProofFile,
  landDocFile,
  setIdProofFile,
  setLandDocFile,
  uploadingDoc,
  isAdminOrSuperAdmin = false,
}: DocumentUploadSectionProps) {
  return (
    <Card className="shadow-sm border-amber-100">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50/50 border-b border-amber-100">
        <CardTitle className="text-amber-800 text-lg flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Upload className="h-4 w-4 text-amber-600" />
          </div>
          Upload Documents
        </CardTitle>
        <p className="text-sm text-amber-600/70 mt-1">
          Upload ID proof and land documents for this application
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-orange-100 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-orange-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  ID Proof (PDF or Image) {!isAdminOrSuperAdmin && " *"}
                </span>
                {isAdminOrSuperAdmin && (
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    Optional
                  </span>
                )}
              </div>
              {idProofFile && (
                <span className="text-xs text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  Selected
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
                  className="h-11 bg-slate-50/50 border-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
                {uploadingDoc === "ID_PROOF" && (
                  <span className="text-sm text-orange-600 animate-pulse font-medium flex items-center gap-1">
                    <div className="h-2 w-2 bg-orange-500 rounded-full animate-bounce"></div>
                    Uploading...
                  </span>
                )}
              </div>
              {idProofFile && (
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-gradient-to-r from-slate-50 to-orange-50 p-3 rounded-xl border border-orange-100 shadow-sm">
                  <File className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  <span className="truncate max-w-[200px] font-medium">
                    {idProofFile.name}
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {(idProofFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                      onClick={() => setIdProofFile(null)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  Land Document (PDF or Image) {!isAdminOrSuperAdmin && " *"}
                </span>
                {isAdminOrSuperAdmin && (
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    Optional
                  </span>
                )}
              </div>
              {landDocFile && (
                <span className="text-xs text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
                  <CheckCircle2 className="h-3 w-3" />
                  Selected
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
                  className="h-11 bg-slate-50/50 border-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {uploadingDoc === "LAND_DOCUMENT" && (
                  <span className="text-sm text-emerald-600 animate-pulse font-medium flex items-center gap-1">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    Uploading...
                  </span>
                )}
              </div>
              {landDocFile && (
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-gradient-to-r from-slate-50 to-emerald-50 p-3 rounded-xl border border-emerald-100 shadow-sm">
                  <File className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="truncate max-w-[200px] font-medium">
                    {landDocFile.name}
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {(landDocFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                      onClick={() => setLandDocFile(null)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <File className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800">
              Document Requirements
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Max 5MB per file. Supported formats: PDF, JPEG, PNG, WebP.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
