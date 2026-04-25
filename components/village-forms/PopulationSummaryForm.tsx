/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { populationSummarySchema } from "@/schema/village-validation";
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
import { MapPin, Users, Save, ShieldCheck, UserCheck } from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";

type PopulationSummaryFormValues = z.infer<typeof populationSummarySchema>;

interface PopulationSummaryFormProps {
  onSubmit: (values: PopulationSummaryFormValues) => Promise<void>;
  mouzas: any[];
  defaultValues?: Partial<PopulationSummaryFormValues>;
  isSubmitting?: boolean;
  onMouzaChange?: (value: string) => void;
  isEditing?: boolean;
}

export function PopulationSummaryForm({
  onSubmit,
  mouzas,
  defaultValues,
  isSubmitting,
  onMouzaChange,
  isEditing = false,
}: PopulationSummaryFormProps) {
  const form = useForm<PopulationSummaryFormValues>({
    resolver: zodResolver(populationSummarySchema),
    defaultValues: {
      mouzaId: "",
      totalMale: 0,
      totalFemale: 0,
      scMale: 0,
      scFemale: 0,
      stMale: 0,
      stFemale: 0,
      obcMale: 0,
      obcFemale: 0,
      genMale: 0,
      genFemale: 0,
      ...defaultValues,
    },
  });

  // RESET FIX
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues,
      });
    }
  }, [defaultValues, form]);

  const values = form.watch();

  // AUTO TOTAL CALCULATION (Govt mandatory)
  useEffect(() => {
    const maleTotal =
      (values.scMale || 0) +
      (values.stMale || 0) +
      (values.obcMale || 0) +
      (values.genMale || 0);

    const femaleTotal =
      (values.scFemale || 0) +
      (values.stFemale || 0) +
      (values.obcFemale || 0) +
      (values.genFemale || 0);

    form.setValue("totalMale", maleTotal);
    form.setValue("totalFemale", femaleTotal);
  }, [
    values.scMale,
    values.stMale,
    values.obcMale,
    values.genMale,
    values.scFemale,
    values.stFemale,
    values.obcFemale,
    values.genFemale,
    form,
  ]);

  const numberInput = (field: any) => (
    <Input
      type="number"
      value={field.value}
      onChange={(e) => field.onChange(Number(e.target.value))}
      className="h-12 text-xl font-bold bg-gray-50/50 border-none focus:bg-white focus:ring-2 focus:ring-indigo-500/10 transition-all rounded-xl shadow-inner shadow-gray-100"
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
                <FormLabel className="text-sm font-bold text-indigo-900 flex items-center space-x-2 mb-1">
                  <MapPin className="h-5 w-5 text-indigo-600" />
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
                    <SelectTrigger className="h-12 bg-white border-gray-200 rounded-xl focus:ring-indigo-500/20 shadow-sm transition-all duration-200">
                      <SelectValue placeholder="Select Mouza for population audit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-gray-100 shadow-xl">
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

        <div className="space-y-6">
          <div className="flex items-center space-x-3 mb-2 px-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg uppercase tracking-tight">
              Demographic Summary <span className="text-xs font-normal normal-case text-gray-400 ml-2">(Auto-calculated)</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <FormField
                control={form.control}
                name="totalMale"
                render={({ field }) => (
                  <FormItem className="p-6 bg-white rounded-3xl border border-gray-100 space-y-4 shadow-sm">
                    <FormLabel className="font-bold text-indigo-700 tracking-tight flex justify-between items-center">
                      Aggregate Male Population
                      <span className="text-[10px] bg-indigo-50 px-2 py-1 rounded-full">SYSTEM AUTO</span>
                    </FormLabel>
                    <FormControl>
                      <Input disabled value={field.value} className="h-14 text-2xl font-black bg-indigo-50/50 border-none cursor-not-allowed opacity-70 text-indigo-900" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <FormField
                control={form.control}
                name="totalFemale"
                render={({ field }) => (
                  <FormItem className="p-6 bg-white rounded-3xl border border-gray-100 space-y-4 shadow-sm">
                    <FormLabel className="font-bold text-teal-700 tracking-tight flex justify-between items-center">
                      Aggregate Female Population
                      <span className="text-[10px] bg-teal-50 px-2 py-1 rounded-full font-bold">SYSTEM AUTO</span>
                    </FormLabel>
                    <FormControl>
                      <Input disabled value={field.value} className="h-14 text-2xl font-black bg-teal-50/50 border-none cursor-not-allowed opacity-70 text-teal-900" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </motion.div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center space-x-3 px-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Users className="h-5 w-5 text-gray-600" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg uppercase tracking-tight">
              Categorized Census Data
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { label: "SC Population Cluster", male: "scMale", female: "scFemale", color: "orange" },
              { label: "ST Population Cluster", male: "stMale", female: "stFemale", color: "emerald" },
              { label: "OBC Population Cluster", male: "obcMale", female: "obcFemale", color: "blue" },
              { label: "General Population Cluster", male: "genMale", female: "genFemale", color: "gray" },
            ].map((c, idx) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (idx + 1) }}
                
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`font-bold text-${c.color}-700 text-base flex items-center gap-2`}>
                    <div className={`w-2 h-2 rounded-full bg-${c.color}-500`} />
                    {c.label}
                  </h3>
                  <UserCheck className={`h-5 w-5 text-${c.color}-300 group-hover:scale-110 transition-transform`} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name={c.male as any}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs font-bold text-gray-500 uppercase">Male</FormLabel>
                        <FormControl>{numberInput(field)}</FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={c.female as any}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs font-bold text-gray-500 uppercase">Female</FormLabel>
                        <FormControl>{numberInput(field)}</FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 transition-all duration-200 active:scale-[0.98] text-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Auditing Census...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Save className="h-6 w-6" />
                <span>{isEditing ? "Refine Census Profile" : "Finalize Census Audit"}</span>
              </div>
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}
