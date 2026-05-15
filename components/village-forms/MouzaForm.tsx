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
import { Calendar, MapPin, Save } from "lucide-react";
import { mouzaSchema } from "@/schema/village-validation";
import { useEffect } from "react";

type MouzaFormValues = z.infer<typeof mouzaSchema>;

interface MouzaFormProps {
  onSubmit: (values: MouzaFormValues) => Promise<void>;
  defaultValues?: Partial<MouzaFormValues>;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export function MouzaForm({
  onSubmit,
  defaultValues,
  isSubmitting,
  isEditing = false,
}: MouzaFormProps) {
  const form = useForm<MouzaFormValues>({
    resolver: zodResolver(mouzaSchema),
    defaultValues: {
      name: "",
      jlno: "",
      totalHouseholds: 0,
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-bold text-gray-700">
                Mouza Name
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., Chandanagar"
                  className="bg-white border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 rounded-xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="jlno"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-bold text-gray-700">
                J.L. No.
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., 45"
                  className="bg-white border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 rounded-xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="totalHouseholds"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-bold text-gray-700">
                Total Households
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  placeholder="e.g., 250"
                  className="bg-white border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 rounded-xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-gradient-to-r from-orange-600 to-orange-600 hover:from-orange-700 hover:to-orange-700 text-white font-bold rounded-xl shadow-lg shadow-orange-100 transition-all duration-200 active:scale-[0.98]"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Save className="h-5 w-5" />
              <span>{isEditing ? "Update Mouza" : "Save Mouza"}</span>
            </div>
          )}
        </Button>
      </form>
    </Form>
  );
}
