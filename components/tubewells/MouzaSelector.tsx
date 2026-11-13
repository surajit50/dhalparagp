"use client";

import React, { useState, useMemo } from "react";
import { Check, ChevronsUpDown, MapPin, X, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useMouzas, type MouzaOption } from "@/lib/hooks/use-mouzas";
import { cn } from "@/lib/utils";

interface MouzaSelectorProps {
  selectedMouza?: string;
  selectedMouzaId?: string;
  selectedSansad?: string;
  selectedWard?: string;
  onSelect: (mouza: {
    mouzaName: string;
    mouzaId?: string;
    sansad?: string;
    ward?: string;
  }) => void;
  error?: string;
  disabled?: boolean;
}

export function MouzaSelector({
  selectedMouza,
  selectedMouzaId,
  selectedSansad,
  selectedWard,
  onSelect,
  error,
  disabled = false,
}: MouzaSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [customMouza, setCustomMouza] = useState("");

  const { mouzas, isLoading, error: mouzasError } = useMouzas();

  // Find currently selected object if exists
  const activeMouza = useMemo(() => {
    if (selectedMouzaId) {
      const match = mouzas.find((m) => m.id === selectedMouzaId);
      if (match) return match;
    }
    if (selectedMouza) {
      return mouzas.find(
        (m) => m.mouzaName.toLowerCase() === selectedMouza.toLowerCase()
      );
    }
    return null;
  }, [mouzas, selectedMouzaId, selectedMouza]);

  // Group mouzas by Gram Sansad for clean organized dropdown
  const groupedMouzas = useMemo(() => {
    const groups: Record<string, MouzaOption[]> = {};
    mouzas.forEach((m) => {
      const sansad = m.gramSansad || "Other Sansads";
      if (!groups[sansad]) groups[sansad] = [];
      groups[sansad].push(m);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [mouzas]);

  const handleSelectMouza = (m: MouzaOption) => {
    onSelect({
      mouzaName: m.mouzaName,
      mouzaId: m.id,
      sansad: m.gramSansad || undefined,
      ward: m.ward || m.sansadCode || undefined,
    });
    setOpen(false);
    setSearch("");
  };

  const handleCustomSubmit = () => {
    const trimmed = customMouza.trim();
    if (!trimmed) return;
    onSelect({
      mouzaName: trimmed,
      mouzaId: undefined,
    });
    setCustomMode(false);
    setCustomMouza("");
    setOpen(false);
  };

  const handleClear = () => {
    onSelect({
      mouzaName: "",
      mouzaId: undefined,
      sansad: "",
      ward: "",
    });
  };

  return (
    <div className="space-y-2">
      {/* If a mouza is already selected, display an informative summary badge */}
      {selectedMouza ? (
        <div className="flex items-start justify-between gap-3 p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 transition-all">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">
                  {selectedMouza}
                </span>
                {activeMouza?.mouzaCode && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                    {activeMouza.mouzaCode}
                  </span>
                )}
                {activeMouza?.jlNo && (
                  <span className="text-[11px] text-muted-foreground">
                    JL No: {activeMouza.jlNo}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                {(selectedSansad || activeMouza?.gramSansad) && (
                  <span>
                    Sansad:{" "}
                    <strong className="text-foreground">
                      {selectedSansad || activeMouza?.gramSansad}
                    </strong>
                  </span>
                )}
                {(selectedWard || activeMouza?.ward || activeMouza?.sansadCode) && (
                  <>
                    <span>•</span>
                    <span>
                      Ward:{" "}
                      <strong className="text-foreground">
                        {selectedWard || activeMouza?.ward || activeMouza?.sansadCode}
                      </strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <X className="w-4 h-4 mr-1" />
            Change
          </Button>
        </div>
      ) : (
        /* Popover selector when no mouza is chosen */
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className={cn(
                "w-full justify-between h-11 text-left font-normal border-input rounded-xl",
                error && "border-destructive text-destructive"
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="text-muted-foreground">
                  {isLoading ? "Loading Mouza list..." : "Select Mouza Name *"}
                </span>
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[calc(100vw-2.5rem)] sm:w-[380px] p-0 rounded-xl"
            align="start"
          >
            <Command shouldFilter={false} className="max-h-[360px]">
              <CommandInput
                placeholder="Search mouza or sansad..."
                value={search}
                onValueChange={setSearch}
                className="h-11"
              />
              <CommandList className="max-h-[280px] overflow-y-auto">
                <CommandEmpty className="p-4 text-center text-xs text-muted-foreground">
                  No matching mouza found.
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCustomMouza(search);
                        setCustomMode(true);
                      }}
                      className="text-xs h-8"
                    >
                      <PlusCircle className="w-3.5 h-3.5 mr-1" />
                      Enter &ldquo;{search || "custom"}&rdquo; manually
                    </Button>
                  </div>
                </CommandEmpty>

                {groupedMouzas.map(([sansad, list]) => {
                  const filtered = list.filter((m) => {
                    if (!search.trim()) return true;
                    const q = search.toLowerCase();
                    return (
                      m.mouzaName.toLowerCase().includes(q) ||
                      (m.gramSansad && m.gramSansad.toLowerCase().includes(q)) ||
                      (m.mouzaCode && m.mouzaCode.toLowerCase().includes(q)) ||
                      (m.jlNo && m.jlNo.toLowerCase().includes(q))
                    );
                  });

                  if (filtered.length === 0) return null;

                  return (
                    <CommandGroup
                      key={sansad}
                      heading={
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          {sansad}
                        </span>
                      }
                      className="px-1"
                    >
                      {filtered.map((m) => (
                        <CommandItem
                          key={m.id}
                          value={m.id}
                          onSelect={() => handleSelectMouza(m)}
                          className="cursor-pointer py-2 px-2.5 rounded-lg my-0.5"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 shrink-0",
                              selectedMouzaId === m.id ||
                                selectedMouza?.toLowerCase() === m.mouzaName.toLowerCase()
                                ? "opacity-100 text-blue-600"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-foreground truncate">
                              {m.mouzaName}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                              {m.gramSansad && <span>Sansad: {m.gramSansad}</span>}
                              {m.mouzaCode && (
                                <span className="font-mono bg-muted px-1 rounded">
                                  {m.mouzaCode}
                                </span>
                              )}
                              {m.jlNo && <span>JL: {m.jlNo}</span>}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  );
                })}
              </CommandList>
            </Command>

            {customMode && (
              <div className="p-3 border-t bg-muted/40 space-y-2">
                <p className="text-xs font-medium text-foreground">
                  Custom Mouza Name:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customMouza}
                    onChange={(e) => setCustomMouza(e.target.value)}
                    placeholder="Enter mouza name..."
                    className="flex-1 h-9 px-3 text-xs rounded-lg border bg-background"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="h-9 text-xs"
                    onClick={handleCustomSubmit}
                  >
                    Set
                  </Button>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
