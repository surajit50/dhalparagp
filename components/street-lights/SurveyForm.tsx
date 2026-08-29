"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useSWR from "swr";
import {
  Loader2,
  CheckCircle2,
  MapPin,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Zap,
  Tag,
  Layers,
  ExternalLink,
  ShieldCheck,
  Search,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { StreetLightSchema, type StreetLightInput } from "@/schema/street-light";
import {
  LIGHT_TYPE_OPTIONS,
  POLE_TYPE_OPTIONS,
  LIGHT_CONDITION_OPTIONS,
  WORKING_STATUS_OPTIONS,
} from "@/lib/utils/street-light";
import { fetcher } from "@/lib/utils";
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
import { GPSCaptureButton } from "./GPSCaptureButton";
import { LightIDBadge } from "./LightIDBadge";
import { ImageUploadDropzone } from "./ImageUploadDropzone";

interface MouzaOption {
  id: string;
  mouzaName: string;
  mouzaCode: string;
  sansadCode?: string;
  gramSansad?: string;
}

const QUICK_LANDMARK_CHIPS = [
  "Primary School",
  "High School",
  "Mandir / Temple",
  "Masjid",
  "Pukur / Pond",
  "Culvert / Bridge",
  "GP Office",
  "Sub-Center / Health",
  "Market / Hat",
  "Road Crossing",
  "Transformer Pole",
  "Playground",
];

export function SurveyForm() {
  const router = useRouter();

  const [lightPreviewId, setLightPreviewId] = useState<string | null>(null);
  const [savedLight, setSavedLight] = useState<{ id: string; lightId: string; landmark?: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showExtendedMenu, setShowExtendedMenu] = useState(false);

  const [lightImagePreview, setLightImagePreview] = useState<string | null>(null);
  const [poleImagePreview, setPoleImagePreview] = useState<string | null>(null);
  const [uploadingLight, setUploadingLight] = useState(false);
  const [uploadingPole, setUploadingPole] = useState(false);

  // Mouza selection state
  const [mouzaOpen, setMouzaOpen] = useState(false);
  const [mouzaSearch, setMouzaSearch] = useState("");

  const { data: mouzas } = useSWR<MouzaOption[]>("/api/mouza-master", fetcher);

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StreetLightInput>({
    resolver: zodResolver(StreetLightSchema),
    defaultValues: {
      lightType: "LED",
      wattage: 10,
      poleType: "ELECTRIC_POLE",
      lightCondition: "GOOD",
      workingStatus: "WORKING",
      ownership: "GP",
    },
  });

  const mouzaId = watch("mouzaId");

  useEffect(() => {
    if (!mouzaId) return;
    let cancelled = false;
    fetch(`/api/street-lights/next-id?mouzaId=${mouzaId}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled && d.nextId) setLightPreviewId(d.nextId);
      })
      .catch(() => { });
    return () => {
      cancelled = true;
    };
  }, [mouzaId]);

  const handleGPSCapture = useCallback(
    (coords: { latitude: number; longitude: number; accuracy: number }) => {
      setValue("latitude", coords.latitude, { shouldValidate: true });
      setValue("longitude", coords.longitude, { shouldValidate: true });
      setValue("gpsAccuracy", coords.accuracy);
      toast.success("📍 Location captured successfully");
    },
    [setValue]
  );

  const uploadImage = useCallback(
    async (file: File, type: "light" | "pole") => {
      const setUploading = type === "light" ? setUploadingLight : setUploadingPole;
      const setPreview = type === "light" ? setLightImagePreview : setPoleImagePreview;
      const urlField = type === "light" ? "lightImageUrl" : "poleImageUrl";
      const idField = type === "light" ? "lightImagePublicId" : "poleImagePublicId";

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "street-lights");
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        const uploadedUrl = data.url || data.fileUrl;
        setValue(urlField, uploadedUrl);
        setValue(idField, data.publicId);
        setPreview(uploadedUrl);
        toast.success(
          `⚡ ${type === "light" ? "Light" : "Pole"} photo saved (${Math.round(file.size / 1024)} KB)`
        );
      } catch {
        toast.error("Photo upload failed");
      } finally {
        setUploading(false);
      }
    },
    [setValue]
  );

  const handleClearImage = useCallback(
    (type: "light" | "pole") => {
      if (type === "light") {
        setLightImagePreview(null);
        setValue("lightImageUrl", undefined);
        setValue("lightImagePublicId", undefined);
      } else {
        setPoleImagePreview(null);
        setValue("poleImageUrl", undefined);
        setValue("poleImagePublicId", undefined);
      }
    },
    [setValue]
  );

  const handleAppendLandmarkChip = useCallback(
    (chipText: string) => {
      const current = (watch("landmark") || "").trim();
      if (!current) {
        setValue("landmark", `Near ${chipText}`, { shouldDirty: true });
      } else if (!current.toLowerCase().includes(chipText.toLowerCase())) {
        setValue("landmark", `${current}, near ${chipText}`, { shouldDirty: true });
      }
    },
    [setValue, watch]
  );

  const onSubmit = useCallback(
    async (data: StreetLightInput) => {
      if (!data.mouzaId) {
        toast.error("Please ensure a Mouza is selected");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/street-lights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to save street light");
        }
        const saved = await res.json();
        setSavedLight({
          id: saved.id,
          lightId: saved.lightId,
          landmark: saved.landmark,
        });
        if (navigator.vibrate) navigator.vibrate(50);
        toast.success(`🎉 Saved! Light ID: ${saved.lightId}`, { duration: 4000 });
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSurveyNext = useCallback(() => {
    const prevMouzaId = mouzaId;
    reset({
      mouzaId: prevMouzaId,
      lightType: "LED",
      wattage: 30,
      poleType: "ELECTRIC_POLE",
      lightCondition: "GOOD",
      workingStatus: "WORKING",
      ownership: "GP",
    });
    setSavedLight(null);
    setLightImagePreview(null);
    setPoleImagePreview(null);
    setShowExtendedMenu(false);
    toast.info("Ready for next light survey");
  }, [mouzaId, reset]);

  // Filter mouzas based on search
  const filteredMouzas = useMemo(() => {
    if (!mouzas) return [];
    if (!mouzaSearch.trim()) return mouzas;
    const query = mouzaSearch.toLowerCase();
    return mouzas.filter(
      (m) =>
        m.mouzaName.toLowerCase().includes(query) ||
        m.mouzaCode.toLowerCase().includes(query) ||
        m.gramSansad?.toLowerCase().includes(query) ||
        m.sansadCode?.toLowerCase().includes(query)
    );
  }, [mouzas, mouzaSearch]);

  // Group filtered mouzas by gramSansad (if available)
  const groupedMouzas = useMemo(() => {
    const groups = new Map<string, MouzaOption[]>();
    filteredMouzas.forEach((m) => {
      const key = m.gramSansad || "Other";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(m);
    });
    return Array.from(groups.entries());
  }, [filteredMouzas]);

  if (savedLight) {
    return (
      <div className="max-w-md mx-auto rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/60 to-white dark:from-emerald-950/20 dark:to-card p-6 text-center space-y-6 shadow-sm">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto shadow-inner text-emerald-600 dark:text-emerald-300">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">Street Light Saved!</h2>
          <p className="text-xs text-muted-foreground">
            Asset successfully registered in Gram Panchayat database
          </p>
        </div>

        <div className="p-3 bg-card border rounded-xl shadow-xs space-y-2">
          <LightIDBadge lightId={savedLight.lightId} className="text-base font-bold" />
          {savedLight.landmark && (
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              {savedLight.landmark}
            </p>
          )}
        </div>

        <div className="space-y-2.5">
          <Button
            onClick={handleSurveyNext}
            className="w-full h-12 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm"
          >
            <Zap className="w-4 h-4" />
            Survey Next Light
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-10 text-xs gap-1.5"
              onClick={() => router.push(`/admindashboard/street-lights/register/${savedLight.id}/edit`)}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Edit Full Specs
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-10 text-xs"
              onClick={() => router.push("/admindashboard/street-lights/register")}
            >
              View Register
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/40 text-xs">
        <div className="flex items-center gap-2 font-medium text-orange-800 dark:text-orange-300">
          <Zap className="w-4 h-4 text-orange-600 animate-pulse" />
          <span>Quick Field Survey</span>
        </div>
        {lightPreviewId && (
          <span className="font-mono font-bold text-orange-700 dark:text-orange-300">
            Next: {lightPreviewId.split("-").slice(-1)[0]}
          </span>
        )}
      </div>

      {/* Section 1: Mouza Selection - Improved Searchable Combobox */}
      <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
              1
            </span>
            <h3 className="text-sm font-semibold text-foreground">
              Select Mouza
            </h3>
          </div>
        </div>

        <Controller
          control={control}
          name="mouzaId"
          render={({ field }) => {
            const selectedMouza = mouzas?.find((m) => m.id === field.value);
            return (
              <Popover open={mouzaOpen} onOpenChange={setMouzaOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={mouzaOpen}
                    className="w-full justify-between h-auto min-h-11 py-2.5 px-3 text-left font-normal"
                  >
                    {selectedMouza ? (
                      <span className="flex flex-col gap-0.5">
                        <span className="font-semibold text-sm">
                          {selectedMouza.mouzaName} ({selectedMouza.mouzaCode})
                        </span>
                        {selectedMouza.gramSansad && (
                          <span className="text-xs text-muted-foreground">
                            Sansad: {selectedMouza.gramSansad}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Choose Mouza…
                      </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search mouza name, code, sansad..."
                      value={mouzaSearch}
                      onValueChange={setMouzaSearch}
                      className="h-11"
                    />
                    <CommandList className="max-h-[60vh] overflow-y-auto">
                      <CommandEmpty>No mouza found.</CommandEmpty>
                      {groupedMouzas.map(([sansad, mouzaList]) => (
                        <CommandGroup key={sansad} heading={sansad}>
                          {mouzaList.map((m) => (
                            <CommandItem
                              key={m.id}
                              value={`${m.mouzaName} ${m.mouzaCode} ${m.gramSansad || ""} ${m.sansadCode || ""}`}
                              onSelect={() => {
                                field.onChange(m.id);
                                if (m.gramSansad) setValue("sansad", m.gramSansad);
                                if (m.sansadCode) setValue("ward", m.sansadCode);
                                setMouzaOpen(false);
                                setMouzaSearch("");
                              }}
                              className="py-2.5 px-3 cursor-pointer"
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-medium">
                                    {m.mouzaName} ({m.mouzaCode})
                                  </span>
                                  {m.gramSansad && (
                                    <span className="text-xs text-muted-foreground">
                                      Sansad: {m.gramSansad}
                                    </span>
                                  )}
                                </div>
                                {field.value === m.id && (
                                  <Check className="h-4 w-4 text-emerald-600" />
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            );
          }}
        />
        {errors.mouzaId && (
          <p className="text-xs text-destructive">{errors.mouzaId.message}</p>
        )}
      </div>

      {/* Section 2: GPS Location */}
      <div className={`rounded-2xl border p-4 space-y-3.5 shadow-xs transition-colors ${watch("latitude") && watch("longitude")
        ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
        : "border-border/70 bg-card"
        }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
              2
            </span>
            <h3 className="text-sm font-semibold text-foreground">
              GPS Location
            </h3>
          </div>
        </div>
        <GPSCaptureButton onCapture={handleGPSCapture} autoCaptureOnMount={false} />
        {watch("latitude") && watch("longitude") && (
          <p className="text-xs text-emerald-600 flex items-center gap-1 mt-2">
            <CheckCircle2 className="w-4 h-4" /> Location captured successfully
          </p>
        )}
      </div>

      {/* Section 3: Landmark */}
      <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-3 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
            3
          </span>
          <h3 className="text-sm font-semibold text-foreground">
            Landmark / Location Description
          </h3>
        </div>

        <div className="space-y-2">
          <Input
            id="landmark"
            {...register("landmark")}
            placeholder="e.g. Near Lalpur High School Gate, opposite pond"
            className="h-11 text-sm"
          />

          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <Tag className="w-3 h-3 text-orange-500" /> Tap to quickly insert landmark:
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
              {QUICK_LANDMARK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleAppendLandmarkChip(chip)}
                  className="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium bg-muted/60 hover:bg-orange-100 hover:text-orange-800 dark:hover:bg-orange-950/60 dark:hover:text-orange-200 border border-border/60 transition-all active:scale-95"
                >
                  +{chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Photograph */}
      <div className="rounded-2xl border border-border/70 bg-card p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
              4
            </span>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Photograph
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Camera capture · Optimized to ≤ 200 KB
              </p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60">
            <ShieldCheck className="w-3 h-3" /> Quick Upload
          </span>
        </div>

        <ImageUploadDropzone
          preview={lightImagePreview}
          uploading={uploadingLight}
          onFile={(f) => uploadImage(f, "light")}
          onClear={() => handleClearImage("light")}
          label="Tap to capture Light photograph"
          sublabel="Camera opens automatically on mobile · Max 200 KB"
          iconVariant="camera"
          previewHeight="h-48"
        />
      </div>

      {/* Extended Specifications */}
      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowExtendedMenu((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">
              Extended Specifications & Pole Details (Optional)
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{showExtendedMenu ? "Hide" : "Expand"}</span>
            {showExtendedMenu ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showExtendedMenu && (
          <div className="p-4 space-y-4 border-t border-border/50 bg-background/50 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground">Light Type</Label>
                <Controller
                  control={control}
                  name="lightType"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LIGHT_TYPE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground">Wattage (W)</Label>
                <Controller
                  control={control}
                  name="wattage"
                  render={({ field }) => (
                    <Input
                      type="number"
                      placeholder="e.g. 10"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      className="h-10 text-sm"
                    />
                  )}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground">Pole Type</Label>
                <Controller
                  control={control}
                  name="poleType"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POLE_TYPE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground">Pole No. (optional)</Label>
                <Input
                  {...register("poleNo")}
                  placeholder="e.g. P-024"
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground">Condition</Label>
                <Controller
                  control={control}
                  name="lightCondition"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LIGHT_CONDITION_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-sm font-medium text-foreground">Working Status</Label>
                <Controller
                  control={control}
                  name="workingStatus"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WORKING_STATUS_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium text-foreground">Road Name</Label>
              <Input
                {...register("roadName")}
                placeholder="e.g. Dhalpara-Lalpur Main Road"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium text-foreground">Pole Photograph (optional)</Label>
              <ImageUploadDropzone
                preview={poleImagePreview}
                uploading={uploadingPole}
                onFile={(f) => uploadImage(f, "pole")}
                onClear={() => handleClearImage("pole")}
                label="Tap to capture pole photo"
                iconVariant="camera"
                previewHeight="h-36"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium text-foreground">Remarks</Label>
              <Textarea
                {...register("remarks")}
                placeholder="Any special notes or observations…"
                rows={2}
                className="text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Sticky Save Button */}
      <div className="space-y-2 pt-1 sticky bottom-4 z-20 pb-[env(safe-area-inset-bottom)]">
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
          ⚡ Save & Record Street Light
        </Button>
      </div>
    </form>
  );
}
