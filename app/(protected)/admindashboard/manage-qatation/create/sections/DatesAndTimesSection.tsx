"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { UseFormReturn } from "react-hook-form";
import type { QuotationSchema } from "@/lib/schemas/quotation";

interface DatesAndTimesSectionProps {
  form: UseFormReturn<QuotationSchema>;
}

export default function DatesAndTimesSection({ form }: DatesAndTimesSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary border-b pb-2">
        Quotation Submission & Opening Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Submission Deadline Section */}
        <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <h4 className="font-semibold text-red-800">
            Last Date & Time for Submission
          </h4>
          <div className="space-y-3">
            <FormField
              name="submissionDate"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="submissionTime"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Time *</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-xs text-red-700 mt-2">
              ⚠️ Quotations submitted after this date/time will not be accepted
            </p>
          </div>
        </div>

        {/* Opening Details Section */}
        <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800">
            Date & Time of Opening
          </h4>
          <div className="space-y-3">
            <FormField
              name="openingDate"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opening Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="openingTime"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opening Time *</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-xs text-green-700 mt-2">
              ✓ Must be after submission deadline
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Opening date/time is automatically set to one day after submission. 
          Adjust if needed.
        </p>
      </div>
    </div>
  );
}
