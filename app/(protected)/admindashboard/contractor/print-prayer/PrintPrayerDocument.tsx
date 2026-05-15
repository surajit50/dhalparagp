"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { generatePDF } from "@/components/pdfgenerator";
import { formatDate } from "@/utils/utils";
import { gpname, gpcode } from "@/constants/gpinfor";

type PrayerType =
  | "BILL_PRAYER"
  | "EMD_REFUND"
  | "SECURITY_MONEY_RELEASE"
  | "OTHER_PRAYER";

const getTemplatePath = (prayerType: PrayerType): string => {
  switch (prayerType) {
    case "SECURITY_MONEY_RELEASE":
      return "/templates/security-release-prayer.json";
    case "EMD_REFUND":
      return "/templates/emd-refund-prayer.json";
    case "BILL_PRAYER":
    default:
      return "/templates/printprayer.json";
  }
};

const PRAYER_TYPE_LABELS: Record<PrayerType, string> = {
  BILL_PRAYER: "Print Bill Prayer",
  EMD_REFUND: "Print EMD Refund Prayer",
  SECURITY_MONEY_RELEASE: "Print Security Money Release Prayer",
  OTHER_PRAYER: "Print Other Prayer",
};

interface PrintPrayerDocumentProps {
  prayerType: PrayerType;
  workName: string;
  nitNumber: string;
  nitDate: Date | string;
  workSlNo: number | string;
  contractorName: string;
  contractorAddress: string;
  workOrderNumber: string;
  workOrderDate: Date | string;
  completionDate: Date | null;
  securityDepositAmount: number | null;
  activityCode: string;
  emdAmount: number | null;
}

export default function PrintPrayerDocument({
  prayerType,
  workName,
  nitNumber,
  nitDate,
  workSlNo,
  contractorName,
  contractorAddress,
  workOrderNumber,
  workOrderDate,
  completionDate,
  securityDepositAmount,
  emdAmount,
  activityCode,
}: PrintPrayerDocumentProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      // Format dates
      const nitDateObj =
        typeof nitDate === "string" ? new Date(nitDate) : nitDate;
      const workOrderDateObj =
        typeof workOrderDate === "string"
          ? new Date(workOrderDate)
          : workOrderDate;

      const nitDateFormatted = formatDate(nitDateObj);
      const workOrderDateFormatted = formatDate(workOrderDateObj);
      const currentDateFormatted = formatDate(new Date());
      const emdAmountFormatted = emdAmount ? emdAmount.toFixed(2) : "0.00";
      // Format NIT details
      const nitDetails = `${nitNumber}/${nitDateObj.getFullYear()}`;
      const paragraph2 = `in NIT No ${nitDetails} dated ${nitDateFormatted} for Work Order No ${workOrderNumber} dated ${workOrderDateFormatted} (Work Sl. No: ${workSlNo.toString()}) for the work "${workName}".`;
      const paragraph3 = `was deposited for participation in NIT No ${nitDetails} dated ${nitDateFormatted} for Work Order No ${workOrderNumber} dated ${workOrderDateFormatted} (Work Sl. No: ${workSlNo.toString()}). As per the terms and conditions, I am now eligible for the refund of the earnest money deposit amount.`;

      const securityamount = `Security Amount: ${
        securityDepositAmount ? securityDepositAmount.toFixed(2) : "0.00"
      }`;

      // Get template path based on prayer type
      const templatePath = getTemplatePath(prayerType);

      // Prepare input data based on prayer type
      let inputs: any[];

      if (prayerType === "SECURITY_MONEY_RELEASE") {
        // For security release prayer, use current date as completion date (or work order date as fallback)

        inputs = [
          {
            gpname: gpname,
            gp_name: gpname,
            subject_label: `Subject: Request for Release of Security Deposit for the NIT NO ${nitDetails} Work Sl no ${workSlNo}`,
            work_name: workName,
            workOrderNumber: workOrderNumber,
            workOrderDate: workOrderDateFormatted,
            workSlNo: workSlNo.toString(),
            workName: `${workName} - ${activityCode}`,
            completion_date: completionDate
              ? formatDate(completionDate)
              : "N/A",
            contractorName: contractorName,
            contractorAddress: contractorAddress || "N/A",
            contractor_name: contractorName,
            contractor_address: contractorAddress || "N/A",
            completionDate: completionDate ? formatDate(completionDate) : "N/A",
            securityamount: securityamount,
          },
        ];
      } else if (prayerType === "EMD_REFUND") {
        // For EMD refund prayer
        inputs = [
          {
            gpname: gpname,
            gp_name: gpname,

            nit_details_subject: nitDetails,
            work_sl_no: workSlNo.toString(),
            work_name: `${workName} - ${activityCode}`,
            paragraph2_continued: paragraph3,
            emd_amount: `Rs. ${emdAmountFormatted}`,
            contractor_name: contractorName,
            contractor_address: contractorAddress || "N/A",
            date: currentDateFormatted,
          },
        ];
      } else {
        // For bill prayer and other types
        inputs = [
          {
            gpname: gpname,
            gp_name: gpname,
            nitDetails: nitDetails,
            nitDate: nitDateFormatted,
            workOrderNumber: workOrderNumber,
            workOrderDate: workOrderDateFormatted,
            workSlNo: workSlNo.toString(),
            workName: `${workName} - ${activityCode}`,
            contractorName: contractorName,
            contractorAddress: contractorAddress || "N/A",
            contractor_name: contractorName,
            contractor_address: contractorAddress || "N/A",
            paragraph2: paragraph2,
          },
        ];
      }

      const pdf = await generatePDF(templatePath, inputs);

      // Handle PDF buffer properly
      const pdfBuffer = pdf instanceof Uint8Array ? pdf : (pdf as any).buffer;
      const buffer =
        pdfBuffer instanceof ArrayBuffer
          ? new Uint8Array(pdfBuffer)
          : pdfBuffer instanceof Uint8Array
          ? pdfBuffer
          : new Uint8Array(pdfBuffer as any);

      const blob = new Blob([buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${workOrderNumber}-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")},.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess(true);
      toast({
        title: "Success",
        description: "Print Prayer PDF generated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error in PDF generation:", error);
      let errorMessage = "An unknown error occurred while generating the PDF.";

      if (error instanceof Error) {
        if (error.message.includes("value.split is not a function")) {
          errorMessage =
            "Error processing text data. Please check the input values and try again.";
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handleGeneratePDF}
        disabled={isGenerating}
        variant="default"
        className="bg-orange-500 text-white px-4 py-2 rounded flex items-center"
        aria-busy={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            {PRAYER_TYPE_LABELS[prayerType] || "Print Prayer"}
          </>
        )}
      </Button>
    </div>
  );
}
