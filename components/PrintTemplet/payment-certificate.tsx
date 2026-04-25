"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Printer } from "lucide-react";
import { generatePDF } from "../pdfgenerator";
import { PaymentDetilsType } from "@/types";
import { formatDate } from "@/utils/utils";
import { gpcode } from "@/constants/gpinfor";
const templatePath = "/templates/paymentcertificatetempleted.json";

export default function PaymentCertificate({
  paymentdetails,
}: {
  paymentdetails: PaymentDetilsType;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      const paymentlenth = paymentdetails.paymentDetails.length;
      const agencyDetails =
        paymentdetails.AwardofContract?.workorderdetails?.[0]?.Bidagency
          ?.agencydetails;
      const fundtype = paymentdetails.ApprovedActionPlanDetails.schemeName;
      const workname =
        paymentdetails.ApprovedActionPlanDetails.activityDescription;
      const estimage = paymentdetails.finalEstimateAmount.toFixed(2);
      const nitmemono = `${
        paymentdetails.nitDetails.memoNumber
      }/${gpcode}/${paymentdetails.nitDetails.memoDate.getFullYear()}`;
      const nitdate = formatDate(paymentdetails.nitDetails.memoDate);
      const workslno = paymentdetails.workslno;

      const workorderno = `${
        paymentdetails.AwardofContract?.workodermenonumber
      }/${gpcode}/${paymentdetails.AwardofContract?.workordeermemodate.getFullYear()}`;

      const workorderdate = paymentdetails.AwardofContract?.workordeermemodate
        ? formatDate(paymentdetails.AwardofContract?.workordeermemodate)
        : "N/A";

      const inputs = [
        {
          agencydetails: `PAYMENT CERTIFICATE ISSUED TO ${
            agencyDetails?.agencyType === "FARM"
              ? `${agencyDetails?.name}${
                  agencyDetails?.proprietorName
                    ? ` (${agencyDetails.proprietorName})`
                    : ""
                }`
              : `${agencyDetails?.name}`
          }, ${
            agencyDetails?.contactDetails?.toUpperCase() || "N/A"
          } BY THE PRADHAN OF NO 3 DHALPARA GRAM PANCHAYAT`,
          pan: agencyDetails?.pan || "N/A",
          gst: agencyDetails?.gst || "N/A",
          nitref: `${nitmemono} , Date -${nitdate} Work Sl no ${workslno}, Work Order Memo no. ${workorderno} Dated : ${workorderdate}`,
          mdrefno: paymentdetails.paymentDetails?.[0]?.mbrefno,
          paydetailstable: paymentdetails.paymentDetails.map((item, index) => {
            const totalDeduction =
              (item.lessIncomeTax?.incomeTaaxAmount || 0) +
              (item.lessLabourWelfareCess?.labourWelfarecessAmt || 0) +
              (item.lessTdsCgst?.tdscgstAmt || 0) +
              (item.lessTdsSgst?.tdsSgstAmt || 0) +
              (item.securityDeposit?.securityDepositAmt || 0);

            const netAmount = (
              item.grossBillAmount - Number(totalDeduction)
            ).toFixed(2);

            const billPosition =
              index === 0
                ? "1st"
                : index === 1
                ? "2nd"
                : index === 2
                ? "3rd"
                : `${index + 1}th`;

            const billTypeText =
              item.billType === "Final Bill"
                ? `${billPosition} & Final Bill`
                : `${billPosition} RA Bill`;

            return [
              (index + 1).toString(),
              workname,
              estimage,
              item.grossBillAmount?.toFixed(2) || "0.00",
              billTypeText,
              item.lessIncomeTax?.incomeTaaxAmount?.toFixed(2) || "0.00",
              item.lessLabourWelfareCess?.labourWelfarecessAmt?.toFixed(2) ||
                "0.00",
              item.lessTdsCgst?.tdscgstAmt.toFixed(2) || "0.00",
              item.lessTdsSgst?.tdsSgstAmt.toFixed(2) || "0.00",
              item.securityDeposit?.securityDepositAmt?.toFixed(2) || "0.00",
              totalDeduction.toFixed(2),
              netAmount,
              `${item.gpmsVoucherNumber} & ${
                item.eGramVoucherDate
                  ? formatDate(item.eGramVoucherDate)
                  : "N/A"
              }`,
              fundtype || "N/A",
            ];
          }),
        },
      ];

      const pdf = await generatePDF(templatePath, inputs);

      if (pdf.buffer) {
        const blob = new Blob([pdf.buffer], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `payment_certificate.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setSuccess(true);
      } else {
        throw new Error("PDF buffer is invalid.");
      }
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

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && (
        <p className="text-green-500 mt-2">PDF generated successfully!</p>
      )}
    </div>
  );
}
