"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Zap, MapPin, Save, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ImageUploadDropzone } from "@/components/street-lights/ImageUploadDropzone";
import { TubewellSurveySchema, type TubewellSurveyInput } from "@/schema/tubewell";

export function TubewellSurveyForm() {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TubewellSurveyInput>({
    resolver: zodResolver(TubewellSurveySchema),
    defaultValues: {
      tubewellType: "MARK_II",
      condition: "WORKING",
    },
  });

  const handleCaptureGps = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue("latitude", position.coords.latitude, { shouldValidate: true });
          setValue("longitude", position.coords.longitude, { shouldValidate: true });
          toast.success("📍 Location captured successfully!");
        },
        (error) => {
          toast.error("Failed to get location: " + error.message);
        }
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Submitting:", data);
      toast.success("🎉 Tubewell Survey saved successfully!");
    } catch (error) {
      toast.error("Failed to save survey");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-6">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-xs">
        <div className="flex items-center gap-2 font-medium text-blue-800 dark:text-blue-300">
          <Zap className="w-4 h-4 text-blue-600 animate-pulse" />
          <span>Quick Field Survey</span>
        </div>
        <span className="font-mono font-bold text-blue-700 dark:text-blue-300">
          Auto ID: TW-NEXT
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Details */}
        <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-card overflow-hidden shadow-sm p-5 space-y-5 transition-all hover:shadow-md">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground border-b pb-2">
            <Target className="w-4 h-4 text-blue-500" /> Tubewell Details
          </h3>
          
          <div className="space-y-2">
            <Label>Tubewell No.</Label>
            <Input disabled placeholder="Auto-generated (e.g. TW-001)" className="bg-muted/50" />
          </div>

          <div className="space-y-2">
            <Label>Tubewell Type <span className="text-destructive">*</span></Label>
            <Controller
              control={control}
              name="tubewellType"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className={errors.tubewellType ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MARK_II">Mark II</SelectItem>
                    <SelectItem value="ORDINARY">Ordinary</SelectItem>
                    <SelectItem value="SUBMERSIBLE">Submersible Pump</SelectItem>
                    <SelectItem value="MINI_PIPED">Mini Piped Water</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.tubewellType && <p className="text-xs text-destructive">{errors.tubewellType.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Condition <span className="text-destructive">*</span></Label>
            <Controller
              control={control}
              name="condition"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className={errors.condition ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WORKING">Working</SelectItem>
                    <SelectItem value="DEFECTIVE">Defective</SelectItem>
                    <SelectItem value="ABANDONED">Abandoned</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.condition && <p className="text-xs text-destructive">{errors.condition.message}</p>}
          </div>
        </div>

        {/* Location Details */}
        <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-card overflow-hidden shadow-sm p-5 space-y-5 transition-all hover:shadow-md">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground border-b pb-2">
            <MapPin className="w-4 h-4 text-blue-500" /> Location Details
          </h3>
          
          <div className="space-y-2">
            <Label>Landmark / Near By <span className="text-destructive">*</span></Label>
            <Textarea 
              {...register("landmark")} 
              placeholder="e.g. Near Primary School, House of Ram" 
              rows={2} 
              className={errors.landmark ? "border-destructive" : ""}
            />
            {errors.landmark && <p className="text-xs text-destructive">{errors.landmark.message}</p>}
          </div>

          <div className="space-y-3 pt-2">
            <Label>GPS Coordinates <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={control}
                name="latitude"
                render={({ field }) => (
                  <Input 
                    placeholder="Latitude" 
                    value={field.value || ""} 
                    readOnly 
                    className={`bg-muted/50 font-mono text-sm ${errors.latitude ? "border-destructive" : ""}`} 
                  />
                )}
              />
              <Controller
                control={control}
                name="longitude"
                render={({ field }) => (
                  <Input 
                    placeholder="Longitude" 
                    value={field.value || ""} 
                    readOnly 
                    className={`bg-muted/50 font-mono text-sm ${errors.longitude ? "border-destructive" : ""}`} 
                  />
                )}
              />
            </div>
            {(errors.latitude || errors.longitude) && (
              <p className="text-xs text-destructive">GPS coordinates are required. Please capture location.</p>
            )}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors"
              onClick={handleCaptureGps}
            >
              <MapPin className="w-4 h-4" /> Capture Current Location
            </Button>
          </div>
        </div>

        {/* Media */}
        <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-card overflow-hidden shadow-sm p-5 space-y-5 transition-all hover:shadow-md">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground border-b pb-2">
            <Zap className="w-4 h-4 text-blue-500" /> Photo Upload
          </h3>
          <div className="px-2 pb-2">
            <ImageUploadDropzone
              onUpload={uploadImage}
              isUploading={uploading}
              previewUrl={imagePreview}
              onClear={clearImage}
              label="Capture Tubewell Photo"
              description="Take a clear photo showing the tubewell and its immediate surroundings"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/40 hover:-translate-y-0.5"
        >
          {loading ? "Saving..." : (
            <>
              <Save className="w-5 h-5 mr-2" /> Save Survey Record
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
