"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useCallback } from "react";
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
  streetLightId: string;
  lightId: string;
  onSuccess?: () => void;
}

export function ComplaintForm({ streetLightId, lightId, onSuccess }: ComplaintFormProps) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<StreetLightComplaintInput>({
    resolver: zodResolver(StreetLightComplaintSchema),
    defaultValues: { streetLightId, priority: "NORMAL" },
  });

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
      const res = await fetch(`/api/street-lights/${streetLightId}/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to file complaint");
      toast.success("Complaint filed successfully");
      reset({ streetLightId, priority: "NORMAL" });
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
      <div className="rounded-lg bg-muted/40 px-4 py-3 text-sm">
        Filing complaint for: <span className="font-mono font-semibold text-orange-700">{lightId}</span>
      </div>

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
