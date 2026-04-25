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
  Droplets,
  Waves,
  Filter,
  LifeBuoy,
  Plus,
  Save,
  Tent,
} from "lucide-react";
import { waterSummarySchema } from "@/schema/village-validation";
import { useEffect } from "react";
import { motion } from "framer-motion";

type WaterSummaryFormValues = z.infer<typeof waterSummarySchema>;

interface WaterSummaryFormProps {
  onSubmit: (values: WaterSummaryFormValues) => Promise<void>;
  mouzas: any[];
  defaultValues?: Partial<WaterSummaryFormValues>;
  isSubmitting?: boolean;
  onMouzaChange?: (value: string) => void;
  isEditing?: boolean;
}

export function WaterSummaryForm({
  onSubmit,
  mouzas,
  defaultValues,
  isSubmitting,
  onMouzaChange,
  isEditing = false,
}: WaterSummaryFormProps) {
  const form = useForm<WaterSummaryFormValues>({
    resolver: zodResolver(waterSummarySchema),
    defaultValues: {
      mouzaId: "",
      tapWater: 0,
      handPump: 0,
      well: 0,
      pond: 0,
      other: 0,
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  const numberInput = (field: any) => (
    <Input
      type="number"
      value={field.value}
      onChange={(e) => field.onChange(Number(e.target.value))}
      className="h-14 text-2xl font-black bg-gray-50/50 border-none focus:bg-white focus:ring-2 focus:ring-sky-500/10 transition-all rounded-2xl"
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
                <FormLabel className="text-sm font-bold text-sky-900 flex items-center space-x-2 mb-1">
                  <MapPin className="h-5 w-5 text-sky-600" />
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
                    <SelectTrigger className="h-12 bg-white border-gray-200 rounded-xl focus:ring-sky-500/20 shadow-sm transition-all duration-200">
                      <SelectValue placeholder="Select Mouza for water audit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                    {mouzas.map((m) => (
                      <SelectItem key={m.id} value={m.id} className="focus:bg-sky-50 focus:text-sky-900 transition-colors">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { name: "tapWater", label: "Piped Tap Water", icon: Waves, color: "sky", desc: "Household connections" },
            { name: "handPump", label: "Hand Pumps", icon: Filter, color: "blue", desc: "Borewell / Tube wells" },
            { name: "well", label: "Open Wells", icon: LifeBuoy, color: "indigo", desc: "Manual drawing wells" },
            { name: "pond", label: "Natural Sources", icon: Droplets, color: "cyan", desc: "Ponds / Rivers / Streams" },
            { name: "other", label: "Misc Sources", icon: Tent, color: "gray", desc: "Tankers / Rainy / Others" },
          ].map((source, idx) => (
            <motion.div
              key={source.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * (idx + 1) }}
            >
              <FormField
                control={form.control}
                name={source.name as any}
                render={({ field }) => (
                  <FormItem className="p-6 bg-white rounded-3xl border border-gray-100 space-y-4 hover:shadow-xl transition-all group relative overflow-hidden">
                    <div className="flex items-center justify-between relative z-10">
                      <FormLabel className="font-bold text-gray-700 tracking-tight">
                        {source.label}
                      </FormLabel>
                      <div className={`p-2 bg-${source.color}-50 rounded-lg group-hover:scale-110 transition-transform`}>
                        <source.icon className={`h-5 w-5 text-${source.color}-600`} />
                      </div>
                    </div>
                    <FormControl className="relative z-10">{numberInput(field)}</FormControl>
                    <p className="text-xs text-gray-400 font-medium">{source.desc}</p>
                    <FormMessage />
                    <div className={`absolute -bottom-6 -right-6 h-24 w-24 bg-${source.color}-50 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur-2xl`} />
                  </FormItem>
                )}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-sky-100 transition-all duration-200 active:scale-[0.98] text-lg"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="h-5 w-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Auditing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Save className="h-6 w-6" />
                <span>{isEditing ? "Update Audit Profile" : "Finalize Water Audit"}</span>
              </div>
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}
