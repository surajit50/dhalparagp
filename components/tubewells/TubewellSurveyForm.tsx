"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Zap,
  MapPin,
  Save,
  Target,
  CheckCircle2,
  ListPlus,
  ExternalLink,
  Info,
  Calendar,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ImageUploadDropzone } from "@/components/street-lights/ImageUploadDropzone";
import { TubewellSurveySchema, type TubewellSurveyInput } from "@/schema/tubewell";
import { createTubewell } from "@/action/tubewell";
import { MouzaSelector } from "./MouzaSelector";
import { LandmarkSuggestions } from "./LandmarkSuggestions";

export function TubewellSurveyForm() {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lastSavedNumber, setLastSavedNumber] = useState<string | null>(null);

  const landmarkInputRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TubewellSurveyInput>({
    resolver: zodResolver(TubewellSurveySchema),
    defaultValues: {
      tubewellType: "MARK_II",
      condition: "WORKING",
      mouza: "",
      mouzaId: "",
      sansad: "",
      ward: "",
      landmark: "",
      remarks: "",
    },
  });

  const currentMouza = watch("mouza");
  const currentMouzaId = watch("mouzaId");
  const currentSansad = watch("sansad");
  const currentWard = watch("ward");
  const currentLandmark = watch("landmark");

  const handleCaptureGps = () => {
    if ("geolocation" in navigator) {
      toast.loading("Capturing GPS coordinates...", { id: "gps-fetch" });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue("latitude", position.coords.latitude, { shouldValidate: true });
          setValue("longitude", position.coords.longitude, { shouldValidate: true });
          toast.success("📍 GPS location captured successfully!", { id: "gps-fetch" });
        },
        (error) => {
          toast.error("Failed to get GPS location: " + error.message, { id: "gps-fetch" });
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "tubewells");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      const uploadedUrl = data.url || data.fileUrl;

      setValue("imageUrl", uploadedUrl, { shouldValidate: true });
      setValue("imagePublicId", data.publicId);
      setImagePreview(uploadedUrl);
      toast.success("📸 Photo uploaded successfully!");
    } catch (error) {
      toast.error("Photo upload failed");
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setValue("imageUrl", undefined);
    setValue("imagePublicId", undefined);
  };

  const onSubmit = async (data: TubewellSurveyInput) => {
    setLoading(true);
    try {
      const res = await createTubewell({
        tubewellType: data.tubewellType,
        condition: data.condition,
        mouza: data.mouza,
        mouzaId: data.mouzaId || undefined,
        sansad: data.sansad || undefined,
        ward: data.ward || undefined,
        landmark: data.landmark,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        installYear: data.installYear ? Number(data.installYear) : undefined,
        remarks: data.remarks || undefined,
        imageUrl: data.imageUrl,
        imagePublicId: data.imagePublicId,
      });

      const assignedNo = res?.tubewellNo || "New Tubewell";
      setLastSavedNumber(assignedNo);
      toast.success(`🎉 Survey saved! Assigned No: ${assignedNo}`);

      // Reset form while keeping the current Mouza, Sansad & Ward intact for easy sequential surveys
      reset({
        tubewellType: "MARK_II",
        condition: "WORKING",
        mouza: data.mouza,
        mouzaId: data.mouzaId,
        sansad: data.sansad,
        ward: data.ward,
        landmark: "",
        remarks: "",
        latitude: undefined,
        longitude: undefined,
        imageUrl: undefined,
        imagePublicId: undefined,
        installYear: undefined,
      });
      setImagePreview(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save survey";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-xs">
        <div className="flex items-center gap-2 font-medium text-blue-800 dark:text-blue-300">
          <Zap className="w-4 h-4 text-blue-600 animate-pulse" />
          <span>Quick Field Survey</span>
        </div>
        <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
          Auto ID on Save (e.g. DGP-TW/{new Date().getFullYear()}/...)
        </span>
      </div>

      {/* Success banner if previous survey was saved */}
      {lastSavedNumber && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 dark:bg-emerald-950/30 dark:border-emerald-800 p-4 space-y-2 text-emerald-900 dark:text-emerald-200 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="font-semibold text-sm">
              Tubewell <span className="font-mono underline">{lastSavedNumber}</span> recorded successfully!
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            The form is ready for the next entry. The selected Mouza is preserved for your convenience.
          </p>
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-8 gap-1.5 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
              asChild
            >
              <Link href="/admindashboard/tubewell/register">
                <ExternalLink className="w-3.5 h-3.5" />
                View Register
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs h-8 text-muted-foreground"
              onClick={() => setLastSavedNumber(null)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Location & Mouza (Crucial for GP survey) */}
        <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-card overflow-hidden shadow-sm p-5 space-y-5 transition-all hover:shadow-md">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground">
              <MapPin className="w-4 h-4 text-blue-500" /> Mouza & Location Area
            </h3>
            <span className="text-[11px] text-muted-foreground font-medium">Step 1 of 4</span>
          </div>

          {/* Mouza Selection */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>
                Mouza Name <span className="text-destructive">*</span>
              </span>
              <span className="text-[11px] text-muted-foreground">
                Required for asset mapping
              </span>
            </Label>
            <Controller
              control={control}
              name="mouza"
              render={({ field }) => (
                <MouzaSelector
                  selectedMouza={field.value}
                  selectedMouzaId={currentMouzaId}
                  selectedSansad={currentSansad}
                  selectedWard={currentWard}
                  onSelect={(m) => {
                    field.onChange(m.mouzaName);
                    setValue("mouzaId", m.mouzaId || "", { shouldValidate: true });
                    if (m.sansad) setValue("sansad", m.sansad);
                    if (m.ward) setValue("ward", m.ward);
                  }}
                  error={errors.mouza?.message}
                />
              )}
            />
          </div>

          {/* Gram Sansad & Ward (Optional/Auto-filled) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Gram Sansad</Label>
              <Input
                {...register("sansad")}
                placeholder="e.g. Sansad I"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Ward No.</Label>
              <Input
                {...register("ward")}
                placeholder="e.g. Ward 03"
                className="h-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Landmark & Location Description */}
        <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-card overflow-hidden shadow-sm p-5 space-y-5 transition-all hover:shadow-md">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground">
              <Target className="w-4 h-4 text-blue-500" /> Landmark & GPS
            </h3>
            <span className="text-[11px] text-muted-foreground font-medium">Step 2 of 4</span>
          </div>

          {/* Landmark Input with Suggestions */}
          <div className="space-y-2">
            <Label className="flex items-center justify-between">
              <span>
                Landmark / Location Name <span className="text-destructive">*</span>
              </span>
              <span className="text-[11px] text-muted-foreground">
                Near house of..., etc.
              </span>
            </Label>

            {/* Quick Suggestion Chips */}
            <LandmarkSuggestions
              value={currentLandmark || ""}
              onChange={(nextVal) => setValue("landmark", nextVal, { shouldValidate: true })}
              targetInputRef={landmarkInputRef}
              className="mb-2 p-3 bg-muted/40 rounded-xl border border-border/50"
            />

            <Textarea
              {...register("landmark")}
              ref={(e) => {
                register("landmark").ref(e);
                landmarkInputRef.current = e;
              }}
              placeholder="e.g. Near house of Ramesh Mondal, Lalpur Primary School Gate"
              rows={2}
              className={`text-sm resize-none ${errors.landmark ? "border-destructive" : ""}`}
            />
            {errors.landmark && (
              <p className="text-xs text-destructive">{errors.landmark.message}</p>
            )}
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>
                Tip: Most tubewells are identified by resident names (e.g. <em>Near house of [Name]</em>) or nearby schools/temples.
              </span>
            </p>
          </div>

          {/* GPS Coordinates */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label>
                GPS Coordinates <span className="text-destructive">*</span>
              </Label>
              <span className="text-[11px] text-muted-foreground font-mono">
                {watch("latitude") && watch("longitude") ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Coordinates locked
                  </span>
                ) : (
                  "Required"
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={control}
                name="latitude"
                render={({ field }) => (
                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-1">Latitude</span>
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g. 25.12345"
                      value={field.value !== undefined && field.value !== null ? field.value : ""}
                      onChange={(e) =>
                        field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                      }
                      className={`font-mono text-xs ${errors.latitude ? "border-destructive" : ""}`}
                    />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="longitude"
                render={({ field }) => (
                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-1">Longitude</span>
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g. 88.54321"
                      value={field.value !== undefined && field.value !== null ? field.value : ""}
                      onChange={(e) =>
                        field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                      }
                      className={`font-mono text-xs ${errors.longitude ? "border-destructive" : ""}`}
                    />
                  </div>
                )}
              />
            </div>
            {(errors.latitude || errors.longitude) && (
              <p className="text-xs text-destructive">
                GPS coordinates are required. Tap the button below to capture automatically.
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950 transition-colors h-10"
              onClick={handleCaptureGps}
            >
              <MapPin className="w-4 h-4 text-blue-600" /> Capture Current Location
            </Button>
          </div>
        </div>

        {/* Section 3: Tubewell Technical Details */}
        <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-card overflow-hidden shadow-sm p-5 space-y-5 transition-all hover:shadow-md">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground">
              <Zap className="w-4 h-4 text-blue-500" /> Tubewell Specifications
            </h3>
            <span className="text-[11px] text-muted-foreground font-medium">Step 3 of 4</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tubewell Type */}
            <div className="space-y-2">
              <Label>
                Tubewell Type <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="tubewellType"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={errors.tubewellType ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MARK_II">Mark II (Deep Tubewell)</SelectItem>
                      <SelectItem value="ORDINARY">Ordinary (Hand Pump)</SelectItem>
                      <SelectItem value="SUBMERSIBLE">Submersible Pump</SelectItem>
                      <SelectItem value="MINI_PIPED">Mini Piped Water</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.tubewellType && (
                <p className="text-xs text-destructive">{errors.tubewellType.message}</p>
              )}
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <Label>
                Condition <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="condition"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={errors.condition ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WORKING">Working (Operational)</SelectItem>
                      <SelectItem value="DEFECTIVE">Defective (Needs Repair)</SelectItem>
                      <SelectItem value="ABANDONED">Abandoned / Beyond Repair</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.condition && (
                <p className="text-xs text-destructive">{errors.condition.message}</p>
              )}
            </div>
          </div>

          {/* Optional: Year of Installation & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="space-y-1.5 sm:col-span-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Install Year
              </Label>
              <Input
                type="number"
                placeholder={`e.g. ${new Date().getFullYear()}`}
                {...register("installYear", {
                  setValueAs: (v) => (v === "" || v === undefined ? undefined : Number(v)),
                })}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Remarks / Note
              </Label>
              <Input
                {...register("remarks")}
                placeholder="Optional notes or surveyor observation"
                className="h-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Photo Upload */}
        <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-card overflow-hidden shadow-sm p-5 space-y-4 transition-all hover:shadow-md">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-semibold text-sm flex items-center gap-2 text-foreground">
              <Zap className="w-4 h-4 text-blue-500" /> Photo Upload
            </h3>
            <span className="text-[11px] text-muted-foreground font-medium">Step 4 of 4</span>
          </div>
          <div className="px-1 pb-1">
            <ImageUploadDropzone
              onFile={uploadImage}
              uploading={uploading}
              preview={imagePreview}
              onClear={clearImage}
              label="Capture Tubewell Photo"
              sublabel="Take a clear photo showing the pump, foundation, and surrounding area"
            />
          </div>
        </div>

        {/* Submit Action */}
        <Button
          type="submit"
          disabled={loading || uploading}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/35 rounded-xl cursor-pointer"
        >
          {loading ? (
            "Saving Survey Record..."
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" /> Save Tubewell Survey
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
