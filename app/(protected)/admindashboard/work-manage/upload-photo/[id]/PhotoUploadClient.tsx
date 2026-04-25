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
  isAdmin?: boolean; // ✅ Added isAdmin prop
}

export default function PhotoUploadClient({
  worksDetailId,
  existingPhotos,
  isAdmin = false, // ✅ Default to false for safety
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

  // ✅ New Logic: Branch based on isAdmin
  if (isAdmin) {
    // Admin bypasses verification checks and can upload any missing stage
    if (!onsetPhoto) availableOptions.push({ value: "onset", label: "Onset (Start)" });
    if (!ongoingPhoto) availableOptions.push({ value: "ongoing", label: "Ongoing (In Progress)" });
    if (!completePhoto) availableOptions.push({ value: "complete", label: "Complete (Finished)" });

    if (availableOptions.length === 0) {
      isAllComplete = true;
      waitingMessage = "All work stages have photos uploaded. Great job!";
    }
  } else {
    // Standard Agency strict flow
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
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Capture New Photo
          </CardTitle>
          <CardDescription>
            Use your device camera to take a photo of the work site. Max size:
            500KB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
                <label className="text-sm font-medium">Work Stage</label>
                <Select
                  value={status}
                  onValueChange={(val: WorkPhotoStatus) => setStatus(val)}
                  disabled={isUploading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select work stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 flex flex-col gap-4">
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
                  className="w-full h-24 text-lg"
                  variant="outline"
                  disabled={isUploading || availableOptions.length === 0}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      <span>Uploading... {uploadProgress}%</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Camera className="h-8 w-8 text-blue-600" />
                      <span>Open Camera / Select File</span>
                    </div>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Uploaded Photos</h3>
        {photos.length === 0 ? (
          <div className="text-center p-8 bg-slate-50 rounded-lg border border-dashed">
            <p className="text-muted-foreground">No photos uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photos.map((photo) => (
              <Card
                key={photo.id}
                className={`overflow-hidden relative group ${photo.isRejected ? "ring-2 ring-red-400" : ""}`}
              >
                <div className="relative h-48 w-full bg-slate-100">
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
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded capitalize">
                    {photo.status}
                  </div>
                  {/* Verification Badge */}
                  {!photo.isRejected && (
                    <div className="absolute top-2 right-2">
                      {photo.isVerified ? (
                        <div
                          className="bg-green-500 text-white p-1 rounded-full shadow"
                          title="Verified by Admin"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </div>
                      ) : (
                        <div
                          className="bg-yellow-500 text-white p-1 rounded-full shadow"
                          title="Pending Verification"
                        >
                          <XCircle className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col gap-1 bg-white">
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
