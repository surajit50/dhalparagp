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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LandConversionApplicationInput } from "@/schema/land-conversion";
import { villagenameOption } from "@/constants/index";
import { User, Mail, Phone, MapPin } from "lucide-react";

export default function ApplicantInfoSection() {
  const { control } = useFormContext<LandConversionApplicationInput>();

  return (
    <Card className="shadow-sm border-blue-100">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border-b border-blue-100">
        <CardTitle className="text-blue-800 text-lg flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          Applicant Information
        </CardTitle>
        <p className="text-sm text-blue-600/70 mt-1">
          Provide your personal and contact details
        </p>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <div className="h-1 w-8 rounded-full bg-blue-200"></div>
            Contact Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FormField
              control={control}
              name="applicantName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-blue-500" />
                    Full Name *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter full name"
                      className="h-11 bg-slate-50/50 border-slate-200 focus:ring-blue-500 focus:border-blue-500"
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
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-blue-500" />
                    Phone *
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      inputMode="tel"
                      placeholder="10-digit mobile number"
                      className="h-11 bg-slate-50/50 border-slate-200 focus:ring-blue-500 focus:border-blue-500"
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
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-blue-500" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="example@email.com"
                      className="h-11 bg-slate-50/50 border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <div className="h-1 w-8 rounded-full bg-blue-200"></div>
            <MapPin className="h-4 w-4 text-slate-500" />
            Address Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FormField
              control={control}
              name="village"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Village *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 bg-slate-50/50 border-slate-200 focus:ring-blue-500 focus:border-blue-500">
                        <SelectValue placeholder="Select village" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {villagenameOption.map((mouza) => (
                        <SelectItem key={mouza.value} value={mouza.value}>
                          {mouza.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="postOffice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-medium">Post Office</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled
                      className="h-11 bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed"
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
                  <FormLabel className="text-slate-700 font-medium">Police Station (PS)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled
                      className="h-11 bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed"
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
                  <FormLabel className="text-slate-700 font-medium">District</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled
                      className="h-11 bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed"
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
                  <FormLabel className="text-slate-700 font-medium">State</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled
                      className="h-11 bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed"
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
