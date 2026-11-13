"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MapPin } from "lucide-react";

import { createTubewell, updateTubewell } from "@/action/tubewell";
import { ImageUploadDropzone } from "@/components/street-lights/ImageUploadDropzone";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  TubewellRegisterSchema,
  type TubewellRegisterInput,
} from "@/schema/tubewell";
import { MouzaSelector } from "./MouzaSelector";
import { LandmarkSuggestions } from "./LandmarkSuggestions";

interface TubewellRegisterFormProps {
  mode: "create" | "edit";
  tubewellId?: string;
  defaultValues?: Partial<TubewellRegisterInput>;
  initialImage?: { url: string; publicId: string } | null;
}

export function TubewellRegisterForm({
  mode,
  tubewellId,
  defaultValues,
  initialImage,
}: TubewellRegisterFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialImage?.url ?? defaultValues?.imageUrl ?? null
  );
  const isEdit = mode === "edit";
  const landmarkInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<TubewellRegisterInput>({
    resolver: zodResolver(TubewellRegisterSchema),
    defaultValues: {
      tubewellType: "ORDINARY",
      condition: "WORKING",
      mouza: "",
      mouzaId: "",
      sansad: "",
      ward: "",
      landmark: "",
      latitude: 0,
      longitude: 0,
      remarks: "",
      imageUrl: initialImage?.url ?? "",
      imagePublicId: initialImage?.publicId ?? "",
      ...defaultValues,
    },
  });

  const handleCaptureGps = () => {
    if ("geolocation" in navigator) {
      toast.loading("Capturing GPS coordinates...", { id: "gps-fetch-reg" });
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue("latitude", position.coords.latitude, { shouldValidate: true });
          form.setValue("longitude", position.coords.longitude, { shouldValidate: true });
          toast.success("📍 GPS location captured successfully!", { id: "gps-fetch-reg" });
        },
        (error) => {
          toast.error("Failed to get GPS location: " + error.message, { id: "gps-fetch-reg" });
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", "tubewells");

      const response = await fetch("/api/upload", {
        method: "POST",
        body,
      });
      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      const url = result.url ?? result.fileUrl;
      if (!url) throw new Error("Upload did not return an image URL");

      form.setValue("imageUrl", url, { shouldValidate: true });
      form.setValue("imagePublicId", result.publicId ?? "", {
        shouldValidate: true,
      });
      setImagePreview(url);
      toast.success("Tubewell photo uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Photo upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (values: TubewellRegisterInput) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        latitude: Number(values.latitude),
        longitude: Number(values.longitude),
        installYear:
          values.installYear === undefined || values.installYear === null
            ? undefined
            : Number(values.installYear),
      };

      if (isEdit) {
        if (!tubewellId) throw new Error("Missing tubewell ID for editing");
        await updateTubewell(tubewellId, payload);
      } else {
        await createTubewell(payload);
      }

      toast.success(isEdit ? "Tubewell updated" : "Tubewell registered");
      router.push("/admindashboard/tubewell/register");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save tubewell");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name="tubewellNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tubewell Number</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} placeholder="Leave blank to auto-generate" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tubewellType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MARK_II">Mark II</SelectItem>
                    <SelectItem value="ORDINARY">Ordinary</SelectItem>
                    <SelectItem value="SUBMERSIBLE">Submersible</SelectItem>
                    <SelectItem value="MINI_PIPED">Mini Piped</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="WORKING">Working</SelectItem>
                    <SelectItem value="DEFECTIVE">Defective</SelectItem>
                    <SelectItem value="ABANDONED">Abandoned</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mouza"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Mouza Name *</FormLabel>
                <FormControl>
                  <MouzaSelector
                    selectedMouza={field.value}
                    selectedMouzaId={form.watch("mouzaId")}
                    selectedSansad={form.watch("sansad")}
                    selectedWard={form.watch("ward")}
                    onSelect={(m) => {
                      field.onChange(m.mouzaName);
                      form.setValue("mouzaId", m.mouzaId || "", { shouldValidate: true });
                      if (m.sansad) form.setValue("sansad", m.sansad);
                      if (m.ward) form.setValue("ward", m.ward);
                    }}
                    error={form.formState.errors.mouza?.message}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sansad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gram Sansad</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} placeholder="e.g. Sansad I" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ward</FormLabel>
                <FormControl><Input {...field} value={field.value ?? ""} placeholder="e.g. Ward 03" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="landmark"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Landmark / Location Details *</FormLabel>
                <LandmarkSuggestions
                  value={field.value || ""}
                  onChange={(nextVal) => form.setValue("landmark", nextVal, { shouldValidate: true })}
                  targetInputRef={landmarkInputRef}
                  className="mb-2 p-3 bg-muted/40 rounded-xl border border-border/50"
                />
                <FormControl>
                  <Input
                    {...field}
                    ref={(e) => {
                      field.ref(e);
                      landmarkInputRef.current = e;
                    }}
                    placeholder="e.g. Near house of Ramesh Mondal, Lalpur Primary School Gate"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2 space-y-3 p-4 bg-muted/20 border rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-500" /> GPS Location Coordinates
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCaptureGps}
                className="gap-1.5 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <MapPin className="w-3.5 h-3.5" /> Capture Current Location
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        value={field.value ?? ""}
                        onChange={(event) =>
                          field.onChange(event.target.value === "" ? undefined : Number(event.target.value))
                        }
                        className="font-mono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        value={field.value ?? ""}
                        onChange={(event) =>
                          field.onChange(event.target.value === "" ? undefined : Number(event.target.value))
                        }
                        className="font-mono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="installYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Installation Year</FormLabel>
                <FormControl>
                  <Input type="number" value={field.value ?? ""} onChange={(event) => field.onChange(event.target.value === "" ? undefined : Number(event.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remarks"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Remarks</FormLabel>
                <FormControl><Textarea {...field} value={field.value ?? ""} rows={3} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <ImageUploadDropzone
          preview={imagePreview}
          uploading={isUploading}
          onFile={uploadImage}
          onClear={() => {
            setImagePreview(null);
            form.setValue("imageUrl", undefined, { shouldValidate: true });
            form.setValue("imagePublicId", undefined, { shouldValidate: true });
          }}
          label="Add a tubewell photo"
          sublabel="A photo is optional; upload a clear image if available."
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/admindashboard/tubewell/register")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? "Saving…" : isEdit ? "Update Tubewell" : "Register Tubewell"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
