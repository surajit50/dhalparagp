"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { allotmentSchema } from "@/lib/validation";
import { z } from "zod";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { toast } from "sonner";
import AllotmentChart from "./AllotmentChart";
import AllotmentTrend from "./AllotmentTrend";

type FormData = z.infer<typeof allotmentSchema>;

interface Summary {
  totalAmount: number;
  totalRemaining: number;
  recentAllotments: any[];
}

export default function AllotmentForm() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    const res = await fetch("/api/samabathy/allotment");
    if (res.ok) {
      const data = await res.json();
      setSummary(data);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const form = useForm<FormData>({
    resolver: zodResolver(allotmentSchema),
    defaultValues: {
      amount: 0,
      receivedDate: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      const res = await fetch("/api/samabathy/allotment", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Allotment saved!");
        form.reset();
        fetchSummary();
      } else {
        toast.error("Failed to save");
      }
    } catch {
      toast.error("Error occurred");
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 rounded-2xl shadow-md">
          <p className="text-sm text-muted-foreground">Total Fund</p>
          <p className="text-2xl font-bold text-primary">
            ₹{summary?.totalAmount?.toLocaleString("en-IN") || 0}
          </p>
        </Card>

        <Card className="p-4 rounded-2xl shadow-md">
          <p className="text-sm text-muted-foreground">Remaining</p>
          <p className="text-2xl font-bold text-green-600">
            ₹{summary?.totalRemaining?.toLocaleString("en-IN") || 0}
          </p>
        </Card>

        <Card className="p-4 rounded-2xl shadow-md">
          <p className="text-sm text-muted-foreground">Used</p>
          <p className="text-2xl font-bold text-red-500">
            ₹{(
              (summary?.totalAmount || 0) -
              (summary?.totalRemaining || 0)
            ).toLocaleString("en-IN")}
          </p>
        </Card>
      </div>

      {/* Main Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* FORM */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Add Allotment</CardTitle>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">
                            ₹
                          </span>
                          <Input
                            type="number"
                            className="pl-7"
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="receivedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button className="w-full h-11 rounded-xl">
                  {loading ? "Saving..." : "Save Allotment"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* ANALYTICS */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <AllotmentChart
              total={summary?.totalAmount || 0}
              remaining={summary?.totalRemaining || 0}
            />

            <AllotmentTrend
              data={summary?.recentAllotments || []}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
