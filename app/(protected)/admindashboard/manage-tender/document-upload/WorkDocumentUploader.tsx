"use client";

import React, { useState, useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateWorkDocument } from "@/action/workDocumentActions";
import { toast } from "sonner";
import {
  FileUp,
  Eye,
  FileText,
  Loader2,
  Search,
  Briefcase,
  FileSignature,
  Ruler,
  Handshake,
  Trash2,
  CheckCircle,
  XCircle,
  Upload,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils"; // if you have it, otherwise use a helper

// ---------- Types ----------
type DocumentType =
  | "estimateDocument"
  | "boqDocument"
  | "scrutinySheetDocument"
  | "agreementDocument"
  | "drawingDocument";

interface Work {
  id: string;
  workslno: number;
  finalEstimateAmount: number;
  estimateDocument: string | null;
  boqDocument: string | null;
  scrutinySheetDocument: string | null;
  agreementDocument: string | null;
  drawingDocument: string | null;
  ApprovedActionPlanDetails: {
    activityDescription: string;
    activityCode: string;
  };
}

interface NIT {
  id: string;
  memoNumber: number;
  memoDate: Date;
  nitCount: string;
  WorksDetail: Work[];
}

interface Props {
  nits: NIT[];
}

// ---------- Main Component ----------
export default function WorkDocumentUploader({ nits }: Props) {
  const [selectedNitId, setSelectedNitId] = useState<string>("");
  const [selectedWorkId, setSelectedWorkId] = useState<string>("");

  const selectedNit = nits.find((n) => n.id === selectedNitId);
  const selectedWork = selectedNit?.WorksDetail.find(
    (w) => w.id === selectedWorkId
  );

  // Reset work when NIT changes
  useEffect(() => {
    setSelectedWorkId("");
  }, [selectedNitId]);

  // Generate unique IDs for labels
  const nitSelectId = useId();
  const workSelectId = useId();

  return (
    <div className="space-y-8">
      {/* ---------- Selection Panel ---------- */}
      <section
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 shadow-2xl shadow-slate-900/20 border border-slate-700/50"
        aria-label="Select tender and work"
      >
        <div className="absolute top-0 right-0 h-96 w-96 -mr-10 -mt-10 rounded-full bg-indigo-500/15 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-64 w-64 -ml-10 -mb-10 rounded-full bg-teal-500/10 blur-[60px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/20 p-2">
              <Search className="h-5 w-5 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Select Tender &amp; Work</h2>
          </div>
          <p className="mb-8 pl-1 text-sm text-slate-400">
            Choose an NIT from the list, then select a specific work (by Serial No.) to manage its documents.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* NIT Selector */}
            <div className="space-y-3">
              <label htmlFor={nitSelectId} className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                1. Select NIT
              </label>
              <Select value={selectedNitId} onValueChange={setSelectedNitId}>
                <SelectTrigger
                  id={nitSelectId}
                  className="h-14 w-full rounded-xl border-slate-700 bg-slate-800/50 text-white backdrop-blur-sm transition-colors hover:border-slate-600 focus:ring-indigo-500 placeholder:text-slate-500"
                >
                  <SelectValue placeholder="-- Select NIT Memo --" />
                </SelectTrigger>
                <SelectContent className="max-h-80 rounded-xl border-slate-700 bg-slate-800 text-white shadow-2xl">
                  {nits.map((nit) => {
                    const memoDate = new Date(nit.memoDate).toLocaleDateString();
                    return (
                      <SelectItem
                        key={nit.id}
                        value={nit.id}
                        className="cursor-pointer rounded-lg py-3 focus:bg-slate-700 focus:text-white mx-1"
                      >
                        <span className="font-semibold text-orange-50">
                          Memo: {nit.memoNumber}
                        </span>
                        <span className="ml-2 text-sm text-slate-400">
                          ({nit.nitCount}) • {memoDate}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Work Selector */}
            <div className="space-y-3">
              <label htmlFor={workSelectId} className="ml-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                2. Select Work
              </label>
              <Select
                value={selectedWorkId}
                onValueChange={setSelectedWorkId}
                disabled={!selectedNit || selectedNit.WorksDetail.length === 0}
              >
                <SelectTrigger
                  id={workSelectId}
                  className="h-14 w-full rounded-xl border-slate-700 bg-slate-800/50 text-white backdrop-blur-sm transition-colors hover:border-slate-600 focus:ring-indigo-500 disabled:opacity-40 disabled:hover:border-slate-700 placeholder:text-slate-500"
                >
                  <SelectValue
                    placeholder={
                      !selectedNit
                        ? "Select NIT first"
                        : selectedNit.WorksDetail.length === 0
                          ? "No works found"
                          : "-- Select Work by Sl No --"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-80 rounded-xl border-slate-700 bg-slate-800 text-white shadow-2xl">
                  {selectedNit?.WorksDetail.map((work) => (
                    <SelectItem
                      key={work.id}
                      value={work.id}
                      className="cursor-pointer rounded-lg py-3 focus:bg-slate-700 focus:text-white mx-1"
                    >
                      <div className="flex flex-col items-start text-left">
                        <span className="font-semibold text-orange-50">
                          Sl No. {work.workslno}
                        </span>
                        <span className="mt-1 max-w-[200px] truncate text-xs text-slate-400 sm:max-w-[300px]">
                          {work.ApprovedActionPlanDetails?.activityDescription ||
                            "Unknown Work"}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Work Details / Document Upload ---------- */}
      {selectedWork ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
          <WorkItem work={selectedWork} nitMemo={selectedNit?.memoNumber} />
        </div>
      ) : selectedNit ? (
        <EmptyState
          icon={Briefcase}
          title="No Work Selected"
          description="Please select a Work from the dropdown above to manage its documents."
        />
      ) : (
        <EmptyState
          icon={FileText}
          title="Ready to Upload"
          description="Select an NIT and a Work from the panel above to start managing documents."
        />
      )}
    </div>
  );
}

// ---------- Work Item (Card) ----------
function WorkItem({ work, nitMemo }: { work: Work; nitMemo?: number }) {
  const documentTypes: {
    label: string;
    field: DocumentType;
    value: string | null;
    icon: React.ReactNode;
  }[] = [
      {
        label: "Estimate",
        field: "estimateDocument",
        value: work.estimateDocument,
        icon: <FileText className="h-5 w-5" />,
      },
      {
        label: "BOQ",
        field: "boqDocument",
        value: work.boqDocument,
        icon: <Briefcase className="h-5 w-5" />,
      },
      {
        label: "Scrutiny Sheet",
        field: "scrutinySheetDocument",
        value: work.scrutinySheetDocument,
        icon: <FileSignature className="h-5 w-5" />,
      },
      {
        label: "Agreement",
        field: "agreementDocument",
        value: work.agreementDocument,
        icon: <Handshake className="h-5 w-5" />,
      },
      {
        label: "Drawing",
        field: "drawingDocument",
        value: work.drawingDocument,
        icon: <Ruler className="h-5 w-5" />,
      },
    ];

  return (
    <Card className="overflow-hidden rounded-3xl border-white/60 bg-white/80 shadow-2xl shadow-slate-200/50 backdrop-blur-xl">
      {/* Header */}
      <div className="relative border-b border-slate-100/50 bg-gradient-to-br from-white to-slate-50 p-6 md:p-10">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="outline"
                className="rounded-full border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-700 shadow-sm"
              >
                Sl No. {work.workslno}
              </Badge>
              {nitMemo && (
                <Badge
                  variant="secondary"
                  className="rounded-full border-orange-100 bg-orange-50 px-4 py-1.5 text-xs font-bold text-orange-700 shadow-sm"
                >
                  NIT: {nitMemo}
                </Badge>
              )}
              <span className="rounded-full border-emerald-100 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
                Code: {work.ApprovedActionPlanDetails?.activityCode}
              </span>
            </div>
            <h3 className="max-w-4xl text-2xl font-extrabold leading-tight tracking-tight text-slate-800 md:text-3xl">
              {work.ApprovedActionPlanDetails?.activityDescription ||
                "Unknown Work Description"}
            </h3>
          </div>
          <div className="self-start whitespace-nowrap rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50 px-8 py-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:text-right">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
              Estimated Amount
            </p>
            <p className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-3xl font-black text-transparent">
              ₹ {work.finalEstimateAmount?.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Document Grid */}
      <CardContent className="bg-slate-50/50 p-6 md:p-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-indigo-400 to-indigo-600 shadow-sm shadow-indigo-500/50" />
          <h4 className="text-xl font-bold tracking-tight text-slate-800">
            Document Uploads
          </h4>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {documentTypes.map((doc) => (
            <DocumentUploadField
              key={doc.field}
              workId={work.id}
              label={doc.label}
              field={doc.field}
              currentUrl={doc.value}
              icon={doc.icon}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Individual Document Upload Field ----------
function DocumentUploadField({
  workId,
  label,
  field,
  currentUrl,
  icon,
}: {
  workId: string;
  label: string;
  field: DocumentType;
  currentUrl: string | null;
  icon: React.ReactNode;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  const isUploaded = Boolean(currentUrl);

  // Reset progress when upload finishes
  useEffect(() => {
    if (!isUploading) {
      setProgress(0);
    }
  }, [isUploading]);

  // ---------- Upload Handler (with XHR for progress) ----------
  const handleFileUpload = async (file: File) => {
    setErrorMsg(null);
    if (!file) return;

    if (file.type !== "application/pdf") {
      const msg = "Only PDF files are allowed.";
      setErrorMsg(msg);
      toast.error(msg);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 500 * 1024) {
      const msg = "File size must be less than 500 KB.";
      setErrorMsg(msg);
      toast.error(msg);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      setIsUploading(true);
      setProgress(0);

      // 1. Upload to Cloudinary via XHR to track progress
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "tender-documents");

      const uploadUrl = "/api/upload";

      const xhr = new XMLHttpRequest();
      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.open("POST", uploadUrl);
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setProgress(percent);
          }
        });
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              if (data.url) resolve(data.url);
              else reject(new Error("No URL returned"));
            } catch {
              reject(new Error("Invalid response"));
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(formData);
      });

      const uploadedUrl = await uploadPromise;

      // 2. Save to Database
      const res = await updateWorkDocument(workId, field, uploadedUrl);
      if (res.success) {
        toast.success(`${label} uploaded successfully!`, {
          action: {
            label: "View",
            onClick: () => window.open(uploadedUrl, "_blank"),
          },
        });
      } else {
        throw new Error(res.error || "Database update failed");
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to upload ${label}`);
    } finally {
      setIsUploading(false);
      setProgress(0);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ---------- Delete Handler ----------
  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete the ${label} document?`)) return;
    try {
      const res = await updateWorkDocument(workId, field, null);
      if (res.success) {
        toast.success(`${label} document removed.`);
      } else {
        throw new Error(res.error);
      }
    } catch (error) {
      console.error(error);
      toast.error(`Failed to delete ${label}`);
    }
  };

  // ---------- Drag & Drop ----------
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // ---------- Render ----------
  return (
    <div
      className={cn(
        "group relative flex min-h-[280px] flex-col justify-between gap-4 rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1",
        isUploaded
          ? "border-emerald-200 bg-gradient-to-b from-emerald-50/80 to-white shadow-lg shadow-emerald-100/40"
          : "border-slate-200 bg-white shadow-sm hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/50",
        isDragging && "scale-[1.02] ring-2 ring-indigo-400 ring-offset-2"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      aria-label={`Upload ${label} document`}
    >
      {/* Status indicator */}
      <div className="absolute right-4 top-4 flex items-center gap-2">
        {isUploaded ? (
          <CheckCircle className="h-5 w-5 text-emerald-500" aria-hidden="true" />
        ) : (
          <XCircle className="h-5 w-5 text-slate-300" aria-hidden="true" />
        )}
        <span className="sr-only">{isUploaded ? "Uploaded" : "Not uploaded"}</span>
      </div>

      {/* Icon & Label */}
      <div className="mt-2 flex flex-col items-center gap-4 text-center">
        <div
          className={cn(
            "rounded-2xl p-4 transition-all duration-300 group-hover:scale-110",
            isUploaded
              ? "bg-emerald-100 text-emerald-600 shadow-inner shadow-emerald-200/50"
              : "bg-slate-50 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-500"
          )}
        >
          {icon}
        </div>
        <span className="text-[15px] font-bold text-slate-800">{label}</span>
        <span className="text-xs font-medium text-slate-500">
          {isUploaded ? "Uploaded" : "Pending"}
        </span>
      </div>

      {/* Actions */}
      <div className="mt-auto flex w-full flex-col gap-3">
        {currentUrl ? (
          <div className="flex w-full gap-2">
            <Button
              size="sm"
              variant="outline"
              asChild
              className="flex-1 border-emerald-200 bg-white text-emerald-600 shadow-sm transition-colors hover:bg-emerald-50 hover:text-emerald-700 h-11 rounded-xl font-bold"
            >
              <Link href={currentUrl} target="_blank" rel="noopener noreferrer">
                <Eye className="mr-2 h-4 w-4" /> View
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              className="h-11 w-11 rounded-xl border border-red-200 text-red-500 hover:bg-red-50"
              aria-label={`Delete ${label} document`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center text-xs font-bold uppercase tracking-widest text-slate-400/80">
            No file uploaded
          </div>
        )}

        {/* Upload area */}
        <div className="relative w-full">
          <Input
            ref={fileInputRef}
            id={id}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            disabled={isUploading}
            accept=".pdf"
            aria-label={`Upload ${label} file`}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="sm"
            variant={isUploaded ? "secondary" : "default"}
            disabled={isUploading}
            className={cn(
              "h-11 w-full rounded-xl font-bold transition-all",
              isUploaded
                ? "border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200"
                : "bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg hover:from-slate-700 hover:to-slate-800 group-hover:shadow-indigo-500/20"
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {progress > 0 ? `${progress}%` : "Uploading..."}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {isUploaded ? "Replace File" : "Upload File"}
              </>
            )}
          </Button>
        </div>

        {/* Progress bar (shown only during upload) */}
        {isUploading && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-teal-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {/* Error message */}
        {errorMsg && (
          <div className="mt-1 text-center text-xs font-semibold text-red-500">
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Empty State Component ----------
function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300/80 bg-white/50 py-24 backdrop-blur-sm shadow-sm">
      <div className="mb-4 rounded-full bg-slate-100 p-4">
        <Icon className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-700">{title}</h3>
      <p className="mt-2 max-w-sm text-center text-slate-500">{description}</p>
    </div>
  );
}