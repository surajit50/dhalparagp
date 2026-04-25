"use client";

import React, { useState } from "react";
import { generatePDF } from "../pdfgenerator";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Printer } from "lucide-react";
import { gpcode } from "@/constants/gpinfor";
import { aoctype } from "@/types/aoc";
import { formatDate } from "@/utils/utils";

const templatePath = "/templates/awardofcontact.json";

export const Aocprint = ({ workdetails }: { workdetails: aoctype }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);

    // Fetch agency details via API to support both AgencyDetails.id and Bidagency.id
    let agencydetails: { name?: string; contactDetails?: string } | null = null;
    try {
      const res = await fetch(
        `/api/agency-details?id=${encodeURIComponent(workdetails.bidagencyid)}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        agencydetails = await res.json();
      } else {
        toast({
          title: "Agency not found",
          description: "Could not resolve agency details for this bid.",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Network error",
        description: "Failed to fetch agency details.",
        variant: "destructive",
      });
      setIsGenerating(false);
      return;
    }

    try {
      // Validate required data

      // Calculate percentage difference safely

      // Format date safely
      const memoDate = workdetails.WorksDetail?.nitDetails.memoDate;
      const formattedDate = memoDate ? formatDate(memoDate) : "";
      const year = memoDate ? memoDate.getFullYear() : "";

      const biddingamount = workdetails.bidAmount;

      const estimate = workdetails.WorksDetail?.finalEstimateAmount || 0;
      //
      const percentageLess =
        estimate > 0
          ? (((estimate - biddingamount) / estimate) * 100).toFixed(2) + "%"
          : "0%";
      // Build NIT string once for reuse
      const nitString = `${workdetails.WorksDetail?.nitDetails.memoNumber}/${gpcode}/${year} Dated: ${formattedDate}`;

      const inputs = [
        {
          memo_number: `${
            workdetails.aocmenonumber
          }/${gpcode}/${workdetails.aocordeermemodate.getFullYear()}`,
          contract_date: formatDate(workdetails.aocordeermemodate),
          awardofcontile: `NIT No: ${nitString}, Work Sl. No.: ${workdetails.WorksDetail?.workslno}`,
          contractor_name: agencydetails?.name || "Unknown Contractor",
          contractor_address: agencydetails?.contactDetails || "Not Provided",
          fund_source:
            workdetails.WorksDetail?.ApprovedActionPlanDetails.schemeName,

          nit_memo_details: nitString,
          acceptance_text: `This is to inform you that your financial bid in response to the e-Tender ${nitString}, floated by Dhalpara Gram Panchayat under the Artho-O-Parikalpona Upa Samiti, for the following work, has been accepted`,
          work_details_table: [
            [
              "Name of Work:",
              workdetails.WorksDetail?.ApprovedActionPlanDetails
                .activityDescription,
            ],
            ["Estimated Amount:", `₹${estimate.toLocaleString("en-IN")}`],
            [
              "Location",
              workdetails.WorksDetail?.ApprovedActionPlanDetails
                .locationofAsset,
            ],
            ["Time of Completion:", "30 days"],
            ["Your Quoted Rate:", `${percentageLess} Less ${biddingamount}`],
          ],
        },
      ];

      // Rest of the PDF generation code remains the same
      const pdf = await generatePDF(templatePath, inputs);
      const blob = new Blob([pdf], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `generated_pdf.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error in PDF generation:", error);
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
};
