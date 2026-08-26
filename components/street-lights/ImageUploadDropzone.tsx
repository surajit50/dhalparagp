"use client";

import { useMemo, useState, useCallback, useRef } from "react";
import { Loader2, X, Camera, Upload, CheckCircle2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { compressImageWithDetails, formatBytes, DEFAULT_TARGET_SIZE_BYTES } from "@/lib/utils/image";
import { Button } from "@/components/ui/button";

type IconVariant = "upload" | "camera";

interface ImageUploadDropzoneProps {
  preview: string | null;
  uploading: boolean;
  onFile: (file: File) => void;
  onClear: () => void;
  label?: string;
  sublabel?: string;
  iconVariant?: IconVariant;
  accept?: string;
  className?: string;
  previewHeight?: string;
  compress?: boolean;
  targetSizeBytes?: number;
}

export function ImageUploadDropzone({
  preview,
  uploading,
  onFile,
  onClear,
  label = "Take photo or upload image",
  sublabel = "Auto-optimized to ≤ 200 KB for fast upload",
  iconVariant = "camera",
  accept = "image/*",
  className,
  previewHeight = "h-44",
  compress = true,
  targetSizeBytes = DEFAULT_TARGET_SIZE_BYTES,
}: ImageUploadDropzoneProps) {
  const [compressing, setCompressing] = useState(false);
  const [compressStats, setCompressStats] = useState<{
    size: number;
    reduction: number;
  } | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const busy = uploading || compressing;

  const handleProcessFile = useCallback(
    async (file: File) => {
      if (!compress) {
        setCompressStats({ size: file.size, reduction: 0 });
        onFile(file);
        return;
      }

      setCompressing(true);
      try {
        const res = await compressImageWithDetails(file, { targetSizeBytes });
        setCompressStats({
          size: res.compressedSizeBytes,
          reduction: res.reductionPercentage,
        });
        onFile(res.file);
      } catch (err) {
        console.warn("Image compression failed, using original:", err);
        setCompressStats({ size: file.size, reduction: 0 });
        onFile(file);
      } finally {
        setCompressing(false);
      }
    },
    [compress, onFile, targetSizeBytes]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (file) {
        handleProcessFile(file);
      }
    },
    [handleProcessFile]
  );

  const handleClear = useCallback(() => {
    setCompressStats(null);
    onClear();
  }, [onClear]);

  const statusLabel = useMemo(() => {
    if (compressing) return "Optimizing to ≤ 200 KB…";
    if (uploading) return "Uploading to server…";
    return label;
  }, [compressing, uploading, label]);

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={cameraInputRef}
        type="file"
        accept={accept}
        capture="environment"
        className="hidden"
        onChange={handleInputChange}
        disabled={busy}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
        disabled={busy}
      />

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/30 bg-muted/20 shadow-sm group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className={cn("w-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-[1.01]", previewHeight)}
          />

          {/* Top-right overlay actions */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={busy}
              className="bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 backdrop-blur-sm transition-all"
              title="Retake photo"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={busy}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-md transition-all"
              title="Remove photo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom status badge */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-black/75 text-emerald-300 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-500/30 shadow-sm">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {compressStats ? `${formatBytes(compressStats.size)} (Optimized)` : "Ready"}
            </span>
            {uploading && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-600 text-white px-2.5 py-1 rounded-full shadow-sm animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" /> Uploading…
              </span>
            )}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "rounded-2xl border-2 border-dashed border-border/80 bg-card/60 p-4 transition-all duration-200",
            "hover:border-orange-400 hover:bg-orange-50/20",
            busy && "opacity-75 pointer-events-none"
          )}
        >
          <div className="flex flex-col items-center text-center gap-3">
            {busy ? (
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center text-orange-600">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center text-orange-600">
                {iconVariant === "camera" ? (
                  <Camera className="w-6 h-6" />
                ) : (
                  <Upload className="w-6 h-6" />
                )}
              </div>
            )}

            <div>
              <p className="text-sm font-semibold text-foreground">{statusLabel}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
            </div>

            <div className="flex gap-2 w-full max-w-xs mt-1">
              <Button
                type="button"
                variant="default"
                size="sm"
                className="flex-1 gap-1.5 h-9 bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
                onClick={() => cameraInputRef.current?.click()}
                disabled={busy}
              >
                <Camera className="w-4 h-4" />
                Take Photo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 h-9"
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
              >
                <Upload className="w-4 h-4" />
                Choose File
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

