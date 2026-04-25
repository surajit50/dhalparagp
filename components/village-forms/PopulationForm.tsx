"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { populationSchema } from "@/schema/village-validation";
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
import { MapPin, Save, Users, Heart, Shield, Landmark } from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";

type PopulationFormValues = z.infer<typeof populationSchema>;

interface PopulationFormProps {
  onSubmit: (values: PopulationFormValues) => Promise<void>;
  mouzas: any[];
  defaultValues?: Partial<PopulationFormValues>;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export function PopulationForm({
  onSubmit,
  mouzas,
  defaultValues,
  isSubmitting,
  isEditing = false,
}: PopulationFormProps) {
  const form = useForm<PopulationFormValues>({
    resolver: zodResolver(populationSchema),
    defaultValues: {
      mouzaId: "",
      male: 0,
      female: 0,
      st: 0,
      sc: 0,
      obc: 0,
      other: 0,
      hindu: 0,
      muslim: 0,
      christian: 0,
      otherReligion: 0,
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues,
      });
    }
  }, [defaultValues, form]);

  const numberInput = (field: any) => (
    <Input
      type="number"
      value={field.value}
      onChange={(e) => field.onChange(Number(e.target.value))}
      className="bg-white border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 rounded-xl"
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        {/* HEADER SECTION */}
        <section className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-3xl shadow-sm">
          <FormField
            control={form.control}
            name="mouzaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-sm font-bold text-emerald-900 mb-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  Target Mouza Selection
                </FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isEditing}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 bg-white border-gray-200 rounded-xl focus:ring-emerald-500/20 shadow-sm transition-all duration-200">
                      <SelectValue placeholder="Select Mouza for population recording" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                    {mouzas.map((m) => (
                      <SelectItem key={m.id} value={m.id} className="focus:bg-emerald-50 focus:text-emerald-900 transition-colors">
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* GENDER DISTRIBUTION */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-pink-50 rounded-lg">
                <Users className="h-5 w-5 text-pink-600" />
              </div>
              <h3 className="font-bold text-gray-800">Gender Stats</h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="male"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-wider">Male Population</FormLabel>
                    <FormControl>{numberInput(field)}</FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="female"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-wider">Female Population</FormLabel>
                    <FormControl>{numberInput(field)}</FormControl>
                  </FormItem>
                )}
              />
            </div>
          </motion.div>

          {/* CASTE DISTRIBUTION */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800">Caste Category</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {["sc", "st", "obc", "other"].map((c) => (
                <FormField
                  key={c}
                  control={form.control}
                  name={c as any}
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-wider">{c}</FormLabel>
                      <FormControl>{numberInput(field)}</FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </motion.div>

          {/* RELIGIOUS DISTRIBUTION */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Landmark className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-gray-800">Religious Demographics</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "hindu", label: "Hindu" },
                { name: "muslim", label: "Muslim" },
                { name: "christian", label: "Christian" },
                { name: "otherReligion", label: "Other" }
              ].map((r) => (
                <FormField
                  key={r.name}
                  control={form.control}
                  name={r.name as any}
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-xs font-bold text-gray-500 uppercase tracking-wider">{r.label}</FormLabel>
                      <FormControl>{numberInput(field)}</FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-100 transition-all duration-200 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing data...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Save className="h-6 w-6" />
                <span>{isEditing ? "Update Demographics" : "Record Population Data"}</span>
              </div>
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}
