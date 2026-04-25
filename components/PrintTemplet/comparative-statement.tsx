"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  FileDown,
  Loader2,
  Printer,
  CheckCircle,
} from "lucide-react";
import { generatePDF } from "../pdfgenerator";
import { comparativeStatementProps } from "@/types";
import { gpcode } from "@/constants/gpinfor";
const TEMPLATE_PATH = "/templates/comparativestatement.json";

type PDFGeneratorProps = {
  comparativeStatement: comparativeStatementProps;
};

export default function PDFGeneratorComponent({
  comparativeStatement,
}: PDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const formatDate = useCallback((dateString?: string | Date): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
  }, []);

  const formatDateTime = useCallback((dateString?: string | Date): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
  }, []);

  const convertNumberToWords = useCallback((amount: number): string => {
    const units = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "Ten",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const convertLessThanThousand = (num: number): string => {
      if (num === 0) return "";
      let result = "";

      if (num >= 100) {
        result += units[Math.floor(num / 100)] + " Hundred ";
        num %= 100;
      }

      if (num >= 20) {
        result += tens[Math.floor(num / 10)] + " ";
        num %= 10;
      } else if (num >= 10) {
        result += teens[num - 10] + " ";
        num = 0;
      }

      if (num > 0) {
        result += units[num] + " ";
      }

      return result.trim();
    };

    let rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);

    let words = "";
    if (rupees > 0) {
      if (rupees >= 100000) {
        words +=
          convertLessThanThousand(Math.floor(rupees / 100000)) + " Lakh ";
        rupees %= 100000;
      }
      if (rupees >= 1000) {
        words +=
          convertLessThanThousand(Math.floor(rupees / 1000)) + " Thousand ";
        rupees %= 1000;
      }
      words += convertLessThanThousand(rupees);
      words += " Rupees";
    }

    if (paise > 0) {
      if (words.length > 0) words += " and ";
      words += convertLessThanThousand(paise) + " Paise";
    }

    return words + (words.length > 0 ? " Only" : "Zero Rupees");
  }, []);

  const handleGeneratePDF = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      // Sort agencies by bidding amount (lowest first)
      const sortedAgencies = [...comparativeStatement.biddingAgencies].sort(
        (a, b) => {
          const amountA = a.biddingAmount ?? Infinity;
          const amountB = b.biddingAmount ?? Infinity;
          return amountA - amountB;
        },
      );

      // Prepare PDF inputs
      const inputs = [
        {
          field4: "Comparative Statement",
          field9: `Tender Ref:- ${
            comparativeStatement.nitDetails.memoNumber
          }/${gpcode}/${new Date(
            comparativeStatement.nitDetails.memoDate,
          ).getFullYear()} Dated: ${formatDate(
            comparativeStatement.nitDetails.memoDate,
          )} Sl No. ${comparativeStatement.workslno}`,
          field5: "SCHEDULE OF WORK / ITEM(S)",
          field6: `Tender Inviting Authority: No 3 Dhalpara Gram Panchayat , Vill- Kismatdapat, PO: Trimohini, P.S- Hili Dakshin Dinajpur`,
          field7: `Name of Work: ${
            comparativeStatement.ApprovedActionPlanDetails
              .activityDescription || "N/A"
          }-${comparativeStatement.ApprovedActionPlanDetails.activityCode}`,
          field8:
            sortedAgencies.length > 0 && sortedAgencies[0].biddingAmount
              ? `Lowest Amount Quoted BY: ${
                  sortedAgencies[0].agencydetails.name
                }(${sortedAgencies[0].biddingAmount.toFixed(2)})`
              : "No bids received",
          field30:
            "Full Signature of Sanchalaks', Artha-O-Parikalpana Upa-Samiti",
          agencytable: sortedAgencies.map((agency, index) => {
            const biddingAmount = agency.biddingAmount ?? 0;
            const estimatedAmount =
              comparativeStatement.finalEstimateAmount ?? 0;

            // Percent of estimate (e.g., 92.34 means bid is 92.34% of estimate)
            const percentOfEstimate =
              estimatedAmount > 0 ? (biddingAmount / estimatedAmount) * 100 : 0;
            const quotedPercentage = percentOfEstimate.toFixed(3);

            // Difference from estimate (negative => less, positive => above)
            const diffPercent =
              estimatedAmount > 0
                ? ((biddingAmount - estimatedAmount) / estimatedAmount) * 100
                : 0;
            // Show signed percentage: '-X.XX%' for lower bids, '+X.XX%' for above estimate
            const quotedDifferenceLabel =
              diffPercent === 0
                ? "At Estimate"
                : `${diffPercent < 0 ? "-" : "+"}${Math.abs(
                    diffPercent,
                  ).toFixed(3)}%`;

            return [
              (index + 1).toString(), // SL NO.
              `${
                agency?.agencydetails?.agencyType === "FARM"
                  ? `${agency?.agencydetails?.name}${
                      agency?.agencydetails?.proprietorName
                        ? ` (${agency.agencydetails.proprietorName})`
                        : ""
                    }`
                  : agency?.agencydetails?.name
              }`,
              // Name of Agency
              estimatedAmount.toFixed(2), // Estimated Rate
              // Show difference relative to estimate (e.g., "5.23% less" or "8.50% above")
              quotedDifferenceLabel, // Quoted Difference
              biddingAmount.toFixed(2), // Rate
              `${biddingAmount.toFixed(2)} (${convertNumberToWords(
                biddingAmount,
              )})`, // Quoted Rate in Figures and Words
            ];
          }),
          field36: [
            [
              "", // Sig. of the Executive Assistant
              "", // Sig. of the Secretary
              "", // Sig. of the Nirman Sahayak
              "", // Sig. of Pradhan
            ],
          ],
        },
      ];

      // Generate and download PDF
      const pdf = await generatePDF(TEMPLATE_PATH, inputs);
      const blob = new Blob([pdf as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Comparative_Statement_${
        comparativeStatement.id || "unknown"
      }_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      setSuccess(true);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate PDF. Please try again later.",
      );
    } finally {
      setIsGenerating(false);
    }
  }, [comparativeStatement, formatDate, convertNumberToWords]);

  return (
    <div className="flex flex-col gap-3">
      {/* Status indicators */}
      {error && (
        <Alert variant="destructive" className="animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Generation Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="animate-fade-in">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>PDF Generated</AlertTitle>
          <AlertDescription>File downloaded successfully</AlertDescription>
        </Alert>
      )}

      {/* Action button */}
      <Button onClick={handleGeneratePDF} disabled={isGenerating}>
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Printer className="mr-2 h-4 w-4" />
            Generate PDF
          </>
        )}
      </Button>
    </div>
  );
}
