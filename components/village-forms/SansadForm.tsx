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
import { Calendar, Users ,Save} from "lucide-react";
import { sansadSchema } from "@/schema/village-validation";
import { useEffect } from "react";

type SansadFormValues = z.infer<typeof sansadSchema>;

interface SansadFormProps {
  onSubmit: (values: SansadFormValues) => Promise<void>;
  defaultValues?: Partial<SansadFormValues>;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export function SansadForm({
  onSubmit,
  defaultValues,
  isSubmitting,
  isEditing = false,
}: SansadFormProps) {
  const form = useForm<SansadFormValues>({
    resolver: zodResolver(sansadSchema),
    defaultValues: {
      sansadname: "",
      sansadnumber: "",
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
          name="sansadname"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-bold text-gray-700">
                Sansad Name
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., Sansad I"
                  className="bg-white border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 rounded-xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sansadnumber"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-sm font-bold text-gray-700">
                Sansad Number
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., 01"
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
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Save className="h-5 w-5" />
              <span>{isEditing ? "Update Sansad" : "Save Sansad"}</span>
            </div>
          )}
        </Button>
      </form>
    </Form>
  );
}
