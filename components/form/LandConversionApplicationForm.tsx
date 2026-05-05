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

interface LandConversionApplicationFormProps {
  isAdminOrSuperAdmin?: boolean;
}

export default function LandConversionApplicationForm({
  isAdminOrSuperAdmin = false,
}: LandConversionApplicationFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdApplicationId, setCreatedApplicationId] = useState<
    string | null
  >(null);
  const [uploadingDoc, setUploadingDoc] = useState<
    "ID_PROOF" | "LAND_DOCUMENT" | null
  >(null);
  const [idProofFile, setIdProofFile] = useState<File | null>(null);
  const [landDocFile, setLandDocFile] = useState<File | null>(null);

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
    // Check if files are selected for SUBMIT mode - only for non-admin users
    if (
      mode === "SUBMIT" &&
      !isAdminOrSuperAdmin &&
      (!idProofFile || !landDocFile)
    ) {
      toast({
        title: "Missing Documents",
        description:
          "Please upload both ID Proof and Land Documents before submitting.",
        variant: "destructive",
      });
      return;
    }

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
        const appId = appData?.id;
        setCreatedApplicationId(appId ?? null);

        // Upload documents if they exist
        if (appId) {
          if (idProofFile) {
            await uploadDocumentHelper(appId, "ID_PROOF", idProofFile);
            setIdProofFile(null); // Clear after upload
          }
          if (landDocFile) {
            await uploadDocumentHelper(appId, "LAND_DOCUMENT", landDocFile);
            setLandDocFile(null); // Clear after upload
          }
        }

        toast({
          title:
            mode === "DRAFT"
              ? "Draft saved successfully"
              : "Application submitted",
          description:
            mode === "DRAFT"
              ? "Your progress has been saved. You can complete it later."
              : `Application registered. Ref No: ${appData?.applicationNo}.`,
        });

        if (mode === "SUBMIT") {
          reset(defaultValues);
          setIdProofFile(null);
          setLandDocFile(null);
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

  const uploadDocumentHelper = async (
    applicationId: string,
    type: "ID_PROOF" | "LAND_DOCUMENT",
    file: File,
  ) => {
    setUploadingDoc(type);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("applicationId", applicationId);
      formData.append("documentType", type);

      const result = await uploadLandConversionDocument(formData);
      if (!result.success) {
        throw new Error(result.error ?? `Failed to upload ${type}`);
      }
    } catch (error: any) {
      console.error(`Error uploading ${type}:`, error);
      toast({
        title: "Upload Failed",
        description: error.message || `Failed to upload ${type}.`,
        variant: "destructive",
      });
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleDocumentUpload = async (
    type: "ID_PROOF" | "LAND_DOCUMENT",
    file: File,
  ) => {
    // This function is now mostly used for immediate upload if an ID exists
    if (!createdApplicationId) {
      // If no ID yet, just store in state (this shouldn't be called directly anymore by UI)
      if (type === "ID_PROOF") setIdProofFile(file);
      else setLandDocFile(file);
      return;
    }

    await uploadDocumentHelper(createdApplicationId, type, file);
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
            idProofFile={idProofFile}
            landDocFile={landDocFile}
            setIdProofFile={setIdProofFile}
            setLandDocFile={setLandDocFile}
            uploadingDoc={uploadingDoc}
            isAdminOrSuperAdmin={isAdminOrSuperAdmin}
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
