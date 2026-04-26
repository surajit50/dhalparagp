"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { applicationSchema } from "@/lib/validation";
import { z } from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SAMABYATHI_VILLAGES,
  SAMABYATHI_RELATIONS,
} from "@/constants/samabyathi";
import { villagenameOption } from "@/constants";
import {
  User,
  Phone,
  MapPin,
  UserMinus,
  HeartHandshake,
  CalendarDays,
  SendHorizontal,
  Info,
  CreditCard,
  Fingerprint,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatAadhaar } from "@/lib/format";

type FormData = z.infer<typeof applicationSchema>;

export default function ApplicationForm({
  onSuccess,
}: {
  onSuccess?: (app: any) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      applicantName: "",
      mobileNumber: "",
      villageName: "",
      deceasedName: "",
      relation: "",
      dateOfDeath: "",
      voterId: "",
      aadhaarNumber: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/samabathy/application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // ✅ Safely parse JSON – catch if server returns unexpected response
      let result;
      try {
        result = await response.json();
      } catch {
        toast.error("Server returned an unexpected response. Please try again.");
        return;
      }

      if (!response.ok) {
        // ✅ If server returned field‑level errors, set them on the form
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            const fieldName = field as keyof FormData;
            const message = Array.isArray(messages) ? messages[0] : String(messages);
            form.setError(fieldName, {
              type: "server",
              message,
            });
          });
        } else {
          // Top‑level error as toast
          toast.error(result.error || "Failed to submit application");
        }
        return;
      }

      // Success
      setSubmittedApp(result.data);
      toast.success(
        `Application submitted! ID: ${result.data.applicationNumber}`
      );
      form.reset();
      if (onSuccess) onSuccess(result.data);
    } catch (error) {
      toast.error("An unexpected network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyApplicationNumber = () => {
    navigator.clipboard.writeText(submittedApp.applicationNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Application number copied to clipboard");
  };

  if (submittedApp) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            {/* Success Card */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 overflow-hidden relative">
              <div className="absolute -right-16 -top-16 w-40 h-40 bg-emerald-200/20 dark:bg-emerald-800/20 rounded-full blur-3xl" />
              <div className="absolute -left-16 -bottom-16 w-40 h-40 bg-teal-200/20 dark:bg-teal-800/20 rounded-full blur-3xl" />
              
              <CardContent className="pt-8 relative z-10">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-lg animate-pulse" />
                    <div className="relative w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-center text-emerald-900 dark:text-emerald-100 mb-2">
                  Application Submitted!
                </h2>
                
                <p className="text-center text-emerald-700 dark:text-emerald-300 mb-8">
                  Your application has been received and is now pending approval. Please keep your application number safe.
                </p>

                {/* Application Number Box */}
                <div className="bg-white dark:bg-slate-900 border-2 border-emerald-200 dark:border-emerald-800 rounded-lg p-6 mb-6">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-widest mb-3">
                    Application Number
                  </p>
                  <div className="flex items-center gap-4">
                    <p className="text-3xl font-mono font-bold text-emerald-600 dark:text-emerald-400 flex-1 text-balance">
                      {submittedApp.applicationNumber}
                    </p>
                    <button
                      onClick={handleCopyApplicationNumber}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Copy application number"
                    >
                      <Copy className={`h-5 w-5 transition-colors ${copied ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`} />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-emerald-600 dark:text-emerald-400 text-center italic font-medium">
                  Use this number to check your application status anytime.
                </p>
              </CardContent>
            </Card>

            {/* Action Button */}
            <Button
              variant="outline"
              className="w-full border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950"
              onClick={() => {
                setSubmittedApp(null);
                form.reset();
              }}
            >
              Submit Another Application
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Info className="h-4 w-4" />
            <span>Application Form</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Assistance Application
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Fill in your information below to apply for assistance
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Applicant Information Card */}
            <Card className="shadow-lg border-slate-200 dark:border-slate-800 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                      Applicant Information
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                      Enter your personal details below
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Applicant Name */}
                  <FormField
                    control={form.control}
                    name="applicantName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            {...field}
                            className="border-slate-300 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Mobile Number */}
                  <FormField
                    control={form.control}
                    name="mobileNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Mobile Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="10-digit number"
                            {...field}
                            maxLength={10}
                            inputMode="numeric"
                            className="border-slate-300 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Voter ID */}
                  <FormField
                    control={form.control}
                    name="voterId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Voter ID Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your Voter ID"
                            {...field}
                            className="border-slate-300 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Aadhaar Number */}
                  <FormField
                    control={form.control}
                    name="aadhaarNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Aadhaar Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="XXXX XXXX XXXX"
                            value={formatAadhaar(field.value || "")}
                            onChange={(e) => {
                              const raw = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 12);
                              field.onChange(raw);
                            }}
                            maxLength={14}
                            inputMode="numeric"
                            className="border-slate-300 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Village Selection */}
                  <FormField
                    control={form.control}
                    name="villageName"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Village / Locality
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-slate-300 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400">
                              <SelectValue placeholder="Select your village" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {villagenameOption.map((village) => (
                              <SelectItem key={village.value} value={village.value}>
                                {village.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Deceased Information Card */}
            <Card className="shadow-lg border-slate-200 dark:border-slate-800 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <UserMinus className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                      Deceased Information
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                      Provide details about the deceased person
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name of Deceased */}
                  <FormField
                    control={form.control}
                    name="deceasedName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Name of Deceased
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter name"
                            {...field}
                            className="border-slate-300 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Relationship */}
                  <FormField
                    control={form.control}
                    name="relation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Relationship
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-slate-300 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400">
                              <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SAMABYATHI_RELATIONS.map((rel) => (
                              <SelectItem key={rel} value={rel}>
                                {rel}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Date of Death */}
                  <FormField
                    control={form.control}
                    name="dateOfDeath"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Date of Death
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="border-slate-300 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400"
                          />
                        </FormControl>
                        <FormDescription className="text-slate-500 dark:text-slate-400">
                          As mentioned in the death certificate
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 gap-2"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <SendHorizontal className="h-4 w-4" />
                    <span>Submit Application</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
