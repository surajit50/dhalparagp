"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, Save, RefreshCw, Plus, Trash2, FileText, AlignLeft, Info, Sparkles, ToggleLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

type TemplateContent = {
  eligible: string[];
  qualificationCriteria: string[];
  termsConditions: string[];
};

type TenderTermTemplate = {
  id: string;
  name: string;
  description: string | null;
  content: TemplateContent;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const stringItemSchema = z.object({
  value: z.string(),
});

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
    eligible: z.array(stringItemSchema).default([]),
    qualificationCriteria: z.array(stringItemSchema).default([]),
    termsConditions: z.array(stringItemSchema).default([]),
    isActive: z.boolean().default(true),
  })
  .refine(
    (data) => {
      const hasContent = [
        ...data.eligible,
        ...data.qualificationCriteria,
        ...data.termsConditions,
      ].some((item) => item.value.trim().length > 0);
      return hasContent;
    },
    { 
      message: "Please provide content in at least one section (Eligible, Qualification Criteria, or Terms & Conditions)", 
      path: ["termsConditions"] 
    },
  );

type FormValues = z.infer<typeof formSchema>;

const sanitizeItemValues = (items?: { value: string }[]) =>
  (items ?? []).map((item) => item.value.trim()).filter((value) => value.length > 0);

const sanitizeStringValues = (items?: string[]) =>
  (items ?? []).map((item) => item.trim()).filter((value) => value.length > 0);

const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

const toFieldArray = (items?: string[]) => (items ?? []).map((value) => ({ value }));

async function fetchTemplate(id: string): Promise<TenderTermTemplate> {
  const response = await fetch(`/api/tender-term-templates/${id}`);
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? "Failed to fetch template");
  }
  return response.json();
}

