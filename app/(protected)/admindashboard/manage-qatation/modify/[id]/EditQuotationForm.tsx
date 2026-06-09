"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useToast } from "@/components/ui/use-toast";
import { updateQuotation, publishQuotation } from "@/lib/actions/quotations";
import { quotationSchema } from "@/lib/schemas/quotation";
import type { QuotationSchema } from "@/lib/schemas/quotation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { ArrowLeft, Save, Send, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

import BasicInfoSection from "@/app/(protected)/admindashboard/manage-qatation/create/sections/BasicInfoSection";
import ItemsTableSection from "@/app/(protected)/admindashboard/manage-qatation/create/sections/ItemsTableSection";
import DatesAndTimesSection from "@/app/(protected)/admindashboard/manage-qatation/create/sections/DatesAndTimesSection";
import TermsConditionsSection from "@/app/(protected)/admindashboard/manage-qatation/create/sections/TermsConditionsSection";
import RequiredDocumentsSection from "@/app/(protected)/admindashboard/manage-qatation/create/sections/RequiredDocumentsSection";

type EditQuotationFormProps = {
  quotation: any;
};

export default function EditQuotationForm({ quotation }: EditQuotationFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const user = useCurrentUser();
  const { toast } = useToast();

  const form = useForm<QuotationSchema>({
    resolver: zodResolver(quotationSchema),
    mode: "onChange",
    defaultValues: {
      quotationType: quotation.quotationType || "SUPPLY",
      nitNo: quotation.nitNo || "",
      nitDate: quotation.nitDate ? new Date(quotation.nitDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      workName: quotation.workName || "",
      estimatedAmount: quotation.estimatedAmount?.toString() || "",
      submissionDate: quotation.submissionDate ? new Date(quotation.submissionDate).toISOString().split("T")[0] : "",
      submissionTime: quotation.submissionTime || "15:00",
      openingDate: quotation.openingDate ? new Date(quotation.openingDate).toISOString().split("T")[0] : "",
      openingTime: quotation.openingTime || "11:00",
      description: quotation.description || "",
      eligibilityCriteria: quotation.eligibilityCriteria || "",
      itemCondition: quotation.itemCondition || "",
      specifications: quotation.specifications || "",
      workLocation: quotation.workLocation || "",
      quantity: quotation.quantity || "",
      unit: quotation.unit || "",
      rateType: quotation.rateType || null,
      serviceCategory: quotation.serviceCategory || null,
    },
  });

  // Auto-set opening date if submission date changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "submissionDate" && value.submissionDate) {
        const nextDay = new Date(value.submissionDate);
        nextDay.setDate(nextDay.getDate() + 1);
        form.setValue("openingDate", nextDay.toISOString().split("T")[0]);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: QuotationSchema) => {
    if (!user?.id) {
      setError("User not authenticated. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await updateQuotation(quotation.id, data, user.id);
      if (result.success) {
        setSuccess("Quotation updated successfully!");
        toast({
          title: "Success",
          description: "Quotation updated successfully!",
        });

        setTimeout(() => {
          router.push("/admindashboard/manage-qatation/view");
        }, 1500);
      } else {
        setError(result.error || "Failed to update quotation");
        toast({
          title: "Error",
          description: result.error || "Failed to update quotation",
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
      console.error("Error updating quotation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onPublish = async (data: QuotationSchema) => {
    if (!user?.id) {
      setError("User not authenticated. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updateResult = await updateQuotation(quotation.id, data, user.id);
      if (updateResult.success) {
        const publishResult = await publishQuotation(quotation.id, user.id);
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
        setError(updateResult.error || "Failed to save quotation updates");
        toast({
          title: "Error",
          description: updateResult.error || "Failed to save quotation updates",
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

  return (
    <div className="min-h-screen bg-muted/40 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admindashboard/manage-qatation/view">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quotations
            </Link>
          </Button>
        </div>

        <Card className="max-w-5xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-primary">
              Modify Quotation Notice (NIT/NIQ)
            </CardTitle>
            <CardDescription className="text-center">
              Edit Quotation Notice Details - {quotation.nitNo}
            </CardDescription>
          </CardHeader>

          <CardContent>
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
                <BasicInfoSection form={form} />
                <ItemsTableSection form={form} />
                <DatesAndTimesSection form={form} />
                <TermsConditionsSection form={form} />
                <RequiredDocumentsSection />

                <div className="flex justify-end gap-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isLoading}
                    className="px-8"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save Draft Updates"}
                  </Button>
                  <Button
                    type="button"
                    onClick={form.handleSubmit(onPublish)}
                    disabled={isLoading}
                    className="px-8"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isLoading ? "Publishing..." : "Publish Updates"}
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
