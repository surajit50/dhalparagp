"use client";

import { useState } from "react";
import { generate } from "@pdfme/generator";
import templateJson from "@/lib/pdfme/template.json";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { toast } from "sonner";

interface MusterRollData {
  id: string;
  allottedAmount: number;
  paymentStatus: string;
  application: {
    applicantName: string;
    villageName: string;
    deceasedName: string;
  };
}

interface PdfmeDownloadButtonProps {
  musterRollNo: string;
  data: MusterRollData[];
}

export default function PdfmeDownloadButton({ musterRollNo, data }: PdfmeDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    try {
      // Map data to match the table schema in template.json
      const tableData = data.map((item, index) => [
        (index + 1).toString(),
        item.application.applicantName,
        item.application.deceasedName,
        item.application.villageName,
        `Rs. ${item.allottedAmount}`,
        "" // Empty signature column
      ]);

      const inputs = [{
        musterRollNo: `No: ${musterRollNo}`,
        date: `Date: ${new Date().toLocaleDateString("en-IN")}`,
        table: tableData,
      }];

      const pdf = await generate({ template: templateJson as any, inputs });
      
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
