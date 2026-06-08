"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { UseFormReturn } from "react-hook-form";
import type { QuotationSchema } from "@/lib/schemas/quotation";

interface TermsConditionsSectionProps {
  form: UseFormReturn<QuotationSchema>;
}

export default function TermsConditionsSection({ form }: TermsConditionsSectionProps) {
  const quotationType = form.watch("quotationType");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-primary border-b pb-2">
        Terms & Conditions / Special Requirements
      </h3>

      <div className="space-y-4">
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description of Item/Work *</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  placeholder="Provide detailed description of items/works to be supplied/executed..."
                  rows={3}
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {quotationType === "SUPPLY" && (
          <FormField
            name="specifications"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Technical Specifications</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ""}
                    placeholder="Detailed technical specifications, brand, model, features..."
                    rows={3}
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {quotationType === "WORK" && (
          <FormField
            name="workLocation"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location of Work</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ""}
                    placeholder="Specific location details where work will be executed..."
                    rows={2}
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {quotationType === "SALE" && (
          <FormField
            name="itemCondition"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition of Items</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ""}
                    placeholder="Current condition, working status, age, defects (if any)..."
                    rows={3}
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          name="eligibilityCriteria"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Eligibility Criteria & Required Documents</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  placeholder="Suppliers must have: Valid Trade License, PAN, GST Registration (if applicable), Bank Account, etc."
                  rows={3}
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <p className="text-sm text-yellow-800 font-semibold mb-2">Standard Terms & Conditions:</p>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>Quotations must be submitted in sealed envelope</li>
          <li>Rates must include all taxes and incidental charges</li>
          <li>Authority reserves right to accept/reject quotations</li>
          <li>Payment as per fund availability and satisfactory completion</li>
          <li>Supplier to maintain confidentiality</li>
        </ul>
      </div>
    </div>
  );
}
