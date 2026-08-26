"use client";

import { useState } from "react";
import { MapPin, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GPSCaptureButtonProps {
  onCapture: (coords: { latitude: number; longitude: number; accuracy: number }) => void;
  className?: string;
}

export function GPSCaptureButton({ onCapture, className }: GPSCaptureButtonProps) {
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
            ? "Location access denied. Please allow location in browser settings."
            : err.code === 2
            ? "Location unavailable. Please try again outdoors."
            : "Location request timed out. Please try again."
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        type="button"
        onClick={handleCapture}
        disabled={status === "loading"}
        variant={status === "success" ? "outline" : "default"}
        className={cn(
          "gap-2 w-full",
          status === "success" && "border-emerald-400 text-emerald-700 bg-emerald-50 hover:bg-emerald-100",
          status === "error" && "border-red-400 text-red-700 bg-red-50 hover:bg-red-100",
        )}
      >
        {status === "loading" && <Loader2 className="w-4 h-4 animate-spin" />}
        {status === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        {status === "error" && <AlertCircle className="w-4 h-4 text-red-500" />}
        {status === "idle" && <MapPin className="w-4 h-4" />}
        {status === "loading"
          ? "Capturing GPS…"
          : status === "success"
          ? "GPS Captured — Tap to Recapture"
          : status === "error"
          ? "GPS Failed — Tap to Retry"
          : "Capture GPS Location"}
      </Button>

      {status === "success" && coords && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 font-mono space-y-0.5">
          <p>Lat: <strong>{coords.lat.toFixed(6)}</strong></p>
          <p>Long: <strong>{coords.lng.toFixed(6)}</strong></p>
          <p>Accuracy: <strong>±{Math.round(coords.acc)} m</strong></p>
        </div>
      )}

      {status === "error" && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {errorMsg}
        </p>
      )}
    </div>
  );
}
