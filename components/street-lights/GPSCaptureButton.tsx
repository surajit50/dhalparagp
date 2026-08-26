"use client";

import { useState, useEffect } from "react";
import { MapPin, Loader2, CheckCircle2, AlertCircle, Sparkles, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GPSCaptureButtonProps {
  onCapture: (coords: { latitude: number; longitude: number; accuracy: number }) => void;
  className?: string;
  autoCaptureOnMount?: boolean;
}

export function GPSCaptureButton({
  onCapture,
  className,
  autoCaptureOnMount = false,
}: GPSCaptureButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number; acc: number } | null>(null);

  const handleCapture = () => {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCoords({ lat: latitude, lng: longitude, acc: accuracy });
        setStatus("success");
        onCapture({ latitude, longitude, accuracy });
      },
      (err) => {
        setStatus("error");
        setErrorMsg(
          err.code === 1
            ? "Location access denied. Please allow GPS permission in browser."
            : err.code === 2
            ? "Location unavailable. Please try moving outdoors with clear sky view."
            : "Location request timed out. Please try again."
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (autoCaptureOnMount && status === "idle") {
      handleCapture();
    }
  }, [autoCaptureOnMount]);

  const isHighAccuracy = coords && coords.acc <= 12;

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        type="button"
        onClick={handleCapture}
        disabled={status === "loading"}
        variant={status === "success" ? "outline" : "default"}
        className={cn(
          "gap-2 w-full h-11 text-sm font-semibold transition-all shadow-sm",
          status === "idle" && "bg-orange-600 hover:bg-orange-700 text-white",
          status === "success" &&
            "border-emerald-500 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-700",
          status === "error" &&
            "border-red-400 text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-300"
        )}
      >
        {status === "loading" && <Loader2 className="w-4 h-4 animate-spin text-orange-600" />}
        {status === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        {status === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}
        {status === "idle" && <Navigation className="w-4 h-4" />}
        {status === "loading"
          ? "Acquiring High-Precision GPS…"
          : status === "success"
          ? "GPS Acquired — Tap to Recapture"
          : status === "error"
          ? "GPS Failed — Tap to Retry"
          : "📍 Auto-Capture GPS Location"}
      </Button>

      {status === "success" && coords && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs font-mono text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-3">
            <span>Lat: <strong className="font-semibold">{coords.lat.toFixed(6)}</strong></span>
            <span>Lng: <strong className="font-semibold">{coords.lng.toFixed(6)}</strong></span>
          </div>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[11px] font-sans font-medium flex items-center gap-1",
              isHighAccuracy
                ? "bg-emerald-200/80 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100"
                : "bg-amber-200/80 text-amber-900 dark:bg-amber-800 dark:text-amber-100"
            )}
          >
            <Sparkles className="w-3 h-3" />
            ±{Math.round(coords.acc)}m
          </span>
        </div>
      )}

      {status === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}

