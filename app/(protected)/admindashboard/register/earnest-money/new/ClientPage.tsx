"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { register } from "@/lib/register";

const formSchema = z.object({
  bidderId: z.string().min(1, "Please select a bidder"),
  earnestMoneyAmount: z.coerce.number().min(1, "Amount must be greater than 0"),
});

type FormValues = z.infer<typeof formSchema>;

interface ClientNewEmdPageProps {
  bidders: any[];
}

export default function ClientNewEmdPage({ bidders }: ClientNewEmdPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bidderId: "",
      earnestMoneyAmount: 0,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const result = await register(values.bidderId, values.earnestMoneyAmount);
      if (result?.success) {
        toast.success("Earnest money entry added successfully");
        router.push("/admindashboard/register/earnest-money");
        router.refresh();
      } else {
        toast.error("Failed to add earnest money entry");
      }
    } catch (error) {
      console.error("Error adding earnest money entry:", error);
      toast.error("Failed to add earnest money entry");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admindashboard/register/earnest-money">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Add Earnest Money Entry</h1>
      </div>

      <Card className="border-border/50 shadow-md">
        <CardHeader>
          <CardTitle>New Entry details</CardTitle>
          <CardDescription>
            Create a new earnest money register entry for a bidder.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="bidderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Bidder / Agency</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a bidder" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bidders.map((bidder) => {
                          const name = bidder.agencydetails?.name || "Unknown Agency";
                          const memo = bidder.WorksDetail?.nitDetails?.memoNumber 
                            ? `(NIT: ${bidder.WorksDetail.nitDetails.memoNumber})` 
                            : "";
                          return (
                            <SelectItem key={bidder.id} value={bidder.id}>
                              {name} {memo}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="earnestMoneyAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Earnest Money Amount (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter amount" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button type="button" variant="outline" asChild>
                  <Link href="/admindashboard/register/earnest-money">
                    Cancel
                  </Link>
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Entry
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
