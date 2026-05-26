"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, User, MapPin, Calendar, Info, Loader2, Check, Building2, Hash, Shield, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { birthVerificationReportSchema, type BirthVerificationReportFormData } from "@/schema/birth-verification-report";
import { createBirthVerificationReport, updateBirthVerificationReport } from "@/action/birth-verification-report";

interface BirthVerificationFormProps {
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const getSafeDateString = (date: any): string => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

export default function BirthVerificationForm({ initialData, onSuccess, onCancel }: BirthVerificationFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<BirthVerificationReportFormData>({
    resolver: zodResolver(birthVerificationReportSchema),
    defaultValues: {
      memoNo: initialData?.memoNo || "",
      memoDate: initialData?.memoDate ? new Date(initialData.memoDate) : new Date(),
      gpMemoNo: initialData?.gpMemoNo || "",
      gpMemoDate: initialData?.gpMemoDate ? new Date(initialData.gpMemoDate) : new Date(),
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
      verificationResult: initialData?.verificationResult || "GENUINE",
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
    <Card className="border-t-4 border-orange-600 shadow-xl overflow-hidden rounded-2xl bg-white/70 backdrop-blur-md">
      <CardHeader className="bg-gradient-to-r from-orange-50/80 to-amber-50/40 border-b border-orange-100/60 py-5">
        <CardTitle className="flex items-center gap-4 text-orange-950">
          <div className="p-3 bg-orange-100/90 text-orange-600 rounded-2xl shadow-inner shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">
              {initialData ? "Edit Verification Report" : "New Birth Verification Report"}
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Create an official birth register verification report to be sent to external authorities.
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Header & Office Reference Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="border-l-4 border-orange-500 bg-slate-50/50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Info className="h-4 w-4 text-orange-600" />
                  Office Reference & Recipient Details
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100">
                  Section 1
                </span>
              </div>
              <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="memoNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700">Reference / Incoming Memo No. *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input className="pl-9 bg-slate-50/30 border-slate-200 focus-visible:ring-orange-500 text-sm h-10 transition-colors" placeholder="e.g. CAF066804290826" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="memoDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700">Incoming Memo Date *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                          <Input
                            className="pl-9 bg-slate-50/30 border-slate-200 focus-visible:ring-orange-500 text-sm h-10"
                            type="date"
                            value={getSafeDateString(field.value)}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val ? new Date(val) : undefined);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gpMemoNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700">GP Outgoing Memo No. *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input className="pl-9 bg-slate-50/30 border-slate-200 focus-visible:ring-orange-500 text-sm h-10 transition-colors" placeholder="e.g. 1/DGP/2026" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gpMemoDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700">GP Outgoing Memo Date *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                          <Input
                            className="pl-9 bg-slate-50/30 border-slate-200 focus-visible:ring-orange-500 text-sm h-10"
                            type="date"
                            value={getSafeDateString(field.value)}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val ? new Date(val) : undefined);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="toAuthority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700">Recipient Authority *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input className="pl-9 bg-slate-50/30 border-slate-200 focus-visible:ring-orange-500 text-sm h-10 transition-colors" placeholder="e.g. The District Informatics Officer (DIO)" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="toZone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700">Recipient Zone / Location *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input className="pl-9 bg-slate-50/30 border-slate-200 focus-visible:ring-orange-500 text-sm h-10 transition-colors" placeholder="e.g. Hili Zone, Dakshin Dinajpur" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-xs font-semibold text-slate-700">Subject *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input className="pl-9 bg-slate-50/30 border-slate-200 focus-visible:ring-orange-500 text-sm h-10 transition-colors" placeholder="Verification Subject" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Birth Certificate Details Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="border-l-4 border-orange-500 bg-slate-50/50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-orange-600" />
                  Birth Certificate Particulars
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100">
                  Section 2
                </span>
              </div>
              <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="certificateHolder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700">Name of Certificate Holder *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input className="pl-9 bg-slate-50/30 border-slate-200 focus-visible:ring-orange-500 text-sm h-10 transition-colors" placeholder="Full name of child/holder" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700">Date of Birth *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                          <Input
                            className="pl-9 bg-slate-50/30 border-slate-200 focus-visible:ring-orange-500 text-sm h-10"
                            type="date"
                            value={getSafeDateString(field.value)}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val ? new Date(val) : undefined);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fatherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700">Father&apos;s Name *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input className="pl-9 bg-slate-50/30 border-slate-200 focus-visible:ring-orange-500 text-sm h-10 transition-colors" placeholder="Father's full name" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="motherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700">Mother&apos;s Name *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input className="pl-9 bg-slate-50/30 border-slate-200 focus-visible:ring-orange-500 text-sm h-10 transition-colors" placeholder="Mother's full name" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-xs font-semibold text-slate-700">Address *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input className="pl-9 bg-slate-50/30 border-slate-200 focus-visible:ring-orange-500 text-sm h-10 transition-colors" placeholder="e.g. Vill- Kismatdapat, P.O.- Trimohini, Dakshin Dinajpur" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="registrationNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700">Registration Number *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input className="pl-9 bg-slate-50/30 border-slate-200 focus-visible:ring-orange-500 text-sm h-10 transition-colors" placeholder="e.g. 159/June 06" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfRegistration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700">Date of Registration / Issue *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                          <Input
                            className="pl-9 bg-slate-50/30 border-slate-200 focus-visible:ring-orange-500 text-sm h-10"
                            type="date"
                            value={getSafeDateString(field.value)}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val ? new Date(val) : undefined);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="placeOfRegistration"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-xs font-semibold text-slate-700">Place of Registration *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input className="pl-9 bg-slate-50/30 border-slate-200 focus-visible:ring-orange-500 text-sm h-10 transition-colors" placeholder="e.g. No. 3 Dhalpara Gram Panchayat" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Verification Status & Remarks */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="border-l-4 border-orange-500 bg-slate-50/50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-orange-600" />
                  Verification & Authenticity
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100">
                  Section 3
                </span>
              </div>
              <div className="p-5 md:p-6 space-y-6">
                <FormField
                  control={form.control}
                  name="verificationResult"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700">Verification Result *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white border-slate-200 focus:ring-orange-500 h-11 rounded-xl">
                            <SelectValue placeholder="Select verification result" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-slate-200 rounded-xl">
                          <SelectItem value="GENUINE" className="py-2.5 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="h-2.5 w-2.5 rounded-full bg-green-500 shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                              <div className="text-left">
                                <span className="font-bold text-slate-800 block text-xs">Genuine & Authentic</span>
                                <span className="text-[10px] text-muted-foreground block">Matched and traced in the official register</span>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="NOT_GENUINE" className="py-2.5 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                              <div className="text-left">
                                <span className="font-bold text-slate-800 block text-xs">Not Genuine / Authentic</span>
                                <span className="text-[10px] text-muted-foreground block">Not found or mismatches the official register</span>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="NOT_AVAILABLE" className="py-2.5 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                              <div className="text-left">
                                <span className="font-bold text-slate-800 block text-xs">Register Not Available</span>
                                <span className="text-[10px] text-muted-foreground block">Office register is missing or not available</span>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-slate-700">Verification Remarks (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Textarea className="pl-9 bg-slate-50/30 border-slate-200 focus-visible:ring-orange-500 text-sm transition-colors rounded-xl" placeholder="Enter any extra findings or verification notes..." rows={3} {...field} />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} disabled={isPending} className="border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors rounded-xl h-10 px-5 text-sm">
                  Cancel
                </Button>
              )}
              <Button type="submit" className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-sm hover:shadow-md transition-all active:scale-[0.98] rounded-xl h-10 px-6 text-sm font-semibold flex items-center gap-2" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
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
