"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import { StreetLightSchema, type StreetLightInput } from "@/schema/street-light";
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
import { GPSCaptureButton } from "./GPSCaptureButton";
import { LightIDBadge } from "./LightIDBadge";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const STEPS = [
  { id: 1, title: "Select Mouza", desc: "Choose the mouza for this light" },
  { id: 2, title: "Capture GPS", desc: "Get the exact GPS location" },
  { id: 3, title: "Take Photo", desc: "Photograph the light & pole" },
  { id: 4, title: "Enter Details", desc: "Light type, condition, remarks" },
  { id: 5, title: "Save", desc: "Review and submit" },
];

interface MouzaOption {
  id: string;
  mouzaName: string;
  mouzaCode: string;
}

export function SurveyForm() {
  const [step, setStep] = useState(1);
  const [lightPreviewId, setLightPreviewId] = useState<string | null>(null);
  const [savedLight, setSavedLight] = useState<{ lightId: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [lightImagePreview, setLightImagePreview] = useState<string | null>(null);
  const [poleImagePreview, setPoleImagePreview] = useState<string | null>(null);
  const [uploadingLight, setUploadingLight] = useState(false);
  const [uploadingPole, setUploadingPole] = useState(false);

  const { data: mouzas } = useSWR<MouzaOption[]>("/api/mouza-master", fetcher);

  const { control, watch, setValue, handleSubmit, reset, formState: { errors } } =
    useForm<StreetLightInput>({
      resolver: zodResolver(StreetLightSchema),
      defaultValues: {
        lightCondition: "GOOD",
        workingStatus: "WORKING",
      },
    });

  const mouzaId = watch("mouzaId");
  const latitude = watch("latitude");
  const longitude = watch("longitude");

  useEffect(() => {
    if (!mouzaId) return;
    fetch(`/api/street-lights/next-id?mouzaId=${mouzaId}`)
      .then((r) => r.json())
      .then((d) => setLightPreviewId(d.nextId ?? null))
      .catch(() => {});
  }, [mouzaId]);

  const uploadImage = async (file: File, type: "light" | "pole") => {
    const setUploading = type === "light" ? setUploadingLight : setUploadingPole;
    const setPreview = type === "light" ? setLightImagePreview : setPoleImagePreview;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "street-lights");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setValue(type === "light" ? "lightImageUrl" : "poleImageUrl", data.url);
      setValue(type === "light" ? "lightImagePublicId" : "poleImagePublicId", data.publicId);
      setPreview(data.url);
      toast.success(`${type === "light" ? "Light" : "Pole"} photo saved`);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: StreetLightInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/street-lights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save");
      const saved = await res.json();
      setSavedLight(saved);
      toast.success(`Saved! Light ID: ${saved.lightId}`);
      setStep(6); // Success step
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    reset({ lightCondition: "GOOD", workingStatus: "WORKING" });
    setStep(1);
    setSavedLight(null);
    setLightImagePreview(null);
    setPoleImagePreview(null);
    setLightPreviewId(null);
  };

  // ── Success Screen ────────────────────────────────────────────────────────
  if (step === 6 && savedLight) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Street Light Recorded!</h2>
          <p className="text-sm text-muted-foreground mt-1">Survey entry saved successfully</p>
        </div>
        <LightIDBadge lightId={savedLight.lightId} className="text-base" />
        <div className="flex gap-3">
          <Button onClick={handleReset} className="gap-2">
            <ChevronRight className="w-4 h-4" />
            Survey Next Light
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/admindashboard/street-lights/register"}>
            View Register
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Step Progress */}
      <div className="flex gap-1">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={`flex-1 h-1.5 rounded-full transition-all ${
              s.id < step ? "bg-emerald-500" : s.id === step ? "bg-orange-500" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <div>
        <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
          Step {step} of {STEPS.length}
        </p>
        <h2 className="text-xl font-bold">{STEPS[step - 1]?.title}</h2>
        <p className="text-sm text-muted-foreground">{STEPS[step - 1]?.desc}</p>
      </div>

      {/* Step 1: Mouza */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Select Mouza *</Label>
            <Controller
              control={control}
              name="mouzaId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Tap to select Mouza…" />
                  </SelectTrigger>
                  <SelectContent>
                    {mouzas?.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.mouzaName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.mouzaId && <p className="text-xs text-destructive">{errors.mouzaId.message}</p>}
          </div>
          {lightPreviewId && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
              <p className="text-xs text-orange-600 mb-1">Next Light ID will be:</p>
              <LightIDBadge lightId={lightPreviewId} />
            </div>
          )}
          <Button onClick={() => { if (mouzaId) setStep(2); else toast.error("Please select a Mouza first"); }} className="w-full h-12 text-base gap-2">
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Step 2: GPS */}
      {step === 2 && (
        <div className="space-y-4">
          <GPSCaptureButton
            onCapture={({ latitude, longitude, accuracy }) => {
              setValue("latitude", latitude);
              setValue("longitude", longitude);
              setValue("gpsAccuracy", accuracy);
            }}
          />
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Latitude</Label>
              <Controller control={control} name="latitude" render={({ field }) => (
                <Input type="number" step="any" placeholder="22.xxx" value={field.value ?? ""} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
              )} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Longitude</Label>
              <Controller control={control} name="longitude" render={({ field }) => (
                <Input type="number" step="any" placeholder="88.xxx" value={field.value ?? ""} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
              )} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Accuracy (m)</Label>
              <Controller control={control} name="gpsAccuracy" render={({ field }) => (
                <Input type="number" step="any" value={field.value ?? ""} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
              )} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>Back</Button>
            <Button className="flex-1 h-12 gap-2" onClick={() => setStep(3)}>
              {latitude && longitude ? "GPS OK" : "Skip GPS"} <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Photos */}
      {step === 3 && (
        <div className="space-y-4">
          {/* Light Photo */}
          <div className="space-y-2">
            <Label>Light Photograph</Label>
            <label className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-muted-foreground/30 cursor-pointer hover:border-orange-300 transition-colors overflow-hidden">
              {lightImagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={lightImagePreview} alt="Light" className="w-full h-full object-cover" />
              ) : uploadingLight ? (
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <span className="text-3xl">📸</span>
                  <span className="text-sm">Tap to capture light photo</span>
                </div>
              )}
              <input type="file" accept="image/*" capture="environment" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, "light"); }}
              />
            </label>
          </div>

          {/* Pole Photo */}
          <div className="space-y-2">
            <Label>Pole Photograph</Label>
            <label className="flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed border-muted-foreground/30 cursor-pointer hover:border-orange-300 transition-colors overflow-hidden">
              {poleImagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={poleImagePreview} alt="Pole" className="w-full h-full object-cover" />
              ) : uploadingPole ? (
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <span className="text-3xl">🪧</span>
                  <span className="text-sm">Tap to capture pole photo</span>
                </div>
              )}
              <input type="file" accept="image/*" capture="environment" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, "pole"); }}
              />
            </label>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(2)}>Back</Button>
            <Button className="flex-1 h-12 gap-2" onClick={() => setStep(4)}>
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Light Details */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Light Type</Label>
              <Controller control={control} name="lightType" render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LED">LED</SelectItem>
                    <SelectItem value="SODIUM">Sodium</SelectItem>
                    <SelectItem value="CFL">CFL</SelectItem>
                    <SelectItem value="HALOGEN">Halogen</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="wattage">Wattage (W)</Label>
              <Controller control={control} name="wattage" render={({ field }) => (
                <Input id="wattage" type="number" placeholder="e.g. 30" value={field.value ?? ""} onChange={(e) => field.onChange(parseInt(e.target.value))} className="h-11" />
              )} />
            </div>
            <div className="space-y-1">
              <Label>Condition</Label>
              <Controller control={control} name="lightCondition" render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GOOD">Good</SelectItem>
                    <SelectItem value="REPAIR_REQUIRED">Repair Required</SelectItem>
                    <SelectItem value="DEFECTIVE">Defective</SelectItem>
                    <SelectItem value="MISSING">Missing</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div className="space-y-1">
              <Label>Working Status</Label>
              <Controller control={control} name="workingStatus" render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WORKING">Working</SelectItem>
                    <SelectItem value="NOT_WORKING">Not Working</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="landmark">Landmark / Location</Label>
            <Controller control={control} name="landmark" render={({ field }) => (
              <Input id="landmark" placeholder="e.g. Near School Gate" value={field.value ?? ""} onChange={field.onChange} className="h-11" />
            )} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="remarks">Remarks</Label>
            <Controller control={control} name="remarks" render={({ field }) => (
              <Textarea id="remarks" placeholder="Any observations…" value={field.value ?? ""} onChange={field.onChange} rows={2} />
            )} />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(3)}>Back</Button>
            <Button className="flex-1 h-12 gap-2" onClick={() => setStep(5)}>
              Review <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Review & Submit */}
      {step === 5 && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="rounded-xl border bg-muted/30 divide-y">
            {lightPreviewId && (
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-muted-foreground">Light ID</span>
                <LightIDBadge lightId={lightPreviewId} />
              </div>
            )}
            <ReviewRow label="Mouza" value={mouzas?.find(m => m.id === mouzaId)?.mouzaName} />
            <ReviewRow label="GPS" value={latitude && longitude ? `${latitude?.toFixed(4)}, ${longitude?.toFixed(4)}` : "Not captured"} />
            <ReviewRow label="Light Type" value={watch("lightType") ?? "Not set"} />
            <ReviewRow label="Wattage" value={watch("wattage") ? `${watch("wattage")} W` : "Not set"} />
            <ReviewRow label="Condition" value={watch("lightCondition")?.replace(/_/g, " ")} />
            <ReviewRow label="Status" value={watch("workingStatus")?.replace(/_/g, " ")} />
            <ReviewRow label="Light Photo" value={lightImagePreview ? "✅ Captured" : "Not taken"} />
            <ReviewRow label="Pole Photo" value={poleImagePreview ? "✅ Captured" : "Not taken"} />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => setStep(4)}>Back</Button>
            <Button type="submit" className="flex-1 h-12 gap-2 bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Save Entry
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value ?? "—"}</span>
    </div>
  );
}
