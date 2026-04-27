"use client";

import { useState } from "react";
import { generate } from "@pdfme/generator";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { toast } from "sonner";
import { generatePDF } from "../pdfgenerator";
import { formatDate } from "@/utils/utils";

const templatePath = "/templates/samabhathy.json";
interface MusterRollData {
  id: string;
  musterRollNo: string | null;
  createdAt: Date;
  allottedAmount: number;
  paymentStatus: string;
  application: {
    applicantName: string;
    villageName: string;
    deceasedName: string;
    aadhaarNumber: string | null;
    relation: string;
    dateOfDeath: Date;
  };
}

interface PdfmeDownloadButtonProps {
  musterRollNo: string | null;
  createdAt: Date;
  data: MusterRollData[];
}

export default function PdfmeDownloadButton({
  musterRollNo,
  createdAt,
  data,
}: PdfmeDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    try {
      // Map data to match the table schema in template.json
      const tableData = data.map((item, index) => [
        (index + 1).toString(),
        item.application.applicantName,
        item.application.deceasedName,
        item.application.aadhaarNumber || "",
        item.application.relation,
        item.application.villageName,
        // dd/mm/yyyy
        formatDate(item.application.dateOfDeath),
        `${item.allottedAmount.toFixed(2)}`,
        "", // Empty signature column
      ]);

      const inputs = [
        {
          mrno: musterRollNo ? `No: ${musterRollNo}` : "",
          dateField: `Date: ${formatDate(createdAt)}`,
          data: tableData,
        },
      ];

      const pdf = await generatePDF(templatePath, inputs);

      const blob = new Blob([pdf.buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${musterRollNo}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("PDF generated successfully");
    } catch (error) {
      console.error("Failed to generate PDF", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGeneratePdf}
      disabled={isGenerating}
      variant="outline"
      className="gap-2"
    >
      <Printer className="h-4 w-4" />
      {isGenerating ? "Generating..." : "Print"}
    </Button>
  );
}
