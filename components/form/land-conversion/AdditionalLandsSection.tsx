"use client";

import { useState } from "react";
import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Check, ChevronsUpDown, Layers } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { LandConversionApplicationInput } from "@/schema/land-conversion";
import { villagenameOption, LAND_CLASSIFICATIONS } from "@/constants/index";

const emptyLand = {
  khatianNo: "",
  plotNo: "",
  mouza: "",
  jlNo: "",
  landAreaDec: "",
  presentLandUse: "",
  proposedLandUse: "",
};

export default function AdditionalLandsSection() {
  const { control, setValue } =
    useFormContext<LandConversionApplicationInput>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "additionalLands",
  });

  const primaryProposedLandUse = useWatch({
    control,
    name: "proposedLandUse",
  });

  const [presentOpenIndex, setPresentOpenIndex] = useState<number | null>(null);
  const [proposedOpenIndex, setProposedOpenIndex] = useState<number | null>(null);

  const handleMouzaChange = (idx: number, value: string) => {
    const selectedVillage = villagenameOption.find((v) => v.value === value);
    if (selectedVillage) {
      setValue(`additionalLands.${idx}.mouza`, value);
      setValue(`additionalLands.${idx}.jlNo`, selectedVillage.jlNo);
    }
  };

  return (
    <Card className="shadow-lg border-indigo-100/60 bg-white/70 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-indigo-200/60 mt-8">
      <CardHeader className="bg-gradient-to-r from-indigo-50/80 to-transparent border-b border-indigo-100/60 pb-5">
        <CardTitle className="text-indigo-900 text-xl flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-indigo-50">
            <Layers className="h-5 w-5 text-indigo-600" />
          </div>
          Additional Land Parcels (Optional)
        </CardTitle>
        <p className="text-sm text-indigo-600/70 mt-2 font-medium">
          Add other plots that are part of this conversion request
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-8">
        {fields.map((item, idx) => (
          <div
            key={item.id}
            className="p-6 bg-white/50 backdrop-blur-md border border-indigo-100/80 rounded-2xl relative group transition-all hover:border-indigo-300/80 hover:shadow-md hover:bg-white/80"
          >
            <div className="absolute top-4 right-4 flex items-center gap-3">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-100/80 px-3 py-1.5 rounded-full shadow-sm border border-indigo-200/50">
                Parcel {idx + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-100 rounded-full transition-all border border-transparent hover:border-rose-200 shadow-sm opacity-60 group-hover:opacity-100"
                onClick={() => remove(idx)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
              <FormField
                control={control}
                name={`additionalLands.${idx}.mouza`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">Mouza *</FormLabel>
                    <Select
                      onValueChange={(val) => handleMouzaChange(idx, val)}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 bg-white/50 border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm rounded-xl">
                          <SelectValue placeholder="Select mouza" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {villagenameOption.map((mouza) => (
                          <SelectItem key={mouza.value} value={mouza.value}>
                            {mouza.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              {(["khatianNo", "plotNo", "jlNo", "landAreaDec"] as const).map(
                (field) => (
                  <FormField
                    key={field}
                    control={control}
                    name={`additionalLands.${idx}.${field}`}
                    render={({ field: nestedField }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold">
                          {field === "landAreaDec"
                            ? "Land Area (dec) *"
                            : `${field.replace(/([A-Z])/g, " $1").trim()} *`}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...nestedField}
                            placeholder={
                              field === "landAreaDec" ? "e.g. 5" : ""
                            }
                            inputMode={
                              field === "landAreaDec" ? "decimal" : undefined
                            }
                            className="h-12 bg-white/50 border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm rounded-xl"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                ),
              )}
              <FormField
                control={control}
                name={`additionalLands.${idx}.presentLandUse`}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-slate-700 font-semibold pb-1">
                      Present Land Use *
                    </FormLabel>
                    <Popover
                      open={presentOpenIndex === idx}
                      onOpenChange={(open) => setPresentOpenIndex(open ? idx : null)}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={presentOpenIndex === idx}
                            className={cn(
                              "h-12 w-full justify-between bg-white/50 border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm rounded-xl font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <span className="truncate">
                              {field.value
                                ? LAND_CLASSIFICATIONS.find((opt) => opt.code === field.value)?.name
                                : "Select"}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-xl" align="start">
                        <Command>
                          <CommandInput placeholder="Search land use..." />
                          <CommandList>
                            <CommandEmpty>No land use found.</CommandEmpty>
                            <CommandGroup>
                              {LAND_CLASSIFICATIONS.map((option) => (
                                <CommandItem
                                  key={option.code}
                                  value={option.name}
                                  onSelect={() => {
                                    field.onChange(option.code);
                                    setPresentOpenIndex(null);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      option.code === field.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {option.name}-{option.bn}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`additionalLands.${idx}.proposedLandUse`}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-slate-700 font-semibold pb-1">
                      Proposed Land Use *
                    </FormLabel>
                    <Popover
                      open={proposedOpenIndex === idx}
                      onOpenChange={(open) => setProposedOpenIndex(open ? idx : null)}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={proposedOpenIndex === idx}
                            className={cn(
                              "h-12 w-full justify-between bg-white/50 border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm rounded-xl font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <span className="truncate">
                              {field.value
                                ? LAND_CLASSIFICATIONS.find((opt) => opt.code === field.value)?.name
                                : "Select"}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-xl" align="start">
                        <Command>
                          <CommandInput placeholder="Search land use..." />
                          <CommandList>
                            <CommandEmpty>No land use found.</CommandEmpty>
                            <CommandGroup>
                              {LAND_CLASSIFICATIONS.map((option) => (
                                <CommandItem
                                  key={option.code}
                                  value={option.name}
                                  onSelect={() => {
                                    field.onChange(option.code);
                                    setProposedOpenIndex(null);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      option.code === field.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {option.name}-{option.bn}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="default"
          className="mt-6 w-full md:w-auto bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 hover:border-indigo-300 transition-all h-12 rounded-xl shadow-sm hover:shadow active:scale-95"
          onClick={() => append({ ...emptyLand, proposedLandUse: primaryProposedLandUse || "" })}
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Add Another Land Parcel
        </Button>
      </CardContent>
    </Card>
  );
}
