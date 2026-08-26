"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Camera, X, Image as ImageIcon } from "lucide-react";
import { StreetLightComplaintSchema, type StreetLightComplaintInput } from "@/schema/street-light";
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

  const uploadImage = async (file: File) => {
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
  };

  const onSubmit = async (data: StreetLightComplaintInput) => {
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
  };

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
                  <SelectItem value="NOT_WORKING">Not Working</SelectItem>
                  <SelectItem value="DAMAGED">Damaged / Broken</SelectItem>
                  <SelectItem value="MISSING">Missing</SelectItem>
                  <SelectItem value="WIRE_ISSUE">Wire Issue</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
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
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
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

        {/* Complaint Photo */}
        <div className="space-y-1.5 md:col-span-2">
          <Label>Complaint Photo (optional)</Label>
          <div className="rounded-xl border-2 border-dashed border-muted-foreground/25 p-4">
            {imagePreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Complaint" className="w-full h-32 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => { setImagePreview(null); setValue("complaintImageUrl", undefined); }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-3 cursor-pointer">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <Camera className="w-5 h-5 text-muted-foreground" />}
                <span className="text-sm text-muted-foreground">
                  {uploading ? "Uploading…" : "Tap to attach a photo of the problem"}
                </span>
                <input type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="gap-2 w-full">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        File Complaint
      </Button>
    </form>
  );
}
