"use client";

import * as z from "zod";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  BookOpen,
  Calendar,
  Clock,
  Hash,
  LayoutGrid,
  MapPin,
  Route,
  Wallet,
  Landmark,
  PlusCircle,
  FileText,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { toast } from "@/components/ui/use-toast";

import { actionplanschema } from "@/schema/actionplan";
import { createschme } from "@/action/uploadwork";

import { cn } from "@/lib/utils";

export default function AddActionPlanForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof actionplanschema>>({
    resolver: zodResolver(actionplanschema),
    defaultValues: {
      financialYear: "",
      themeName: "",
      activityCode: "",
      activityName: "",
      activityDescription: "",
      activityFor: "",
      sector: "",
      locationofAsset: "",
      estimatedCost: 0,
      totalduration: "",
      schemeName: "",
      generalFund: 0,
      scFund: 0,
      stFund: 0,
      fundType: "Tied", // default to Tied
    },
  });

  /* Fund calculation */
  const general = form.watch("generalFund");
  const sc = form.watch("scFund");
  const st = form.watch("stFund");

  const totalFund = useMemo(() => {
    return (general || 0) + (sc || 0) + (st || 0);
  }, [general, sc, st]);

  /* Submit */
  async function onSubmit(values: z.infer<typeof actionplanschema>) {
    if (totalFund !== values.estimatedCost) {
      toast({
        title: "Fund mismatch",
        description: "Total fund must equal estimated cost",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await createschme(values);

      toast({
        title: "✅ Action Plan Added",
        description: "Your action plan has been successfully submitted.",
      });

      form.reset();
    } catch (error) {
      toast({
        title: "⚠️ Error",
        description: "Failed to add action plan.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl border shadow-lg p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">New Action Plan Form</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Financial Section */}
          <div className="bg-muted/50 p-6 rounded-xl space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-orange-600" />
              Financial Details
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="financialYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Financial Year
                    </FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select financial year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="2023-2024">2023-2024</SelectItem>
                        <SelectItem value="2024-2025">2024-2025</SelectItem>
                        <SelectItem value="2025-2026">2025-2026</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="themeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4" />
                      Theme Name
                    </FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="Development" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="schemeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Scheme Name
                  </FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} placeholder="Enter scheme name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Activity Section */}
          <div className="bg-muted/50 p-6 rounded-xl space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Route className="h-5 w-5 text-green-600" />
              Activity Details
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="activityCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Activity Code
                    </FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="1001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="activityName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Route className="h-4 w-4" />
                      Activity Name
                    </FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="Road Construction" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="activityDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea disabled={isLoading} className="min-h-[120px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sector</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="e.g., Sanitation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="locationofAsset"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location of Asset</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="Village / Town" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="estimatedCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Cost (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled={isLoading}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalduration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Duration</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="6 months" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Funding Allocation Section */}
          <div className="bg-muted/50 p-6 rounded-xl space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-purple-600" />
              Funding Allocation
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="generalFund"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>General Fund</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled={isLoading}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scFund"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SC Fund</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled={isLoading}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stFund"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ST Fund</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled={isLoading}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* NEW: Fund Type Selection */}
            <FormField
              control={form.control}
              name="fundType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="flex items-center gap-2">
                    {field.value === "Tied" ? (
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-amber-600" />
                    )}
                    Fund Type (Tied / Untied)
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Tied" id="tied" />
                        <label htmlFor="tied" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Tied
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Untied" id="untied" />
                        <label htmlFor="untied" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Untied
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-sm font-medium text-muted-foreground">
              Total Allocation: ₹{totalFund.toLocaleString()}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "rounded-xl px-8 py-6 text-lg font-semibold",
                "bg-gradient-to-r from-orange-600 to-purple-600",
                "text-white shadow-lg hover:shadow-xl flex items-center gap-2"
              )}
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <PlusCircle className="h-5 w-5" />
                  Create Action Plan
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
