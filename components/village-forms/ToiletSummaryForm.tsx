"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toiletSummarySchema } from "@/schema/village-validation";
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
import { MapPin, Home, CheckCircle2, XCircle, Save, Droplets } from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";

type ToiletSummaryFormValues = z.infer<typeof toiletSummarySchema>;

interface ToiletSummaryFormProps {
  onSubmit: (values: ToiletSummaryFormValues) => Promise<void>;
  mouzas: any[];
  defaultValues?: Partial<ToiletSummaryFormValues>;
  isSubmitting?: boolean;
  onMouzaChange?: (value: string) => void;
  isEditing?: boolean;
}

export function ToiletSummaryForm({
  onSubmit,
  mouzas,
  defaultValues,
  isSubmitting,
  onMouzaChange,
  isEditing = false,
}: ToiletSummaryFormProps) {
  const form = useForm<ToiletSummaryFormValues>({
    resolver: zodResolver(toiletSummarySchema),
    defaultValues: {
      mouzaId: "",
      totalHousehold: 0,
      toiletAvailable: 0,
      toiletNotAvailable: 0,
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        mouzaId: defaultValues.mouzaId || "",
        totalHousehold: defaultValues.totalHousehold || 0,
        toiletAvailable: defaultValues.toiletAvailable || 0,
        toiletNotAvailable: defaultValues.toiletNotAvailable || 0,
        ...defaultValues,
      });
    }
  }, [defaultValues, form]);

  const values = form.watch();

  useEffect(() => {
    const total =
      (values.toiletAvailable || 0) + (values.toiletNotAvailable || 0);
    form.setValue("totalHousehold", total);
  }, [form, values.toiletAvailable, values.toiletNotAvailable]);

  const numberInput = (field: any) => (
    <Input
      type="number"
      value={field.value}
      onChange={(e) => field.onChange(Number(e.target.value))}
      className="h-14 text-2xl font-black bg-gray-50/50 border-none focus:bg-white focus:ring-2 focus:ring-rose-500/10 transition-all rounded-2xl"
    />
  );

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
                <FormLabel className="text-sm font-bold text-rose-900 flex items-center space-x-2 mb-1">
                  <MapPin className="h-5 w-5 text-rose-600" />
                  <span>Administrative Area (Mouza)</span>
                </FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    onMouzaChange?.(v);
                  }}
                  disabled={isEditing}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 bg-white border-gray-200 rounded-xl focus:ring-rose-500/20 shadow-sm transition-all duration-200">
                      <SelectValue placeholder="Select Mouza for sanitation audit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                    {mouzas.map((m) => (
                      <SelectItem key={m.id} value={m.id} className="focus:bg-rose-50 focus:text-rose-900 transition-colors">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <FormField
              control={form.control}
              name="totalHousehold"
              render={({ field }) => (
                <FormItem className="p-6 bg-white rounded-3xl border border-gray-100 space-y-4 hover:shadow-xl hover:shadow-gray-200/50 transition-all group relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    <FormLabel className="font-bold text-gray-700 tracking-tight">
                      Total Households
                    </FormLabel>
                    <div className="p-2 bg-gray-50 rounded-lg group-hover:scale-110 transition-transform">
                      <Home className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <FormControl className="relative z-10">
                    <Input disabled value={field.value} className="h-14 text-2xl font-black bg-gray-100/50 border-none cursor-not-allowed opacity-70" />
                  </FormControl>
                  <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-gray-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur-2xl" />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <FormField
              control={form.control}
              name="toiletAvailable"
              render={({ field }) => (
                <FormItem className="p-6 bg-white rounded-3xl border border-gray-100 space-y-4 hover:shadow-xl hover:shadow-emerald-100 transition-all group relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    <FormLabel className="font-bold text-gray-700 tracking-tight text-emerald-700">
                      With Facilities
                    </FormLabel>
                    <div className="p-2 bg-emerald-50 rounded-lg group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                  <FormControl className="relative z-10">{numberInput(field)}</FormControl>
                  <FormMessage />
                  <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur-2xl" />
                </FormItem>
              )}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <FormField
              control={form.control}
              name="toiletNotAvailable"
              render={({ field }) => (
                <FormItem className="p-6 bg-white rounded-3xl border border-gray-100 space-y-4 hover:shadow-xl hover:shadow-rose-100 transition-all group relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10">
                    <FormLabel className="font-bold text-gray-700 tracking-tight text-rose-700">
                      Pending Facilities
                    </FormLabel>
                    <div className="p-2 bg-rose-50 rounded-lg group-hover:scale-110 transition-transform">
                      <XCircle className="h-5 w-5 text-rose-600" />
                    </div>
                  </div>
                  <FormControl className="relative z-10">{numberInput(field)}</FormControl>
                  <FormMessage />
                  <div className="absolute -bottom-6 -right-6 h-24 w-24 bg-rose-50 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur-2xl" />
                </FormItem>
              )}
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold rounded-2xl shadow-xl shadow-rose-100 transition-all duration-200 active:scale-[0.98] text-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Auditing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Save className="h-6 w-6" />
                <span>{isEditing ? "Refine Audit Record" : "Finalize Sanitation Audit"}</span>
              </div>
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}
