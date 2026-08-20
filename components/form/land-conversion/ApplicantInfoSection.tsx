"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { LandConversionApplicationInput } from "@/schema/land-conversion";
import { User, Mail, Phone, MapPin } from "lucide-react";

export default function ApplicantInfoSection() {
  const { control } = useFormContext<LandConversionApplicationInput>();

  return (
    <Card className="shadow-lg border-indigo-100/60 bg-white/70 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-indigo-200/60">
      <CardHeader className="bg-gradient-to-r from-indigo-50/80 to-transparent border-b border-indigo-100/60 pb-5">
        <CardTitle className="text-indigo-900 text-xl flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-indigo-50">
            <User className="h-5 w-5 text-indigo-600" />
          </div>
          Applicant Information
        </CardTitle>
        <p className="text-sm text-indigo-600/70 mt-2 font-medium">
          Provide your personal and contact details
        </p>
      </CardHeader>
      <CardContent className="space-y-8 pt-8">
        <div className="space-y-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200/60"></div>
            Contact Details
            <div className="h-px flex-1 bg-slate-200/60"></div>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={control}
              name="applicantName"
              render={({ field }) => (
                <FormItem className="group">
                  <FormLabel className="text-slate-700 font-semibold flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors">
                    <User className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    Full Name *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter full name"
                      className="h-12 bg-white/50 border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm rounded-xl"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="applicantPhone"
              render={({ field }) => (
                <FormItem className="group">
                  <FormLabel className="text-slate-700 font-semibold flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors">
                    <Phone className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    Phone *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      inputMode="tel"
                      placeholder="10-digit mobile number"
                      className="h-12 bg-white/50 border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm rounded-xl"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="applicantEmail"
              render={({ field }) => (
                <FormItem className="group">
                  <FormLabel className="text-slate-700 font-semibold flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors">
                    <Mail className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="example@email.com"
                      className="h-12 bg-white/50 border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm rounded-xl"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-5 pt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200/60"></div>
            <MapPin className="h-4 w-4 text-slate-400" />
            Address Details
            <div className="h-px flex-1 bg-slate-200/60"></div>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormField
              control={control}
              name="village"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">Village / Town / City *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter village or city"
                      className="h-12 bg-white/50 border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm rounded-xl"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="postOffice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">Post Office</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter post office"
                      className="h-12 bg-white/50 border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm rounded-xl"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="ps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">Police Station (PS)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter police station"
                      className="h-12 bg-white/50 border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm rounded-xl"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">District</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter district"
                      className="h-12 bg-white/50 border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm rounded-xl"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold">State</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter state"
                      className="h-12 bg-white/50 border-slate-200/80 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm rounded-xl"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
