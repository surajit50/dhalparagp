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
  Map as MapIcon,
  X,
} from "lucide-react";

import {
  StreetLightSchema,
  type StreetLightInput,
} from "@/schema/street-light";

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

/* ============================================================
   TYPES
============================================================ */

interface MouzaOption {
  id: string;
  mouzaName: string;
  mouzaCode: string;
  sansadCode?: string;
  gramSansad?: string;
}

/* ============================================================
   LANDMARK QUICK OPTIONS
============================================================ */

const QUICK_LANDMARK_CHIPS = [
  "House of ",
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

/* ============================================================
   COMPONENT
============================================================ */

export function SurveyForm() {
  const router = useRouter();

  /* ----------------------------------------------------------
     STATE
  ---------------------------------------------------------- */

  const [lightPreviewId, setLightPreviewId] =
    useState<string | null>(null);

  const [savedLight, setSavedLight] = useState<{
    id: string;
    lightId: string;
    landmark?: string | null;
  } | null>(null);

  const [loading, setLoading] = useState(false);

  const [showExtendedMenu, setShowExtendedMenu] =
    useState(false);

  const [lightImagePreview, setLightImagePreview] =
    useState<string | null>(null);

  const [poleImagePreview, setPoleImagePreview] =
    useState<string | null>(null);

  const [uploadingLight, setUploadingLight] =
    useState(false);

  const [uploadingPole, setUploadingPole] =
    useState(false);

  /* ----------------------------------------------------------
     MOUZA STATE
  ---------------------------------------------------------- */

  const [mouzaOpen, setMouzaOpen] = useState(false);

  const [mouzaSearch, setMouzaSearch] =
    useState("");

  /* ----------------------------------------------------------
     LOAD MOUZAS
  ---------------------------------------------------------- */

  const {
    data: mouzas,
    isLoading: mouzasLoading,
  } = useSWR<MouzaOption[]>(
    "/api/mouza-master",
    fetcher
  );

  /* ----------------------------------------------------------
     FORM
  ---------------------------------------------------------- */

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

  /* ----------------------------------------------------------
     WATCH MOUZA
  ---------------------------------------------------------- */

  const mouzaId = watch("mouzaId");

  /* ============================================================
     SELECTED MOUZA
  ============================================================ */

  const selectedMouza = useMemo(() => {
    if (!mouzas || !mouzaId) {
      return null;
    }

    return (
      mouzas.find(
        (mouza) => mouza.id === mouzaId
      ) ?? null
    );
  }, [mouzas, mouzaId]);

  /* ============================================================
     NEXT LIGHT ID
  ============================================================ */

  useEffect(() => {
    if (!mouzaId) {
      setLightPreviewId(null);
      return;
    }

    let cancelled = false;

    fetch(
      `/api/street-lights/next-id?mouzaId=${mouzaId}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled && data.nextId) {
          setLightPreviewId(data.nextId);
        }
      })
      .catch(() => {
        setLightPreviewId(null);
      });

    return () => {
      cancelled = true;
    };
  }, [mouzaId]);

  /* ============================================================
     GPS CAPTURE
  ============================================================ */

  const handleGPSCapture = useCallback(
    (coords: {
      latitude: number;
      longitude: number;
      accuracy: number;
    }) => {
      setValue(
        "latitude",
        coords.latitude,
        {
          shouldValidate: true,
        }
      );

      setValue(
        "longitude",
        coords.longitude,
        {
          shouldValidate: true,
        }
      );

      setValue(
        "gpsAccuracy",
        coords.accuracy
      );

      toast.success(
        "📍 Location captured successfully"
      );
    },
    [setValue]
  );

  /* ============================================================
     IMAGE UPLOAD
  ============================================================ */

  const uploadImage = useCallback(
    async (
      file: File,
      type: "light" | "pole"
    ) => {
      const setUploading =
        type === "light"
          ? setUploadingLight
          : setUploadingPole;

      const setPreview =
        type === "light"
          ? setLightImagePreview
          : setPoleImagePreview;

      const urlField =
        type === "light"
          ? "lightImageUrl"
          : "poleImageUrl";

      const idField =
        type === "light"
          ? "lightImagePublicId"
          : "poleImagePublicId";

      setUploading(true);

      try {
        const formData = new FormData();

        formData.append(
          "file",
          file
        );

        formData.append(
          "folder",
          "street-lights"
        );

        const response = await fetch(
          "/api/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Upload failed"
          );
        }

        const data =
          await response.json();

        const uploadedUrl =
          data.url ||
          data.fileUrl;

        setValue(
          urlField,
          uploadedUrl
        );

        setValue(
          idField,
          data.publicId
        );

        setPreview(
          uploadedUrl
        );

        toast.success(
          `⚡ ${
            type === "light"
              ? "Light"
              : "Pole"
          } photo saved (${Math.round(
            file.size / 1024
          )} KB)`
        );
      } catch {
        toast.error(
          "Photo upload failed"
        );
      } finally {
        setUploading(false);
      }
    },
    [setValue]
  );

  /* ============================================================
     CLEAR IMAGE
  ============================================================ */

  const handleClearImage = useCallback(
    (type: "light" | "pole") => {
      if (type === "light") {
        setLightImagePreview(null);

        setValue(
          "lightImageUrl",
          undefined
        );

        setValue(
          "lightImagePublicId",
          undefined
        );
      } else {
        setPoleImagePreview(null);

        setValue(
          "poleImageUrl",
          undefined
        );

        setValue(
          "poleImagePublicId",
          undefined
        );
      }
    },
    [setValue]
  );

  /* ============================================================
     LANDMARK QUICK CHIP
  ============================================================ */

  const handleAppendLandmarkChip =
    useCallback(
      (chipText: string) => {
        const current = (
          watch("landmark") || ""
        ).trim();

        if (!current) {
          setValue(
            "landmark",
            `Near ${chipText}`,
            {
              shouldDirty: true,
            }
          );
        } else if (
          !current
            .toLowerCase()
            .includes(
              chipText.toLowerCase()
            )
        ) {
          setValue(
            "landmark",
            `${current}, near ${chipText}`,
            {
              shouldDirty: true,
            }
          );
        }
      },
      [setValue, watch]
    );

  /* ============================================================
     SUBMIT
  ============================================================ */

  const onSubmit = useCallback(
    async (data: StreetLightInput) => {
      if (!data.mouzaId) {
        toast.error(
          "Please select a Mouza"
        );
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(
          "/api/street-lights",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(data),
          }
        );

        if (!response.ok) {
          const errorData =
            await response
              .json()
              .catch(() => ({}));

          throw new Error(
            errorData.error ||
              "Failed to save street light"
          );
        }

        const saved =
          await response.json();

        setSavedLight({
          id: saved.id,
          lightId: saved.lightId,
          landmark: saved.landmark,
        });

        if (
          typeof navigator !==
            "undefined" &&
          navigator.vibrate
        ) {
          navigator.vibrate(50);
        }

        toast.success(
          `🎉 Saved! Light ID: ${saved.lightId}`,
          {
            duration: 4000,
          }
        );
      } catch (error: unknown) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* ============================================================
     NEXT SURVEY
  ============================================================ */

  const handleSurveyNext =
    useCallback(() => {
      const previousMouzaId =
        mouzaId;

      reset({
        mouzaId:
          previousMouzaId,

        lightType: "LED",

        wattage: 30,

        poleType:
          "ELECTRIC_POLE",

        lightCondition:
          "GOOD",

        workingStatus:
          "WORKING",

        ownership: "GP",
      });

      setSavedLight(null);

      setLightImagePreview(
        null
      );

      setPoleImagePreview(
        null
      );

      setShowExtendedMenu(
        false
      );

      toast.info(
        "Ready for next light survey"
      );
    }, [mouzaId, reset]);

  /* ============================================================
     FILTER MOUZAS
  ============================================================ */

  const filteredMouzas = useMemo(() => {
    if (!mouzas) {
      return [];
    }

    const query =
      mouzaSearch
        .trim()
        .toLowerCase();

    if (!query) {
      return mouzas;
    }

    return mouzas.filter(
      (mouza) => {
        return (
          mouza.mouzaName
            ?.toLowerCase()
            .includes(query) ||

          mouza.mouzaCode
            ?.toLowerCase()
            .includes(query) ||

          mouza.gramSansad
            ?.toLowerCase()
            .includes(query) ||

          mouza.sansadCode
            ?.toLowerCase()
            .includes(query)
        );
      }
    );
  }, [
    mouzas,
    mouzaSearch,
  ]);

  /* ============================================================
     GROUP MOUZAS
     
     IMPORTANT:
     Native JavaScript Map is used here.
     Lucide Map icon is imported as MapIcon.
  ============================================================ */

  const groupedMouzas =
    useMemo(() => {
      const groups =
        new Map<
          string,
          MouzaOption[]
        >();

      filteredMouzas.forEach(
        (mouza) => {
          const key =
            mouza.gramSansad?.trim() ||
            "Other Mouzas";

          if (!groups.has(key)) {
            groups.set(
              key,
              []
            );
          }

          groups
            .get(key)!
            .push(mouza);
        }
      );

      return Array.from(
        groups.entries()
      );
    }, [filteredMouzas]);

  /* ============================================================
     SAVED SCREEN
  ============================================================ */

  if (savedLight) {
    return (
      <div className="max-w-md mx-auto rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/60 to-white dark:from-emerald-950/20 dark:to-card p-6 text-center space-y-6 shadow-sm">

        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto shadow-inner text-emerald-600 dark:text-emerald-300">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">
            Street Light Saved!
          </h2>

          <p className="text-xs text-muted-foreground">
            Asset successfully registered
            in Gram Panchayat database
          </p>
        </div>

        <div className="p-3 bg-card border rounded-xl shadow-xs space-y-2">

          <LightIDBadge
            lightId={
              savedLight.lightId
            }
            className="text-base font-bold"
          />

          {savedLight.landmark && (
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">

              <MapPin className="w-3.5 h-3.5 text-orange-500" />

              {savedLight.landmark}

            </p>
          )}
        </div>

        <div className="space-y-2.5">

          <Button
            onClick={
              handleSurveyNext
            }
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
              onClick={() =>
                router.push(
                  `/admindashboard/street-lights/register/${savedLight.id}/edit`
                )
              }
            >
              <ExternalLink className="w-3.5 h-3.5" />

              Edit Full Specs
            </Button>

            <Button
              variant="secondary"
              size="sm"
              className="h-10 text-xs"
              onClick={() =>
                router.push(
                  "/admindashboard/street-lights/register"
                )
              }
            >
              View Register
            </Button>

          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     MAIN FORM
  ============================================================ */

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit
      )}
      className="max-w-xl mx-auto space-y-4 pb-6"
    >

      {/* ========================================================
          QUICK SURVEY HEADER
      ======================================================== */}

      <div className="flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/40 text-xs">

        <div className="flex items-center gap-2 font-medium text-orange-800 dark:text-orange-300">

          <Zap className="w-4 h-4 text-orange-600 animate-pulse" />

          <span>
            Quick Field Survey
          </span>

        </div>

        {lightPreviewId && (
          <span className="font-mono font-bold text-orange-700 dark:text-orange-300">
            Next:{" "}
            {
              lightPreviewId
                .split("-")
                .slice(-1)[0]
            }
          </span>
        )}

      </div>

      {/* ========================================================
          SECTION 1 - MOUZA
      ======================================================== */}

      <div className="rounded-2xl border border-orange-200/80 dark:border-orange-900/40 bg-card overflow-hidden shadow-sm">

        {/* Section heading */}

        <div className="px-4 pt-4 pb-3">

          <div className="flex items-center gap-2">

            <span className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              1
            </span>

            <div>

              <h3 className="text-sm font-bold text-foreground">
                Select Mouza
              </h3>

              <p className="text-[11px] text-muted-foreground mt-0.5">
                Choose the correct survey
                area before recording
                the light
              </p>

            </div>

          </div>

        </div>

        <Controller
          control={control}
          name="mouzaId"
          render={({ field }) => {

            const currentSelected =
              mouzas?.find(
                (mouza) =>
                  mouza.id ===
                  field.value
              ) ?? null;

            return (
              <div className="px-4 pb-4 space-y-3">

                {/* =================================================
                    MOUZA SELECT BUTTON
                ================================================= */}

                <Popover
                  open={mouzaOpen}
                  onOpenChange={
                    setMouzaOpen
                  }
                >

                  <PopoverTrigger
                    asChild
                  >

                    <button
                      type="button"
                      aria-label="Select Mouza"
                      className={`
                        w-full text-left
                        rounded-xl border
                        transition-all
                        duration-200
                        focus:outline-none
                        focus:ring-2
                        focus:ring-orange-500/30
                        ${
                          currentSelected
                            ? "border-emerald-300 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/20"
                            : "border-border bg-background hover:border-orange-300 hover:bg-orange-50/30 dark:hover:bg-orange-950/20"
                        }
                      `}
                    >

                      <div className="flex items-center gap-3 p-3">

                        {/* Icon */}

                        <div
                          className={`
                            shrink-0
                            w-10 h-10
                            rounded-xl
                            flex items-center
                            justify-center
                            ${
                              currentSelected
                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300"
                                : "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300"
                            }
                          `}
                        >

                          {currentSelected ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <MapIcon className="w-5 h-5" />
                          )}

                        </div>

                        {/* Selected text */}

                        <div className="flex-1 min-w-0">

                          {currentSelected ? (
                            <>
                              <div className="flex items-center gap-2">

                                <span className="font-bold text-sm truncate">
                                  {
                                    currentSelected.mouzaName
                                  }
                                </span>

                                <span className="shrink-0 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                                  {
                                    currentSelected.mouzaCode
                                  }
                                </span>

                              </div>

                              <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                                {currentSelected.gramSansad
                                  ? `Gram Sansad: ${currentSelected.gramSansad}`
                                  : "Mouza selected"}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-semibold">
                                Choose Mouza
                              </p>

                              <p className="text-[11px] text-muted-foreground">
                                Search by name,
                                code or Sansad
                              </p>
                            </>
                          )}

                        </div>

                        <ChevronsUpDown className="w-4 h-4 shrink-0 text-muted-foreground" />

                      </div>

                    </button>

                  </PopoverTrigger>

                  {/* =================================================
                      MOUZA SEARCH POPUP
                  ================================================= */}

                  <PopoverContent
                    align="start"
                    sideOffset={6}
                    className="w-[var(--radix-popover-trigger-width)] min-w-[320px] max-w-[calc(100vw-24px)] p-0 rounded-xl overflow-hidden shadow-xl"
                  >

                    <Command
                      shouldFilter={false}
                      className="rounded-xl"
                    >

                      {/* Search */}

                      <div className="border-b bg-muted/20">

                        <CommandInput
                          placeholder="Search Mouza, code or Sansad..."
                          value={
                            mouzaSearch
                          }
                          onValueChange={
                            setMouzaSearch
                          }
                          className="h-12 text-sm"
                        />

                      </div>

                      {/* Result count */}

                      <div className="px-3 py-2 border-b bg-background flex items-center justify-between">

                        <span className="text-[11px] font-medium text-muted-foreground">

                          {mouzasLoading
                            ? "Loading Mouzas..."
                            : `${filteredMouzas.length} Mouza${
                                filteredMouzas.length ===
                                1
                                  ? ""
                                  : "s"
                              } found`}

                        </span>

                        {mouzaSearch && (
                          <button
                            type="button"
                            onClick={() =>
                              setMouzaSearch(
                                ""
                              )
                            }
                            className="text-[11px] text-orange-600 hover:underline flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Clear
                          </button>
                        )}

                      </div>

                      {/* List */}

                      <CommandList className="max-h-[55vh] overflow-y-auto p-1.5">

                        <CommandEmpty className="py-8 text-center">

                          <Search className="w-7 h-7 mx-auto mb-2 text-muted-foreground/50" />

                          <p className="text-sm font-medium">
                            No Mouza found
                          </p>

                          <p className="text-[11px] text-muted-foreground mt-1">
                            Try another name,
                            code or Sansad
                          </p>

                        </CommandEmpty>

                        {/* =================================================
                            GROUPED MOUZAS
                        ================================================= */}

                        {groupedMouzas.map(
                          ([
                            sansad,
                            mouzaList,
                          ]) => (

                            <CommandGroup
                              key={sansad}
                              heading={
                                <div className="flex items-center gap-2 px-1 py-1">

                                  <MapPin className="w-3 h-3 text-orange-500" />

                                  <span className="font-bold text-xs">
                                    {sansad}
                                  </span>

                                  <span className="text-[10px] text-muted-foreground">
                                    (
                                    {
                                      mouzaList.length
                                    }
                                    )
                                  </span>

                                </div>
                              }
                            >

                              {mouzaList.map(
                                (mouza) => {

                                  const isSelected =
                                    field.value ===
                                    mouza.id;

                                  return (
                                    <CommandItem
                                      key={
                                        mouza.id
                                      }
                                      value={
                                        mouza.id
                                      }
                                      onSelect={() => {

                                        /* Set Mouza */

                                        field.onChange(
                                          mouza.id
                                        );

                                        /* Auto-fill Sansad */

                                        if (
                                          mouza.gramSansad
                                        ) {
                                          setValue(
                                            "sansad",
                                            mouza.gramSansad,
                                            {
                                              shouldDirty:
                                                true,
                                            }
                                          );
                                        }

                                        /* Auto-fill Ward/Sansad Code */

                                        if (
                                          mouza.sansadCode
                                        ) {
                                          setValue(
                                            "ward",
                                            mouza.sansadCode,
                                            {
                                              shouldDirty:
                                                true,
                                            }
                                          );
                                        }

                                        /* Close */

                                        setMouzaOpen(
                                          false
                                        );

                                        setMouzaSearch(
                                          ""
                                        );

                                        toast.success(
                                          `Mouza selected: ${mouza.mouzaName}`
                                        );
                                      }}
                                      className={`
                                        relative
                                        mb-1
                                        rounded-lg
                                        px-3 py-3
                                        cursor-pointer
                                        items-start
                                        ${
                                          isSelected
                                            ? "bg-emerald-50 dark:bg-emerald-950/30"
                                            : ""
                                        }
                                      `}
                                    >

                                      {/* Selection icon */}

                                      <div
                                        className={`
                                          mt-0.5
                                          mr-3
                                          w-7 h-7
                                          rounded-lg
                                          flex
                                          items-center
                                          justify-center
                                          shrink-0
                                          ${
                                            isSelected
                                              ? "bg-emerald-500 text-white"
                                              : "bg-muted text-muted-foreground"
                                          }
                                        `}
                                      >

                                        {isSelected ? (
                                          <Check className="w-4 h-4" />
                                        ) : (
                                          <MapPin className="w-3.5 h-3.5" />
                                        )}

                                      </div>

                                      {/* Details */}

                                      <div className="flex-1 min-w-0">

                                        <div className="flex flex-wrap items-center gap-2">

                                          <span
                                            className={`
                                              text-sm
                                              ${
                                                isSelected
                                                  ? "font-bold text-emerald-700 dark:text-emerald-300"
                                                  : "font-semibold"
                                              }
                                            `}
                                          >
                                            {
                                              mouza.mouzaName
                                            }
                                          </span>

                                          <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted border">
                                            Code:{" "}
                                            {
                                              mouza.mouzaCode
                                            }
                                          </span>

                                        </div>

                                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">

                                          {mouza.gramSansad && (
                                            <span className="text-[10px] text-muted-foreground">
                                              Sansad:{" "}
                                              {
                                                mouza.gramSansad
                                              }
                                            </span>
                                          )}

                                          {mouza.sansadCode && (
                                            <span className="text-[10px] text-muted-foreground">
                                              Sansad Code:{" "}
                                              {
                                                mouza.sansadCode
                                              }
                                            </span>
                                          )}

                                        </div>

                                      </div>

                                    </CommandItem>
                                  );
                                }
                              )}

                            </CommandGroup>

                          )
                        )}

                      </CommandList>

                    </Command>

                  </PopoverContent>

                </Popover>

                {/* =================================================
                    SELECTED MOUZA SUMMARY
                ================================================= */}

                {currentSelected && (
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/60 dark:bg-emerald-950/20 p-3">

                    <div className="flex items-start gap-2">

                      <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />

                      <div className="flex-1 min-w-0">

                        <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                          Selected Survey Area
                        </p>

                        <p className="text-sm font-bold mt-0.5">
                          {
                            currentSelected.mouzaName
                          }
                        </p>

                        <div className="flex flex-wrap gap-1.5 mt-2">

                          <span className="text-[10px] font-mono font-semibold px-2 py-1 rounded-md bg-white dark:bg-card border">
                            Mouza Code:{" "}
                            {
                              currentSelected.mouzaCode
                            }
                          </span>

                          {currentSelected.gramSansad && (
                            <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-white dark:bg-card border">
                              Sansad:{" "}
                              {
                                currentSelected.gramSansad
                              }
                            </span>
                          )}

                          {currentSelected.sansadCode && (
                            <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-white dark:bg-card border">
                              Sansad Code:{" "}
                              {
                                currentSelected.sansadCode
                              }
                            </span>
                          )}

                        </div>

                      </div>

                    </div>

                  </div>
                )}

                {/* Validation error */}

                {errors.mouzaId && (
                  <p className="text-xs text-destructive flex items-center gap-1">

                    <X className="w-3.5 h-3.5" />

                    {
                      errors.mouzaId
                        .message
                    }

                  </p>
                )}

              </div>
            );
          }}
        />

      </div>

      {/* ========================================================
          SECTION 2 - GPS
      ======================================================== */}

      <div
        className={`
          rounded-2xl
          border
          p-4
          space-y-3.5
          shadow-xs
          transition-colors
          ${
            watch("latitude") &&
            watch("longitude")
              ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20"
              : "border-border/70 bg-card"
          }
        `}
      >

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

        <GPSCaptureButton
          onCapture={
            handleGPSCapture
          }
          autoCaptureOnMount={
            false
          }
        />

        {watch("latitude") &&
          watch("longitude") && (
            <p className="text-xs text-emerald-600 flex items-center gap-1 mt-2">

              <CheckCircle2 className="w-4 h-4" />

              Location captured
              successfully

            </p>
          )}

      </div>

      {/* ========================================================
          SECTION 3 - LANDMARK
      ======================================================== */}

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
            {...register(
              "landmark"
            )}
            placeholder="e.g. Near Lalpur High School Gate, opposite pond"
            className="h-11 text-sm"
          />

          <div className="space-y-1.5">

            <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">

              <Tag className="w-3 h-3 text-orange-500" />

              Tap to quickly insert
              landmark:

            </p>

            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">

              {QUICK_LANDMARK_CHIPS.map(
                (chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() =>
                      handleAppendLandmarkChip(
                        chip
                      )
                    }
                    className="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium bg-muted/60 hover:bg-orange-100 hover:text-orange-800 dark:hover:bg-orange-950/60 dark:hover:text-orange-200 border border-border/60 transition-all active:scale-95"
                  >
                    +{chip}
                  </button>
                )
              )}

            </div>

          </div>

        </div>

      </div>

      {/* ========================================================
          SECTION 4 - PHOTOGRAPH
      ======================================================== */}

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
                Camera capture · Optimized
                to ≤ 200 KB
              </p>

            </div>

          </div>

          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/60">

            <ShieldCheck className="w-3 h-3" />

            Quick Upload

          </span>

        </div>

        <ImageUploadDropzone
          preview={
            lightImagePreview
          }
          uploading={
            uploadingLight
          }
          onFile={(file) =>
            uploadImage(
              file,
              "light"
            )
          }
          onClear={() =>
            handleClearImage(
              "light"
            )
          }
          label="Tap to capture Light photograph"
          sublabel="Camera opens automatically on mobile · Max 200 KB"
          iconVariant="camera"
          previewHeight="h-48"
        />

      </div>

      {/* ========================================================
          EXTENDED SPECIFICATIONS
      ======================================================== */}

      <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs">

        <button
          type="button"
          onClick={() =>
            setShowExtendedMenu(
              (value) => !value
            )
          }
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
        >

          <div className="flex items-center gap-2">

            <Layers className="w-4 h-4 text-muted-foreground" />

            <span className="text-xs font-semibold text-foreground">
              Extended Specifications &
              Pole Details
            </span>

            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              OPTIONAL
            </span>

          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">

            <span>
              {showExtendedMenu
                ? "Hide"
                : "Expand"}
            </span>

            {showExtendedMenu ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}

          </div>

        </button>

        {showExtendedMenu && (
          <div className="p-4 space-y-4 border-t border-border/50 bg-background/50 animate-in fade-in">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* Light Type */}

              <div className="space-y-1">

                <Label className="text-sm font-medium text-foreground">
                  Light Type
                </Label>

                <Controller
                  control={
                    control
                  }
                  name="lightType"
                  render={({
                    field,
                  }) => (
                    <Select
                      onValueChange={
                        field.onChange
                      }
                      value={
                        field.value
                      }
                    >

                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        {LIGHT_TYPE_OPTIONS.map(
                          (option) => (
                            <SelectItem
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {
                                option.label
                              }
                            </SelectItem>
                          )
                        )}
                      </SelectContent>

                    </Select>
                  )}
                />

              </div>

              {/* Wattage */}

              <div className="space-y-1">

                <Label className="text-sm font-medium text-foreground">
                  Wattage (W)
                </Label>

                <Controller
                  control={
                    control
                  }
                  name="wattage"
                  render={({
                    field,
                  }) => (
                    <Input
                      type="number"
                      placeholder="e.g. 10"
                      value={
                        field.value ??
                        ""
                      }
                      onChange={(
                        event
                      ) =>
                        field.onChange(
                          parseInt(
                            event
                              .target
                              .value
                          ) ||
                            undefined
                        )
                      }
                      className="h-10 text-sm"
                    />
                  )}
                />

              </div>

              {/* Pole Type */}

              <div className="space-y-1">

                <Label className="text-sm font-medium text-foreground">
                  Pole Type
                </Label>

                <Controller
                  control={
                    control
                  }
                  name="poleType"
                  render={({
                    field,
                  }) => (
                    <Select
                      onValueChange={
                        field.onChange
                      }
                      value={
                        field.value
                      }
                    >

                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        {POLE_TYPE_OPTIONS.map(
                          (option) => (
                            <SelectItem
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {
                                option.label
                              }
                            </SelectItem>
                          )
                        )}
                      </SelectContent>

                    </Select>
                  )}
                />

              </div>

              {/* Pole Number */}

              <div className="space-y-1">

                <Label className="text-sm font-medium text-foreground">
                  Pole No. (optional)
                </Label>

                <Input
                  {...register(
                    "poleNo"
                  )}
                  placeholder="e.g. P-024"
                  className="h-10 text-sm"
                />

              </div>

              {/* Condition */}

              <div className="space-y-1">

                <Label className="text-sm font-medium text-foreground">
                  Condition
                </Label>

                <Controller
                  control={
                    control
                  }
                  name="lightCondition"
                  render={({
                    field,
                  }) => (
                    <Select
                      onValueChange={
                        field.onChange
                      }
                      value={
                        field.value
                      }
                    >

                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        {LIGHT_CONDITION_OPTIONS.map(
                          (option) => (
                            <SelectItem
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {
                                option.label
                              }
                            </SelectItem>
                          )
                        )}
                      </SelectContent>

                    </Select>
                  )}
                />

              </div>

              {/* Working Status */}

              <div className="space-y-1">

                <Label className="text-sm font-medium text-foreground">
                  Working Status
                </Label>

                <Controller
                  control={
                    control
                  }
                  name="workingStatus"
                  render={({
                    field,
                  }) => (
                    <Select
                      onValueChange={
                        field.onChange
                      }
                      value={
                        field.value
                      }
                    >

                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        {WORKING_STATUS_OPTIONS.map(
                          (option) => (
                            <SelectItem
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {
                                option.label
                              }
                            </SelectItem>
                          )
                        )}
                      </SelectContent>

                    </Select>
                  )}
                />

              </div>

            </div>

            {/* Road Name */}

            <div className="space-y-1">

              <Label className="text-sm font-medium text-foreground">
                Road Name
              </Label>

              <Input
                {...register(
                  "roadName"
                )}
                placeholder="e.g. Dhalpara-Lalpur Main Road"
                className="h-10 text-sm"
              />

            </div>

            {/* Pole Photograph */}

            <div className="space-y-1">

              <Label className="text-sm font-medium text-foreground">
                Pole Photograph
                (optional)
              </Label>

              <ImageUploadDropzone
                preview={
                  poleImagePreview
                }
                uploading={
                  uploadingPole
                }
                onFile={(file) =>
                  uploadImage(
                    file,
                    "pole"
                  )
                }
                onClear={() =>
                  handleClearImage(
                    "pole"
                  )
                }
                label="Tap to capture pole photo"
                iconVariant="camera"
                previewHeight="h-36"
              />

            </div>

            {/* Remarks */}

            <div className="space-y-1">

              <Label className="text-sm font-medium text-foreground">
                Remarks
              </Label>

              <Textarea
                {...register(
                  "remarks"
                )}
                placeholder="Any special notes or observations…"
                rows={2}
                className="text-sm"
              />

            </div>

          </div>
        )}

      </div>

      {/* ========================================================
          SAVE BUTTON
      ======================================================== */}

      <div className="space-y-2 pt-1 sticky bottom-4 z-20 pb-[env(safe-area-inset-bottom)]">

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg gap-2"
        >

          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />

              Saving Street Light...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />

              ⚡ Save & Record Street Light
            </>
          )}

        </Button>

      </div>

    </form>
  );
}
