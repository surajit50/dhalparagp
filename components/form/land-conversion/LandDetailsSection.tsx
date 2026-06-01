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
import { Check, ChevronsUpDown } from "lucide-react";
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
    <Card className="shadow-sm border-orange-100">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-50/50 border-b border-orange-100">
        <CardTitle className="text-orange-800 text-lg flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <svg
              className="h-4 w-4 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
          Land Details
        </CardTitle>
        <p className="text-sm text-orange-600/70 mt-1">
          Enter the primary land parcel information for conversion
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <div className="h-1 w-8 rounded-full bg-orange-200"></div>
            Primary Parcel Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FormField
              control={control}
              name="mouza"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">
                    Mouza *
                  </FormLabel>
                  <Select onValueChange={handleMouzaChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 bg-slate-50/50 border-slate-200 focus:ring-orange-500 focus:border-orange-500">
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
                      <FormLabel className="text-slate-700 font-medium">
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
                          className="h-11 bg-slate-50/50 border-slate-200 focus:ring-orange-500 focus:border-orange-500"
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
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <div className="h-1 w-8 rounded-full bg-orange-200"></div>
            Land Use Classification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField
              control={control}
              name="presentLandUse"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-slate-700 font-medium pb-2">
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
                            "h-11 w-full justify-between bg-slate-50/50 border-slate-200 focus:ring-orange-500 focus:border-orange-500 font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? LAND_CLASSIFICATIONS.find((opt) => opt.code === field.value)?.name
                            : "Select present land use"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
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
                  <FormLabel className="text-slate-700 font-medium pb-2">
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
                            "h-11 w-full justify-between bg-slate-50/50 border-slate-200 focus:ring-orange-500 focus:border-orange-500 font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? LAND_CLASSIFICATIONS.find((opt) => opt.code === field.value)?.name
                            : "Select proposed land use"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
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

