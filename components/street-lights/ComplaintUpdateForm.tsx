"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ComplaintUpdateSchema, type ComplaintUpdateInput } from "@/schema/street-light";
import { COMPLAINT_STATUS_OPTIONS } from "@/lib/utils/street-light";
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
import { StatusBadge } from "./StatusBadge";
import { ImageUploadDropzone } from "./ImageUploadDropzone";

interface ComplaintUpdateFormProps {
  complaintId: string;
  currentStatus: string;
  onSuccess?: () => void;
}

export function ComplaintUpdateForm({
  complaintId,
  currentStatus,
  onSuccess,
}: ComplaintUpdateFormProps) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ComplaintUpdateInput>({
    resolver: zodResolver(ComplaintUpdateSchema),
    defaultValues: { status: currentStatus as ComplaintUpdateInput["status"] },
  });

  const uploadImage = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "street-lights/repairs");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setValue("completionImageUrl", data.url);
      setValue("completionImagePublicId", data.publicId);
      setImagePreview(data.url);
      toast.success("Completion photo uploaded");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  }, [setValue]);

  const handleClearImage = useCallback(() => {
    setImagePreview(null);
    setValue("completionImageUrl", undefined);
    setValue("completionImagePublicId", undefined);
  }, [setValue]);

  const onSubmit = useCallback(async (data: ComplaintUpdateInput) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/street-lights/complaints/${complaintId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update complaint");
      toast.success("Complaint updated successfully");
      onSuccess?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [complaintId, onSuccess]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">Current status:</p>
        <StatusBadge type="complaint" value={currentStatus} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Update Status</Label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {COMPLAINT_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="assignedTo">Assigned To</Label>
          <Input id="assignedTo" {...register("assignedTo")} placeholder="Staff / person name" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="assignedDate">Assigned Date</Label>
          <Input id="assignedDate" type="date" {...register("assignedDate")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="repairDate">Repair Date</Label>
          <Input id="repairDate" type="date" {...register("repairDate")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="resolvedDate">Resolved Date</Label>
          <Input id="resolvedDate" type="date" {...register("resolvedDate")} />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="repairRemarks">Repair Remarks</Label>
          <Textarea
            id="repairRemarks"
            {...register("repairRemarks")}
            placeholder="Describe the repair work done…"
            rows={3}
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label>Completion / After-Repair Photo</Label>
          <ImageUploadDropzone
            preview={imagePreview}
            uploading={uploading}
            onFile={uploadImage}
            onClear={handleClearImage}
            label="Attach after-repair photo"
            iconVariant="camera"
            previewHeight="h-32"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Update Complaint
      </Button>
    </form>
  );
}
