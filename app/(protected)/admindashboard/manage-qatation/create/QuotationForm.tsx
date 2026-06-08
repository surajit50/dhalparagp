"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useToast } from "@/components/ui/use-toast";
import { createQuotation, publishQuotation } from "@/lib/actions/quotations";
import { quotationSchema } from "@/lib/schemas/quotation";
import type { QuotationSchema } from "@/lib/schemas/quotation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { ArrowLeft, Save, Send, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import BasicInfoSection from "./sections/BasicInfoSection";
import ItemsTableSection from "./sections/ItemsTableSection";
import DatesAndTimesSection from "./sections/DatesAndTimesSection";
import TermsConditionsSection from "./sections/TermsConditionsSection";
import RequiredDocumentsSection from "./sections/RequiredDocumentsSection";

type QuotationFormType = QuotationSchema;

export default function CreateQuotationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quotationType = (searchParams.get("type") as "WORK" | "SUPPLY" | "SALE") || "SUPPLY";
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const user = useCurrentUser();
  const { toast } = useToast();

  const form = useForm<QuotationFormType>({
    resolver: zodResolver(quotationSchema),
    mode: "onChange",
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

  const onSubmit = async (data: QuotationFormType) => {
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

  const onPublish = async (data: QuotationFormType) => {
    if (!user?.id) {
      setError("User not authenticated. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const createResult = await createQuotation(data, user.id);
      if (createResult.success && createResult.data) {
        const publishResult = await publishQuotation(createResult.data.id, user.id);
        if (publishResult.success) {
          setSuccess("Quotation published successfully!");
          toast({
            title: "Success",
            description: "Quotation published successfully!",
          });

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

        <Card className="max-w-5xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-primary">
              Create Quotation Notice (NIT/NIQ)
            </CardTitle>
            <CardDescription className="text-center">
              Official Quotation Notice Format - Gram Panchayat
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
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form className="space-y-6">
                {/* Basic Information Section */}
                <BasicInfoSection form={form} />

                {/* Items Table Section */}
                <ItemsTableSection form={form} />

                {/* Dates and Times Section */}
                <DatesAndTimesSection form={form} />

                {/* Terms & Conditions Section */}
                <TermsConditionsSection form={form} />

                {/* Required Documents Section */}
                <RequiredDocumentsSection form={form} />

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isLoading}
                    className="px-8"
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
