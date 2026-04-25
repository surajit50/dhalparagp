"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  School,
  Library,
  GraduationCap,
  Users,
  Baby,
  Building2,
  BookOpen,
  Wrench,
  Laptop,
  Save,
} from "lucide-react";
import { educationSummarySchema } from "@/schema/village-validation";
import { useEffect } from "react";
import { motion } from "framer-motion";

type EducationSummaryFormValues = z.infer<typeof educationSummarySchema>;

interface EducationSummaryFormProps {
  onSubmit: (values: EducationSummaryFormValues) => Promise<void>;
  mouzas: any[];
  defaultValues?: Partial<EducationSummaryFormValues>;
  isSubmitting?: boolean;
  onMouzaChange?: (value: string) => void;
  isEditing?: boolean;
}

export function EducationSummaryForm({
  onSubmit,
  mouzas,
  defaultValues,
  isSubmitting,
  onMouzaChange,
  isEditing = false,
}: EducationSummaryFormProps) {
  const form = useForm<EducationSummaryFormValues>({
    resolver: zodResolver(educationSummarySchema),
    defaultValues: {
      mouzaId: "",
      ssk: 0,
      anganwadi: 0,
      primarySchool: 0,
      upperPrimary: 0,
      highSchool: 0,
      higherSecondary: 0,
      madrasah: 0,
      juniorHigh: 0,
      college: 0,
      university: 0,
      technicalInstitute: 0,
      vocationalCenter: 0,
      adultEducationCenter: 0,
      libraryCount: 0,
      computerCenter: 0,
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  const statsFields = [
    { name: "ssk", label: "Shishu Shiksha Kendra (SSK)", icon: Baby, color: "text-rose-500", bg: "bg-rose-50" },
    { name: "anganwadi", label: "Anganwadi Centers", icon: Baby, color: "text-pink-500", bg: "bg-pink-50" },
    { name: "primarySchool", label: "Primary Schools", icon: School, color: "text-amber-500", bg: "bg-amber-50" },
    { name: "upperPrimary", label: "Upper Primary Schools", icon: School, color: "text-orange-500", bg: "bg-orange-50" },
    { name: "juniorHigh", label: "Junior High Schools", icon: Building2, color: "text-cyan-500", bg: "bg-cyan-50" },
    { name: "highSchool", label: "High Schools", icon: Library, color: "text-blue-500", bg: "bg-blue-50" },
    { name: "higherSecondary", label: "Higher Secondary", icon: GraduationCap, color: "text-indigo-500", bg: "bg-indigo-50" },
    { name: "madrasah", label: "Madrasah", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-50" },
    { name: "college", label: "Colleges", icon: GraduationCap, color: "text-violet-500", bg: "bg-violet-50" },
    { name: "university", label: "Universities", icon: GraduationCap, color: "text-purple-500", bg: "bg-purple-50" },
    { name: "technicalInstitute", label: "Technical Institutes", icon: Wrench, color: "text-slate-600", bg: "bg-slate-100" },
    { name: "vocationalCenter", label: "Vocational Centers", icon: Wrench, color: "text-gray-600", bg: "bg-gray-100" },
    { name: "adultEducationCenter", label: "Adult Education Centers", icon: Users, color: "text-teal-600", bg: "bg-teal-50" },
    { name: "libraryCount", label: "Public Libraries", icon: Library, color: "text-fuchsia-500", bg: "bg-fuchsia-50" },
    { name: "computerCenter", label: "Computer Centers", icon: Laptop, color: "text-sky-500", bg: "bg-sky-50" },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          
        >
          <FormField
            control={form.control}
            name="mouzaId"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-sm font-bold text-indigo-900 flex items-center space-x-2 mb-1">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  <span>Administrative Area (Mouza)</span>
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    onMouzaChange?.(value);
                  }}
                  value={field.value}
                  disabled={isEditing}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 bg-white border-gray-200 rounded-xl focus:ring-indigo-500/20 shadow-sm transition-all duration-200">
                      <SelectValue placeholder="Select Mouza for data entry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-gray-100 shadow-xl max-h-[300px]">
                    {mouzas.map((m) => (
                      <SelectItem key={m.id} value={m.id} className="focus:bg-indigo-50 focus:text-indigo-900 transition-colors">
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsFields.map((field, index) => (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }} // slightly faster stagger since there are 15
            >
              <FormField
                control={form.control}
                name={field.name as any}
                render={({ field: inputField }) => (
                  <FormItem className="p-5 bg-white rounded-3xl border border-gray-100 space-y-4 hover:shadow-xl hover:shadow-gray-200/50 transition-all group relative overflow-hidden h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between relative z-10">
                      <FormLabel className="font-bold text-gray-700 tracking-tight leading-tight pr-2">
                        {field.label}
                      </FormLabel>
                      <div className={`p-2 shrink-0 ${field.bg} rounded-lg transition-transform group-hover:scale-110 duration-200`}>
                        <field.icon className={`h-5 w-5 ${field.color}`} />
                      </div>
                    </div>
                    <FormControl className="relative z-10">
                      <Input
                        type="number"
                        {...inputField}
                        onChange={(e) => inputField.onChange(Number(e.target.value))}
                        className="h-14 text-2xl font-black bg-gray-50/50 border-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all rounded-2xl"
                      />
                    </FormControl>
                    <FormMessage />
                    <div className={`absolute -bottom-6 -right-6 h-24 w-24 ${field.bg} rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur-2xl`} />
                  </FormItem>
                )}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 transition-all duration-200 active:scale-[0.98] text-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Synchronizing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Save className="h-6 w-6" />
                <span>{isEditing ? "Update Educational Infrastructure" : "Save Educational Infrastructure"}</span>
              </div>
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}
