"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";
import { WarishApplicationPayloadProps, WarishDetailProps } from "@/types";
import { formatDate } from "@/utils/utils";
import { generatePDF } from "@/lib/pdf-generator";
import { toast } from "../ui/use-toast";
const templatePath = "/templates/warishform.json";
const PrintWarishForm = ({
  warishform,
}: {
  warishform: WarishApplicationPayloadProps;
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const normalizeWarishDetails = (details: any[]): WarishDetailProps[] => {
    return details.map((detail) => ({
      ...detail,
      children: detail.children
        ? normalizeWarishDetails(detail.children) // Recursively normalize children
        : [], // Ensure children is an empty array if not present
    }));
  };

  const buildWarishTree = (
    details: WarishDetailProps[]
  ): WarishDetailProps[] => {
    const map = new Map<string, WarishDetailProps>();
    details.forEach((detail) =>
      map.set(detail.id, { ...detail, children: [] })
    );

    const rootDetails: WarishDetailProps[] = [];
    map.forEach((detail) => {
      if (detail.parentId) {
        const parent = map.get(detail.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(detail);
        }
      } else {
        rootDetails.push(detail);
      }
    });

    return rootDetails;
  };

  const getSerialNumber = (depth: number, index: number): string => {
    if (depth === 0) return `${index + 1}`;
    if (depth === 1) return String.fromCharCode(65 + index);
    return String.fromCharCode(97 + index);
  };

  const generateTableData = (
    details: WarishDetailProps[],
    depth: number = 0,
    parentIndex: string = ""
  ): Array<[string, string, string, string, string, string]> => {
    return details.flatMap((detail, index) => {
      const currentIndex = parentIndex
        ? `${parentIndex}.${getSerialNumber(depth, index)}`
        : getSerialNumber(depth, index);
      const name =
        detail.livingStatus === "dead" ? `Late ${detail.name}` : detail.name;
      const relation = detail.relation;
      const gender = detail.gender;
      const row: [string, string, string, string, string, string] = [
        currentIndex,
        name,
        gender,
        relation,
        detail.maritialStatus || "Unknown",
        detail.hasbandName || "",
      ];

      const rows = [row];

      if (detail.children && detail.children.length > 0) {
        rows.push(
          ...generateTableData(detail.children, depth + 1, currentIndex)
        );
      }

      return rows;
    });
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const normalizedWarishDetails = normalizeWarishDetails(
        warishform.warishDetails || []
      );

      const warishTree = buildWarishTree(normalizedWarishDetails);
      const tableData = generateTableData(warishTree);

      const inputs = [
        {
          reportingdate: formatDate(warishform.reportingDate),
          applicantname: warishform.applicantName || "N/A",
          mobilenumber: warishform.applicantMobileNumber || "N/A",
          relwithapp: warishform.relationwithdeceased || "N/A",
          field41: `ACK No : -${warishform.acknowlegment || "N/A"}`,
          nameofdeceased: warishform.nameOfDeceased || "N/A",
          dateofdeath: formatDate(warishform.dateOfDeath),
          genderofdeased: warishform.gender || "N/A",
          materialstatus: warishform.maritialStatus || "N/A",
          fathername: warishform.fatherName || "N/A",
          spousename: warishform.spouseName || "N/A",
          villagename: warishform.villageName || "N/A",
          postoffice: warishform.postOffice || "N/A",
          warishdetails: tableData, // Pass table data for the PDF
        },
      ];
      const pdf = await generatePDF(templatePath, inputs);
      const blob = new Blob([pdf.buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `warish_form_${warishform.id || "unknown"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      console.log("Inputs for PDF:", inputs);
    } catch (error) {
      console.error("Error generating PDF:", error);
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
};

export default PrintWarishForm;
