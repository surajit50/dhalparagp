"use client";

import React, { useState } from "react";
import { Zap, MapPin, Camera, Save, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function TubewellSurveyForm() {
  const [loading, setLoading] = useState(false);
  const [gps, setGps] = useState({ lat: "", lng: "" });

  const handleCaptureGps = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGps({
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6),
          });
          toast.success("Location captured successfully!");
        },
        (error) => {
          toast.error("Failed to get location: " + error.message);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
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

      <form className="space-y-6">
        {/* Basic Details */}
        <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-card overflow-hidden shadow-sm p-4 space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground border-b pb-2">
            <Target className="w-4 h-4" /> Tubewell Details
          </h3>
          
          <div className="space-y-2">
            <Label>Tubewell No.</Label>
            <Input disabled placeholder="Auto-generated (e.g. TW-001)" className="bg-muted/50" />
          </div>

          <div className="space-y-2">
            <Label>Tubewell Type <span className="text-destructive">*</span></Label>
            <Select defaultValue="mark2">
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mark2">Mark II</SelectItem>
                <SelectItem value="ordinary">Ordinary</SelectItem>
                <SelectItem value="submersible">Submersible Pump</SelectItem>
                <SelectItem value="mini_piped">Mini Piped Water</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Condition</Label>
            <Select defaultValue="working">
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="working">Working</SelectItem>
                <SelectItem value="defective">Defective</SelectItem>
                <SelectItem value="abandoned">Abandoned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Location Details */}
        <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-card overflow-hidden shadow-sm p-4 space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground border-b pb-2">
            <MapPin className="w-4 h-4" /> Location Details
          </h3>
          
          <div className="space-y-2">
            <Label>Landmark / Near By <span className="text-destructive">*</span></Label>
            <Textarea placeholder="e.g. Near Primary School, House of Ram" rows={2} />
          </div>

          <div className="space-y-3 pt-2">
            <Label>GPS Coordinates <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Latitude" value={gps.lat} readOnly className="bg-muted/50 font-mono text-sm" />
              <Input placeholder="Longitude" value={gps.lng} readOnly className="bg-muted/50 font-mono text-sm" />
            </div>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={handleCaptureGps}
            >
              <MapPin className="w-4 h-4" /> Capture Current Location
            </Button>
          </div>
        </div>

        {/* Media */}
        <div className="rounded-2xl border border-blue-200/80 dark:border-blue-900/40 bg-card overflow-hidden shadow-sm p-4 space-y-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground border-b pb-2">
            <Camera className="w-4 h-4" /> Photo Upload
          </h3>
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
            <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm font-medium">Tap to take photo</p>
            <p className="text-xs text-muted-foreground mt-1">Capture clear image of the tubewell</p>
          </div>
        </div>

        <Button className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/20">
          <Save className="w-5 h-5 mr-2" /> Save Survey Record
        </Button>
      </form>
    </div>
  );
}
