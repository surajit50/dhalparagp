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

export default function ApplicantInfoSection() {
  const { control } = useFormContext<LandConversionApplicationInput>();

  return (
    <Card className="shadow-sm border-blue-100">
      <CardHeader className="bg-blue-50/50 border-b border-blue-100">
        <CardTitle className="text-blue-800 text-lg">
          Applicant Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={control}
            name="applicantName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter full name"
                    className="focus:ring-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="applicantPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    inputMode="tel"
                    placeholder="10-digit mobile number"
                    className="focus:ring-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="applicantEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="example@email.com"
                    className="focus:ring-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            Address Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormField
              control={control}
              name="village"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Village *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="focus:ring-blue-500">
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="postOffice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Office</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled
                      className="bg-slate-50 border-slate-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="ps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Police Station (PS)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled
                      className="bg-slate-50 border-slate-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled
                      className="bg-slate-50 border-slate-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled
                      className="bg-slate-50 border-slate-200"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
