"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  User, 
  MapPin, 
  Calendar, 
  Info, 
  Loader2, 
  Check, 
  Building2, 
  Hash, 
  Shield, 
  BookOpen,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { villagenameOption } from "@/constants";
import { birthVerificationReportSchema, type BirthVerificationReportFormData } from "@/schema/birth-verification-report";
import { createBirthVerificationReport, updateBirthVerificationReport, getNextGpMemoNo } from "@/action/birth-verification-report";

interface BirthVerificationFormProps {
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const RECIPIENT_PRESETS = [
  {
    label: "DIO (NIC)",
    authority: "The District Informatics Officer (DIO)",
    zone: "Hili Zone, Dakshin Dinajpur"
  },
  {
    label: "BDO Hili",
    authority: "The Block Development Officer (BDO)",
    zone: "Hili Block, Dakshin Dinajpur"
  },
  {
    label: "SDO Balurghat",
    authority: "The Sub-Divisional Officer (SDO)",
    zone: "Balurghat Sub-Division, Dakshin Dinajpur"
  },
  {
    label: "CMOH Office",
    authority: "The Chief Medical Officer of Health (CMOH)",
    zone: "Dakshin Dinajpur"
  },
  {
    label: "DM Office",
    authority: "The District Magistrate (DM)",
    zone: "Dakshin Dinajpur District"
  }
];

const getSafeDateString = (date: any): string => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

const getVillageFromAddress = (addressStr: string): string => {
  if (!addressStr) return "";
  const found = villagenameOption.find(v => 
    addressStr.toLowerCase().includes(v.value.toLowerCase()) || 
    addressStr.toLowerCase().includes(v.label.toLowerCase())
  );
  return found ? found.value : "";
};

export default function BirthVerificationForm({ initialData, onSuccess, onCancel }: BirthVerificationFormProps) {
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState(1);

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

  const [loadingMemo, setLoadingMemo] = useState(false);

  const gpMemoDate = form.watch("gpMemoDate");

  useEffect(() => {
    if (!initialData) {
      const year = gpMemoDate ? new Date(gpMemoDate).getFullYear() : new Date().getFullYear();
      setLoadingMemo(true);
      getNextGpMemoNo(year)
        .then((res) => {
          if (res.success && res.data) {
            form.setValue("gpMemoNo", res.data, { shouldValidate: true });
          }
        })
        .catch((err) => console.error("Error fetching next gpMemoNo:", err))
        .finally(() => setLoadingMemo(false));
    }
  }, [gpMemoDate, initialData, form]);

  const nextStep = async () => {
    if (step === 1) {
      const isValid = await form.trigger([
        "memoNo",
        "memoDate",
        "toAuthority",
        "toZone",
        "gpMemoNo",
        "gpMemoDate",
        "subject"
      ]);
      if (isValid) {
        setStep(2);
      } else {
        toast.error("Please fill in all required fields in Step 1 correctly.");
      }
    } else if (step === 2) {
      const isValid = await form.trigger([
        "certificateHolder",
        "dateOfBirth",
        "fatherName",
        "address",
        "registrationNo",
        "dateOfRegistration",
        "placeOfRegistration"
      ]);
      if (isValid) {
        setStep(3);
      } else {
        toast.error("Please fill in all required fields in Step 2 correctly.");
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleStepClick = async (targetStep: number) => {
    if (targetStep === 1) {
      setStep(1);
    } else if (targetStep === 2) {
      const isStep1Valid = await form.trigger([
        "memoNo",
        "memoDate",
        "toAuthority",
        "toZone",
        "gpMemoNo",
        "gpMemoDate",
        "subject"
      ]);
      if (isStep1Valid) {
        setStep(2);
      } else {
        toast.error("Please complete Step 1 before proceeding.");
      }
    } else if (targetStep === 3) {
      const isStep1Valid = await form.trigger([
        "memoNo",
        "memoDate",
        "toAuthority",
        "toZone",
        "gpMemoNo",
        "gpMemoDate",
        "subject"
      ]);
      if (!isStep1Valid) {
        toast.error("Please complete Step 1 first.");
        return;
      }
      const isStep2Valid = await form.trigger([
        "certificateHolder",
        "dateOfBirth",
        "fatherName",
        "address",
        "registrationNo",
        "dateOfRegistration",
        "placeOfRegistration"
      ]);
      if (isStep2Valid) {
        setStep(3);
      } else {
        toast.error("Please complete Step 2 before proceeding.");
      }
    }
  };

  const onSubmit = async (data: BirthVerificationReportFormData) => {
    if (step < 3) {
      await nextStep();
      return;
    }

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
    <Card className="border-0 shadow-2xl shadow-orange-900/5 overflow-hidden rounded-[2.5rem] bg-white/80 backdrop-blur-2xl ring-1 ring-white/60">
      <style>{`
        @keyframes formStepFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-step-in {
          animation: formStepFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <CardHeader className="bg-gradient-to-br from-orange-500/[0.03] to-amber-500/[0.03] border-b border-slate-100/80 py-8 px-6 md:px-10">
        <CardTitle className="flex flex-col md:flex-row md:items-center gap-5 text-orange-950">
          <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-[1.25rem] shadow-lg shadow-orange-500/30 shrink-0 self-start md:self-center">
            <FileText className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {initialData ? "Edit Verification Report" : "New Birth Verification Report"}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Create an official birth register verification report to be sent to external authorities.
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 md:p-10">
        {/* Stepper Progress Indicator */}
        <div className="mb-12 px-2 md:px-12 max-w-4xl mx-auto">
          <div className="flex items-center justify-between relative">
            {/* Background connecting lines */}
            <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-100 -translate-y-1/2 z-0 rounded-full" />
            <div 
              className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-orange-500 to-amber-500 -translate-y-1/2 z-0 rounded-full transition-all duration-700 ease-in-out shadow-sm"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />

            {/* Step 1 */}
            <button
              type="button"
              onClick={() => handleStepClick(1)}
              className="relative z-10 flex flex-col items-center focus:outline-none group"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-[3px] transition-all duration-500 font-bold text-sm ${
                step > 1 
                  ? "bg-gradient-to-br from-orange-500 to-orange-600 border-transparent text-white shadow-lg shadow-orange-500/40"
                  : step === 1 
                    ? "bg-white border-orange-500 text-orange-600 ring-8 ring-orange-500/10 scale-110 shadow-sm"
                    : "bg-white border-slate-200 text-slate-400 group-hover:border-slate-300 group-hover:text-slate-600"
              }`}>
                {step > 1 ? <Check className="h-5 w-5 stroke-[3]" /> : "1"}
              </div>
              <span className={`text-[11px] md:text-sm font-bold mt-4 transition-colors whitespace-nowrap ${
                step === 1 ? "text-orange-600" : "text-slate-500 font-semibold group-hover:text-slate-700"
              }`}>
                Office & References
              </span>
            </button>

            {/* Step 2 */}
            <button
              type="button"
              onClick={() => handleStepClick(2)}
              className="relative z-10 flex flex-col items-center focus:outline-none group"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-[3px] transition-all duration-500 font-bold text-sm ${
                step > 2 
                  ? "bg-gradient-to-br from-orange-500 to-orange-600 border-transparent text-white shadow-lg shadow-orange-500/40"
                  : step === 2 
                    ? "bg-white border-orange-500 text-orange-600 ring-8 ring-orange-500/10 scale-110 shadow-sm"
                    : "bg-white border-slate-200 text-slate-400 group-hover:border-slate-300 group-hover:text-slate-600"
              }`}>
                {step > 2 ? <Check className="h-5 w-5 stroke-[3]" /> : "2"}
              </div>
              <span className={`text-[11px] md:text-sm font-bold mt-4 transition-colors whitespace-nowrap ${
                step === 2 ? "text-orange-600" : "text-slate-500 font-semibold group-hover:text-slate-700"
              }`}>
                Certificate Particulars
              </span>
            </button>

            {/* Step 3 */}
            <button
              type="button"
              onClick={() => handleStepClick(3)}
              className="relative z-10 flex flex-col items-center focus:outline-none group"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-[3px] transition-all duration-500 font-bold text-sm ${
                step === 3 
                  ? "bg-white border-orange-500 text-orange-600 ring-8 ring-orange-500/10 scale-110 shadow-sm"
                  : "bg-white border-slate-200 text-slate-400 group-hover:border-slate-300 group-hover:text-slate-600"
              }`}>
                {step === 3 && initialData ? <Check className="h-5 w-5 stroke-[3]" /> : "3"}
              </div>
              <span className={`text-[11px] md:text-sm font-bold mt-4 transition-colors whitespace-nowrap ${
                step === 3 ? "text-orange-600" : "text-slate-500 font-semibold group-hover:text-slate-700"
              }`}>
                Verification Result
              </span>
            </button>
          </div>
        </div>

        <Form {...form}>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
                e.preventDefault();
                e.stopPropagation();
                if (step < 3) {
                  nextStep();
                }
              }
            }}
            className="space-y-8 max-w-4xl mx-auto"
          >
            
            {/* Step 1 Form Fields */}
            {step === 1 && (
              <div className="space-y-6 animate-step-in">
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden transition-all duration-300">
                  <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2.5">
                      <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                        <Info className="h-4 w-4" />
                      </div>
                      Office Memo & Receiving Department
                    </h2>
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                      Step 1 of 3
                    </span>
                  </div>
                  
                  <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Panel: Receiving Department (Request Details) */}
                    <div className="space-y-5">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-orange-400" />
                        Receiving Department Details
                      </h3>
                      
                      <div className="space-y-5">
                        {/* Quick Presets row */}
                        <div className="space-y-2.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Quick Recipient Presets
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {RECIPIENT_PRESETS.map((preset, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  form.setValue("toAuthority", preset.authority, { shouldValidate: true });
                                  form.setValue("toZone", preset.zone, { shouldValidate: true });
                                  toast.info(`Applied preset: ${preset.label}`, { duration: 1500 });
                                }}
                                className="text-[11px] font-bold bg-white hover:bg-orange-50 text-slate-600 hover:text-orange-700 border border-slate-200 hover:border-orange-300 px-3 py-1.5 rounded-xl transition-all shadow-sm cursor-pointer select-none"
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <FormField
                          control={form.control}
                          name="memoNo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold text-slate-700">Reference / Incoming Memo No. *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                  <Input className="pl-10 rounded-xl bg-slate-50/50 border-slate-200/80 focus:bg-white focus:border-orange-500 focus:ring-orange-500/20 hover:border-orange-300/50 transition-all shadow-sm h-11" placeholder="Enter incoming memo number..." {...field} />
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
                              <FormLabel className="text-xs font-bold text-slate-700">Incoming Memo Date *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                  <Input
                                    className="pl-10 rounded-xl bg-slate-50/50 border-slate-200/80 focus:bg-white focus:border-orange-500 focus:ring-orange-500/20 hover:border-orange-300/50 transition-all shadow-sm h-11"
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
                              <FormLabel className="text-xs font-bold text-slate-700">Recipient Authority *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                  <Input className="pl-10 rounded-xl bg-slate-50/50 border-slate-200/80 focus:bg-white focus:border-orange-500 focus:ring-orange-500/20 hover:border-orange-300/50 transition-all shadow-sm h-11" placeholder="e.g. The District Informatics Officer (DIO)" {...field} />
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
                              <FormLabel className="text-xs font-bold text-slate-700">Recipient Zone / Location *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                  <Input className="pl-10 rounded-xl bg-slate-50/50 border-slate-200/80 focus:bg-white focus:border-orange-500 focus:ring-orange-500/20 hover:border-orange-300/50 transition-all shadow-sm h-11" placeholder="e.g. Hili Zone, Dakshin Dinajpur" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Right Panel: GP Outgoing Reference */}
                    <div className="space-y-5 p-6 rounded-[1.5rem] bg-orange-50/40 border border-orange-100/60 shadow-inner">
                      <h3 className="text-xs font-black text-orange-700 uppercase tracking-widest border-b border-orange-200/60 pb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-orange-500" />
                        GP Outgoing Reference
                      </h3>
                      
                      <div className="space-y-5">
                        <FormField
                          control={form.control}
                          name="gpMemoNo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold text-slate-700 flex justify-between items-center">
                                <span>GP Outgoing Memo No. *</span>
                                {!initialData && (
                                  <span className="text-[9px] font-black uppercase text-orange-600 bg-white px-2 py-0.5 rounded-full border border-orange-200 shadow-sm animate-pulse">
                                    Auto-Generated
                                  </span>
                                )}
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                  <Input
                                    className="pl-10 rounded-xl bg-slate-100/80 border-slate-200 focus-visible:ring-orange-500 text-sm h-11 transition-colors cursor-not-allowed font-mono font-medium shadow-sm"
                                    placeholder="Auto-generating..."
                                    readOnly
                                    {...field}
                                  />
                                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                                    {loadingMemo && (
                                      <span className="animate-spin h-4 w-4 border-2 border-orange-500 rounded-full border-t-transparent" />
                                    )}
                                  </div>
                                </div>
                              </FormControl>
                              <FormDescription className="text-[10px] text-slate-500 font-medium mt-1.5">
                                {!initialData 
                                  ? "Sequentially generated based on the selected GP memo year."
                                  : "The GP memo number is fixed and cannot be edited."}
                              </FormDescription>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="gpMemoDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold text-slate-700">GP Outgoing Memo Date *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                  <Input
                                    className="pl-10 rounded-xl bg-white border-slate-200 focus:border-orange-500 focus:ring-orange-500/20 hover:border-orange-300/50 transition-all shadow-sm h-11"
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
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold text-slate-700">Subject *</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                  <Input className="pl-10 rounded-xl bg-white border-slate-200 focus:border-orange-500 focus:ring-orange-500/20 hover:border-orange-300/50 transition-all shadow-sm h-11" placeholder="Verification Subject" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 Form Fields */}
            {step === 2 && (
              <div className="space-y-6 animate-step-in">
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden transition-all duration-300">
                  <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2.5">
                      <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      Birth Certificate Particulars
                    </h2>
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                      Step 2 of 3
                    </span>
                  </div>
                  <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="certificateHolder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-slate-700">Name of Certificate Holder *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input className="pl-10 rounded-xl bg-slate-50/50 border-slate-200/80 focus:bg-white focus:border-orange-500 focus:ring-orange-500/20 hover:border-orange-300/50 transition-all shadow-sm h-11" placeholder="Full name of child/holder" {...field} />
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
                          <FormLabel className="text-xs font-bold text-slate-700">Date of Birth *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                              <Input
                                className="pl-10 rounded-xl bg-slate-50/50 border-slate-200/80 focus:bg-white focus:border-orange-500 focus:ring-orange-500/20 hover:border-orange-300/50 transition-all shadow-sm h-11"
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
                          <FormLabel className="text-xs font-bold text-slate-700">Father&apos;s Name *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input className="pl-10 rounded-xl bg-slate-50/50 border-slate-200/80 focus:bg-white focus:border-orange-500 focus:ring-orange-500/20 hover:border-orange-300/50 transition-all shadow-sm h-11" placeholder="Father's full name" {...field} />
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
                          <FormLabel className="text-xs font-bold text-slate-700">Mother&apos;s Name <span className="text-slate-400 font-medium">(Optional)</span></FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input className="pl-10 rounded-xl bg-slate-50/50 border-slate-200/80 focus:bg-white focus:border-orange-500 focus:ring-orange-500/20 hover:border-orange-300/50 transition-all shadow-sm h-11" placeholder="Mother's full name" {...field} />
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
                          <FormLabel className="text-xs font-bold text-slate-700">Address (Village) *</FormLabel>
                          <Select
                            value={getVillageFromAddress(field.value)}
                            onValueChange={(value) => {
                              const po = value === "Purbba Gobindapur" ? "Fatepur" : "Trimohini";
                              const formatted = `Vill- ${value}, P.O.- ${po}, Dakshin Dinajpur`;
                              field.onChange(formatted);
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-slate-50/50 border-slate-200/80 focus:border-orange-500 focus:ring-orange-500/20 hover:border-orange-300/50 transition-all shadow-sm h-11 rounded-xl">
                                <SelectValue placeholder="Select Village / গ্রামের নাম লিখুন" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="border-slate-100 rounded-xl shadow-xl">
                              {villagenameOption.map((item) => (
                                <SelectItem key={item.value} value={item.value} className="py-2.5 rounded-lg cursor-pointer hover:bg-slate-50 font-medium">
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {field.value && (
                            <FormDescription className="text-[11px] text-slate-500 font-medium mt-1.5 p-2 bg-slate-50 rounded-lg border border-slate-100 inline-block">
                              Generated: <span className="font-bold text-slate-700">{field.value}</span>
                            </FormDescription>
                          )}
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="registrationNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-slate-700">Registration Number *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input className="pl-10 rounded-xl bg-slate-50/50 border-slate-200/80 focus:bg-white focus:border-orange-500 focus:ring-orange-500/20 hover:border-orange-300/50 transition-all shadow-sm h-11" placeholder="e.g. 159/June 06" {...field} />
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
                          <FormLabel className="text-xs font-bold text-slate-700">Date of Registration / Issue *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                              <Input
                                className="pl-10 rounded-xl bg-slate-50/50 border-slate-200/80 focus:bg-white focus:border-orange-500 focus:ring-orange-500/20 hover:border-orange-300/50 transition-all shadow-sm h-11"
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
                          <FormLabel className="text-xs font-bold text-slate-700">Place of Registration *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input className="pl-10 rounded-xl bg-slate-50/50 border-slate-200/80 focus:bg-white focus:border-orange-500 focus:ring-orange-500/20 hover:border-orange-300/50 transition-all shadow-sm h-11" placeholder="e.g. No. 3 Dhalpara Gram Panchayat" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 Form Fields */}
            {step === 3 && (
              <div className="space-y-6 animate-step-in">
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden transition-all duration-300">
                  <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2.5">
                      <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                        <Shield className="h-4 w-4" />
                      </div>
                      Verification & Authenticity
                    </h2>
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                      Step 3 of 3
                    </span>
                  </div>
                  <div className="p-6 md:p-8 space-y-8">
                    <FormField
                      control={form.control}
                      name="verificationResult"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <FormLabel className="text-xs font-black text-slate-500 uppercase tracking-widest">Verification Result *</FormLabel>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {/* Genuine Card */}
                            <div
                              onClick={() => field.onChange("GENUINE")}
                              className={`cursor-pointer rounded-[1.5rem] p-6 border-2 transition-all duration-300 flex flex-col items-center text-center gap-4 relative select-none hover:-translate-y-1 ${
                                field.value === "GENUINE"
                                  ? "border-green-500 bg-green-50/50 shadow-lg shadow-green-100/50"
                                  : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-md"
                              }`}
                            >
                              {field.value === "GENUINE" && (
                                <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-1 shadow-sm animate-in zoom-in duration-300">
                                  <Check className="h-3 w-3 stroke-[4]" />
                                </div>
                              )}
                              <div className={`p-4 rounded-[1.25rem] transition-colors duration-300 ${
                                field.value === "GENUINE" ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                              }`}>
                                <CheckCircle2 className="h-8 w-8" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-sm text-slate-800">Genuine & Authentic</h4>
                                <p className="text-[11px] font-medium text-slate-500 mt-1.5 leading-relaxed">
                                  Successfully verified in the official registry.
                                </p>
                              </div>
                            </div>

                            {/* Not Genuine Card */}
                            <div
                              onClick={() => field.onChange("NOT_GENUINE")}
                              className={`cursor-pointer rounded-[1.5rem] p-6 border-2 transition-all duration-300 flex flex-col items-center text-center gap-4 relative select-none hover:-translate-y-1 ${
                                field.value === "NOT_GENUINE"
                                  ? "border-red-500 bg-red-50/50 shadow-lg shadow-red-100/50"
                                  : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-md"
                              }`}
                            >
                              {field.value === "NOT_GENUINE" && (
                                <div className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-1 shadow-sm animate-in zoom-in duration-300">
                                  <Check className="h-3 w-3 stroke-[4]" />
                                </div>
                              )}
                              <div className={`p-4 rounded-[1.25rem] transition-colors duration-300 ${
                                field.value === "NOT_GENUINE" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-400"
                              }`}>
                                <XCircle className="h-8 w-8" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-sm text-slate-800">Not Genuine / Fake</h4>
                                <p className="text-[11px] font-medium text-slate-500 mt-1.5 leading-relaxed">
                                  Mismatches or not found in the official registry.
                                </p>
                              </div>
                            </div>

                            {/* Not Available Card */}
                            <div
                              onClick={() => field.onChange("NOT_AVAILABLE")}
                              className={`cursor-pointer rounded-[1.5rem] p-6 border-2 transition-all duration-300 flex flex-col items-center text-center gap-4 relative select-none hover:-translate-y-1 ${
                                field.value === "NOT_AVAILABLE"
                                  ? "border-amber-500 bg-amber-50/50 shadow-lg shadow-amber-100/50"
                                  : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-md"
                              }`}
                            >
                              {field.value === "NOT_AVAILABLE" && (
                                <div className="absolute top-4 right-4 bg-amber-500 text-white rounded-full p-1 shadow-sm animate-in zoom-in duration-300">
                                  <Check className="h-3 w-3 stroke-[4]" />
                                </div>
                              )}
                              <div className={`p-4 rounded-[1.25rem] transition-colors duration-300 ${
                                field.value === "NOT_AVAILABLE" ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"
                              }`}>
                                <AlertCircle className="h-8 w-8" />
                              </div>
                              <div>
                                <h4 className="font-extrabold text-sm text-slate-800">Register Not Available</h4>
                                <p className="text-[11px] font-medium text-slate-500 mt-1.5 leading-relaxed">
                                  Registry volumes are missing or damaged.
                                </p>
                              </div>
                            </div>
                          </div>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="remarks"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-slate-700">Verification Remarks <span className="text-slate-400 font-medium">(Optional)</span></FormLabel>
                          <FormControl>
                            <div className="relative">
                              <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                              <Textarea className="pl-10 pt-3.5 rounded-xl bg-slate-50/50 border-slate-200/80 focus:bg-white focus:border-orange-500 focus:ring-orange-500/20 hover:border-orange-300/50 transition-all shadow-sm" placeholder="Enter any extra findings or verification notes..." rows={4} {...field} />
                            </div>
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions / Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 mt-8">
              <div>
                {step > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors rounded-xl h-11 px-6 text-sm font-semibold shadow-sm flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                ) : (
                  onCancel && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={onCancel} 
                      disabled={isPending} 
                      className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors rounded-xl h-11 px-6 text-sm font-semibold shadow-sm"
                    >
                      Cancel
                    </Button>
                  )
                )}
              </div>

              <div className="flex items-center gap-3">
                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 transition-all active:scale-[0.98] rounded-xl h-11 px-8 text-sm font-bold flex items-center gap-2"
                  >
                    Next Step
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={form.handleSubmit(onSubmit)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30 transition-all active:scale-[0.98] rounded-xl h-11 px-8 text-sm font-bold flex items-center gap-2" 
                    disabled={isPending}
                  >
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
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
