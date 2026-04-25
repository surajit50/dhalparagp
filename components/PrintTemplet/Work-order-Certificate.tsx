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
import { getBase64FromUrl } from "@/utils";
import { blockname, gpcode, gpname, nameinprodhan, gpaddress } from "@/constants/gpinfor";

const templatePath = "/templates/workordercertificate.json";

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

const toTitleCase = (str: string) => {
  return str.replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
  });
};

export default function Component({ workOrderDetails }: WorkOrderCertificatePDFProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const getNitYear = (): number => {
    const memoDate = workOrderDetails.Bidagency?.WorksDetail?.nitDetails?.memoDate;
    return memoDate ? new Date(memoDate).getFullYear() : new Date().getFullYear();
  };

  const workOrderDate = workOrderDetails.awardofcontractdetails?.workordeermemodate;
  const workorderyear = workOrderDate
    ? new Date(workOrderDate).getFullYear()
    : new Date().getFullYear();

  const calculateBidPercentage = (): string => {
    const estimateAmount = workOrderDetails.Bidagency?.WorksDetail?.finalEstimateAmount || 0;
    const biddingAmount = workOrderDetails.Bidagency?.biddingAmount || 0;

    if (estimateAmount && biddingAmount && estimateAmount !== 0) {
      const percentage = ((estimateAmount - biddingAmount) / estimateAmount) * 100;
      return percentage.toFixed(2);
    }
    return "0.00";
  };

  const createTableData = (): string[][] => {
    const activityDescription =
      workOrderDetails.Bidagency?.WorksDetail?.ApprovedActionPlanDetails?.activityDescription || "";
    const activityCode =
      workOrderDetails.Bidagency?.WorksDetail?.ApprovedActionPlanDetails?.activityCode || "";

    const workName = `${toTitleCase(activityDescription)}${
      activityCode ? `-${activityCode}` : ""
    }`;

    const data = [
      "1",
      workName,
      `${workOrderDetails.Bidagency?.WorksDetail?.finalEstimateAmount || "N/A"}`,
      `${workOrderDetails.Bidagency?.biddingAmount || "N/A"}`,
      "As per Govt. Norms and latest guideline of Govt.",
    ];

    return [data];
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);

    const nitMemoNumber = workOrderDetails.Bidagency?.WorksDetail?.nitDetails?.memoNumber;
    const nitDetailsId = workOrderDetails.Bidagency?.WorksDetail?.nitDetailsId;

    try {
      const nitworkcount = await getworklenthbynitno(
        nitMemoNumber || 0,
        nitDetailsId || ""
      );

      const bidPercentage = calculateBidPercentage();
      const table = createTableData();

      if (!table?.length || !table[0]?.length) {
        console.error("Table data issue:", table);
        throw new Error("Invalid table data for PDF.");
      }

      const logoBase64 = await getBase64FromUrl("/images/logo.png");
      const workOrderMemoDate = workOrderDetails.awardofcontractdetails?.workordeermemodate;
      const formattedWorkOrderDate = workOrderMemoDate ? formatDate(workOrderMemoDate) : "";

      const agencyDetails = workOrderDetails.Bidagency?.agencydetails;
      const agencyname =
        agencyDetails?.agencyType === "FARM" && agencyDetails?.proprietorName
          ? `${agencyDetails.name?.trim()} (${agencyDetails.proprietorName?.trim()})`
          : agencyDetails?.name?.trim() || "N/A";

      const inputs = [
        {
          refno: `${workOrderDetails.awardofcontractdetails?.workodermenonumber || ""}/${gpcode}/${workorderyear}`,
          gpname: `${gpname}`,
          gpaddress: `${gpaddress} , ${blockname}, Dakshin Dinajpur`,
          gpname2: `${nameinprodhan}`,
          gpname3: `${nameinprodhan}`,
          refdate: formattedWorkOrderDate,
          agencyname,
          agencyadd: `${agencyDetails?.contactDetails || ""} - ${agencyDetails?.mobileNumber || ""}`,
          fund: workOrderDetails.Bidagency?.WorksDetail?.ApprovedActionPlanDetails?.schemeName || "",
          worksl: `${workOrderDetails.Bidagency?.WorksDetail?.workslno || ""} out of ${nitworkcount}`,
          nitno: `${nitMemoNumber || ""}/${gpcode}/${getNitYear()} ${
            workOrderDetails.Bidagency?.WorksDetail?.nitDetails?.memoDate
              ? formatDate(workOrderDetails.Bidagency.WorksDetail.nitDetails.memoDate)
              : ""
          }`,
          workname: `${toTitleCase(
            workOrderDetails.Bidagency?.WorksDetail?.ApprovedActionPlanDetails?.activityDescription || ""
          )}${
            workOrderDetails.Bidagency?.WorksDetail?.ApprovedActionPlanDetails?.activityCode
              ? `-${workOrderDetails.Bidagency.WorksDetail.ApprovedActionPlanDetails.activityCode}`
              : ""
          }`,
          body1: `As the rate offered by you for execution of the above mentioned scheme under ${
            workOrderDetails.Bidagency?.WorksDetail?.ApprovedActionPlanDetails?.schemeName || ""
          } fund, invited vide above NIT is found to be the 1st lowest, also in view of the agreement executed by you on ${formattedWorkOrderDate} for accomplishing the proposed consolidated work, following are the stipulated terms and conditions and the work order is hereby issued for execution of work at the accepted rate which is ${bidPercentage}% less than the NIT Tendered Amount.`,
          body2:
            "Entire work will have to be completed under the effective and technical guidance of Nirman Sahayak of Gram Panchayat. The said work shall have to be completed within 30(Thirty) days from the date of receiving the work order.",
          table: table,
          forwardtable: workorderforward.map((term, i) => [`${i + 1}. ${term}`]),
          logo: logoBase64,
        },
      ];

      const pdf = await generatePDF(templatePath, inputs);
      if (!pdf || !pdf.buffer) {
        throw new Error("PDF generation failed");
      }

      const blob = new Blob([pdf.buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `work_order_certificate_${workOrderDetails.id || "unknown"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Work Order Certificate PDF generated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error in PDF generation:", error);
      let errorMessage = "An unknown error occurred while generating the PDF.";

      if (error instanceof Error) {
        errorMessage = error.message;
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
