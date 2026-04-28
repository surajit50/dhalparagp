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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Additional land parcels (optional)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Add other plots that are part of this conversion request.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((item, idx) => (
          <div
            key={item.id}
            className="p-4 border rounded-md bg-slate-50 relative group"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
              onClick={() => remove(idx)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={control}
                name={`additionalLands.${idx}.mouza`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Mouza</FormLabel>
                    <Select
                      onValueChange={(val) => handleMouzaChange(idx, val)}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="mt-1">
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
                        <FormLabel className="text-xs">
                          {field === "landAreaDec"
                            ? "Land area (dec)"
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
                            className="mt-1"
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
                    <FormLabel className="text-xs">Present land use</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="mt-1">
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
                    <FormLabel className="text-xs">Proposed land use</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="mt-1">
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
          size="sm"
          className="mt-2"
          onClick={() => append({ ...emptyLand })}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add another land parcel
        </Button>
      </CardContent>
    </Card>
  );
}
