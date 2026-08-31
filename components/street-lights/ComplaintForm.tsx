"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { StreetLightComplaintSchema, type StreetLightComplaintInput } from "@/schema/street-light";
import { COMPLAINT_TYPE_OPTIONS, PRIORITY_OPTIONS } from "@/lib/utils/street-light";
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
import { ImageUploadDropzone } from "./ImageUploadDropzone";

interface ComplaintFormProps {
  streetLightId?: string;
  lightId?: string;
  onSuccess?: () => void;
}

export function ComplaintForm({ streetLightId, lightId, onSuccess }: ComplaintFormProps) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [lights, setLights] = useState<any[]>([]);
  const [loadingLights, setLoadingLights] = useState(false);
  const [selectedMouza, setSelectedMouza] = useState<string>("");

  const uniqueMouzas = useMemo(() => {
    const mouzas = lights.map((l) => l.mouza?.mouzaName).filter(Boolean);
    return Array.from(new Set(mouzas)).sort();
  }, [lights]);

  const filteredLights = useMemo(() => {
    if (!selectedMouza) return lights;
    return lights.filter((l) => l.mouza?.mouzaName === selectedMouza);
  }, [lights, selectedMouza]);
  useEffect(() => {
    if (!streetLightId) {
      setLoadingLights(true);
      fetch("/api/street-lights/list")
        .then(res => res.json())
        .then(data => setLights(Array.isArray(data) ? data : []))
        .catch(err => console.error(err))
        .finally(() => setLoadingLights(false));
    }
  }, [streetLightId]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<StreetLightComplaintInput>({
    resolver: zodResolver(StreetLightComplaintSchema),
    defaultValues: { streetLightId: streetLightId || "", priority: "NORMAL" },
  });

  const selectedStreetLightId = watch("streetLightId");

  const uploadImage = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "street-lights/complaints");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setValue("complaintImageUrl", data.url);
      setValue("complaintImagePublicId", data.publicId);
      setImagePreview(data.url);
      toast.success("Photo uploaded");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  }, [setValue]);

  const handleClearImage = useCallback(() => {
    setImagePreview(null);
    setValue("complaintImageUrl", undefined);
    setValue("complaintImagePublicId", undefined);
  }, [setValue]);

  const onSubmit = useCallback(async (data: StreetLightComplaintInput) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/street-lights/${data.streetLightId}/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to file complaint");
      toast.success("Complaint filed successfully");
      reset({ streetLightId: streetLightId || "", priority: "NORMAL" });
      setImagePreview(null);
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [streetLightId, reset, onSuccess]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {streetLightId && lightId ? (
        <div className="rounded-lg bg-muted/40 px-4 py-3 text-sm">
          Filing complaint for: <span className="font-mono font-semibold text-orange-700">{lightId}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Select Mouza <span className="text-red-500">*</span></Label>
            <Select onValueChange={(val) => {
              setSelectedMouza(val);
              setValue("streetLightId", "");
            }} value={selectedMouza}>
              <SelectTrigger>
                <SelectValue placeholder={loadingLights ? "Loading..." : "Select Mouza"} />
              </SelectTrigger>
              <SelectContent>
                {uniqueMouzas.map((m) => (
                  <SelectItem key={m as string} value={m as string}>
                    {m as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Select Street Light <span className="text-red-500">*</span></Label>
            <Controller
              control={control}
              name="streetLightId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedMouza}>
                  <SelectTrigger>
                    <SelectValue placeholder={!selectedMouza ? "Select Mouza first" : "Select a street light"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredLights.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.lightId} {l.landmark ? `(${l.landmark})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.streetLightId && <p className="text-xs text-red-500">{errors.streetLightId.message}</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Complaint Type</Label>
          <Controller
            control={control}
            name="complaintType"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {COMPLAINT_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Priority</Label>
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register("description")} placeholder="Describe the problem in detail…" rows={3} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reportedBy">Reported By</Label>
          <Input id="reportedBy" {...register("reportedBy")} placeholder="Name of reporter" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reporterMobile">Reporter Mobile</Label>
          <Input id="reporterMobile" {...register("reporterMobile")} placeholder="10-digit mobile" type="tel" />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label>Complaint Photo (optional)</Label>
          <ImageUploadDropzone
            preview={imagePreview}
            uploading={uploading}
            onFile={uploadImage}
            onClear={handleClearImage}
            label="Tap to attach a photo of the problem"
            iconVariant="camera"
            previewHeight="h-32"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="gap-2 w-full">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        File Complaint
      </Button>
    </form>
  );
}
