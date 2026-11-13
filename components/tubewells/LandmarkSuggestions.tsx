"use client";

import React from "react";
import {
  Home,
  School,
  Building2,
  MapPin,
  Tag,
  Sparkles,
  Waves,
  Store,
  Footprints,
  Baby,
} from "lucide-react";

export interface LandmarkSuggestionItem {
  label: string;
  text: string;
  type: "prefix" | "landmark";
  category: "resident" | "institution" | "religious" | "infrastructure";
}

export const LANDMARK_SUGGESTIONS: LandmarkSuggestionItem[] = [
  // Resident Name Prefixes (most requested)
  { label: "Near house of...", text: "Near house of ", type: "prefix", category: "resident" },
  { label: "Beside house of...", text: "Beside house of ", type: "prefix", category: "resident" },
  { label: "Opposite to house of...", text: "Opposite to house of ", type: "prefix", category: "resident" },
  { label: "Behind house of...", text: "Behind house of ", type: "prefix", category: "resident" },

  // Public & Educational
  { label: "Primary School", text: "Primary School", type: "landmark", category: "institution" },
  { label: "High School", text: "High School", type: "landmark", category: "institution" },
  { label: "ICDS / Anganwadi", text: "ICDS / Anganwadi Centre", type: "landmark", category: "institution" },
  { label: "GP Office", text: "GP Office", type: "landmark", category: "institution" },
  { label: "Health Sub-Center", text: "Health Sub-Center", type: "landmark", category: "institution" },

  // Religious / Community
  { label: "Mandir / Temple", text: "Mandir", type: "landmark", category: "religious" },
  { label: "Masjid", text: "Masjid", type: "landmark", category: "religious" },
  { label: "Club / Community Hall", text: "Club", type: "landmark", category: "religious" },

  // Water & Infrastructure
  { label: "Pukur / Pond", text: "Pukur (Pond)", type: "landmark", category: "infrastructure" },
  { label: "Culvert / Bridge", text: "Culvert", type: "landmark", category: "infrastructure" },
  { label: "Market / More", text: "Market More", type: "landmark", category: "infrastructure" },
];

interface LandmarkSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  targetInputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  className?: string;
}

export function LandmarkSuggestions({
  value,
  onChange,
  targetInputRef,
  className = "",
}: LandmarkSuggestionsProps) {
  const handleSelect = (item: LandmarkSuggestionItem) => {
    const current = (value || "").trim();
    let next = "";

    if (item.type === "prefix") {
      if (!current) {
        next = item.text;
      } else {
        // If current text ends with punctuation or not
        const endsWithComma = current.endsWith(",");
        next = `${current}${endsWithComma ? " " : ", "}${item.text.toLowerCase()}`;
      }
    } else {
      // Landmark entity
      if (!current) {
        next = `Near ${item.text}`;
      } else if (
        current.toLowerCase().endsWith("near ") ||
        current.toLowerCase().endsWith("beside ") ||
        current.toLowerCase().endsWith("opposite to ") ||
        current.toLowerCase().endsWith("behind ")
      ) {
        next = `${current}${item.text}`;
      } else if (!current.toLowerCase().includes(item.text.toLowerCase())) {
        next = `${current}, near ${item.text}`;
      } else {
        next = current;
      }
    }

    onChange(next);

    // Focus target element and place cursor at the end
    setTimeout(() => {
      const el = targetInputRef?.current;
      if (el) {
        el.focus();
        const len = el.value.length;
        if (el.setSelectionRange) {
          el.setSelectionRange(len, len);
        }
      }
    }, 40);
  };

  const residentPrefixes = LANDMARK_SUGGESTIONS.filter((s) => s.category === "resident");
  const commonLandmarks = LANDMARK_SUGGESTIONS.filter((s) => s.category !== "resident");

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Resident Prefix Suggestions */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Resident Name Suggestions:
          </span>
          <span className="text-[11px] text-muted-foreground hidden sm:inline">
            Tap to insert prefix, then type person&apos;s name
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {residentPrefixes.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleSelect(item)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 shadow-2xs transition-all active:scale-95"
            >
              <Sparkles className="w-3 h-3 text-blue-500" />
              <span>+{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Community Landmark Suggestions */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Tag className="w-3.5 h-3.5 text-slate-500" />
          Common Community Landmarks:
        </div>
        <div className="flex flex-wrap gap-1.5">
          {commonLandmarks.map((item) => {
            const isSchool = item.category === "institution";
            const isWater = item.category === "infrastructure";
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleSelect(item)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border shadow-2xs transition-all active:scale-95 ${
                  isSchool
                    ? "bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-900/60"
                    : isWater
                    ? "bg-cyan-50 text-cyan-800 hover:bg-cyan-100 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-900/60"
                    : "bg-muted/80 text-foreground hover:bg-muted dark:bg-muted/50 border-border"
                }`}
              >
                <span>+{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
