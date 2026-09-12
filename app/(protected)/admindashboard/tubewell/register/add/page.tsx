"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TubewellRegisterSchema, type TubewellRegisterInput } from "@/schema/tubewell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MapPin, Save, ArrowLeft, Droplets, Target, Camera, Map } from "lucide-react";
import Link from "next/link";
import { ImageUploadDropzone } from "@/components/street-lights/ImageUploadDropzone";
import { createTubewell } from "@/action/tubewell";
import {
  TUBEWELL_TYPE_OPTIONS,
  TUBEWELL_CONDITION_OPTIONS,
} from "@/lib/utils/tubewell";
import { useImageUpload } from "@/lib/hooks/use-image-upload";
import { Label } from "@/components/ui/label";

const IMAGE_KEY = "tubewell-photo";

export default function AddTubewellPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [remoteImage, setRemoteImage] = useState<{ url: string; publicId: string } | null>(null);
  const { getState, upload, clear } = useImageUpload("tubewells");
  const imgState = getState(IMAGE_KEY);

  const form = useForm<TubewellRegisterInput>({
    resolver: zodResolver(TubewellRegisterSchema),
    defaultValues: {
      tubewellNo: "",
      tubewellType: "MARK_II",
      condition: "WORKING",
      mouza: "",
      sansad: "",
      ward: "",
      landmark: "",
      latitude: undefined as unknown as number,
      longitude: undefined as unknown as number,
      installYear: new Date().getFullYear(),
      remarks: "",
    },
  });

  const handleFile = async (file: File) => {
    try {
      const data = await upload(file, IMAGE_KEY, (result) => {
        setRemoteImage({ url: result.url, publicId: result.publicId });
      });
      if (data) {
        setRemoteImage({ url: data.url, publicId: data.publicId });
      }
    } catch {
      /* hook already toasts */
    }
  };

  const clearImage = () => {
    clear(IMAGE_KEY);
    setRemoteImage(null);
  };

  const onSubmit = async (data: TubewellRegisterInput) => {
    setIsPending(true);
    try {
      await createTubewell({
        ...data,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        imageUrl: remoteImage?.url,
        imagePublicId: remoteImage?.publicId,
      });
      toast.success("🎉 Tubewell added to register successfully!");
      router.push("/admindashboard/tubewell/register");
    } catch (error: any) {
      toast.error(error.message || "Failed to add tubewell. Number may already exist.");
    } finally {
      setIsPending(false);
    }
  };

  const handleCaptureGps = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    toast.loading("Capturing GPS location…", { id: "gps-capture" });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue("latitude", position.coords.latitude, {
          shouldValidate: true,
          shouldDirty: true,
        });
        form.setValue("longitude", position.coords.longitude, {
          shouldValidate: true,
          shouldDirty: true,
        });
        toast.success("📍 Location captured successfully!", { id: "gps-capture" });
      },
      (error) => {
        toast.error("Failed to get location: " + error.message, { id: "gps-capture" });
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const openInMaps = () => {
    const lat = form.getValues("latitude");
    const lng = form.getValues("longitude");
    if (lat && lng) {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
    } else {
      toast.error("Capture GPS coordinates first");
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admindashboard/tubewell/register">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Add New Tubewell
            </h1>
            <p className="text-sm text-muted-foreground">
              Register a tubewell with GPS coordinates, photos, and details.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-blue-600" />
                  Basic Tubewell Details
                </CardTitle>
                <CardDescription>
                  Administrative information about the tubewell asset.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tubewellNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tubewell Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Auto-generated if blank (e.g. DGP-TW/2025/001)"
                            disabled={isPending}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Leave blank to auto-assign the next sequential number.
                        </FormDescription>
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
                          <Input
                            type="number"
                            min="1950"
                            max={new Date().getFullYear()}
                            disabled={isPending}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tubewellType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Tubewell Type <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TUBEWELL_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
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
                        <FormLabel>
                          Current Condition <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TUBEWELL_CONDITION_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  Location Details
                </CardTitle>
                <CardDescription>
                  Mouza, landmark, and precise GPS coordinates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="mouza"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Mouza <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Dhalpara"
                            disabled={isPending}
                            {...field}
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
                        <FormControl>
                          <Input
                            placeholder="e.g. Sansad No. 1"
                            disabled={isPending}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
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
                        <FormControl>
                          <Input
                            placeholder="e.g. 5"
                            disabled={isPending}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="landmark"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Landmark <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Near Primary School, beside temple…"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* GPS Capture */}
                <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/40 p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-emerald-600 animate-pulse" />
                      <Label className="text-sm font-semibold text-emerald-900 m-0">
                        GPS Coordinates <span className="text-destructive">*</span>
                      </Label>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCaptureGps}
                        disabled={isPending}
                        className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                      >
                        <MapPin className="h-4 w-4" />
                        Capture Current Location
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={openInMaps}
                        disabled={isPending}
                        className="gap-2"
                      >
                        <Map className="h-4 w-4" />
                        Verify on Map
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Latitude</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.000001"
                              disabled={isPending}
                              {...field}
                              value={(field.value as unknown as string) ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? (undefined as unknown as number)
                                    : Number(e.target.value)
                                )
                              }
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
                          <FormLabel className="text-xs">Longitude</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.000001"
                              disabled={isPending}
                              {...field}
                              value={(field.value as unknown as string) ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? (undefined as unknown as number)
                                    : Number(e.target.value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photo + Remarks Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-orange-600" />
                  Photo &amp; Additional Notes
                </CardTitle>
                <CardDescription>
                  Optional photo of the tubewell and any maintenance remarks.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <Label className="text-sm font-medium">Tubewell Photo</Label>
                  <div className="mt-2">
                    <ImageUploadDropzone
                      onFile={handleFile}
                      onClear={clearImage}
                      preview={imgState.preview}
                      uploading={imgState.uploading}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="Maintenance history, pump details, water quality notes…"
                          disabled={isPending}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                asChild
                disabled={isPending}
              >
                <Link href="/admindashboard/tubewell/register">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
              >
                <Save className="h-4 w-4" />
                {isPending ? "Saving Tubewell…" : "Save Tubewell"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
