"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileDown, Loader2, Printer, CheckCircle } from "lucide-react";
import { generatePDF } from "../pdfgenerator";
import { workdetailsforprint } from "@/types";
import { gpcode } from "@/constants/gpinfor";
const TEMPLATE_PATH = "/templates/scrutnisheettemplete.json";

type PDFGeneratorProps = {
  workdetails: workdetailsforprint;
};

export default function PDFGeneratorComponent({
  workdetails,
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

  const handleGeneratePDF = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      // Prepare PDF inputs
      const inputs = [
        {
          field2: `Scrutiny Report of Tender Papers for NIT No. ${
            workdetails.nitDetails.memoNumber
          }/${gpcode}/${new Date(workdetails.nitDetails.memoDate).getFullYear()} Dated: ${formatDate(
            workdetails.nitDetails.memoDate
          )} Sl No. ${workdetails.workslno}`,
          field4: workdetails.ApprovedActionPlanDetails.activityDescription || "N/A",
          field32: formatDateTime(workdetails.nitDetails.endTime),
          field33: formatDateTime(workdetails.nitDetails.technicalBidOpeningDate),
          field35: workdetails.ApprovedActionPlanDetails.schemeName || "N/A",
          field20: workdetails.finalEstimateAmount.toString(),
          emd: workdetails.earnestMoneyFee.toFixed(2),
          pcharge: workdetails.participationFee.toFixed(2),
          field31: workdetails.finalEstimateAmount.toFixed(2),
          agencytable: workdetails.biddingAgencies.map((agency, index) => [
            (index + 1).toString(),
            agency.agencydetails.agencyType === "FARM"
              ? `${agency.agencydetails.name}${
                  agency.agencydetails.proprietorName
                    ? ` (${agency.agencydetails.proprietorName})`
                    : ""
                }`
              : agency.agencydetails.name,
            workdetails.participationFee.toFixed(2),
           
            //agency is coparative then emd 0
          agency.agencydetails.cooperative
            ? "0.00"
            : workdetails.earnestMoneyFee.toFixed(2),
            agency.technicalEvelution?.credencial?.sixtyperamtput ? "Yes" : "No",
            agency.technicalEvelution?.credencial?.workorder ? "Yes" : "No",
            agency.technicalEvelution?.credencial?.paymentcertificate ? "Yes" : "No",
            agency.technicalEvelution?.credencial?.comcertificat ? "Yes" : "No",
            agency.technicalEvelution?.validityofdocument?.itreturn ? "Yes" : "No",
            agency.technicalEvelution?.validityofdocument?.gst ? "Yes" : "No",
            agency.technicalEvelution?.validityofdocument?.tradelicence ? "Yes" : "No",
            agency.technicalEvelution?.validityofdocument?.ptax ? "Yes" : "No",
            agency.technicalEvelution?.byelow ? "Yes" : "No",
            agency.technicalEvelution?.qualify ? "Yes" : "No",
            agency.technicalEvelution?.remarks || "-",
          ]),
          field29: (() => {
            const qualifiedBidders = workdetails.biddingAgencies.filter(
              (agency) => agency.technicalEvelution?.qualify
            ).length;
            const totalBidders = workdetails.biddingAgencies.length;
            const plural = totalBidders !== 1 ? "s" : "";
            const qualifiedPlural = qualifiedBidders !== 1 ? "s" : "";

            if (qualifiedBidders === 0) {
              return `${totalBidders} bidder${plural} participated but none satisfied the technical bid requirements.`;
            }

            return qualifiedBidders >= 3
              ? `${totalBidders} bidder${plural} participated, ${qualifiedBidders} satisfied technical requirements. Financial bids may be opened.`
              : `${totalBidders} bidder${plural} participated, ${qualifiedBidders} satisfied technical requirements. Financial bids cannot be opened (less than 3 qualified).`;
          })(),
        },
      ];

      // Generate and download PDF
      const pdf = await generatePDF(TEMPLATE_PATH, inputs);
      const blob = new Blob([pdf.buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `Tender_Scrutiny_${workdetails.id || "unknown"}_${new Date().toISOString().slice(0, 10)}.pdf`;
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
          : "Failed to generate PDF. Please try again later."
      );
    } finally {
      setIsGenerating(false);
    }
  }, [workdetails, formatDate, formatDateTime]);

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
      <Button
        onClick={handleGeneratePDF}
        disabled={isGenerating}
      >
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
