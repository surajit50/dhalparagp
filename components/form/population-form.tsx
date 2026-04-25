"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { populationSchema } from "@/schema/villageinfo";

type Village = {
  id: string;
  name: string;
};

interface PopulationFormProps {
  villages: Village[];
  onSuccess?: () => void;
  editMode?: boolean;
  initialData?: z.infer<typeof populationSchema>;
}

export default function PopulationForm({
  villages,
  onSuccess,
  editMode = false,
  initialData,
}: PopulationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof populationSchema>>({
    resolver: zodResolver(populationSchema),
    defaultValues: initialData || {
      villageId: "",
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
    },
  });

  async function onSubmit(values: z.infer<typeof populationSchema>) {}

  const CustomNumberInput = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
  >((props, ref) => (
    <Input
      {...props}
      type="number"
      ref={ref}
      min={0}
      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  ));
  CustomNumberInput.displayName = "CustomNumberInput";

  const populationFields = [
    { name: "male", label: "Male" },
    { name: "female", label: "Female" },
    { name: "st", label: "ST" },
    { name: "sc", label: "SC" },
    { name: "obc", label: "OBC" },
    { name: "other", label: "Other" },
    { name: "hindu", label: "Hindu" },
    { name: "muslim", label: "Muslim" },
    { name: "christian", label: "Christian" },
    { name: "otherReligion", label: "Other Religion" },
  ] as const;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="villageId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Village</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a village" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {villages.map((village) => (
                    <SelectItem key={village.id} value={village.id}>
                      {village.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          {populationFields.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: { onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel htmlFor={field.name}>{field.label}</FormLabel>
                  <FormControl>
                    <CustomNumberInput
                      id={field.name}
                      {...fieldProps}
                      onChange={(e) => onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editMode ? "Updating..." : "Submitting..."}
            </>
          ) : editMode ? (
            "Update"
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </Form>
  );
}
