"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
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
import { LandConversionApplicationInput } from "@/schema/land-conversion";
import { villagenameOption } from "@/constants/index";

const presentLandUseOptions = [
  { value: "agriculture", label: "Agriculture" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
] as const;

const proposedLandUseOptions = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "institutional", label: "Institutional" },
] as const;

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

  const handleMouzaChange = (idx: number, value: string) => {
    const selectedVillage = villagenameOption.find((v) => v.value === value);
    if (selectedVillage) {
      setValue(`additionalLands.${idx}.mouza`, value);
      setValue(`additionalLands.${idx}.jlNo`, selectedVillage.jlNo);
    }
  };

  return (
    <Card className="shadow-sm border-emerald-100">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50/50 border-b border-emerald-100">
        <CardTitle className="text-emerald-800 text-lg flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <PlusCircle className="h-4 w-4 text-emerald-600" />
          </div>
          Additional Land Parcels (Optional)
        </CardTitle>
        <p className="text-sm text-emerald-600/70 mt-1">
          Add other plots that are part of this conversion request
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {fields.map((item, idx) => (
          <div
            key={item.id}
            className="p-5 bg-gradient-to-br from-slate-50 to-emerald-50/30 border-2 border-emerald-100 rounded-xl relative group transition-all hover:border-emerald-200 hover:shadow-md"
          >
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                Parcel {idx + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
                onClick={() => remove(idx)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <FormField
                control={control}
                name={`additionalLands.${idx}.mouza`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Mouza</FormLabel>
                    <Select
                      onValueChange={(val) => handleMouzaChange(idx, val)}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 bg-white border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 text-sm">
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
                        <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                          {field === "landAreaDec"
                            ? "Land Area (dec)"
                            : field.replace(/([A-Z])/g, " $1").trim()}
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
                            className="h-10 bg-white border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
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
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Present Land Use</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 bg-white border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {presentLandUseOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`additionalLands.${idx}.proposedLandUse`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Proposed Land Use</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 bg-white border-slate-200 focus:ring-emerald-500 focus:border-emerald-500 text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {proposedLandUseOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
          className="mt-4 w-full md:w-auto border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 transition-all h-11"
          onClick={() => append({ ...emptyLand })}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Another Land Parcel
        </Button>
      </CardContent>
    </Card>
  );
}
