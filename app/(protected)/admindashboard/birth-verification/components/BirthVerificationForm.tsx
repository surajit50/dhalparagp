"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, User, MapPin, Calendar, Info, Loader2, Check, Building2, Hash, Shield, BookOpen, HelpCircle } from "lucide-react";
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

  // Reset form when initialData changes (edit mode)
  useEffect(() => {
    if (initialData) {
      form.reset({
        memoNo: initialData.memoNo || "",
        memoDate: initialData.memoDate ? new Date(initialData.memoDate) : new Date(),
        gpMemoNo: initialData.gpMemoNo || "",
        gpMemoDate: initialData.gpMemoDate ? new Date(initialData.gpMemoDate) : new Date(),
        toAuthority: initialData.toAuthority || "The District Informatics Officer (DIO)",
        toZone: initialData.toZone || "Hili Zone, Dakshin Dinajpur",
        subject: initialData.subject || "Verification Report on Birth Certificate",
        certificateHolder: initialData.certificateHolder || "",
        motherName: initialData.motherName || "",
        fatherName: initialData.fatherName || "",
        address: initialData.address || "",
        dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth) : undefined,
        registrationNo: initialData.registrationNo || "",
        dateOfRegistration: initialData.dateOfRegistration ? new Date(initialData.dateOfRegistration) : undefined,
        placeOfRegistration: initialData.placeOfRegistration || "No. 3 Dhalpara Gram Panchayat",
        verificationResult: initialData.verificationResult || "GENUINE",
        remarks: initialData.remarks || "",
      });
    }
  }, [initialData, form]);

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

  // Helper to display verification status with dot
  const getVerificationDisplay = (value: string) => {
    switch (value) {
      case "GENUINE":
        return { label: "Genuine & Authentic", dotClass: "bg-green-500", textClass: "text-green-700" };
      case "NOT_GENUINE":
        return { label: "Not Genuine", dotClass: "bg-red-500", textClass: "text-red-700" };
      case "NOT_AVAILABLE":
        return { label: "Register Not Available", dotClass: "bg-amber-500", textClass: "text-amber-700" };
      default:
        return { label: "Select status", dotClass: "bg-gray-400", textClass: "text-gray-700" };
    }
  };

  const selectedVerification = form.watch("verificationResult");
  const verificationDisplay = getVerificationDisplay(selectedVerification);

  return (
    <Card className="border-0 shadow-2xl overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
      {/* Decorative gradient bar */}
      <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600" />

      <CardHeader className="bg-white border-b border-slate-100 pb-6 pt-7 px-6 md:px-8">
        <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-4 text-slate-800">
          <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-100 text-orange-600 rounded-2xl shadow-sm shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              {initialData ? "Edit Verification Report" : "New Birth Verification Report"}
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Create an official birth register verification report to be sent to external authorities. All marked fields are required.
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 md:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Office Reference Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
              <div className="border-l-4 border-orange-500 bg-gradient-to-r from-slate-50/80 to-white px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
                  <Info className="h-4.5 w-4.5 text-orange-600" />
                  Office Reference & Recipient Details
                </h2>
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 shadow-sm">
                  Section 1 of 3
                </span>
              </div>
              <div className="p-6 md:p-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="memoNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        Reference / Incoming Memo No. <span className="text-orange-500 text-base">*</span>
                        <HelpCircle className="h-3.5 w-3.5 text-slate-400 cursor-help" title="Unique reference number from the incoming memo" />
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                          <Input
                            className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:border-orange-500 transition-all duration-200 h-11 rounded-xl"
                            placeholder="e.g. CAF066804290826"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="memoDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        Incoming Memo Date <span className="text-orange-500 text-base">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-orange-500 pointer-events-none" />
                          <Input
                            className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:border-orange-500 transition-all duration-200 h-11 rounded-xl"
                            type="date"
                            value={getSafeDateString(field.value)}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val ? new Date(val) : undefined);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gpMemoNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        GP Outgoing Memo No. <span className="text-orange-500 text-base">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                          <Input
                            className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:border-orange-500 transition-all duration-200 h-11 rounded-xl"
                            placeholder="e.g. 1/DGP/2026"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gpMemoDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        GP Outgoing Memo Date <span className="text-orange-500 text-base">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-orange-500 pointer-events-none" />
                          <Input
                            className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:border-orange-500 transition-all duration-200 h-11 rounded-xl"
                            type="date"
                            value={getSafeDateString(field.value)}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val ? new Date(val) : undefined);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="toAuthority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        Recipient Authority <span className="text-orange-500 text-base">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                          <Input
                            className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:border-orange-500 transition-all duration-200 h-11 rounded-xl"
                            placeholder="e.g. The District Informatics Officer (DIO)"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="toZone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        Recipient Zone / Location <span className="text-orange-500 text-base">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                          <Input
                            className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:border-orange-500 transition-all duration-200 h-11 rounded-xl"
                            placeholder="e.g. Hili Zone, Dakshin Dinajpur"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        Subject <span className="text-orange-500 text-base">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                          <Input
                            className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:border-orange-500 transition-all duration-200 h-11 rounded-xl"
                            placeholder="Verification Subject"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Birth Certificate Particulars */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
              <div className="border-l-4 border-orange-500 bg-gradient-to-r from-slate-50/80 to-white px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
                  <BookOpen className="h-4.5 w-4.5 text-orange-600" />
                  Birth Certificate Particulars
                </h2>
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 shadow-sm">
                  Section 2 of 3
                </span>
              </div>
              <div className="p-6 md:p-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="certificateHolder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        Name of Certificate Holder <span className="text-orange-500 text-base">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                          <Input
                            className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:border-orange-500 transition-all duration-200 h-11 rounded-xl"
                            placeholder="Full name of child/holder"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        Date of Birth <span className="text-orange-500 text-base">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-orange-500 pointer-events-none" />
                          <Input
                            className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:border-orange-500 transition-all duration-200 h-11 rounded-xl"
                            type="date"
                            value={getSafeDateString(field.value)}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val ? new Date(val) : undefined);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fatherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        Father&apos;s Name <span className="text-orange-500 text-base">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                          <Input
                            className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:border-orange-500 transition-all duration-200 h-11 rounded-xl"
                            placeholder="Father's full name"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="motherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        Mother&apos;s Name <span className="text-orange-500 text-base">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                          <Input
                            className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:border-orange-500 transition-all duration-200 h-11 rounded-xl"
                            placeholder="Mother's full name"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        Address <span className="text-orange-500 text-base">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                          <Input
                            className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:border-orange-500 transition-all duration-200 h-11 rounded-xl"
                            placeholder="e.g. Vill- Kismatdapat, P.O.- Trimohini, Dakshin Dinajpur"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="registrationNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        Registration Number <span className="text-orange-500 text-base">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                          <Input
                            className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:border-orange-500 transition-all duration-200 h-11 rounded-xl"
                            placeholder="e.g. 159/June 06"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfRegistration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        Date of Registration / Issue <span className="text-orange-500 text-base">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-orange-500 pointer-events-none" />
                          <Input
                            className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:border-orange-500 transition-all duration-200 h-11 rounded-xl"
                            type="date"
                            value={getSafeDateString(field.value)}
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(val ? new Date(val) : undefined);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="placeOfRegistration"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        Place of Registration <span className="text-orange-500 text-base">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                          <Input
                            className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:border-orange-500 transition-all duration-200 h-11 rounded-xl"
                            placeholder="e.g. No. 3 Dhalpara Gram Panchayat"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Verification & Remarks */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
              <div className="border-l-4 border-orange-500 bg-gradient-to-r from-slate-50/80 to-white px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
                  <Shield className="h-4.5 w-4.5 text-orange-600" />
                  Verification & Authenticity
                </h2>
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 shadow-sm">
                  Section 3 of 3
                </span>
              </div>
              <div className="p-6 md:p-7 space-y-7">
                <FormField
                  control={form.control}
                  name="verificationResult"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        Verification Result <span className="text-orange-500 text-base">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white border-slate-200 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 h-11 rounded-xl transition-all duration-200">
                            <SelectValue placeholder="Select verification result">
                              {selectedVerification && (
                                <div className="flex items-center gap-2">
                                  <span className={`h-2.5 w-2.5 rounded-full ${verificationDisplay.dotClass} shadow-sm`} />
                                  <span className={`text-sm font-medium ${verificationDisplay.textClass}`}>
                                    {verificationDisplay.label}
                                  </span>
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-slate-200 rounded-xl">
                          <SelectItem value="GENUINE" className="py-3 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="h-2.5 w-2.5 rounded-full bg-green-500 shrink-0 shadow-md" />
                              <div className="text-left">
                                <span className="font-bold text-slate-800 block text-sm">Genuine & Authentic</span>
                                <span className="text-xs text-muted-foreground block">Matched and traced in the official register</span>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="NOT_GENUINE" className="py-3 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0 shadow-md" />
                              <div className="text-left">
                                <span className="font-bold text-slate-800 block text-sm">Not Genuine / Authentic</span>
                                <span className="text-xs text-muted-foreground block">Not found or mismatches the official register</span>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="NOT_AVAILABLE" className="py-3 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0 shadow-md" />
                              <div className="text-left">
                                <span className="font-bold text-slate-800 block text-sm">Register Not Available</span>
                                <span className="text-xs text-muted-foreground block">Office register is missing or not available</span>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        Verification Remarks <span className="text-slate-400 text-xs font-normal">(Optional)</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <FileText className="absolute left-3 top-3.5 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-orange-500" />
                          <Textarea
                            className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:border-orange-500 transition-all duration-200 rounded-xl resize-none"
                            placeholder="Enter any extra findings, discrepancies, or verification notes..."
                            rows={3}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-8 border-t border-slate-100 sticky bottom-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md -mx-2 px-4 mt-6">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isPending}
                  className="w-full sm:w-auto border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 rounded-xl h-11 px-6 text-sm font-medium"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98] rounded-xl h-11 px-8 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="h-4.5 w-4.5" />
                    {initialData ? "Update Report" : "Save & Submit"}
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-center text-slate-400 pt-4 border-t border-slate-100 mt-4">
              All fields marked with <span className="text-orange-500 font-bold">*</span> are required. Please double-check before submission.
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
