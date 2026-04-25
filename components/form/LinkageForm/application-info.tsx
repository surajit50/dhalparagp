import type React from "react";
import type { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LinkageFormValuesType } from "./constants";
import { BilingualLabel } from "@/components/form/WarishForm/bilingual-label";
import { villagenameOption } from "@/constants";

interface ApplicationInfoProps {
  form: UseFormReturn<LinkageFormValuesType>;
}

export const ApplicationInfo: React.FC<ApplicationInfoProps> = ({ form }) => {
  // Function to capitalize each word
  const capitalizeWords = (str: string) => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg shadow-sm">
      {/* Applicant Name */}
      <FormField
        control={form.control}
        name="applicantName"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">
              <BilingualLabel english="Applicant Name" bengali="আবেদনকারীর নাম" />
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Applicant Name / আবেদনকারীর নাম"
                {...field}
                onChange={(e) => field.onChange(capitalizeWords(e.target.value))}
                className="h-10 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </FormControl>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />

      {/* Phone Number */}
      <FormField
        control={form.control}
        name="applicantPhone"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">
              <BilingualLabel english="Mobile Number" bengali="মোবাইল নম্বর" />
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Enter Mobile Number / মোবাইল নম্বর দিন"
                {...field}
                className="h-10 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </FormControl>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />

      {/* Email */}
      <FormField
        control={form.control}
        name="applicantEmail"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">
              <BilingualLabel english="Email Address" bengali="ইমেইল ঠিকানা" />
            </FormLabel>
            <FormControl>
              <Input
                placeholder="email@example.com"
                {...field}
                className="h-10 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </FormControl>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />

      {/* Village Name — with auto post-office fill */}
      <FormField
        control={form.control}
        name="applicantVillage"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              <BilingualLabel english="Village Name" bengali="গ্রামের নাম" />
            </FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  // Auto-fill post office based on village
                  if (value === "Purbba Gobindapur") {
                    form.setValue("applicantPostOffice", "Fatepur");
                  } else {
                    form.setValue("applicantPostOffice", "Trimohini");
                  }
                }}
              >
                <SelectTrigger className="w-full h-10 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Enter Village / গ্রামের নাম লিখুন" />
                </SelectTrigger>
                <SelectContent>
                  {villagenameOption.map((item) => (
                    <SelectItem value={item.value} key={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />

      {/* Post Office — auto-filled, disabled */}
      <FormField
        control={form.control}
        name="applicantPostOffice"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              <BilingualLabel english="Post Office" bengali="ডাকঘর" />
            </FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled
              >
                <SelectTrigger className="w-full h-10 text-sm bg-gray-50 border-gray-300 text-gray-600 cursor-not-allowed">
                  <SelectValue placeholder="Auto-filled based on village / গ্রাম অনুযায়ী স্বয়ংক্রিয়ভাবে পূরণ করা হবে" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Trimohini">Trimohini</SelectItem>
                  <SelectItem value="Fatepur">Fatepur</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />

      {/* Block */}
      <FormField
        control={form.control}
        name="applicantBlock"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">
              <BilingualLabel english="Block" bengali="ব্লক" />
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                onChange={(e) => field.onChange(capitalizeWords(e.target.value))}
                className="h-10 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </FormControl>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />

      {/* District */}
      <FormField
        control={form.control}
        name="applicantDistrict"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">
              <BilingualLabel english="District" bengali="জেলা" />
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                onChange={(e) => field.onChange(capitalizeWords(e.target.value))}
                className="h-10 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </FormControl>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />

      {/* Full Address */}
      <FormField
        control={form.control}
        name="applicantAddress"
        render={({ field }) => (
          <FormItem className="space-y-2 lg:col-span-2">
            <FormLabel className="text-sm font-medium text-gray-700">
              <BilingualLabel english="Full Address" bengali="সম্পূর্ণ ঠিকানা" />
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Village, PO, PS, District"
                {...field}
                onChange={(e) => field.onChange(capitalizeWords(e.target.value))}
                className="h-10 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </FormControl>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />

      {/* Linkage Type */}
      <FormField
        control={form.control}
        name="linkageType"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">
              <BilingualLabel english="Linkage Type" bengali="লিঙ্কেজের ধরন" />
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="h-10 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Select type / ধরন নির্বাচন করুন" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Family">Family Linkage / পারিবারিক লিঙ্কেজ</SelectItem>
                <SelectItem value="Property">Property Linkage / সম্পত্তি লিঙ্কেজ</SelectItem>
                <SelectItem value="Other">Other / অন্যান্য</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />

      {/* Linkage Category */}
      <FormField
        control={form.control}
        name="linkageCategory"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">
              <BilingualLabel english="Category" bengali="বিভাগ" />
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="e.g. Heirship, Ownership"
                onChange={(e) => field.onChange(capitalizeWords(e.target.value))}
                className="h-10 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </FormControl>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />

      {/* Linked Entity Name */}
      <FormField
        control={form.control}
        name="linkedEntityName"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">
              <BilingualLabel
                english="Linked Entity Name"
                bengali="লিঙ্ক করা সত্তার নাম (যেমন মৃত ব্যক্তির নাম)"
              />
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                onChange={(e) => field.onChange(capitalizeWords(e.target.value))}
                className="h-10 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </FormControl>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />

      {/* Linked Entity Address */}
      <FormField
        control={form.control}
        name="linkedEntityAddress"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-sm font-medium text-gray-700">
              <BilingualLabel
                english="Linked Entity Address"
                bengali="লিঙ্ক করা সত্তার ঠিকানা"
              />
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                onChange={(e) => field.onChange(capitalizeWords(e.target.value))}
                className="h-10 text-sm bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </FormControl>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />

      {/* Reason for Linkage */}
      <FormField
        control={form.control}
        name="linkageReason"
        render={({ field }) => (
          <FormItem className="space-y-2 lg:col-span-2">
            <FormLabel className="text-sm font-medium text-gray-700">
              <BilingualLabel english="Reason for Linkage" bengali="লিঙ্কেজের কারণ" />
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Explain why this certificate is needed / এই শংসাপত্র কেন প্রয়োজন তা ব্যাখ্যা করুন"
                className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </FormControl>
            <FormMessage className="text-xs text-red-500" />
          </FormItem>
        )}
      />
    </div>
  );
};
