"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useSWR from "swr";
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  Crosshair,
} from "lucide-react";
import { StreetLightSchema, type StreetLightInput } from "@/schema/street-light";
import {
  LIGHT_TYPE_OPTIONS,
  POLE_TYPE_OPTIONS,
  OWNERSHIP_OPTIONS,
  LIGHT_CONDITION_OPTIONS,
  WORKING_STATUS_OPTIONS,
} from "@/lib/utils/street-light";
import { fetcher } from "@/lib/utils";
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
import { GPSCaptureButton } from "./GPSCaptureButton";
import { LightIDBadge } from "./LightIDBadge";
import { ImageUploadDropzone } from "./ImageUploadDropzone";

interface MouzaOption {
  id: string;
  mouzaName: string;
  mouzaCode: string;
  sansadCode?: string;
}

interface StreetLightFormProps {
  defaultValues?: Partial<StreetLightInput>;
  lightDbId?: string;
  existingLightId?: string;
}

export function StreetLightForm({
  defaultValues,
  lightDbId,
  existingLightId,
}: StreetLightFormProps) {
  const router = useRouter();
  const isEdit = !!lightDbId;

  const [loading, setLoading] = useState(false);
  const [lightPreviewId, setLightPreviewId] = useState<string | null>(
    existingLightId ?? null
  );
  const [lightPreview, setLightPreview] = useState<string | null>(
    defaultValues?.lightImageUrl ?? null
  );
  const [polePreview, setPolePreview] = useState<string | null>(
    defaultValues?.poleImageUrl ?? null
  );
  const [uploadingLight, setUploadingLight] = useState(false);
  const [uploadingPole, setUploadingPole] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { data: mouzas } = useSWR<MouzaOption[]>("/api/mouza-master", fetcher);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StreetLightInput>({
    resolver: zodResolver(StreetLightSchema),
    defaultValues: {
      lightCondition: "GOOD",
      workingStatus: "WORKING",
      ...defaultValues,
    },
  });

  const mouzaId = watch("mouzaId");

  useEffect(() => {
    if (!mouzaId || isEdit) return;
    let cancelled = false;
    fetch(`/api/street-lights/next-id?mouzaId=${mouzaId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setLightPreviewId(d.nextId ?? null);
      })
      .catch(() => { });
    return () => {
      cancelled = true;
    };
  }, [mouzaId, isEdit]);

  const handleGPSCapture = useCallback(
    async ({ latitude: lat, longitude: lng, accuracy: acc }: { latitude: number; longitude: number; accuracy: number }) => {
      setValue("latitude", lat, { shouldValidate: true });
      setValue("longitude", lng, { shouldValidate: true });
      setValue("gpsAccuracy", acc);

      try {
        const url = `/api/street-lights/nearest-mouza?lat=${lat}&lng=${lng}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.mouzaId && data.mouza) {
            setValue("mouzaId", data.mouzaId, { shouldValidate: true, shouldDirty: true });
            if (data.mouza.gramSansad && !watch("sansad")) {
              setValue("sansad", data.mouza.gramSansad);
            }
            if (data.suggestedLandmark && !watch("landmark")) {
              setValue("landmark", data.suggestedLandmark, { shouldDirty: true });
            }
            toast.success(`📍 Mouza auto-detected: ${data.mouza.mouzaName} (${data.mouza.mouzaCode})`);
          }
        }
      } catch (err) {
        console.error("Auto-resolve mouza error:", err);
      }
    },
    [setValue, watch]
  );

  const handleAppendLandmarkChip = useCallback(
    (chipText: string) => {
      const current = (watch("landmark") || "").trim();
      if (!current) {
        setValue("landmark", `Near ${chipText}`, { shouldDirty: true });
      } else if (!current.toLowerCase().includes(chipText.toLowerCase())) {
        setValue("landmark", `${current}, near ${chipText}`, { shouldDirty: true });
      }
    },
    [setValue, watch]
  );

  const uploadImage = useCallback(
    async (file: File, field: "light" | "pole") => {
      const setUploading = field === "light" ? setUploadingLight : setUploadingPole;
      const setPreview = field === "light" ? setLightPreview : setPolePreview;
      const urlField = field === "light" ? "lightImageUrl" : "poleImageUrl";
      const idField = field === "light" ? "lightImagePublicId" : "poleImagePublicId";

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "street-lights");

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();

        setValue(urlField, data.url);
        setValue(idField, data.publicId);
        setPreview(data.url);
        toast.success(
          `${field === "light" ? "Light" : "Pole"} photo uploaded (${Math.round(
            file.size / 1024
          )} KB)`
        );
      } catch {
        toast.error("Image upload failed");
      } finally {
        setUploading(false);
      }
    },
    [setValue]
  );

  const onSubmit = useCallback(
    async (data: StreetLightInput) => {
      setLoading(true);
      try {
        const url = isEdit ? `/api/street-lights/${lightDbId}` : "/api/street-lights";
        const method = isEdit ? "PUT" : "POST";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to save");
        }
        const saved = await res.json();
        toast.success(
          isEdit ? "Street light updated" : `Street light added — ID: ${saved.lightId}`
        );
        router.push("/admindashboard/street-lights/register");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [isEdit, lightDbId, router]
  );

  const clearImage = useCallback(
    (field: "light" | "pole") => {
      const setPreview = field === "light" ? setLightPreview : setPolePreview;
      const urlField = field === "light" ? "lightImageUrl" : "poleImageUrl";
      const idField = field === "light" ? "lightImagePublicId" : "poleImagePublicId";
      setPreview(null);
      setValue(urlField, undefined);
      setValue(idField, undefined);
    },
    [setValue]
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      {lightPreviewId && (
        <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4">
          <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">
            {isEdit ? "Permanent Light ID" : "Auto-generated Light ID"}
          </p>
          <LightIDBadge lightId={lightPreviewId} />
        </div>
      )}

      {/* ===== STEP 1: GPS & Mouza ===== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">
            1
          </div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            GPS Location & Mouza
          </h3>
        </div>

        <GPSCaptureButton
          onCapture={handleGPSCapture}
        />
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              {...register("latitude")}
              placeholder="22.xxxxxx"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              {...register("longitude")}
              placeholder="88.xxxxxx"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gpsAccuracy">Accuracy (m)</Label>
            <Input
              id="gpsAccuracy"
              type="number"
              step="any"
              {...register("gpsAccuracy")}
              placeholder="±5"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="mouzaId">Mouza *</Label>
          <Controller
            control={control}
            name="mouzaId"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="mouzaId">
                  <SelectValue placeholder="Select Mouza" />
                </SelectTrigger>
                <SelectContent>
                  {mouzas?.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.mouzaName} ({m.mouzaCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.mouzaId && (
            <p className="text-xs text-destructive">{errors.mouzaId.message}</p>
          )}
        </div>
      </div>

      {/* ===== STEP 2: Landmark + Quick Details ===== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">
            2
          </div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Location + Quick Details
          </h3>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="landmark">Landmark / Location Description</Label>
            <Input
              id="landmark"
              {...register("landmark")}
              placeholder="e.g. Near Lalpur Primary School Gate, left side pole"
              className="h-11"
            />
            {/* Quick Landmark Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                "Primary School",
                "High School",
                "Mandir / Temple",
                "Masjid",
                "Pukur / Pond",
                "Culvert / Bridge",
                "GP Office",
                "Health Center",
                "Market / Hat",
                "Road Corner",
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleAppendLandmarkChip(chip)}
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted/60 hover:bg-orange-100 hover:text-orange-800 dark:hover:bg-orange-950/60 dark:hover:text-orange-200 border border-border/60 transition-all active:scale-95"
                >
                  +{chip}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="roadName">Road Name (optional)</Label>
              <Input
                id="roadName"
                {...register("roadName")}
                placeholder="e.g. Lalpur-Dhalpara Road"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="poleNo">Pole No. (optional)</Label>
              <Input id="poleNo" {...register("poleNo")} placeholder="e.g. P-045" />
            </div>
          </div>
        </div>
      </div>

      {/* ===== STEP 3: Photographs ===== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">
            3
          </div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Photographs <span className="font-normal normal-case text-xs">(auto-optimized to ~200 KB)</span>
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUploadDropzone
            label="Tap to capture / upload light photo"
            iconVariant="camera"
            preview={lightPreview}
            uploading={uploadingLight}
            onFile={(f) => uploadImage(f, "light")}
            onClear={() => clearImage("light")}
          />
          <ImageUploadDropzone
            label="Tap to capture / upload pole photo"
            iconVariant="upload"
            preview={polePreview}
            uploading={uploadingPole}
            onFile={(f) => uploadImage(f, "pole")}
            onClear={() => clearImage("pole")}
          />
        </div>
      </div>

      {/* ===== ADVANCED DETAILS (separate menu) ===== */}
      <div>
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-between px-4 py-3 h-auto text-sm font-medium text-muted-foreground"
          onClick={() => setShowAdvanced((v) => !v)}
        >
          <span className="flex items-center gap-2">
            <Crosshair className="w-4 h-4" />
            Advanced Details — Light Specs, Condition, Ownership (optional)
          </span>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>

        {showAdvanced && (
          <div className="mt-4 space-y-6 border rounded-xl p-5 bg-muted/20">
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Light Specification
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Light Type</Label>
                  <Controller
                    control={control}
                    name="lightType"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {LIGHT_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="wattage">Wattage (W)</Label>
                  <Input
                    id="wattage"
                    type="number"
                    {...register("wattage")}
                    placeholder="e.g. 30"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Pole Type</Label>
                  <Controller
                    control={control}
                    name="poleType"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pole type" />
                        </SelectTrigger>
                        <SelectContent>
                          {POLE_TYPE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Ownership</Label>
                  <Controller
                    control={control}
                    name="ownership"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ownership" />
                        </SelectTrigger>
                        <SelectContent>
                          {OWNERSHIP_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sansad">Sansad / Area</Label>
                  <Input
                    id="sansad"
                    {...register("sansad")}
                    placeholder="e.g. Lalpur Sansad"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ward">Ward</Label>
                  <Input id="ward" {...register("ward")} placeholder="e.g. Ward No. 5" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="installYear">Pole Install Year</Label>
                  <Input
                    id="installYear"
                    type="number"
                    {...register("installYear")}
                    placeholder="e.g. 2022"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bulbInstallationDate">Bulb Installation Date (Warranty)</Label>
                  <Input id="bulbInstallationDate" type="date" {...register("bulbInstallationDate")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastInspection">Last Inspection Date</Label>
                  <Input id="lastInspection" type="date" {...register("lastInspection")} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Condition & Status
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Light Condition</Label>
                  <Controller
                    control={control}
                    name="lightCondition"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LIGHT_CONDITION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Working Status</Label>
                  <Controller
                    control={control}
                    name="workingStatus"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WORKING_STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    {...register("remarks")}
                    placeholder="Any additional notes or observations…"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="gap-2 min-w-32 h-11">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? "Update Light" : "Save Street Light"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} className="h-11">
          Cancel
        </Button>
      </div>
    </form>
  );
}
