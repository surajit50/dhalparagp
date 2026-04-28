"use client";

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

export default function LandDetailsSection() {
  const { control, setValue } = useFormContext<LandConversionApplicationInput>();

  const handleMouzaChange = (value: string) => {
    const selectedVillage = villagenameOption.find((v) => v.value === value);
    if (selectedVillage) {
      setValue("mouza", value);
      setValue("jlNo", selectedVillage.jlNo);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Land Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="mouza"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mouza *</FormLabel>
                <Select onValueChange={handleMouzaChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
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
                <FormMessage />
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
                    <FormLabel>
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
                          name === "landAreaDec" ? "e.g. 5.5" : `Enter ${name}`
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ),
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="presentLandUse"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Present Land Use *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select present land use" />
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
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="proposedLandUse"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proposed Land Use *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select proposed land use" />
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
