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
    <Card className="shadow-lg border-indigo-100/60 bg-white/70 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-indigo-200/60 mt-8">
      <CardHeader className="bg-gradient-to-r from-indigo-50/80 to-transparent border-b border-indigo-100/60 pb-5">
        <CardTitle className="text-indigo-900 text-xl flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-indigo-50">
            <Upload className="h-5 w-5 text-indigo-600" />
          </div>
          Upload Documents
        </CardTitle>
        <p className="text-sm text-indigo-600/70 mt-2 font-medium">
          Upload ID proof and land documents for this application
        </p>
      </CardHeader>
      <CardContent className="space-y-8 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100/50">
                  <ShieldCheck className="h-4 w-4 text-indigo-500" />
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  ID Proof (PDF or Image) {!isAdminOrSuperAdmin && " *"}
                </span>
                {isAdminOrSuperAdmin && (
                  <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200/60">
                    Optional
                  </span>
                )}
              </div>
              {idProofFile && (
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/50">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Selected
                </span>
              )}
            </div>
            <div className="flex flex-col gap-3">
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
                  className="h-12 bg-white/50 border-slate-200/80 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all shadow-sm rounded-xl cursor-pointer"
                />
                {uploadingDoc === "ID_PROOF" && (
                  <span className="text-sm text-indigo-600 animate-pulse font-medium flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg">
                    <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    Uploading...
                  </span>
                )}
              </div>
              {idProofFile && (
                <div className="flex items-center gap-3 text-sm text-slate-600 bg-white/80 p-3.5 rounded-xl border border-indigo-100/60 shadow-sm transition-all hover:border-indigo-200 group">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <File className="h-4 w-4 text-indigo-500" />
                  </div>
                  <span className="truncate max-w-[180px] font-medium group-hover:text-indigo-700 transition-colors">
                    {idProofFile.name}
                  </span>
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-md">
                      {(idProofFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all border border-transparent hover:border-rose-100"
                      onClick={() => setIdProofFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100/50">
                  <FileText className="h-4 w-4 text-indigo-500" />
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  Land Document (PDF or Image) {!isAdminOrSuperAdmin && " *"}
                </span>
                {isAdminOrSuperAdmin && (
                  <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200/60">
                    Optional
                  </span>
                )}
              </div>
              {landDocFile && (
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/50">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Selected
                </span>
              )}
            </div>
            <div className="flex flex-col gap-3">
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
                  className="h-12 bg-white/50 border-slate-200/80 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all shadow-sm rounded-xl cursor-pointer"
                />
                {uploadingDoc === "LAND_DOCUMENT" && (
                  <span className="text-sm text-indigo-600 animate-pulse font-medium flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg">
                    <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    Uploading...
                  </span>
                )}
              </div>
              {landDocFile && (
                <div className="flex items-center gap-3 text-sm text-slate-600 bg-white/80 p-3.5 rounded-xl border border-indigo-100/60 shadow-sm transition-all hover:border-indigo-200 group">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <File className="h-4 w-4 text-indigo-500" />
                  </div>
                  <span className="truncate max-w-[180px] font-medium group-hover:text-indigo-700 transition-colors">
                    {landDocFile.name}
                  </span>
                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-md">
                      {(landDocFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all border border-transparent hover:border-rose-100"
                      onClick={() => setLandDocFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl bg-gradient-to-r from-indigo-50/50 to-white border border-indigo-100/60 flex items-start gap-4 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-indigo-100/50 flex items-center justify-center flex-shrink-0 border border-indigo-200/50 mt-0.5">
            <File className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-indigo-900">
              Document Requirements
            </p>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Ensure files are clear and readable. <strong className="font-medium text-slate-700">Max 5MB</strong> per file. <br />
              Supported formats: <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider">PDF</span> <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider">JPEG</span> <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider">PNG</span> <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider">WEBP</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
