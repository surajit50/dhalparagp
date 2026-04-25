"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ArrowLeft, Save, Loader2, RefreshCw, FileText, Hash, AlignLeft, Info, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TenderTerm {
  id: string;
  category: string;
  title: string;
  content: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

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
  order: z.coerce.number().int().nonnegative("Order must be a non-negative number").default(0),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

async function fetchTerm(id: string): Promise<TenderTerm> {
  const response = await fetch(`/api/tender-terms/${id}`);
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? "Failed to fetch term");
  }
  return response.json();
}

async function updateTerm(id: string, payload: FormValues) {
  const response = await fetch(`/api/tender-terms/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? "Failed to update term");
  }

  return response.json();
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const EditTermsPage = ({ params }: PageProps) => {
  const router = useRouter();
  const [termId, setTermId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialTerm, setInitialTerm] = useState<TenderTerm | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const resolveParams = async () => {
      const { id } = await params;
      setTermId(id);
    };
    resolveParams();
  }, [params]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      title: "",
      content: "",
      order: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!termId) return;

    const loadTerm = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const term = await fetchTerm(termId);
        setInitialTerm(term);
        form.reset({
          category: term.category,
          title: term.title,
          content: term.content,
          order: term.order,
          isActive: term.isActive,
        });
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to fetch term");
      } finally {
        setIsLoading(false);
      }
    };

    loadTerm();
  }, [termId, form]);

  const onSubmit = async (values: FormValues) => {
    if (!termId) return;
    setIsSubmitting(true);
    try {
      await updateTerm(termId, values);
      toast.success("Term updated successfully!");
      router.push("/admindashboard/manage-tender/manage-terms");
    } catch (err) {
      console.error("Failed to update term", err);
      toast.error(err instanceof Error ? err.message : "Failed to update term");
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedCategory = form.watch("category");
  const watchedTitle = form.watch("title");
  const watchedContent = form.watch("content");
  const watchedOrder = form.watch("order");
  const watchedIsActive = form.watch("isActive");

  const hasChanges = useMemo(() => {
    if (!initialTerm) return false;

    return (
      watchedCategory !== initialTerm.category ||
      (watchedTitle || "").trim() !== initialTerm.title.trim() ||
      (watchedContent || "").trim() !== initialTerm.content.trim() ||
      watchedOrder !== initialTerm.order ||
      watchedIsActive !== initialTerm.isActive
    );
  }, [initialTerm, watchedCategory, watchedTitle, watchedContent, watchedOrder, watchedIsActive]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-4xl flex flex-col items-center justify-center h-64 gap-3 text-gray-600">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading term...</span>
        </div>
      </div>
    );
  }

  if (error || !termId) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-2xl text-center space-y-4">
          <h2 className="text-xl font-semibold text-red-600">Unable to load term</h2>
          <p className="text-gray-600">{error ?? "Term not found"}</p>
          <Button asChild>
            <Link href="/admindashboard/manage-tender/manage-terms">Back to Terms Management</Link>
          </Button>
        </div>
      </div>
    );
  }

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
              Edit Tender Term
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              Update the tender term details
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
              Update the details for this tender term
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
                            onValueChange={field.onChange}
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
                              placeholder="0"
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              value={field.value}
                              className="h-11"
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">
                            Lower numbers appear first in the list
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            A brief, descriptive title (3-200 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">Status</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(value === "true")}
                            value={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  Active
                                </div>
                              </SelectItem>
                              <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-sm text-gray-500">
                            Active terms are visible in tender documents
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

                {hasChanges && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      You have unsaved changes. Do not forget to save your updates.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !hasChanges}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Update Term
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

export default EditTermsPage;
