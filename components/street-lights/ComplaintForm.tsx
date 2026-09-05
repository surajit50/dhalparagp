"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Loader2,
  MapPin,
  Lightbulb,
  AlertTriangle,
  FileText,
  User,
  Phone,
  Camera,
  Search,
  CheckCircle2,
  ChevronRight,
  Info,
} from "lucide-react";

import {
  StreetLightComplaintSchema,
  type StreetLightComplaintInput,
} from "@/schema/street-light";

import {
  COMPLAINT_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
} from "@/lib/utils/street-light";

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

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComplaintFormProps {
  streetLightId?: string;
  lightId?: string;
  onSuccess?: () => void;
}

export function ComplaintForm({
  streetLightId,
  lightId,
  onSuccess,
}: ComplaintFormProps) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [lights, setLights] = useState<any[]>([]);
  const [loadingLights, setLoadingLights] = useState(false);
  const [selectedMouza, setSelectedMouza] = useState("");

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
    defaultValues: {
      streetLightId: streetLightId || "",
      priority: "NORMAL",
    },
  });

  const selectedStreetLightId = watch("streetLightId");
  const complaintType = watch("complaintType");
  const priority = watch("priority");

  /* -------------------------------------------------------
     Load street lights
  ------------------------------------------------------- */

  useEffect(() => {
    if (streetLightId) return;

    setLoadingLights(true);

    fetch("/api/street-lights/list")
      .then((res) => res.json())
      .then((data) => {
        setLights(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        toast.error("Unable to load street lights");
      })
      .finally(() => {
        setLoadingLights(false);
      });
  }, [streetLightId]);

  /* -------------------------------------------------------
     Mouza list
  ------------------------------------------------------- */

  const uniqueMouzas = useMemo(() => {
    const mouzas = lights
      .map((light) => light.mouza?.mouzaName)
      .filter(Boolean);

    return Array.from(new Set(mouzas)).sort();
  }, [lights]);

  /* -------------------------------------------------------
     Filter lights
  ------------------------------------------------------- */

  const filteredLights = useMemo(() => {
    if (!selectedMouza) return [];

    return lights.filter(
      (light) => light.mouza?.mouzaName === selectedMouza
    );
  }, [lights, selectedMouza]);

  /* -------------------------------------------------------
     Selected light
  ------------------------------------------------------- */

  const selectedLight = useMemo(() => {
    return lights.find((light) => light.id === selectedStreetLightId);
  }, [lights, selectedStreetLightId]);

  /* -------------------------------------------------------
     Upload image
  ------------------------------------------------------- */

  const uploadImage = useCallback(
    async (file: File) => {
      setUploading(true);

      try {
        const formData = new FormData();

        formData.append("file", file);
        formData.append("folder", "street-lights/complaints");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Upload failed");
        }

        const data = await res.json();

        setValue("complaintImageUrl", data.url);
        setValue("complaintImagePublicId", data.publicId);
        setImagePreview(data.url);

        toast.success("Photo uploaded successfully");
      } catch {
        toast.error("Image upload failed");
      } finally {
        setUploading(false);
      }
    },
    [setValue]
  );

  /* -------------------------------------------------------
     Clear image
  ------------------------------------------------------- */

  const handleClearImage = useCallback(() => {
    setImagePreview(null);
    setValue("complaintImageUrl", undefined);
    setValue("complaintImagePublicId", undefined);
  }, [setValue]);

  /* -------------------------------------------------------
     Submit
  ------------------------------------------------------- */

  const onSubmit = useCallback(
    async (data: StreetLightComplaintInput) => {
      setLoading(true);

      try {
        const res = await fetch(
          `/api/street-lights/${data.streetLightId}/complaints`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }
        );

        if (!res.ok) {
          throw new Error("Failed to file complaint");
        }

        toast.success("Complaint filed successfully");

        reset({
          streetLightId: streetLightId || "",
          priority: "NORMAL",
        });

        setSelectedMouza("");
        setImagePreview(null);

        onSuccess?.();
      } catch (err: unknown) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    },
    [streetLightId, reset, onSuccess]
  );

  /* -------------------------------------------------------
     Field helper
  ------------------------------------------------------- */

  const ErrorMessage = ({
    message,
  }: {
    message?: string;
  }) => {
    if (!message) return null;

    return (
      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-destructive">
        <AlertTriangle className="h-3.5 w-3.5" />
        {message}
      </p>
    );
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto w-full max-w-4xl space-y-5"
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <AlertTriangle className="h-6 w-6 text-primary" />
          </div>

          <div className="min-w-0">
            <h2 className="text-xl font-bold tracking-tight">
              Report Street Light Problem
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Submit a complaint about a damaged, non-functional or
              faulty street light.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          STREET LIGHT LOCATION
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="border-b bg-muted/30 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h3 className="font-semibold">
                Street Light Location
              </h3>

              <p className="text-xs text-muted-foreground">
                Identify the street light for this complaint
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {streetLightId && lightId ? (
            <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Complaint for Street Light
                </p>

                <p className="font-mono text-sm font-bold">
                  {lightId}
                </p>
              </div>

              <CheckCircle2 className="ml-auto h-5 w-5 text-green-600" />
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {/* Mouza */}

              <div className="space-y-2">
                <Label>
                  Mouza
                  <span className="ml-1 text-destructive">*</span>
                </Label>

                <Select
                  value={selectedMouza}
                  onValueChange={(value) => {
                    setSelectedMouza(value);
                    setValue("streetLightId", "");
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue
                      placeholder={
                        loadingLights
                          ? "Loading Mouzas..."
                          : "Select Mouza"
                      }
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {uniqueMouzas.map((mouza) => (
                      <SelectItem
                        key={mouza as string}
                        value={mouza as string}
                      >
                        {mouza as string}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <p className="text-xs text-muted-foreground">
                  First select the Mouza where the light is located.
                </p>
              </div>

              {/* Street Light */}

              <div className="space-y-2">
                <Label>
                  Street Light
                  <span className="ml-1 text-destructive">*</span>
                </Label>

                <Controller
                  control={control}
                  name="streetLightId"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          disabled={!selectedMouza}
                          className={cn(
                            "h-11 w-full justify-between font-normal",
                            !field.value &&
                              "text-muted-foreground",
                            errors.streetLightId &&
                              "border-destructive"
                          )}
                        >
                          <span className="flex min-w-0 items-center gap-2 truncate">
                            <Lightbulb className="h-4 w-4 shrink-0" />

                            {field.value
                              ? filteredLights.find(
                                  (light) =>
                                    light.id === field.value
                                )?.lightId
                              : !selectedMouza
                              ? "Select Mouza first"
                              : "Search street light"}
                          </span>

                          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent
                        className="w-[calc(100vw-3rem)] p-0 sm:w-[420px]"
                        align="start"
                      >
                        <Command>
                          <CommandInput
                            placeholder="Search light ID or landmark..."
                            className="h-11"
                          />

                          <CommandList>
                            <CommandEmpty>
                              No street light found.
                            </CommandEmpty>

                            <CommandGroup>
                              {filteredLights.map((light) => (
                                <CommandItem
                                  key={light.id}
                                  value={`${light.lightId} ${
                                    light.landmark || ""
                                  }`}
                                  onSelect={() => {
                                    field.onChange(light.id);
                                  }}
                                  className="py-3"
                                >
                                  <Check
                                    className={cn(
                                      "mr-3 h-4 w-4",
                                      field.value === light.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />

                                  <div className="min-w-0">
                                    <p className="font-mono font-semibold">
                                      {light.lightId}
                                    </p>

                                    {light.landmark && (
                                      <p className="truncate text-xs text-muted-foreground">
                                        {light.landmark}
                                      </p>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                />

                <ErrorMessage
                  message={errors.streetLightId?.message}
                />
              </div>
            </div>
          )}

          {/* Selected light information */}

          {selectedLight && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border bg-green-50/60 p-4 dark:bg-green-950/20">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

              <div className="min-w-0">
                <p className="text-sm font-semibold">
                  Street light selected
                </p>

                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    ID:{" "}
                    <strong className="font-mono text-foreground">
                      {selectedLight.lightId}
                    </strong>
                  </span>

                  {selectedLight.landmark && (
                    <span>
                      Landmark:{" "}
                      <strong className="text-foreground">
                        {selectedLight.landmark}
                      </strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          COMPLAINT DETAILS
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="border-b bg-muted/30 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>

            <div>
              <h3 className="font-semibold">
                Complaint Details
              </h3>

              <p className="text-xs text-muted-foreground">
                Tell us what is wrong with the street light
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          {/* Complaint type */}

          <div className="space-y-2">
            <Label>Complaint Type</Label>

            <Controller
              control={control}
              name="complaintType"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select complaint type" />
                  </SelectTrigger>

                  <SelectContent>
                    {COMPLAINT_TYPE_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            <ErrorMessage
              message={errors.complaintType?.message}
            />
          </div>

          {/* Priority */}

          <div className="space-y-2">
            <Label>Priority</Label>

            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            <p className="text-xs text-muted-foreground">
              Selected priority:{" "}
              <span className="font-medium text-foreground">
                {priority || "Normal"}
              </span>
            </p>
          </div>

          {/* Description */}

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">
              Problem Description
            </Label>

            <Textarea
              id="description"
              {...register("description")}
              placeholder="Example: Street light is not working since yesterday..."
              rows={5}
              className="resize-none"
            />

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Please provide enough detail to help the maintenance
                team.
              </p>

              <Info className="h-4 w-4 text-muted-foreground" />
            </div>

            <ErrorMessage
              message={errors.description?.message}
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          REPORTER DETAILS
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="border-b bg-muted/30 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
              <User className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h3 className="font-semibold">
                Reporter Information
              </h3>

              <p className="text-xs text-muted-foreground">
                Optional contact details for follow-up
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div className="space-y-2">
            <Label htmlFor="reportedBy">
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Name
              </span>
            </Label>

            <Input
              id="reportedBy"
              {...register("reportedBy")}
              placeholder="Enter reporter name"
              className="h-11"
            />

            <ErrorMessage
              message={errors.reportedBy?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reporterMobile">
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                Mobile Number
              </span>
            </Label>

            <Input
              id="reporterMobile"
              {...register("reporterMobile")}
              placeholder="10-digit mobile number"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              className="h-11"
            />

            <ErrorMessage
              message={errors.reporterMobile?.message}
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          PHOTO EVIDENCE
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="border-b bg-muted/30 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10">
              <Camera className="h-5 w-5 text-purple-600" />
            </div>

            <div>
              <h3 className="font-semibold">
                Photo Evidence
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  Optional
                </span>
              </h3>

              <p className="text-xs text-muted-foreground">
                A photo can help the maintenance team identify the
                problem faster.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <ImageUploadDropzone
            preview={imagePreview}
            uploading={uploading}
            onFile={uploadImage}
            onClear={handleClearImage}
            label="Click or tap to upload a photo"
            iconVariant="camera"
            previewHeight="h-40"
          />
        </div>
      </section>

      {/* =====================================================
          SUBMIT
      ====================================================== */}

      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

            <div>
              <p className="text-sm font-medium">
                Ready to submit?
              </p>

              <p className="text-xs text-muted-foreground">
                Please review the complaint details before filing.
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || uploading}
            className="h-11 w-full gap-2 px-7 sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Filing Complaint...
              </>
            ) : (
              <>
                File Complaint
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
