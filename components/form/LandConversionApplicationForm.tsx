"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Form } from "@/components/ui/form";
import { CheckCircle, Clock, Save, Send, AlertCircle } from "lucide-react";
import {
  createLandConversionApplication,
  uploadLandConversionDocument,
} from "@/action/land-conversion-actions";
import {
  landConversionApplicationSchema,
  type LandConversionApplicationInput,
} from "@/schema/land-conversion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import ApplicantInfoSection from "./land-conversion/ApplicantInfoSection";
import LandDetailsSection from "./land-conversion/LandDetailsSection";
import AdditionalLandsSection from "./land-conversion/AdditionalLandsSection";
import DocumentUploadSection from "./land-conversion/DocumentUploadSection";

const defaultValues: LandConversionApplicationInput = {
  applicantName: "",
  applicantPhone: "",
  applicantEmail: "",
  village: "",
  postOffice: "Trimohini",
  ps: "Hili",
  state: "West Bengal",
  district: "Dakshin Dinajpur",
  address: "",
  khatianNo: "",
  plotNo: "",
  mouza: "",
  jlNo: "",
  landAreaDec: "",
  presentLandUse: "",
  proposedLandUse: "",
  additionalLands: [],
};

export default function LandConversionApplicationForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdApplicationId, setCreatedApplicationId] = useState<
    string | null
  >(null);
  const [uploadingDoc, setUploadingDoc] = useState<
    "ID_PROOF" | "LAND_DOCUMENT" | null
  >(null);

  const form = useForm<LandConversionApplicationInput>({
    resolver: zodResolver(landConversionApplicationSchema),
    defaultValues,
    mode: "onBlur",
  });

  const { handleSubmit, reset } = form;

  // --- Handlers ---

  const handleFormSubmission = async (
    values: LandConversionApplicationInput,
    mode: "DRAFT" | "SUBMIT",
  ) => {
    setIsSubmitting(true);
    startTransition(async () => {
      try {
        const result = await createLandConversionApplication(values, mode);

        if (!result.success) {
          toast({
            title:
              mode === "DRAFT" ? "Failed to save draft" : "Submission failed",
            description: result.error ?? "Please check the form and try again.",
            variant: "destructive",
          });
          return;
        }

        const appData = result.data?.application;
        setCreatedApplicationId(appData?.id ?? null);

        toast({
          title:
            mode === "DRAFT"
              ? "Draft saved successfully"
              : "Application submitted",
          description:
            mode === "DRAFT"
              ? "Your progress has been saved. You can complete it later."
              : `Application registered. Ref No: ${appData?.applicationNo}. Please upload required documents.`,
        });

        if (mode === "SUBMIT") {
          reset(defaultValues);
        }
      } catch (error) {
        console.error("Land Conversion Submission Error:", error);
        toast({
          title: "Technical Error",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  const handleDocumentUpload = async (
    type: "ID_PROOF" | "LAND_DOCUMENT",
    file: File,
  ) => {
    if (!createdApplicationId) {
      toast({
        title: "Application ID missing",
        description:
          "Please save or submit the form first before uploading documents.",
        variant: "destructive",
      });
      return;
    }

    setUploadingDoc(type);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("applicationId", createdApplicationId);
      formData.append("documentType", type);

      const result = await uploadLandConversionDocument(formData);

      if (result.success) {
        toast({
          title: "Document Uploaded",
          description: `${type.replace("_", " ")} has been successfully attached to your application.`,
        });
      } else {
        throw new Error(result.error ?? "Failed to upload document.");
      }
    } catch (error: any) {
      console.error("Document Upload Error:", error);
      toast({
        title: "Upload Failed",
        description:
          error.message || "An unexpected error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setUploadingDoc(null);
    }
  };

  // --- UI Components ---

  const FormFooter = () => (
    <Card className="border-t-4 border-t-blue-600 shadow-lg overflow-hidden">
      <CardContent className="pt-6 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span>Review all mandatory fields (*) before submission</span>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              className="flex-1 sm:flex-none border-blue-200 text-blue-700 hover:bg-blue-50 transition-all active:scale-95"
              disabled={isSubmitting || isPending}
              onClick={handleSubmit((values) =>
                handleFormSubmission(values, "DRAFT"),
              )}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>

            <Button
              type="button"
              className="flex-1 sm:flex-none bg-blue-700 hover:bg-blue-800 shadow-md transition-all active:scale-95"
              disabled={isSubmitting || isPending}
              onClick={handleSubmit((values) =>
                handleFormSubmission(values, "SUBMIT"),
              )}
            >
              {isSubmitting || isPending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in duration-500">
      <Form {...form}>
        <form className="space-y-8">
          <ApplicantInfoSection />
          <LandDetailsSection />
          <AdditionalLandsSection />

          <DocumentUploadSection
            createdApplicationId={createdApplicationId || ""}
            uploadingDoc={uploadingDoc}
            handleDocumentUpload={handleDocumentUpload}
          />

          <FormFooter />
        </form>
      </Form>

      {createdApplicationId && (
        <Alert className="bg-emerald-50 border-emerald-200 shadow-sm animate-in slide-in-from-bottom-4">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          <AlertTitle className="text-emerald-800 font-bold">
            Application Successfully Registered
          </AlertTitle>
          <AlertDescription className="text-emerald-700 mt-1">
            Your application is now in the system with ID:{" "}
            <span className="font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded text-emerald-900 border border-emerald-200">
              {createdApplicationId}
            </span>
            .
            <p className="mt-2 text-xs opacity-80">
              You can now track the progress of this application through the
              management dashboard.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
