"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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

  const form = useForm<TubewellRegisterInput>({
    resolver: zodResolver(TubewellRegisterSchema),
    defaultValues: {
      tubewellType: "MARK_II",
      condition: "WORKING",
      mouza: "",
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
              <FormItem>
                <FormLabel>Mouza *</FormLabel>
                <FormControl><Input {...field} placeholder="Enter Mouza" /></FormControl>
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
                <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
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
                <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="landmark"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Landmark *</FormLabel>
                <FormControl><Input {...field} placeholder="Nearby landmark or location details" /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude *</FormLabel>
                <FormControl>
                  <Input type="number" step="any" value={field.value ?? ""} onChange={(event) => field.onChange(event.target.value === "" ? undefined : Number(event.target.value))} />
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
                  <Input type="number" step="any" value={field.value ?? ""} onChange={(event) => field.onChange(event.target.value === "" ? undefined : Number(event.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
