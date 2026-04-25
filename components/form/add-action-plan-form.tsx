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
    },
  });

  /* -------------------------------- */
  /* Fund calculation                  */
  /* -------------------------------- */

  const general = form.watch("generalFund");
  const sc = form.watch("scFund");
  const st = form.watch("stFund");

  const totalFund = useMemo(() => {
    return (general || 0) + (sc || 0) + (st || 0);
  }, [general, sc, st]);

  /* -------------------------------- */
  /* Submit                           */
  /* -------------------------------- */

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

  /* -------------------------------- */
  /* UI                               */
  /* -------------------------------- */

  return (
    <div className="mx-auto max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl border shadow-lg p-8">

      <h1 className="text-3xl font-bold mb-8 text-center">
        New Action Plan Form
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* ----------------------------- */}
          {/* Financial Section             */}
          {/* ----------------------------- */}

          <div className="bg-muted/50 p-6 rounded-xl space-y-6">

            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              Financial Details
            </h2>

            <div className="grid md:grid-cols-2 gap-6">

              {/* Financial Year */}

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

              {/* Theme */}

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
                      <Input
                        disabled={isLoading}
                        placeholder="Development"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />

                  </FormItem>
                )}
              />

            </div>

            {/* Scheme Name */}

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
                    <Input
                      disabled={isLoading}
                      placeholder="Enter scheme name"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />

                </FormItem>
              )}
            />

          </div>

          {/* ----------------------------- */}
          {/* Activity Section              */}
          {/* ----------------------------- */}

          <div className="bg-muted/50 p-6 rounded-xl space-y-6">

            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Route className="h-5 w-5 text-green-600" />
              Activity Details
            </h2>

            <div className="grid md:grid-cols-2 gap-6">

              {/* Activity Code */}

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
                      <Input
                        disabled={isLoading}
                        placeholder="1001"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />

                  </FormItem>
                )}
              />

              {/* Activity Name */}

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
                      <Input
                        disabled={isLoading}
                        placeholder="Road Construction"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />

                  </FormItem>
                )}
              />

            </div>

            {/* Description */}

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
                    <Textarea
                      disabled={isLoading}
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />

                </FormItem>
              )}
            />

          </div>

          {/* ----------------------------- */}
          {/* Funding Section               */}
          {/* ----------------------------- */}

          <div className="bg-muted/50 p-6 rounded-xl space-y-6">

            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Wallet className="h-5 w-5 text-purple-600" />
              Funding Allocation
            </h2>

            <div className="grid md:grid-cols-3 gap-6">

              {/* General Fund */}

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
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                      />
                    </FormControl>

                    <FormMessage />

                  </FormItem>
                )}
              />

              {/* SC Fund */}

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
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                      />
                    </FormControl>

                    <FormMessage />

                  </FormItem>
                )}
              />

              {/* ST Fund */}

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
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                      />
                    </FormControl>

                    <FormMessage />

                  </FormItem>
                )}
              />

            </div>

            {/* Total Fund Display */}

            <div className="text-sm font-medium text-muted-foreground">
              Total Allocation: ₹{totalFund.toLocaleString()}
            </div>

          </div>

          {/* ----------------------------- */}
          {/* Submit                        */}
          {/* ----------------------------- */}

          <div className="flex justify-center">

            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "rounded-xl px-8 py-6 text-lg font-semibold",
                "bg-gradient-to-r from-blue-600 to-purple-600",
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
