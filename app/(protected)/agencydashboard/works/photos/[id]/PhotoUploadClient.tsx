"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { uploadWorkPhoto, deleteWorkPhoto } from "@/action/work-photo-actions";
import { WorkPhotoStatus } from "@prisma/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Loader2, Trash2, CheckCircle, XCircle } from "lucide-react";

import Image from "next/image";
import { toast } from "sonner";

const POLL_INTERVAL_MS = 10_000; // Poll every 10 seconds

interface PhotoUploadClientProps {
  worksDetailId: string;
  existingPhotos: any[];
}

export default function PhotoUploadClient({
  worksDetailId,
  existingPhotos,
}: PhotoUploadClientProps) {
  // ✅ Keep photos in local state so UI updates instantly on upload/delete
  const [photos, setPhotos] = useState<any[]>(existingPhotos);
  const [status, setStatus] = useState<WorkPhotoStatus>("onset");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  let availableOptions: { value: WorkPhotoStatus; label: string }[] = [];
  let waitingMessage = "";
  let isAllComplete = false;

  const onsetPhoto = photos.find(
    (p: any) => p.status === "onset" && !p.isRejected,
  );
  const ongoingPhoto = photos.find(
    (p: any) => p.status === "ongoing" && !p.isRejected,
  );
  const completePhoto = photos.find(
    (p: any) => p.status === "complete" && !p.isRejected,
  );

  // Find any rejected photos (to show in the list)
  const rejectedOnset = photos.find(
    (p: any) => p.status === "onset" && p.isRejected,
  );
  const rejectedOngoing = photos.find(
    (p: any) => p.status === "ongoing" && p.isRejected,
  );
  const rejectedComplete = photos.find(
    (p: any) => p.status === "complete" && p.isRejected,
  );

  if (!onsetPhoto) {
    availableOptions = [
      { value: "onset" as WorkPhotoStatus, label: "Onset (Start)" },
    ];
  } else if (!onsetPhoto.isVerified) {
    waitingMessage = "Waiting for Onset photo to be verified by Admin.";
  } else if (!ongoingPhoto) {
    availableOptions = [
      { value: "ongoing" as WorkPhotoStatus, label: "Ongoing (In Progress)" },
    ];
  } else if (!ongoingPhoto.isVerified) {
    waitingMessage = "Waiting for Ongoing photo to be verified by Admin.";
  } else if (!completePhoto) {
    availableOptions = [
      { value: "complete" as WorkPhotoStatus, label: "Complete (Finished)" },
    ];
  } else if (!completePhoto.isVerified) {
    waitingMessage = "Waiting for Complete photo to be verified by Admin.";
  } else {
    isAllComplete = true;
    waitingMessage =
      "All work stages have photos uploaded and verified. Great job!";
  }

  useEffect(() => {
    if (
      availableOptions.length > 0 &&
      !availableOptions.find((opt) => opt.value === status)
    ) {
      setStatus(availableOptions[0].value);
    }
  }, [availableOptions.length, photos, status]);

  // ✅ Poll every 10s so agency sees admin verify/reject instantly without a refresh
  const pollPhotos = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/work-photos?worksDetailId=${worksDetailId}`,
      );
      if (!res.ok) return;
      const fresh: any[] = await res.json();

      setPhotos((prev) => {
        let changed = false;
        // Update existing photos whose isVerified or isRejected has changed
        const updated = prev.map((p) => {
          const freshPhoto = fresh.find((f) => f.id === p.id);
          if (!freshPhoto) return p;
          if (
            freshPhoto.isVerified !== p.isVerified ||
            freshPhoto.isRejected !== p.isRejected
          ) {
            changed = true;
            if (freshPhoto.isVerified && !p.isVerified) {
              toast.success(
                `Your ${freshPhoto.status} photo has been verified!`,
              );
            }
            if (freshPhoto.isRejected && !p.isRejected) {
              toast.error(
                `Your ${freshPhoto.status} photo was rejected: ${freshPhoto.rejectionReason || "by admin"}`,
              );
            }
            return { ...p, ...freshPhoto };
          }
          return p;
        });
        return changed ? updated : prev;
      });
    } catch {
      // silently ignore polling errors
    }
  }, [worksDetailId]);

  useEffect(() => {
    const timer = setInterval(pollPhotos, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [pollPhotos]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10); // Fake progress

    const isLarge = file.size > 500 * 1024;

    if (isLarge) {
      toast.info("Compressing image...");
    }

    try {
      // Get location if available
      let lat = undefined;
      let lng = undefined;

      try {
        if ("geolocation" in navigator) {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 10000,
              });
            },
          );
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        }
      } catch (geoError) {
        console.warn("Could not retrieve geolocation data:", geoError);
        // Continue uploading even without location
      }

      setUploadProgress(40);

      const processAndUpload = async (base64Data: string) => {
        setUploadProgress(60);

        const res = await uploadWorkPhoto({
          worksDetailId,
          status,
          base64Image: base64Data,
          fileName: `work_${worksDetailId}_${Date.now()}`,
          fileType: isLarge ? "image/jpeg" : file.type,
          latitude: lat,
          longitude: lng,
        });

        if (res.success && res.photo) {
          toast.success("Photo uploaded successfully!");
          // ✅ Instantly prepend new photo — no page refresh needed
          setPhotos((prev) => [res.photo, ...prev]);
        } else {
          toast.error((res as any).error || "Failed to upload photo");
        }

        setIsUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
      };

      if (isLarge) {
        // Compress image using canvas
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new window.Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            let width = img.width;
            let height = img.height;

            const MAX_DIMENSION = 1920;
            if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
              if (width > height) {
                height = Math.round((height * MAX_DIMENSION) / width);
                width = MAX_DIMENSION;
              } else {
                width = Math.round((width * MAX_DIMENSION) / height);
                height = MAX_DIMENSION;
              }
            }

            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);

            let quality = 0.9;
            let dataUrl = canvas.toDataURL("image/jpeg", quality);
            const maxBase64Length = 500 * 1024 * 1.33; // ~500KB in base64

            while (dataUrl.length > maxBase64Length && quality > 0.1) {
              quality -= 0.1;
              dataUrl = canvas.toDataURL("image/jpeg", quality);
            }

            processAndUpload(dataUrl);
          };
          img.onerror = () => {
            toast.error("Failed to process image.");
            setIsUploading(false);
            setUploadProgress(0);
          };
        };
        reader.onerror = () => {
          toast.error("Failed to read file.");
          setIsUploading(false);
          setUploadProgress(0);
        };
      } else {
        // Direct base64 conversion
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          processAndUpload(reader.result as string);
        };
        reader.onerror = () => {
          toast.error("Failed to read file.");
          setIsUploading(false);
          setUploadProgress(0);
        };
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during upload.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Deleted: agency can delete their own unverified, non-rejected photo to retry
  const handleDelete = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    const res = await deleteWorkPhoto(photoId);
    if (res.success) {
      toast.success("Photo deleted successfully");
      // ✅ Instantly remove photo from local state — no page refresh needed
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } else {
      toast.error(res.error || "Failed to delete photo");
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12 mt-4">
      <Card className="lg:col-span-5 shadow-sm border-slate-200/60 overflow-visible bg-white/60 backdrop-blur-md rounded-2xl h-fit">
        <CardHeader className="bg-gradient-to-b from-slate-50/50 to-white/0 border-b border-slate-100/80 pb-5 rounded-t-2xl">
          <CardTitle className="flex items-center gap-3 text-lg md:text-xl font-bold text-slate-800">
            <div className="p-2 bg-orange-100/50 rounded-xl text-orange-600 shadow-sm border border-orange-100">
              <Camera className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            Capture Photo
          </CardTitle>
          <CardDescription className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            Use your device camera to take a photo of the work site. Max size: 500KB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-5 md:p-6">
          {availableOptions.length === 0 ? (
            <div
              className={
                isAllComplete
                  ? "bg-green-50 p-4 rounded-md text-green-800 text-sm border border-green-200"
                  : "bg-amber-50 p-4 rounded-md text-amber-800 text-sm border border-amber-200"
              }
            >
              {waitingMessage}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Work Stage</label>
                <Select
                  value={status}
                  onValueChange={(val: WorkPhotoStatus) => setStatus(val)}
                  disabled={isUploading}
                >
                  <SelectTrigger className="w-full bg-white h-12 rounded-xl border-slate-200 shadow-sm focus:ring-orange-500/20 focus:border-orange-400 transition-all font-medium text-slate-700">
                    <SelectValue placeholder="Select work stage" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                    {availableOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="rounded-lg cursor-pointer mx-1 my-0.5 py-2.5 font-medium">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2 flex flex-col gap-4">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment" // Suggests back camera on mobile
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={isUploading || availableOptions.length === 0}
                />

                <Button
                  className="w-full h-32 md:h-40 border-2 border-dashed border-orange-200 hover:border-orange-400 hover:bg-orange-50/50 bg-orange-50/20 transition-all duration-300 rounded-2xl group"
                  variant="outline"
                  disabled={isUploading || availableOptions.length === 0}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-10 w-10 bg-orange-100/80 rounded-full flex items-center justify-center shadow-sm">
                        <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
                      </div>
                      <span className="text-sm font-semibold text-orange-700">Uploading... {uploadProgress}%</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-orange-100 group-hover:scale-110 transition-transform duration-300">
                        <Camera className="h-5 w-5 text-orange-500" />
                      </div>
                      <span className="font-semibold text-slate-600 text-sm md:text-base">Tap to Open Camera</span>
                    </div>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="lg:col-span-7 space-y-5">
        <h3 className="text-xl font-bold text-slate-800 px-1">Uploaded Photos</h3>
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-white/40 backdrop-blur-sm rounded-2xl border-2 border-dashed border-slate-200 shadow-sm mt-2">
            <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 border border-slate-100">
              <Camera className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-600 font-semibold text-lg">No photos uploaded yet</p>
            <p className="text-sm text-slate-400 mt-2 max-w-[250px]">Select a stage and capture a photo to begin tracking progress.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {photos.map((photo) => (
              <Card
                key={photo.id}
                className={`overflow-hidden relative group rounded-2xl border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 bg-white/80 backdrop-blur-sm ${photo.isRejected ? "ring-2 ring-red-400 shadow-red-500/10" : ""}`}
              >
                <div className="relative h-56 w-full bg-slate-100/50">
                  {photo.isRejected ? (
                    <div className="absolute inset-0 bg-red-50 flex flex-col items-center justify-center gap-2">
                      <XCircle className="h-10 w-10 text-red-400" />
                      <span className="text-red-500 text-xs font-semibold">
                        Image Removed
                      </span>
                    </div>
                  ) : (
                    <Image
                      src={photo.imageUrl}
                      alt={`Work photo ${photo.status}`}
                      fill
                      className="object-cover"
                    />
                  )}
                  {/* Rejected overlay */}
                  {photo.isRejected && (
                    <div className="absolute bottom-0 inset-x-0 bg-red-600 text-white text-xs font-bold px-3 py-1 flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> REJECTED BY ADMIN
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-md capitalize shadow-sm">
                    {photo.status}
                  </div>
                  {/* Verification Badge */}
                  {!photo.isRejected && (
                    <div className="absolute top-3 right-3">
                      {photo.isVerified ? (
                        <div
                          className="bg-green-500/90 backdrop-blur-sm text-white p-1.5 rounded-full shadow-md"
                          title="Verified by Admin"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </div>
                      ) : (
                        <div
                          className="bg-amber-500/90 backdrop-blur-sm text-white p-1.5 rounded-full shadow-md"
                          title="Pending Verification"
                        >
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-2 bg-white/60 backdrop-blur-sm">
                  {photo.isRejected ? (
                    <div className="text-xs text-red-600 font-medium flex items-start gap-1">
                      <span className="shrink-0">Reason:</span>
                      <span>
                        {photo.rejectionReason || "Rejected by admin"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        {new Date(photo.uploadedAt).toLocaleDateString()}
                      </div>
                      {!photo.isVerified && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(photo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