async function updateTemplate(id: string, payload: {
  name: string;
  description?: string | null;
  isActive: boolean;
  content: TemplateContent;
}) {
  const response = await fetch(`/api/tender-term-templates/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message ?? "Failed to update template");
  }

  return response.json();
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const EditTemplatePage = ({ params }: PageProps) => {
  const router = useRouter();
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialTemplate, setInitialTemplate] = useState<TenderTermTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const resolveParams = async () => {
      const { id } = await params;
      setTemplateId(id);
    };
    resolveParams();
  }, [params]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      eligible: [],
      qualificationCriteria: [],
      termsConditions: [],
      isActive: true,
    },
  });

  const eligibleArray = useFieldArray<FormValues, "eligible">({
    control: form.control,
    name: "eligible",
  });

  const qualificationArray = useFieldArray<FormValues, "qualificationCriteria">({
    control: form.control,
    name: "qualificationCriteria",
  });

  const termsArray = useFieldArray<FormValues, "termsConditions">({
    control: form.control,
    name: "termsConditions",
  });

  useEffect(() => {
    if (!templateId) return;

    const loadTemplate = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const template = await fetchTemplate(templateId);
        setInitialTemplate(template);
        const eligibleFields = toFieldArray(template.content?.eligible);
        const qualificationFields = toFieldArray(template.content?.qualificationCriteria);
        const termsFields = toFieldArray(template.content?.termsConditions);
        
        form.reset({
          name: template.name,
          description: template.description ?? "",
          eligible: eligibleFields,
          qualificationCriteria: qualificationFields,
          termsConditions: termsFields,
          isActive: template.isActive,
        });
        
        // Replace field arrays after form reset
        eligibleArray.replace(eligibleFields);
        qualificationArray.replace(qualificationFields);
        termsArray.replace(termsFields);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to fetch template");
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  const onSubmit = async (values: FormValues) => {
    if (!templateId) return;
    setIsSubmitting(true);
    try {
      const eligibleContent = sanitizeItemValues(values.eligible);
      const qualificationContent = sanitizeItemValues(values.qualificationCriteria);
      const termsContent = sanitizeItemValues(values.termsConditions);

      await updateTemplate(templateId, {
        name: values.name.trim(),
        description: values.description?.trim() || null,
        isActive: values.isActive,
        content: {
          eligible: eligibleContent,
          qualificationCriteria: qualificationContent,
          termsConditions: termsContent,
        },
      });
      toast.success("Template updated successfully");
      router.push("/admindashboard/manage-tender/templates");
    } catch (err) {
      console.error("Failed to update template", err);
      toast.error(err instanceof Error ? err.message : "Failed to update template");
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchedName = form.watch("name");
  const watchedDescription = form.watch("description");
  const watchedIsActive = form.watch("isActive");
  const watchedEligible = form.watch("eligible");
  const watchedQualification = form.watch("qualificationCriteria");
  const watchedTerms = form.watch("termsConditions");

  const hasChanges = useMemo(() => {
    if (!initialTemplate) return false;

    const currentEligible = sanitizeItemValues(watchedEligible);
    const currentQualification = sanitizeItemValues(watchedQualification);
    const currentTerms = sanitizeItemValues(watchedTerms);

    const baselineEligible = sanitizeStringValues(initialTemplate.content?.eligible);
    const baselineQualification = sanitizeStringValues(
      initialTemplate.content?.qualificationCriteria,
    );
    const baselineTerms = sanitizeStringValues(initialTemplate.content?.termsConditions);

    const current = {
      name: (watchedName || "").trim(),
      description: (watchedDescription || "").trim(),
      isActive: watchedIsActive,
    };

    const baseline = {
      name: initialTemplate.name.trim(),
      description: (initialTemplate.description || "").trim(),
      isActive: initialTemplate.isActive,
    };

    const basicChanged =
      current.name !== baseline.name ||
      current.description !== baseline.description ||
      current.isActive !== baseline.isActive;

    const contentChanged =
      !arraysEqual(currentEligible, baselineEligible) ||
      !arraysEqual(currentQualification, baselineQualification) ||
      !arraysEqual(currentTerms, baselineTerms);

    return basicChanged || contentChanged;
  }, [
    initialTemplate,
    watchedName,
    watchedDescription,
    watchedIsActive,
    watchedEligible,
    watchedQualification,
    watchedTerms,
  ]);

  const renderContentSection = (
    fieldName: "eligible" | "qualificationCriteria" | "termsConditions",
    label: string,
    description: string,
    count: number,
  ) => {
    const array =
      fieldName === "eligible"
        ? eligibleArray
        : fieldName === "qualificationCriteria"
        ? qualificationArray
        : termsArray;

    const fields = array.fields;
    const iconColor = fieldName === "eligible" ? "text-blue-500" : fieldName === "qualificationCriteria" ? "text-green-500" : "text-purple-500";

    return (
    <FormField
      control={form.control}
      name={fieldName}
      render={() => (
        <FormItem>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className={`h-4 w-4 ${iconColor}`} />
              <FormLabel className="text-base font-medium">{label}</FormLabel>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {count} item{count === 1 ? "" : "s"}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => array.append({ value: "" })}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
          </div>
          <FormDescription className="text-sm text-gray-500 mb-3">
            {description}
          </FormDescription>

          <div className="space-y-3">
            {fields.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
                <p className="text-sm text-gray-500 mb-2">No entries yet</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => array.append({ value: "" })}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add your first item
                </Button>
              </div>
            ) : (
              fields.map((item, index) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name={`${fieldName}.${index}.value` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              rows={3}
                              placeholder={`Enter ${label.toLowerCase()} item ${index + 1}...`}
                              {...field}
                              className="resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => array.remove(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-10 w-10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <FormMessage />
        </FormItem>
      )}
    />
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-4xl flex flex-col items-center justify-center h-64 gap-3 text-gray-600">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading template...</span>
        </div>
      </div>
    );
  }

  if (error || !templateId) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
        <div className="mx-auto max-w-2xl text-center space-y-4">
          <h2 className="text-xl font-semibold text-red-600">Unable to load template</h2>
          <p className="text-gray-600">{error ?? "Template not found"}</p>
          <Button asChild>
            <Link href="/admindashboard/manage-tender/templates">Back to templates</Link>
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
              <Link href="/admindashboard/manage-tender/templates">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Templates
              </Link>
            </Button>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent tracking-tight">
              Edit Tender Term Template
            </h1>
            <p className="text-gray-600 text-lg font-medium">
              Update the reusable conditions bundle. Changes will apply to future NITs that use this template.
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
              Modify the template metadata and section content. Existing NITs retain previously included text.
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
                      Click Add to create new items. Empty items will be removed on save.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 gap-6">
                    {renderContentSection(
                      "eligible",
                      "Eligible",
                      "List bidder eligibility conditions.",
                      sanitizeItemValues(watchedEligible).length,
                    )}

                    {renderContentSection(
                      "qualificationCriteria",
                      "Qualification Criteria",
                      "Add qualification requirements that bidders must satisfy.",
                      sanitizeItemValues(watchedQualification).length,
                    )}

                    {renderContentSection(
                      "termsConditions",
                      "Terms & Conditions *",
                      "Provide terms and conditions that will be inserted into NIT documents.",
                      sanitizeItemValues(watchedTerms).length,
                    )}
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
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save changes
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

export default EditTemplatePage;

