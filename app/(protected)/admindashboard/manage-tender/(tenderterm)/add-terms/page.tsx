"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Save, FileText, Hash, AlignLeft, Info } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  category: z.string().min(1, "Please select a category for this term"),
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters"),
  content: z
    .string()
    .min(1, "Content is required")
    .min(10, "Content must be at least 10 characters")
    .max(5000, "Content must not exceed 5000 characters"),
  order: z
    .union([
      z.coerce.number().int().nonnegative("Order must be a non-negative number"),
      z.undefined(),
    ])
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

const fetchSuggestedOrder = async (category: string) => {
  const response = await fetch(`/api/tender-terms/last-order?category=${category}`);
  if (!response.ok) throw new Error("Failed to fetch suggested order");
  return response.json();
};

const createTerm = async (data: FormValues) => {
  const response = await fetch("/api/tender-terms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create term");
  return response.json();
};

const AddTermsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      title: "",
      content: "",
      order: undefined,
    },
  });

  // Fetch suggested order when category changes
  const { data: orderData } = useQuery({
    queryKey: ["suggested-order", category],
    queryFn: () => fetchSuggestedOrder(category),
    enabled: !!category,
  });

  const mutation = useMutation({
    mutationFn: createTerm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tender-terms"] });
      toast.success("Term added successfully!");
      router.push("/admindashboard/manage-tender/manage-terms");
    },
    onError: () => {
      toast.error("Failed to add term");
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="hover:bg-white/80">
              <Link href="/admindashboard/manage-tender/manage-terms">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Terms Management
              </Link>
            </Button>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent tracking-tight">
              Add New Tender Term
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              Create a new term for tender documents
            </p>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-blue-600"></div>
              Term Information
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Fill in the details for the new tender term
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium flex items-center gap-2">
                            <Hash className="h-4 w-4 text-gray-500" />
                            Category <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              setCategory(value);
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ELIGIBLE">Eligible</SelectItem>
                              <SelectItem value="QUALIFICATION_CRITERIA">
                                Qualification Criteria
                              </SelectItem>
                              <SelectItem value="TERMS_CONDITIONS">
                                Terms & Conditions
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-sm text-gray-500">
                            Choose the category this term belongs to
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="order"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium flex items-center gap-2">
                            <Hash className="h-4 w-4 text-gray-500" />
                            Display Order
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Auto-suggested"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))}
                              value={field.value === undefined ? "" : field.value}
                              min="0"
                              className="h-11"
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">
                            {orderData?.lastOrder !== undefined && !field.value ? (
                              <span className="text-blue-600 font-medium">
                                Suggested: {orderData.lastOrder + 1} (lower numbers appear first)
                              </span>
                            ) : (
                              "Lower numbers appear first in the list"
                            )}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Content Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2">
                    <AlignLeft className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Term Content</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          Title <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter a clear and descriptive title" 
                            {...field}
                            className="h-11"
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">
                          A brief, descriptive title for this term (3-200 characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          Content <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter detailed content for this term. Be specific and clear..."
                            rows={10}
                            {...field}
                            className="resize-none"
                          />
                        </FormControl>
                        <div className="flex items-start justify-between">
                          <FormDescription className="text-sm text-gray-500">
                            Provide detailed content for this term (10-5000 characters)
                          </FormDescription>
                          <span className="text-xs text-gray-400">
                            {field.value?.length || 0} / 5000
                          </span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.formState.errors.root && (
                  <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      {form.formState.errors.root.message}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={mutation.isPending}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={mutation.isPending}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {mutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Add Term
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddTermsPage;
