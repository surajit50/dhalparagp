"use client";

import React, { useState, useTransition, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { submitEnquiryReport } from "@/action/warishApplicationAction";
import { useRouter } from "next/navigation";

export default function EnquiryReportForm({
  applicationId,
  initialReport = "",
  onClose,
}: {
  applicationId: string;
  initialReport?: string;
  onClose?: () => void;
}) {
  const router = useRouter();

  const [report, setReport] = useState(initialReport);
  const [isPending, startTransition] = useTransition();
  const [submitStatus, setSubmitStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  const characterLimit = 1000;
  const characterCount = report.length;
  const progress = Math.min((characterCount / characterLimit) * 100, 100);
  const isNearLimit = characterCount > characterLimit * 0.9;

  useEffect(() => {
    if (submitStatus.type !== "idle") {
      const timer = setTimeout(() => {
        setSubmitStatus({ type: "idle", message: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  const handleSubmit = async (formData: FormData) => {
    if (!report.trim()) return;

    try {
      formData.append("applicationId", applicationId);

      startTransition(async () => {
        const result = await submitEnquiryReport(formData);

        if (result.success) {
          setSubmitStatus({ type: "success", message: result.message });
          setReport("");

          setTimeout(() => {
            if (onClose) {
              onClose();
            } else {
              router.push("/employeedashboard/warish/view-assigned/");
            }
            router.refresh();
          }, 1200);
        } else {
          setSubmitStatus({
            type: "error",
            message: result.message || "Failed to submit report",
          });
        }
      });
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    }
  };

  return (
    <Card className="mt-6 max-w-2xl mx-auto shadow-lg border rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 text-green-600" />
          Staff Enquiry Report
        </CardTitle>
        <CardDescription>
          Provide detailed findings of your enquiry for this application.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="report" className="text-sm font-medium">
              Enquiry Report
            </Label>

            <Textarea
              id="report"
              name="report"
              value={report}
              onChange={(e) => setReport(e.target.value)}
              placeholder="Enter detailed enquiry findings..."
              className="min-h-[120px] resize-none"
              maxLength={characterLimit}
              required
            />

            <div className="space-y-2">
              <Progress value={progress} />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span
                  className={`${
                    isNearLimit ? "text-red-500 font-medium" : ""
                  }`}
                >
                  {characterCount}/{characterLimit} characters
                </span>

                {isNearLimit && (
                  <span className="text-red-500">
                    Approaching character limit
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending || !report.trim()}
            className="w-full"
          >
            {isPending ? "Submitting Report..." : "Submit Enquiry Report"}
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        {submitStatus.type === "success" && (
          <Alert className="bg-green-50 border-green-200 text-green-800 w-full">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{submitStatus.message}</AlertDescription>
          </Alert>
        )}

        {submitStatus.type === "error" && (
          <Alert variant="destructive" className="w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{submitStatus.message}</AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  );
}
