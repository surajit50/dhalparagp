"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Printer } from "lucide-react";
import { generatePDF } from "../pdfgenerator";
import { Agreement } from "@/types/agreement";
import { formatDate } from "@/utils/utils";

const templatePath = "/templates/agreementcertificate.json";

export const AgrementCertificate = ({ agrement }: { agrement: Agreement }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setError(null);
    setSuccess(false);
    const agrementref = `Agreement No.-${
      agrement.aggrementno
    }, Dated-${formatDate(agrement.aggrementdate)}`;
    const details = `This Contract made on ${formatDate(
      agrement.aggrementdate
    )}, between the Pradhan,No 4 Harsura Gram Panchayat  , Vill-Suhari, PO-Rampur, PS-Tapan, Dist.-D/Dinajpur. of West Bengal,  hereinafter “The First Party” of the one part and  ${
      agrement.acceptagency.agencydetails.name
    }, ${
      agrement.acceptagency.agencydetails.contactDetails
    } hereinafter “The Second Party” or the “Contractor” of the other part:`;
    try {
      const inputs = [
        {
          agrerdf: agrementref,
          details: details,
          field7: `${agrement.workdetails.activityDescription} should be executed by ‘The Second Party’, as they have accepted a Tender submitted by ‘The Second Party’ for the execution and completion of this Work and the remedying of any defects therein.`,
        },
      ];

      const pdf = await generatePDF(templatePath, inputs);
      const blob = new Blob([pdf.buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `generated_pdf_${agrement.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSuccess(true);
      toast({
        title: "Success",
        description: "Certificate PDF generated successfully",
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
