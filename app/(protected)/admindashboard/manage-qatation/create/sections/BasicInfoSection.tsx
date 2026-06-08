"use client";

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
import { Input } from "@/components/ui/input";
import type { UseFormReturn } from "react-hook-form";
import type { QuotationSchema } from "@/lib/schemas/quotation";

interface BasicInfoSectionProps {
  form: UseFormReturn<QuotationSchema>;
}

export default function BasicInfoSection({ form }: BasicInfoSectionProps) {
  const quotationType = form.watch("quotationType");
  const serviceCategory = form.watch("serviceCategory");

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "WORK":
        return "Works/Construction";
      case "SUPPLY":
        return "Supply of Items/Materials";
      case "SERVICE":
        return "Equipment/Services Hiring";
      default:
        return "Supply of Items/Materials";
    }
  };

  const getWorkNameLabel = (type: string) => {
    switch (type) {
      case "WORK":
        return "Name of Work/Project";
      case "SUPPLY":
        return "Name of Material/Item to Supply";
      case "SERVICE":
        return "Name of Service/Equipment";
      default:
        return "Name of Work/Material/Item";
    }
  };

  const getWorkNamePlaceholder = (type: string) => {
    switch (type) {
      case "WORK":
        return "e.g. Road Construction, Building Repair";
      case "SUPPLY":
        return "e.g. Supply of Cement, Steel Rods";
      case "SERVICE":
        return "e.g. JCB Hiring with Operator, Tractor with Trolley";
      default:
        return "Enter work/item name";
    }
  };

  const serviceCategoryOptions = {
    JCB_HIRING: "JCB/JCG Machine Hiring",
    TRACTOR_HIRING: "Tractor with Trolley Hiring",
    WATER_TANKER: "Water Tanker Hiring",
    VEHICLE_HIRING: "Vehicle Hiring",
    GENERATOR_HIRING: "Generator Set Hiring",
    SOUND_SYSTEM: "Sound System Hiring",
    EQUIPMENT_MAINTENANCE: "Equipment/Vehicle Maintenance",
    LABOR_ENGAGEMENT: "Labour/Manpower Engagement",
    OTHER_SERVICE: "Other Service",
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary border-b pb-2">
        Basic Information
      </h3>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            name="nitNo"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIT/NIQ No. *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. 001/NIT/24-25" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="nitDate"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Memo Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          name="quotationType"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type of Quotation *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SUPPLY">📦 Supply of Items/Materials</SelectItem>
                  <SelectItem value="WORK">🏗️ Works/Construction</SelectItem>
                  <SelectItem value="SERVICE">🔧 Equipment/Services Hiring</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>Type Selected:</strong> {getTypeLabel(quotationType)}
          </p>
        </div>

        {quotationType === "SERVICE" && (
          <FormField
            name="serviceCategory"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(serviceCategoryOptions).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          name="workName"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{getWorkNameLabel(quotationType)} *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={getWorkNamePlaceholder(quotationType)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {quotationType === "SERVICE" && (
          <FormField
            name="rateType"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rate Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rate type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="HOURLY">Per Hour</SelectItem>
                    <SelectItem value="DAILY">Per Day</SelectItem>
                    <SelectItem value="TRIP">Per Trip</SelectItem>
                    <SelectItem value="MONTHLY">Per Month</SelectItem>
                    <SelectItem value="FIXED">Fixed Rate</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          name="estimatedAmount"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {quotationType === "SERVICE" ? "Estimated Total Amount (₹)" : "Estimated Amount (₹)"} *
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  placeholder={quotationType === "SERVICE" ? "e.g. 10000" : "e.g. 100000"}
                  step="0.01"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {quotationType === "SERVICE" && (
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <p className="text-sm text-green-800">
              <strong>Note:</strong> For hiring services, specify the rate per hour/day/trip and the estimated total amount for the project duration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
