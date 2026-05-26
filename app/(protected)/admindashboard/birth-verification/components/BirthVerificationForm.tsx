"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, User, MapPin, Calendar, Info, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { birthVerificationReportSchema, type BirthVerificationReportFormData } from "@/schema/birth-verification-report";
import { createBirthVerificationReport, updateBirthVerificationReport } from "@/action/birth-verification-report";

interface BirthVerificationFormProps {
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function BirthVerificationForm({ initialData, onSuccess, onCancel }: BirthVerificationFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<BirthVerificationReportFormData>({
    resolver: zodResolver(birthVerificationReportSchema),
    defaultValues: {
      memoNo: initialData?.memoNo || "",
      memoDate: initialData?.memoDate ? new Date(initialData.memoDate) : new Date(),
      toAuthority: initialData?.toAuthority || "The District Informatics Officer (DIO)",
      toZone: initialData?.toZone || "Hili Zone, Dakshin Dinajpur",
      subject: initialData?.subject || "Verification Report on Birth Certificate",
      certificateHolder: initialData?.certificateHolder || "",
      motherName: initialData?.motherName || "",
      fatherName: initialData?.fatherName || "",
      address: initialData?.address || "",
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth) : undefined,
      registrationNo: initialData?.registrationNo || "",
      dateOfRegistration: initialData?.dateOfRegistration ? new Date(initialData.dateOfRegistration) : undefined,
      placeOfRegistration: initialData?.placeOfRegistration || "No. 3 Dhalpara Gram Panchayat",
      isGenuine: initialData?.isGenuine !== undefined ? initialData.isGenuine : true,
      remarks: initialData?.remarks || "",
    },
  });

  const onSubmit = async (data: BirthVerificationReportFormData) => {
    startTransition(async () => {
      try {
        let result;
        if (initialData?.id) {
          result = await updateBirthVerificationReport(initialData.id, data);
        } else {
          result = await createBirthVerificationReport(data, false);
        }

        if (result.success) {
          toast.success(result.message);
          if (onSuccess) onSuccess();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error("Submission error:", error);
        toast.error("An error occurred during submission");
      }
    });
  };

  return (
    <Card className="border-t-4 border-orange-600 shadow-lg">
      <CardHeader className="bg-orange-50/50">
        <CardTitle className="flex items-center gap-3 text-orange-900">
          <FileText className="h-6 w-6 text-orange-600" />
          <div>
            <h1 className="text-xl font-bold">{initialData ? "Edit Verification Report" : "New Birth Verification Report"}</h1>
            <p className="text-sm font-normal text-muted-foreground mt-1">
              Create an official birth register verification report to be sent to external authorities.
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Header & Office Reference Section */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/60 space-y-4">
              <h2 className="text-md font-semibold text-slate-800 flex items-center gap-2 border-b pb-2">
                <Info className="h-4 w-4 text-orange-500" />
                Office Reference & Recipient Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="memoNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Memo / Reference Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. CAF066804290826" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="memoDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Memo Date *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? field.value.toISOString().split("T")[0] : ""}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="toAuthority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Authority *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. The District Informatics Officer (DIO)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="toZone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Zone / Location *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Hili Zone, Dakshin Dinajpur" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Subject *</FormLabel>
                      <FormControl>
                        <Input placeholder="Verification Subject" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Birth Certificate Details Section */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/60 space-y-4">
              <h2 className="text-md font-semibold text-slate-800 flex items-center gap-2 border-b pb-2">
                <User className="h-4 w-4 text-orange-500" />
                Birth Certificate Particulars
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="certificateHolder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name of Certificate Holder *</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name of child/holder" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? field.value.toISOString().split("T")[0] : ""}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fatherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Father&apos;s Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Father's full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="motherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mother&apos;s Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Mother's full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Vill- Kismatdapat, P.O.- Trimohini, Dakshin Dinajpur" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="registrationNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 159/June 06" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfRegistration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Registration / Issue *</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? field.value.toISOString().split("T")[0] : ""}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="placeOfRegistration"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Place of Registration *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. No. 3 Dhalpara Gram Panchayat" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Verification Status & Remarks */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/60 space-y-4">
              <h2 className="text-md font-semibold text-slate-800 flex items-center gap-2 border-b pb-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                Verification & Authenticity
              </h2>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isGenuine"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-white shadow-sm">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-semibold text-slate-800 cursor-pointer">
                          Genuine & Authentic Verification
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Check this box if the certificate particulars are found to match the official register and are genuine.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Remarks (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter any extra findings or verification notes..." rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                  Cancel
                </Button>
              )}
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white min-w-[120px]" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {initialData ? "Update Report" : "Save & Submit"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
