"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/utils";
import { Loader2, FileCheck, AlertCircle, Printer } from "lucide-react";
import { generatePDF } from "../pdfgenerator";
import { CompletationCertificate } from "@/types";
import { gpcode } from "@/constants/gpinfor";
const templatePath = "/templates/completationcertificate.json";

export default function Completationcertificate({
  paymentdetails,
}: {
  paymentdetails: CompletationCertificate;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      const paymentDetails = paymentdetails.paymentDetails || [];

      const agencyname =
        paymentdetails.AwardofContract?.workorderdetails?.[0]?.Bidagency
          ?.agencydetails.agencyType === "FARM"
          ? `${
              paymentdetails.AwardofContract?.workorderdetails?.[0]?.Bidagency
                ?.agencydetails.name
            }${
              paymentdetails.AwardofContract?.workorderdetails?.[0]?.Bidagency
                ?.agencydetails.proprietorName
                ? ` (${paymentdetails.AwardofContract?.workorderdetails?.[0]?.Bidagency?.agencydetails.proprietorName})`
                : ""
            }`
          : `${paymentdetails.AwardofContract?.workorderdetails?.[0]?.Bidagency?.agencydetails.name}`;

      const inputs = [
        {
          agencydetails: `This is to certify that ${agencyname}, located at ${paymentdetails.AwardofContract?.workorderdetails?.[0]?.Bidagency?.agencydetails.contactDetails}, has successfully completed the following work:`,
          workname:
            paymentdetails.ApprovedActionPlanDetails.activityDescription,
          nitdetails: `${
            paymentdetails.nitDetails.memoNumber
          }/${gpcode}/${paymentdetails.nitDetails.memoDate.getFullYear()} Date:-${formatDate(
            paymentdetails.nitDetails.memoDate
          )} Work Sl no ${paymentdetails.workslno}`,
          workorderno: `${
            paymentdetails.AwardofContract?.workodermenonumber
          }/${gpcode}/${paymentdetails.AwardofContract?.workordeermemodate.getFullYear()} Date:-${
            paymentdetails.AwardofContract?.workordeermemodate
              ? formatDate(paymentdetails.AwardofContract?.workordeermemodate)
              : "N/A"
          }`,
          completationdate: paymentdetails.completionDate
            ? formatDate(paymentdetails.completionDate)
            : "N/A",
          sanctionamt:
            paymentdetails.AwardofContract?.workorderdetails?.[0].Bidagency?.biddingAmount?.toFixed(
              2
            ),
          grosbillamnt: (() => {
            if (paymentDetails.length === 0) return "0.00";
            if (paymentDetails.length === 1)
              return paymentDetails[0].grossBillAmount.toFixed(2);
            const amounts = paymentDetails.map((p) =>
              p.grossBillAmount.toFixed(2)
            );
            const total = paymentDetails
              .reduce((sum, p) => sum + p.grossBillAmount, 0)
              .toFixed(2);
            return `${amounts.join(" + ")} = ${total}`;
          })(),
          netbill: (() => {
            if (paymentDetails.length === 0) return "0.00";
            if (paymentDetails.length === 1)
              return paymentDetails[0].netAmt.toFixed(2);
            const amounts = paymentDetails.map((p) => p.netAmt.toFixed(2));
            const total = paymentDetails
              .reduce((sum, p) => sum + p.netAmt, 0)
              .toFixed(2);
            return `${amounts.join(" + ")} = ${total}`;
          })(),
          qrcode: `https://www.dhalparagp.in/services/e-governance/workorder-verification?id=${paymentdetails.id}`,

          certificateno: `Certificate No: ${paymentdetails.completionDate?.getFullYear()}${paymentdetails.completionDate?.getMonth()}-${
            paymentdetails.AwardofContract?.workodermenonumber
          }-${paymentdetails.nitDetails.memoNumber}`,
          certificatedate: `Date:${
            paymentdetails.completionDate
              ? formatDate(paymentdetails.completionDate)
              : ""
          }`,
        },
      ];

      // Rest of the PDF generation code remains the same
      const pdf = await generatePDF(templatePath, inputs);
      const blob = new Blob([pdf.buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `generated_pdf.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch (error) {
      console.error("Error in PDF generation:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4">
      <Button
        onClick={handleGeneratePDF}
        disabled={isGenerating}
        className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
        aria-busy={isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Printer className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
