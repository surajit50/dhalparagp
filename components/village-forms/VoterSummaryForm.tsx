"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { voterSummarySchema } from "@/schema/village-validation";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect } from "react";
import { motion } from "framer-motion";

type VoterSummaryFormValues = z.infer<typeof voterSummarySchema>;

interface VoterSummaryFormProps {
  onSubmit: (values: VoterSummaryFormValues) => Promise<void>;
  mouzas: any[];
  defaultValues?: Partial<VoterSummaryFormValues>;
  isSubmitting?: boolean;
  onMouzaChange?: (value: string) => void;
  isEditing?: boolean;
}

export function VoterSummaryForm({
  onSubmit,
  mouzas,
  defaultValues,
  isSubmitting,
  onMouzaChange,
  isEditing = false,
}: VoterSummaryFormProps) {
  const form = useForm<VoterSummaryFormValues>({
    resolver: zodResolver(voterSummarySchema),
    defaultValues: {
      mouzaIds: [],
      pollingStationNo: "",
      pollingStationName: "",
      totalMaleVoter: 0,
      totalFemaleVoter: 0,
      scMaleVoter: 0,
      scFemaleVoter: 0,
      stMaleVoter: 0,
      stFemaleVoter: 0,
      obcMaleVoter: 0,
      obcFemaleVoter: 0,
      genMaleVoter: 0,
      genFemaleVoter: 0,
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues,
      });
    }
  }, [defaultValues]);

  const values = form.watch();

  useEffect(() => {
    const maleTotal =
      (values.scMaleVoter || 0) +
      (values.stMaleVoter || 0) +
      (values.obcMaleVoter || 0) +
      (values.genMaleVoter || 0);

    const femaleTotal =
      (values.scFemaleVoter || 0) +
      (values.stFemaleVoter || 0) +
      (values.obcFemaleVoter || 0) +
      (values.genFemaleVoter || 0);

    form.setValue("totalMaleVoter", maleTotal);
    form.setValue("totalFemaleVoter", femaleTotal);
  }, [
    values.scMaleVoter,
    values.stMaleVoter,
    values.obcMaleVoter,
    values.genMaleVoter,
    values.scFemaleVoter,
    values.stFemaleVoter,
    values.obcFemaleVoter,
    values.genFemaleVoter,
    form,
  ]);

  const numberInput = (field: any) => (
    <Input
      type="number"
      value={field.value}
      onChange={(e) => field.onChange(Number(e.target.value))}
      className="h-12 text-xl font-bold bg-gray-50/50 border-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 transition-all rounded-xl shadow-inner shadow-gray-100"
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
         
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <FormField
              control={form.control}
              name="pollingStationNo"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-bold text-blue-900 flex items-center space-x-2 mb-1">
                    <span>Polling Station Number</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="E.g. 101" className="h-12 border-gray-200 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pollingStationName"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-bold text-blue-900 flex items-center space-x-2 mb-1">
                    <span>Polling Station Name</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter station name" className="h-12 border-gray-200 rounded-xl" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="mouzaIds"
            render={() => (
              <FormItem className="space-y-3">
                <FormLabel className="text-sm font-bold text-blue-900 flex items-center space-x-2 mb-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span>Covered Administrative Areas (Mouzas)</span>
                </FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  {mouzas.map((m) => (
                    <FormField
                      key={m.id}
                      control={form.control}
                      name="mouzaIds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={m.id}
                            className="flex flex-row items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                disabled={isEditing}
                                checked={field.value?.includes(m.id)}
                                onCheckedChange={(checked) => {
                                  let updated = field.value ? [...field.value] : [];
                                  if (checked) {
                                    updated.push(m.id);
                                  } else {
                                    updated = updated.filter((value: string) => value !== m.id);
                                  }
                                  field.onChange(updated);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer text-sm">
                              {m.name}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
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
              Electoral Summary <span className="text-xs font-normal normal-case text-gray-400 ml-2">(Auto-calculated)</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <FormField
                control={form.control}
                name="totalMaleVoter"
                render={({ field }) => (
                  <FormItem className="p-6 bg-white rounded-3xl border border-gray-100 space-y-4 shadow-sm">
                    <FormLabel className="font-bold text-blue-700 tracking-tight flex justify-between items-center">
                      Aggregate Male Voters
                      <span className="text-[10px] bg-blue-50 px-2 py-1 rounded-full">SYSTEM AUTO</span>
                    </FormLabel>
                    <FormControl>
                      <Input disabled value={field.value} className="h-14 text-2xl font-black bg-blue-50/50 border-none cursor-not-allowed opacity-70 text-blue-900" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <FormField
                control={form.control}
                name="totalFemaleVoter"
                render={({ field }) => (
                  <FormItem className="p-6 bg-white rounded-3xl border border-gray-100 space-y-4 shadow-sm">
                    <FormLabel className="font-bold text-pink-700 tracking-tight flex justify-between items-center">
                      Aggregate Female Voters
                      <span className="text-[10px] bg-pink-50 px-2 py-1 rounded-full font-bold">SYSTEM AUTO</span>
                    </FormLabel>
                    <FormControl>
                      <Input disabled value={field.value} className="h-14 text-2xl font-black bg-pink-50/50 border-none cursor-not-allowed opacity-70 text-pink-900" />
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
              Categorized Voter Enrollment
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { label: "SC Cluster", male: "scMaleVoter", female: "scFemaleVoter", color: "orange" },
              { label: "ST Cluster", male: "stMaleVoter", female: "stFemaleVoter", color: "emerald" },
              { label: "OBC Cluster", male: "obcMaleVoter", female: "obcFemaleVoter", color: "indigo" },
              { label: "General Cluster", male: "genMaleVoter", female: "genFemaleVoter", color: "gray" },
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
                        <FormLabel className="text-xs font-bold text-gray-500 uppercase">Male Enrollment</FormLabel>
                        <FormControl>{numberInput(field)}</FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={c.female as any}
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-xs font-bold text-gray-500 uppercase">Female Enrollment</FormLabel>
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
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-100 transition-all duration-200 active:scale-[0.98] text-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Auditing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Save className="h-6 w-6" />
                <span>{isEditing ? "Refine Voter Profile" : "Finalize Voter Audit"}</span>
              </div>
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}
