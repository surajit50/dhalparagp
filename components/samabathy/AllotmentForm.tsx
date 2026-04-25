"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { allotmentSchema } from "@/lib/validation";
import { z } from "zod";
import { useState } from "react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import FullPageLoader from "./FullPageLoader";

type FormData = z.infer<typeof allotmentSchema>;

interface AllotmentSummary {
  totalAmount: number;
  totalRemaining: number;
  recentAllotments: any[];
}

export default function AllotmentForm() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<AllotmentSummary | null>(null);

  const fetchSummary = async () => {
    try {
      const res = await fetch("/api/samabathy/allotment");
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (error) {
      console.error("Failed to fetch summary", error);
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
    setProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 5;
      });
    }, 200);

    try {
      const response = await fetch("/api/samabathy/allotment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setProgress(100);
        setTimeout(() => {
          toast.success("Allotment saved and applications auto-approved!");
          form.reset();
          fetchSummary();
          setLoading(false);
        }, 500);
      } else {
        toast.error("Failed to save allotment");
        setLoading(false);
      }
    } catch (error) {
      toast.error("An error occurred");
      setLoading(false);
    } finally {
      clearInterval(progressInterval);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <FullPageLoader 
        isLoading={loading} 
        progress={progress} 
        title="Processing Allotment" 
        description="Saving the allotment and automatically approving pending applications based on available funds."
      />
      <Card className="shadow-sm h-fit">
        <CardHeader>
          <CardTitle>Add New Allotment</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allotment Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 50000"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        value={field.value || ""}
                      />
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
                    <FormLabel>Date Received</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving & Processing..." : "Save Allotment"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Allotment Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">Total Received</span>
            <span className="text-lg font-bold">
              ₹{summary?.totalAmount.toLocaleString("en-IN") || 0}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
            <span className="text-sm font-medium">Total Remaining</span>
            <Badge
              variant="outline"
              className="text-lg font-bold border-primary text-primary"
            >
              ₹{summary?.totalRemaining.toLocaleString("en-IN") || 0}
            </Badge>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-semibold mb-2">Recent Allotments</h4>
            <div className="space-y-2">
              {summary?.recentAllotments.map((a: any) => (
                <div
                  key={a.id}
                  className="text-xs flex justify-between items-center border-b pb-1"
                >
                  <span>{new Date(a.receivedDate).toLocaleDateString()}</span>
                  <span className="font-medium">
                    ₹{a.amount.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
              {summary?.recentAllotments.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No allotments found
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
