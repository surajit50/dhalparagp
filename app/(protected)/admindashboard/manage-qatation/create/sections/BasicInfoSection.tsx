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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "WORK":
        return "Works";
      case "SUPPLY":
        return "Supply of Items";
      case "SALE":
        return "Sale of Old Items";
      default:
        return "Supply of Items";
    }
  };

  const getWorkNameLabel = (type: string) => {
    switch (type) {
      case "WORK":
        return "Name of Work/Service";
      case "SUPPLY":
        return "Name of Material/Item to Supply";
      case "SALE":
        return "Name of Item for Sale";
      default:
        return "Name of Work/Material/Item";
    }
  };

  const getWorkNamePlaceholder = (type: string) => {
    switch (type) {
      case "WORK":
        return "e.g. Building Maintenance Work";
      case "SUPPLY":
        return "e.g. Supply of HP Laptop";
      case "SALE":
        return "e.g. Old Tubewell Parts";
      default:
        return "Enter work/item name";
    }
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
                  <SelectItem value="SUPPLY">Supply of Items</SelectItem>
                  <SelectItem value="WORK">Works/Services</SelectItem>
                  <SelectItem value="SALE">Sale of Old Items</SelectItem>
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

        <FormField
          name="estimatedAmount"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Amount (₹) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  placeholder="e.g. 100000"
                  step="0.01"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
