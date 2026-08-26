"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useSWR from "swr";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { StreetLightSchema, type StreetLightInput } from "@/schema/street-light";
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

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface MouzaOption {
  id: string;
  mouzaName: string;
  mouzaCode: string;
  sansadCode?: string;
}

interface StreetLightFormProps {
  defaultValues?: Partial<StreetLightInput>;
  lightDbId?: string; // DB id if editing
  existingLightId?: string; // Display Light ID if editing
}

export function StreetLightForm({
  defaultValues,
  lightDbId,
  existingLightId,
}: StreetLightFormProps) {
  const router = useRouter();
  const isEdit = !!lightDbId;

  const [loading, setLoading] = useState(false);
  const [lightPreviewId, setLightPreviewId] = useState<string | null>(existingLightId ?? null);
  const [uploadingLight, setUploadingLight] = useState(false);
  const [uploadingPole, setUploadingPole] = useState(false);
  const [lightImagePreview, setLightImagePreview] = useState<string | null>(
    defaultValues?.lightImageUrl ?? null
  );
  const [poleImagePreview, setPoleImagePreview] = useState<string | null>(
    defaultValues?.poleImageUrl ?? null
  );

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

  // Fetch next ID preview when mouza changes
  useEffect(() => {
    if (!mouzaId || isEdit) return;
    fetch(`/api/street-lights/next-id?mouzaId=${mouzaId}`)
      .then((r) => r.json())
      .then((d) => setLightPreviewId(d.nextId ?? null))
      .catch(() => {});
  }, [mouzaId, isEdit]);

  // Image upload helper
  const uploadImage = async (file: File, field: "light" | "pole") => {
    const setUploading = field === "light" ? setUploadingLight : setUploadingPole;
    const setPreview = field === "light" ? setLightImagePreview : setPoleImagePreview;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "street-lights");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();

      const urlField = field === "light" ? "lightImageUrl" : "poleImageUrl";
      const idField = field === "light" ? "lightImagePublicId" : "poleImagePublicId";
      setValue(urlField, data.url);
      setValue(idField, data.publicId);
      setPreview(data.url);
      toast.success(`${field === "light" ? "Light" : "Pole"} photo uploaded`);
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: StreetLightInput) => {
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
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      const saved = await res.json();
      toast.success(isEdit ? "Street light updated" : `Street light added — ID: ${saved.lightId}`);
      router.push("/admindashboard/street-lights/register");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
      {/* Light ID Preview */}
      {lightPreviewId && (
        <div className="rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4">
          <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">
            {isEdit ? "Permanent Light ID" : "Auto-generated Light ID"}
          </p>
          <LightIDBadge lightId={lightPreviewId} />
        </div>
      )}

      {/* Section 1 — Location */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Location Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
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
            {errors.mouzaId && <p className="text-xs text-destructive">{errors.mouzaId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sansad">Sansad / Area</Label>
            <Input id="sansad" {...register("sansad")} placeholder="e.g. Lalpur Sansad" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ward">Ward</Label>
            <Input id="ward" {...register("ward")} placeholder="e.g. Ward No. 5" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="landmark">Landmark / Location Description</Label>
            <Input id="landmark" {...register("landmark")} placeholder="e.g. Near Lalpur Primary School Gate" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="roadName">Road Name</Label>
            <Input id="roadName" {...register("roadName")} placeholder="e.g. Lalpur-Dhalpara Road" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="poleNo">Pole No. / Existing ID</Label>
            <Input id="poleNo" {...register("poleNo")} placeholder="e.g. P-045" />
          </div>
        </div>
      </div>

      {/* Section 2 — GPS */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          GPS Location
        </h3>
        <GPSCaptureButton
          onCapture={({ latitude, longitude, accuracy }) => {
            setValue("latitude", latitude);
            setValue("longitude", longitude);
            setValue("gpsAccuracy", accuracy);
          }}
        />
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="latitude">Latitude</Label>
            <Input id="latitude" type="number" step="any" {...register("latitude")} placeholder="22.xxxxxx" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="longitude">Longitude</Label>
            <Input id="longitude" type="number" step="any" {...register("longitude")} placeholder="88.xxxxxx" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gpsAccuracy">Accuracy (m)</Label>
            <Input id="gpsAccuracy" type="number" step="any" {...register("gpsAccuracy")} placeholder="±5" />
          </div>
        </div>
      </div>

      {/* Section 3 — Light Specification */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Light Specification
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Light Type</Label>
            <Controller
              control={control}
              name="lightType"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LED">LED</SelectItem>
                    <SelectItem value="SODIUM">Sodium Vapour</SelectItem>
                    <SelectItem value="CFL">CFL</SelectItem>
                    <SelectItem value="HALOGEN">Halogen</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="wattage">Wattage (W)</Label>
            <Input id="wattage" type="number" {...register("wattage")} placeholder="e.g. 30" />
          </div>
          <div className="space-y-1.5">
            <Label>Pole Type</Label>
            <Controller
              control={control}
              name="poleType"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select pole type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ELECTRIC_POLE">Electric Pole</SelectItem>
                    <SelectItem value="RCC">RCC Pole</SelectItem>
                    <SelectItem value="MS">MS Pole</SelectItem>
                    <SelectItem value="WOODEN">Wooden Pole</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
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
                  <SelectTrigger><SelectValue placeholder="Select ownership" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GP">Gram Panchayat</SelectItem>
                    <SelectItem value="ELECTRICITY_DEPARTMENT">Electricity Department</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="installYear">Installation Year</Label>
            <Input id="installYear" type="number" {...register("installYear")} placeholder="e.g. 2022" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastInspection">Last Inspection Date</Label>
            <Input id="lastInspection" type="date" {...register("lastInspection")} />
          </div>
        </div>
      </div>

      {/* Section 4 — Condition & Status */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Condition & Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Light Condition</Label>
            <Controller
              control={control}
              name="lightCondition"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GOOD">Good</SelectItem>
                    <SelectItem value="REPAIR_REQUIRED">Repair Required</SelectItem>
                    <SelectItem value="DEFECTIVE">Defective</SelectItem>
                    <SelectItem value="MISSING">Missing</SelectItem>
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
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WORKING">Working</SelectItem>
                    <SelectItem value="NOT_WORKING">Not Working</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" {...register("remarks")} placeholder="Any additional notes or observations…" rows={3} />
          </div>
        </div>
      </div>

      {/* Section 5 — Photographs */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Photographs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Light Photo */}
          <div className="space-y-2">
            <Label>Existing Light Photograph</Label>
            <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 p-4 hover:border-orange-300 transition-colors">
              {lightImagePreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={lightImagePreview} alt="Light" className="w-full h-40 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => { setLightImagePreview(null); setValue("lightImageUrl", undefined); }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  {uploadingLight ? (
                    <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {uploadingLight ? "Uploading…" : "Tap to capture / upload light photo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImage(file, "light");
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Pole Photo */}
          <div className="space-y-2">
            <Label>Pole Photograph</Label>
            <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 p-4 hover:border-orange-300 transition-colors">
              {poleImagePreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={poleImagePreview} alt="Pole" className="w-full h-40 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => { setPoleImagePreview(null); setValue("poleImageUrl", undefined); }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  {uploadingPole ? (
                    <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {uploadingPole ? "Uploading…" : "Tap to capture / upload pole photo"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImage(file, "pole");
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="gap-2 min-w-32">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEdit ? "Update Light" : "Save Street Light"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
