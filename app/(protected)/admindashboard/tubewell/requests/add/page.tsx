"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitRepairRequest } from "@/action/tubewell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { villagenameOption } from "@/constants";

const commonProblems = [
  "Handle loose / not working",
  "Pump rod broken",
  "Water not lifting",
  "Leakage at pipe joints",
  "Base plate damaged",
  "Chain / pulley problem",
  "Cylinder valve stuck",
  "Foot valve defective",
  "Other",
];

const requestSchema = z
  .object({
    citizenName: z.string().min(1, "Required"),
    mobileNumber: z.string().optional(),
    address: z.string().min(1, "Required"),
    mouza: z.string().min(1, "Required"),
    problemType: z.string().min(1, "Select problem"),
    customProblem: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.problemType === "Other") {
        return !!data.customProblem && data.customProblem.trim() !== "";
      }
      return true;
    },
    {
      message: "Please describe the problem",
      path: ["customProblem"],
    }
  );

type RequestFormValues = z.infer<typeof requestSchema>;

export default function AddRequestPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      citizenName: "",
      mobileNumber: "",
      address: "",
      mouza: "",
      problemType: "",
      customProblem: "",
    },
  });

  const onSubmit = (data: RequestFormValues) => {
    const finalProblem =
      data.problemType === "Other"
        ? data.customProblem
        : data.problemType;

    startTransition(async () => {
      try {
        await submitRepairRequest({
          citizenName: data.citizenName,
          mobileNumber: data.mobileNumber || undefined,
          address: data.address,
          problemDetails: finalProblem,
          mouza: data.mouza,
        });

        toast.success("Complaint Registered Successfully");
        router.push("/admindashboard/tubewell/requests");
      } catch {
        toast.error("Submission Failed");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* BACK BUTTON */}
        <Button variant="ghost" size="sm" asChild className="mb-6 hover:bg-white hover:shadow-sm transition-all text-slate-500 hover:text-slate-900">
          <Link href="/admindashboard/tubewell/requests" className="flex items-center gap-2 font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to Requests
          </Link>
        </Button>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* HEADER */}
          <div className="bg-slate-900 px-8 py-10 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl font-bold tracking-tight">
                Log Repair Request
              </h1>
              <p className="text-slate-400 mt-2 font-medium">
                Register a new citizen complaint for tubewell maintenance.
              </p>
            </div>
            {/* Subtle decorative element */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
          </div>

          <div className="p-8 sm:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

                {/* SECTION: CITIZEN INFO */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Save className="h-4 w-4 text-orange-600" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">Citizen Information</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="citizenName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-bold mb-2">Full Name *</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isPending} placeholder="Enter citizen name" className="rounded-xl border-slate-200 focus:border-primary focus:ring-primary h-12 transition-all shadow-sm" />
                          </FormControl>
                          <FormMessage className="text-rose-500 font-medium" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mobileNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-bold mb-2">Mobile Number</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isPending} placeholder="10-digit mobile number" className="rounded-xl border-slate-200 focus:border-primary focus:ring-primary h-12 transition-all shadow-sm" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* SECTION: LOCATION */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Save className="h-4 w-4 text-orange-600" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">Tubewell Location</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="mouza"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-bold mb-2">Mouza / Village *</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={isPending}
                            >
                              <SelectTrigger className="rounded-xl border-slate-200 h-12 shadow-sm focus:ring-primary">
                                <SelectValue placeholder="Select mouza" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                {villagenameOption.map((m) => (
                                  <SelectItem key={m.label} value={m.label} className="focus:bg-slate-50 rounded-lg m-1 py-2 cursor-pointer">
                                    {m.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage className="text-rose-500 font-medium" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-bold mb-2">Specific Address *</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isPending} placeholder="Near landmark, ward no, etc." className="rounded-xl border-slate-200 focus:border-primary focus:ring-primary h-12 transition-all shadow-sm" />
                          </FormControl>
                          <FormMessage className="text-rose-500 font-medium" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* SECTION: PROBLEM DETAILS */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="p-2 bg-rose-50 rounded-lg">
                      <Save className="h-4 w-4 text-rose-600" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">Problem Details</h2>
                  </div>

                  <FormField
                    control={form.control}
                    name="problemType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-bold mb-2">Type of Problem *</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isPending}
                          >
                            <SelectTrigger className="rounded-xl border-slate-200 h-12 shadow-sm focus:ring-primary">
                              <SelectValue placeholder="Select reported issue" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                              {commonProblems.map((p) => (
                                <SelectItem key={p} value={p} className="focus:bg-slate-50 rounded-lg m-1 py-2 cursor-pointer">
                                  {p}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className="text-rose-500 font-medium" />
                      </FormItem>
                    )}
                  />

                  {form.watch("problemType") === "Other" && (
                    <FormField
                      control={form.control}
                      name="customProblem"
                      render={({ field }) => (
                        <FormItem className="animate-in fade-in slide-in-from-top-2 duration-300">
                          <FormLabel className="text-slate-700 font-bold mb-2">Describe Other Problem *</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={3}
                              {...field}
                              disabled={isPending}
                              placeholder="Please provide details about the issue..."
                              className="rounded-xl border-slate-200 focus:border-primary focus:ring-primary transition-all shadow-sm"
                            />
                          </FormControl>
                          <FormMessage className="text-rose-500 font-medium" />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                    className="rounded-xl px-8 h-12 font-bold text-slate-500 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="rounded-xl px-10 h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 gap-2"
                  >
                    <Save className="h-5 w-5" />
                    {isPending ? "Registering..." : "Register Complaint"}
                  </Button>
                </div>

              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
