"use client";

import { PondFormValues } from "../ponds/schema";
import {
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/utils";
import { UseFormReturn } from "react-hook-form";

interface PondTypeFieldsProps {
  form: UseFormReturn<PondFormValues>;
  isPending?: boolean;
  isLeased?: boolean;
}

export function PondTypeFields({
  form,
  isPending = false,
  isLeased = false,
}: PondTypeFieldsProps) {
  const pondType = form.watch("pondType");

  const handlePondTypeChange = (value: "LEASEABLE" | "PUBLIC") => {
    form.setValue("pondType", value);
    if (value === "PUBLIC") {
      form.setValue("status", "PUBLIC_USE");
    } else if (form.getValues("status") === "PUBLIC_USE") {
      form.setValue("status", isLeased ? "LEASED" : "AVAILABLE");
    }
  };

  return (
    <>
      <FormField
        control={form.control}
        name="pondType"
        render={({ field }) => (
          <FormItem className="space-y-3 rounded-lg border border-border/50 bg-muted/20 p-4">
            <FormLabel className="text-sm font-medium">Pond Category</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={(value) =>
                  handlePondTypeChange(value as "LEASEABLE" | "PUBLIC")
                }
                value={field.value}
                className="grid gap-3"
                disabled={isPending || isLeased}
              >
                <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border bg-background p-3">
                  <FormControl>
                    <RadioGroupItem value="LEASEABLE" className="mt-1" />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel className="font-medium cursor-pointer">
                      Leasable / Tender Pond
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Pond can be leased out through tender to a private party.
                    </p>
                  </div>
                </FormItem>

                <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border bg-background p-3">
                  <FormControl>
                    <RadioGroupItem value="PUBLIC" className="mt-1" />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel className="font-medium cursor-pointer">
                      Public Pond (Not for Tender)
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Public also uses this pond. GP collects yearly amount from
                      public as per resolution — not leased to any individual.
                    </p>
                  </div>
                </FormItem>
              </RadioGroup>
            </FormControl>
            {isLeased && (
              <p className="text-xs text-amber-700">
                Pond category cannot be changed while an active lease exists.
              </p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      {pondType === "PUBLIC" ? (
        <div className="space-y-4 rounded-lg border border-sky-200 bg-sky-50/50 p-4">
          <p className="text-sm font-medium text-sky-900">
            Public Use — Yearly Amount as per GP Resolution
          </p>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="resolutionNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resolution No.</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 12/2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resolutionDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Resolution Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value
                            ? formatDate(field.value)
                            : "Select date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ?? undefined}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="publicYearlyAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Yearly Amount from Public (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="As per GP resolution"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(Number(e.target.value) || undefined)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ) : (
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Status</FormLabel>
              <Select
                disabled={isPending || isLeased}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-muted/50 focus-visible:bg-transparent">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="LEASED">Leased</SelectItem>
                </SelectContent>
              </Select>
              {isLeased && (
                <p className="text-xs text-muted-foreground">
                  Status is managed automatically through lease records.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}
