"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, Send, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { createQuotation, publishQuotation } from "@/lib/actions/quotations";
import { useState, useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useToast } from "@/components/ui/use-toast";

const quotationNoticeSchema = z.object({
  quotationType: z.enum(["WORK", "SUPPLY", "SALE"], {
    required_error: "Please select a quotation type",
  }),
  nitNo: z.string().min(1, "NIT/NIQ No. is required"),
  nitDate: z.string().min(1, "Date is required"),
  workName: z.string().min(1, "Name of Work/Material/Item is required"),
  estimatedAmount: z.string().min(1, "Estimated Amount is required"),
  submissionDate: z.string().min(1, "Submission Last Date is required"),
  submissionTime: z.string().min(1, "Submission Last Time is required"),
  openingDate: z.string().min(1, "Opening Date is required"),
  openingTime: z.string().min(1, "Opening Time is required"),
  description: z.string().optional(),
  eligibilityCriteria: z.string().optional(),
  itemCondition: z.string().optional(),
  specifications: z.string().optional(),
  workLocation: z.string().optional(),
  quantity: z.string().optional(),
  unit: z.string().optional(),
});

type QuotationNoticeFormType = z.infer<typeof quotationNoticeSchema>;

export default function CreateQuotationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quotationType =
    (searchParams.get("type") as "WORK" | "SUPPLY" | "SALE") || "SUPPLY";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const user = useCurrentUser();
  const { toast } = useToast();

  const form = useForm<QuotationNoticeFormType>({
    resolver: zodResolver(quotationNoticeSchema),
    defaultValues: {
      quotationType,
      nitNo: "",
      nitDate: new Date().toISOString().split("T")[0],
      workName: "",
      estimatedAmount: "",
      submissionDate: "",
      submissionTime: "15:00",
      openingDate: "",
      openingTime: "11:00",
      description: "",
      eligibilityCriteria: "",
      itemCondition: "",
      specifications: "",
      workLocation: "",
      quantity: "",
      unit: "",
    },
  });

  // Auto-set opening date to be after submission date
  useEffect(() => {
    const submissionDate = form.watch("submissionDate");
    if (submissionDate) {
      const nextDay = new Date(submissionDate);
      nextDay.setDate(nextDay.getDate() + 1);
      form.setValue("openingDate", nextDay.toISOString().split("T")[0]);
    }
  }, [form]);

  const onSubmit = async (data: QuotationNoticeFormType) => {
    if (!user?.id) {
      setError("User not authenticated. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await createQuotation(data, user.id);
      if (result.success) {
        setSuccess("Quotation saved as draft successfully!");
        toast({
          title: "Success",
          description: "Quotation saved as draft successfully!",
        });

        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push("/admindashboard/manage-qatation/publish");
        }, 1500);
      } else {
        setError(result.error || "Failed to save quotation");
        toast({
          title: "Error",
          description: result.error || "Failed to save quotation",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = "An unexpected error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error saving quotation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onPublish = async (data: QuotationNoticeFormType) => {
    if (!user?.id) {
      setError("User not authenticated. Please log in again.");
      return;
    }

    // Validate dates
    const submissionDate = new Date(data.submissionDate);
    const openingDate = new Date(data.openingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const createResult = await createQuotation(data, user.id);
      if (createResult.success && createResult.data) {
        const publishResult = await publishQuotation(
          createResult.data.id,
          user.id
        );
        if (publishResult.success) {
          setSuccess("Quotation published successfully!");
          toast({
            title: "Success",
            description: "Quotation published successfully!",
          });

          // Redirect after a short delay to show success message
          setTimeout(() => {
            router.push("/admindashboard/manage-qatation/published");
          }, 1500);
        } else {
          setError(publishResult.error || "Failed to publish quotation");
          toast({
            title: "Error",
            description: publishResult.error || "Failed to publish quotation",
            variant: "destructive",
          });
        }
      } else {
        setError(createResult.error || "Failed to create quotation");
        toast({
          title: "Error",
          description: createResult.error || "Failed to create quotation",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = "An unexpected error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Error publishing quotation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getQuotationTypeLabel = (type: string) => {
    switch (type) {
      case "WORK":
        return "Work/Services";
      case "SUPPLY":
        return "Supply of Items";
      case "SALE":
        return "Sale of Old Items";
      default:
        return "Supply of Items";
    }
  };

  const getWorkNameLabel = (type: string) => {
    switch (type) {
      case "WORK":
        return "Name of Work/Service";
      case "SUPPLY":
        return "Name of Material/Item to Supply";
      case "SALE":
        return "Name of Item for Sale";
      default:
        return "Name of Work/Material/Item";
    }
  };

  const getWorkNamePlaceholder = (type: string) => {
    switch (type) {
      case "WORK":
        return "e.g. Building Maintenance Work";
      case "SUPPLY":
        return "e.g. Supply of HP Laptop";
      case "SALE":
        return "e.g. Old Tubewell Parts";
      default:
        return "Enter work/item name";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-muted/40 py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-lg font-medium">Authentication Required</p>
                <p className="text-muted-foreground mb-4">
                  Please log in to create a quotation.
                </p>
                <Button asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admindashboard/manage-qatation">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quotations
            </Link>
          </Button>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-primary">
              Create Quotation Notice (NIT/NIQ)
            </CardTitle>
            <CardDescription className="text-center">
              Fill in the details below to create a new quotation notice for{" "}
              <span className="font-medium">
                {getQuotationTypeLabel(quotationType)}
              </span>
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Status Messages */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b pb-2">
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      name="nitNo"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NIT/NIQ No. *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. 01/NIQ/24-25" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="nitDate"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    name="quotationType"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quotation Type *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select quotation type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="SUPPLY">
                              Supply of Items
                            </SelectItem>
                            <SelectItem value="WORK">Work/Services</SelectItem>
                            <SelectItem value="SALE">
                              Sale of Old Items
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="workName"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {getWorkNameLabel(form.watch("quotationType"))} *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={getWorkNamePlaceholder(
                              form.watch("quotationType")
                            )}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Quantity and Amount */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b pb-2">
                    Quantity & Amount
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      name="quantity"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. 10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="unit"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g. Pieces, Kg, Meters"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="estimatedAmount"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Amount (₹) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              placeholder="e.g. 50000"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Important Dates */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b pb-2">
                    Important Dates
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-800">
                        Submission Deadline
                      </h4>
                      <div className="space-y-4">
                        <FormField
                          name="submissionDate"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date *</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="submissionTime"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time *</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800">Opening</h4>
                      <div className="space-y-4">
                        <FormField
                          name="openingDate"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date *</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          name="openingTime"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time *</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Type-specific Fields */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b pb-2">
                    Additional Details
                  </h3>

                  {form.watch("quotationType") === "WORK" && (
                    <FormField
                      name="workLocation"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Work Location</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g. Main Office Building, Block A"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch("quotationType") === "SUPPLY" && (
                    <FormField
                      name="specifications"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Technical Specifications</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Detailed specifications of items to be supplied..."
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch("quotationType") === "SALE" && (
                    <FormField
                      name="itemCondition"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Condition</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Describe the condition of items for sale (working condition, age, any defects, etc.)..."
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    name="description"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Additional details about the work/material..."
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="eligibilityCriteria"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Eligibility Criteria</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Eligibility requirements for bidders..."
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isLoading}
                    className="px-8 bg-transparent"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save as Draft"}
                  </Button>
                  <Button
                    type="button"
                    onClick={form.handleSubmit(onPublish)}
                    disabled={isLoading}
                    className="px-8"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isLoading ? "Publishing..." : "Publish Notice"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
