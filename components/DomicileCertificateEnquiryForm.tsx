"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { gpcode } from "@/constants/gpinfor";
import {
  domicileCertificateEnquirySchema,
  type DomicileCertificateEnquiryFormData,
} from "@/schema/domicile-certificate-enquiry";

export function DomicileCertificateEnquiryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DomicileCertificateEnquiryFormData>({
    resolver: zodResolver(domicileCertificateEnquirySchema),
    defaultValues: {
      memoNo: "",
      memoDate: new Date(),
      letterNumber: "",
      letterDate: new Date(),
      applicantName: "",
      applicantFatherName: "",
      applicantAddress: "",
      applicantVillage: "",
      applicantPostOffice: "",
      applicantDistrict: "",
      applicantState: "",
      enquiryFindings: [],
      documentsVerified: [],
      isPermanentResident: true,
      finalRemarks: "",
    },
  });

  const onSubmit = async (data: DomicileCertificateEnquiryFormData) => {
    setIsSubmitting(true);
    console.log("Form data:", data);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Domicile Certificate Enquiry Report
        </h1>
        <p className="text-gray-600 mt-2">
          Complete the form below to submit a domicile certificate enquiry report
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <CardTitle>Header Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="memoNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Memo Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 141/${gpcode}/2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Applicant Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name of the applicant" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Applicant Information */}
          <Card>
            <CardHeader>
              <CardTitle>Applicant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="applicantAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complete Address *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Full residential address"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Submitting..." : "Submit Enquiry Report"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
