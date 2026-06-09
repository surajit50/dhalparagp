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
  const rateType = form.watch("rateType");

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
              <FormLabel>
                {quotationType === "SERVICE" 
                  ? "Description of Service/Equipment"
                  : "Description of Item/Work"
                } *
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ""}
                  placeholder={
                    quotationType === "SERVICE"
                      ? "Provide detailed description of equipment/services, specifications, availability..."
                      : "Provide detailed description of items/works to be supplied/executed..."
                  }
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
          <>
            <FormField
              name="itemCondition"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition of Items *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="Describe the physical/working condition of the items (e.g. used, scrap, non-functional, damaged)..."
                      rows={2}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="workLocation"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location of Items / Inspection Venue</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="Provide details where items are stored and where they can be inspected before bidding..."
                      rows={2}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {quotationType === "SERVICE" && (
          <div className="space-y-4">
            <FormField
              name="specifications"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment/Service Specifications</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder={`Include: Make/Model, Capacity, Features, Operator availability, Fuel charges included/excluded, Availability hours...`}
                      rows={3}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="workLocation"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Availability & Location</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="Where and when the service/equipment will be available, working hours, mobilization time..."
                      rows={2}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {quotationType === "SERVICE" && (
          <div className="bg-orange-50 p-3 rounded border border-orange-200">
            <p className="text-sm text-orange-800 font-semibold mb-2">Rate Terms for {rateType || "Hiring"}:</p>
            <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
              {rateType === "HOURLY" && (
                <>
                  <li>Rate inclusive of fuel, operator charges, and all taxes</li>
                  <li>Minimum hours per day: 8 hours or as per agreement</li>
                  <li>Over-time rates (if applicable): to be specified</li>
                  <li>Mobilization charges (if any): to be separately quoted</li>
                </>
              )}
              {rateType === "DAILY" && (
                <>
                  <li>Rate inclusive of fuel, operator, maintenance, and taxes</li>
                  <li>Standard working hours: 8 hours per day</li>
                  <li>Over-time charges (if applicable): to be separately quoted</li>
                </>
              )}
              {rateType === "TRIP" && (
                <>
                  <li>Rate per trip inclusive of all charges</li>
                  <li>Trip distance and load capacity: to be specified</li>
                  <li>Extra trips: to be charged separately</li>
                </>
              )}
              {rateType === "MONTHLY" && (
                <>
                  <li>Rate inclusive of all operating costs and taxes</li>
                  <li>Service hours per day: to be specified</li>
                  <li>Maintenance and repair responsibility: to be clarified</li>
                </>
              )}
              {rateType === "FIXED" && (
                <>
                  <li>One-time fixed rate for complete service</li>
                  <li>Scope of work inclusive of the fixed rate: to be defined</li>
                  <li>Any additional charges: to be separately quoted</li>
                </>
              )}
            </ul>
          </div>
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
                  placeholder={
                    quotationType === "SERVICE"
                      ? "Suppliers must have: Valid Trade License, PAN, GST Registration (if applicable), Equipment Registration Certificate, Insurance Certificate, Valid Driving License (for vehicle/machinery), etc."
                      : "Suppliers must have: Valid Trade License, PAN, GST Registration (if applicable), Bank Account, etc."
                  }
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
          {quotationType === "SALE" ? (
            <li>Rates must include all applicable taxes and loading charges</li>
          ) : (
            <li>Rates must include all taxes and incidental charges</li>
          )}
          <li>Authority reserves right to accept/reject quotations</li>
          {quotationType === "SALE" ? (
            <li>Payment of the full bid amount must be made prior to lifting/delivery of items</li>
          ) : (
            <li>Payment as per fund availability and satisfactory completion</li>
          )}
          {quotationType === "SERVICE" && (
            <>
              <li>Equipment must be in good working condition</li>
              <li>Valid insurance certificate to be provided</li>
              <li>Service to be provided as and when required</li>
              <li>Operator/Staff availability as per requirement</li>
            </>
          )}
          {quotationType === "SALE" && (
            <>
              <li>Items will be sold on 'As Is Where Is' basis</li>
              <li>Interested bidders can inspect the items at the specified location during office hours</li>
              <li>Items must be removed/lifted by the buyer at their own cost within 3 days of payment</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
