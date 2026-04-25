"use client";

import { useState } from "react";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Save, FileText, AlignLeft, Info, Sparkles, ToggleLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z
  .object({
    name: z
      .string()
      .min(1, "Template name is required")
      .min(3, "Template name must be at least 3 characters")
      .max(100, "Template name must not exceed 100 characters"),
    description: z
      .string()
      .max(500, "Description must not exceed 500 characters")
      .optional(),
    eligible: z
      .string()
      .max(10000, "Eligible section must not exceed 10000 characters")
      .optional(),
    qualificationCriteria: z
      .string()
      .max(10000, "Qualification criteria must not exceed 10000 characters")
      .optional(),
    termsConditions: z
      .string()
      .max(10000, "Terms & conditions must not exceed 10000 characters")
      .optional(),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      const hasContent =
        Boolean(data.eligible?.trim()) ||
        Boolean(data.qualificationCriteria?.trim()) ||
        Boolean(data.termsConditions?.trim());
      return hasContent;
    },
    {
      message: "Please provide content in at least one section (Eligible, Qualification Criteria, or Terms & Conditions)",
      path: ["termsConditions"],
    },
  );

type FormValues = z.infer<typeof formSchema>;

const splitLines = (value?: string | null) =>
  (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

const createTemplate = async (payload: {
  name: string;
  description?: string;
  content: {
    eligible: string[];
    qualificationCriteria: string[];
    termsConditions: string[];
  };
  isActive: boolean;
}) => {
  const response = await fetch("/api/tender-term-templates", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? "Failed to create template");
  }

  return response.json();
};

const AddTemplatePage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      eligible: "",
      qualificationCriteria: "",
      termsConditions: "",
      isActive: true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await createTemplate({
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        isActive: values.isActive,
        content: {
          eligible: splitLines(values.eligible),
          qualificationCriteria: splitLines(values.qualificationCriteria),
          termsConditions: splitLines(values.termsConditions),
        },
      });

      toast.success("Template created successfully");
      router.push("/admindashboard/manage-tender/templates");
    } catch (error) {
      console.error("Failed to create template", error);
      toast.error(error instanceof Error ? error.message : "Failed to create template");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="hover:bg-white/80">
              <Link href="/admindashboard/manage-tender/templates">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Templates
              </Link>
            </Button>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent tracking-tight">
              Create Tender Term Template
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              Combine frequently used eligibility conditions into reusable template bundles.
            </p>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-blue-600"></div>
              Template details
            </CardTitle>
            <CardDescription className="text-gray-600 font-medium">
              Add template metadata and the content for each section.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Template Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Template Information</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          Template Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="E.g. Standard Civil Works Terms" 
                            {...field}
                            className="h-11"
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500">
                          A descriptive name for this template (3-100 characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Optional summary to help other admins understand when to use this template..."
                            rows={3}
                            {...field}
                            className="resize-none"
                          />
                        </FormControl>
                        <div className="flex items-start justify-between">
                          <FormDescription className="text-sm text-gray-500">
                            Optional description (max 500 characters)
                          </FormDescription>
                          <span className="text-xs text-gray-400">
                            {field.value?.length || 0} / 500
                          </span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-6" />

                {/* Content Sections */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2">
                    <AlignLeft className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Template Content</h3>
                    <span className="text-sm text-gray-500 font-normal">
                      (At least one section is required)
                    </span>
                  </div>

                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      Enter each item on a new line. Empty lines will be ignored.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="eligible"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-blue-500" />
                            Eligible Conditions
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter each eligibility condition on a new line&#10;Example:&#10;Must be registered contractor&#10;Minimum 5 years experience"
                              rows={6}
                              {...field}
                              className="resize-none font-mono text-sm"
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">
                            List bidder eligibility conditions (one per line)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="qualificationCriteria"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-green-500" />
                            Qualification Criteria
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter each qualification criterion on a new line&#10;Example:&#10;Valid GST certificate&#10;ISO certification required"
                              rows={6}
                              {...field}
                              className="resize-none font-mono text-sm"
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">
                            Add qualification requirements (one per line)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="termsConditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-500" />
                            Terms &amp; Conditions
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter each term on a new line&#10;Example:&#10;Payment terms: 30 days from invoice&#10;Warranty period: 12 months"
                              rows={8}
                              {...field}
                              className="resize-none font-mono text-sm"
                            />
                          </FormControl>
                          <FormDescription className="text-sm text-gray-500">
                            Provide terms and conditions (one per line). At least one section must have content.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Status Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2">
                    <ToggleLeft className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Template Status</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-base font-medium">Status</FormLabel>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 hover:bg-gray-100 transition-colors">
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 block">
                              {field.value ? "Active" : "Inactive"}
                            </span>
                            <span className="text-xs text-gray-600">
                              {field.value
                                ? "Template is available for selection in new NITs"
                                : "Template is hidden and cannot be selected"}
                            </span>
                          </div>
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
                    disabled={isSubmitting}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Create template
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

export default AddTemplatePage;

