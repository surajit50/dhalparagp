"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { LandConversionApplicationInput } from "@/schema/land-conversion";
import { LAND_CLASSIFICATIONS, villagenameOption } from "@/constants/index";

export default function LandDetailsSection() {
  const { control, setValue } =
    useFormContext<LandConversionApplicationInput>();

  const [presentOpen, setPresentOpen] = useState(false);
  const [proposedOpen, setProposedOpen] = useState(false);

  const handleMouzaChange = (value: string) => {
    const selectedVillage = villagenameOption.find((v) => v.value === value);
    if (selectedVillage) {
      setValue("mouza", value);
      setValue("jlNo", selectedVillage.jlNo);
    }
  };

  return (
    <Card className="shadow-lg border-indigo-100/60 bg-white/70 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-indigo-200/60 mt-8">
      <CardHeader className="bg-gradient-to-r from-indigo-50/80 to-transparent border-b border-indigo-100/60 pb-5">
        <CardTitle className="text-indigo-900 text-xl flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-indigo-50">
            <Map className="h-5 w-5 text-indigo-600" />
          </div>
          Land Details
        </CardTitle>
        <p className="text-sm text-indigo-600/70 mt-2 font-medium">
          Enter the primary land parcel information for conversion
        </p>
      </CardHeader>
      <CardContent className="space-y-8 pt-8">
        <div className="space-y-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200/60"></div>
            Primary Parcel Information
            <div className="h-px flex-1 bg-slate-200/60"></div>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={control}
              name="mouza"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">
                    Mouza *
                  </FormLabel>
                  <Select onValueChange={handleMouzaChange} value={field.value}>
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
              (name) => (
                <FormField
                  key={name}
                  control={control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">
                        {name === "landAreaDec"
                          ? "Land Area (Decimal) *"
                          : `${name.replace(/([A-Z])/g, " $1").trim()} *`}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          inputMode={
                            name === "landAreaDec" ? "decimal" : undefined
                          }
                          placeholder={
                            name === "landAreaDec"
                              ? "e.g. 5.5"
                              : `Enter ${name}`
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
          </div>
        </div>
        <div className="space-y-5 pt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200/60"></div>
            Land Use Classification
            <div className="h-px flex-1 bg-slate-200/60"></div>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="presentLandUse"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-slate-700 font-semibold pb-1">
                    Present Status *
                  </FormLabel>
                  <Popover open={presentOpen} onOpenChange={setPresentOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={presentOpen}
                          className={cn(
                            "h-12 w-full justify-between bg-white/50 border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm rounded-xl font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <span className="truncate">
                            {field.value
                              ? LAND_CLASSIFICATIONS.find((opt) => opt.code === field.value)?.name
                              : "Select present land use"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-xl" align="start">
                      <Command>
                        <CommandInput placeholder="Search present land use..." />
                        <CommandList>
                          <CommandEmpty>No land use found.</CommandEmpty>
                          <CommandGroup>
                            {LAND_CLASSIFICATIONS.map((option) => (
                              <CommandItem
                                key={option.code}
                                value={option.name}
                                onSelect={() => {
                                  field.onChange(option.code);
                                  setPresentOpen(false);
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
              name="proposedLandUse"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-slate-700 font-semibold pb-1">
                    Proposed Status *
                  </FormLabel>
                  <Popover open={proposedOpen} onOpenChange={setProposedOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={proposedOpen}
                          className={cn(
                            "h-12 w-full justify-between bg-white/50 border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm rounded-xl font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <span className="truncate">
                            {field.value
                              ? LAND_CLASSIFICATIONS.find((opt) => opt.code === field.value)?.name
                              : "Select proposed land use"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-xl" align="start">
                      <Command>
                        <CommandInput placeholder="Search proposed land use..." />
                        <CommandList>
                          <CommandEmpty>No land use found.</CommandEmpty>
                          <CommandGroup>
                            {LAND_CLASSIFICATIONS.map((option) => (
                              <CommandItem
                                key={option.code}
                                value={option.name}
                                onSelect={() => {
                                  field.onChange(option.code);
                                  setProposedOpen(false);
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
      </CardContent>
    </Card>
  );
}

