"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Workorderdetails } from "@/types/tender-manage";
import { Printer, Loader2 } from "lucide-react";
import { generatePDF } from "@/lib/pdf-generator";
import type { Font } from "@pdfme/common";
import { workorderforward } from "@/constants";
import { formatDate } from "@/utils/utils";
import { getworklenthbynitno } from "@/lib/auth";
import { gpcode } from "@/constants/gpinfor";
const templatePath = "/templates/supplyorder.json";

const customFonts: Font = {
  serif: {
    data: "https://example.com/fonts/serif.ttf",
    fallback: true,
  },
  sans_serif: {
    data: "https://example.com/fonts/sans_serif.ttf",
  },
};

type WorkOrderCertificatePDFProps = {
  workOrderDetails: Workorderdetails;
};

export default function SupplyOrder({
  workOrderDetails,
}: WorkOrderCertificatePDFProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const getNitYear = (): number => {
    const memoDate =
      workOrderDetails.Bidagency?.WorksDetail?.nitDetails?.memoDate;
    return memoDate
      ? new Date(memoDate).getFullYear()
      : new Date().getFullYear();
  };

  const workorderyear =
    workOrderDetails.awardofcontractdetails.workordeermemodate.getFullYear() ||
    "";

  const calculateBidPercentage = (): string => {
    const estimateAmount =
      workOrderDetails.Bidagency?.WorksDetail?.finalEstimateAmount || 0;
    const biddingAmount = workOrderDetails.Bidagency?.biddingAmount || 0;

    if (estimateAmount && biddingAmount && estimateAmount !== 0) {
      const percentage =
        ((estimateAmount - biddingAmount) / estimateAmount) * 100;
      return percentage.toFixed(2);
    }
    return "0.00";
  };

  const createTableData = (): string[][] => {
    const data = [
      "1",
      workOrderDetails.Bidagency?.WorksDetail?.ApprovedActionPlanDetails
        ?.activityDescription,
      `${workOrderDetails.Bidagency?.WorksDetail?.finalEstimateAmount}`,
      `${workOrderDetails.Bidagency?.biddingAmount}`,
      "As per Govt. Norms and latest guideline of Govt.",
    ];

    return [data.map((item) => (item || "N/A").toString())];
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);

    const nitworkcount = await getworklenthbynitno(
      workOrderDetails.Bidagency?.WorksDetail?.nitDetails.memoNumber || 0,
      workOrderDetails.Bidagency?.WorksDetail?.nitDetailsId || ""
    );

    try {
      const bidPercentage = calculateBidPercentage();
      const table = await createTableData();

      if (table.length === 0 || table[0].length === 0) {
        throw new Error("Invalid table data");
      }

      const inputs = [
        {
          refno: `${
            workOrderDetails.awardofcontractdetails?.workodermenonumber || ""
          }/${gpcode}/${workorderyear}`,
          refdate:
            formatDate(
              workOrderDetails.awardofcontractdetails?.workordeermemodate
            ) || "",
          agencyname: workOrderDetails.Bidagency?.agencydetails?.name || "",
          agencyadd: `${
            workOrderDetails.Bidagency?.agencydetails?.contactDetails || ""
          } - ${workOrderDetails.Bidagency?.agencydetails.mobileNumber || ""}`,
          field8: `Supply Order for  ${
            workOrderDetails.Bidagency?.WorksDetail?.nitDetails
              .supplyitemname || ""
          }.`,
          fund:
            workOrderDetails.Bidagency?.WorksDetail?.ApprovedActionPlanDetails
              ?.schemeName || "",
          worksl: `${workOrderDetails.Bidagency?.WorksDetail?.workslno || ""}`,
          nitno: `${
            workOrderDetails.Bidagency?.WorksDetail?.nitDetails?.memoNumber ||
            ""
          }/${gpcode}/${getNitYear()} ${
            workOrderDetails.Bidagency?.WorksDetail?.nitDetails?.memoDate
              ? formatDate(
                  workOrderDetails.Bidagency?.WorksDetail?.nitDetails?.memoDate
                )
              : ""
          }`,
          workname: `${
            workOrderDetails.Bidagency?.WorksDetail?.ApprovedActionPlanDetails
              ?.activityDescription || ""
          }-${
            workOrderDetails.Bidagency?.WorksDetail?.ApprovedActionPlanDetails
              ?.activityCode || ""
          }`,

          table: table,
          field32: `Your bid has been accepted as your quoted rate is ${bidPercentage}% below the estimated amount (₹${workOrderDetails.Bidagency?.WorksDetail?.finalEstimateAmount}) and you have secured the 1st position in the bidding process.`,
          forwardtable:
            workorderforward.map((term, i) => [`${i + 1}. ${term}`]) || [],
        },
      ];

      const pdf = await generatePDF(templatePath, inputs);
      if (!pdf || !pdf.buffer) {
        throw new Error("PDF generation failed");
      }

      const blob = new Blob([new Uint8Array(pdf.buffer)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `supply_order_${workOrderDetails.id || "unknown"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Supply Order PDF generated successfully",
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
    <Button
      variant="outline"
      onClick={handleGeneratePDF}
      disabled={isGenerating}
      aria-label="Generate PDF"
      className="w-full transition-colors hover:bg-primary hover:text-primary-foreground"
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Printer className="h-4 w-4" />
      )}
    </Button>
  );
}
