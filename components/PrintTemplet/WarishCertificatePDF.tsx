"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { generatePDF } from "../pdfgenerator";
import type { WarishApplicationProps, WarishDetailProps } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Printer, Loader2, FileSignature } from "lucide-react";
import { formatDate } from "@/utils/utils";
import { domain_url } from "@/constants";

const templatePath = "/templates/warishcertificate.json";

/* ===================================================== */
/* SERIAL NUMBER SYSTEM                                  */
/* ===================================================== */

const getSerialNumber = (depth: number, index: number): string => {
  if (depth === 0) return `${index + 1}`; // 1,2,3
  if (depth === 1) return String.fromCharCode(65 + index); // A,B,C
  if (depth === 2) return String.fromCharCode(97 + index); // a,b,c
  return `${index + 1}`; // fallback
};
// Function to convert image to base64
const getBase64FromUrl = async (url: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error loading image:", error);
    return null;
  }
};
/* ===================================================== */
/* BUILD TREE FROM FLAT DB LIST                          */
/* ===================================================== */

const buildWarishTree = (details: WarishDetailProps[]): WarishDetailProps[] => {
  const map = new Map<string, WarishDetailProps>();

  details.forEach((detail) => {
    map.set(detail.id, { ...detail, children: [] });
  });

  const roots: WarishDetailProps[] = [];

  map.forEach((detail) => {
    if (detail.parentId) {
      const parent = map.get(detail.parentId);
      if (parent) parent.children.push(detail);
    } else {
      roots.push(detail);
    }
  });

  return roots;
};

/* ===================================================== */
/* GENERATE TABLE DATA                                   */
/* ===================================================== */

const generateTableData = (
  details: WarishDetailProps[],
  depth = 0,
  parentIndex = "",
): Array<[string, string, string, string, string]> => {
  let rows: Array<[string, string, string, string, string]> = [];

  details.forEach((detail, index) => {
    const serial = parentIndex
      ? `${parentIndex}.${getSerialNumber(depth, index)}`
      : getSerialNumber(depth, index);

    const displayName =
      detail.livingStatus === "dead" ? `Late ${detail.name}` : detail.name;

    rows.push([
      serial,
      displayName,
      detail.relation,
      detail.maritialStatus,
      detail.hasbandName ?? "",
    ]);

    if (detail.children?.length) {
      rows.push(...generateTableData(detail.children, depth + 1, serial));
    }
  });

  return rows;
};

/* ===================================================== */
/* COMPONENT                                              */
/* ===================================================== */

type Props = {
  applicationDetails: WarishApplicationProps;
  mode?: "downloadOnly" | "uploadAndDownload";
};

export default function WarishCertificatePDF({
  applicationDetails,
  mode = "downloadOnly",
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  /* ================= BUILD PDF ================= */

  const buildPDF = async (digitallySignedText = "") => {
    const nestedWarish = buildWarishTree(
      applicationDetails.warishDetails || [],
    );

    const tableData = generateTableData(nestedWarish);

    const body1 = `Certified that late ${applicationDetails.nameOfDeceased}, ${
      applicationDetails.gender === "male"
        ? "son of"
        : applicationDetails.gender === "female" &&
            applicationDetails.maritialStatus === "unmarried"
          ? "daughter of"
          : "wife of"
    } ${
      applicationDetails.gender === "female" &&
      applicationDetails.maritialStatus === "married"
        ? applicationDetails.spouseName
        : applicationDetails.fatherName
    } residing at ${applicationDetails.villageName} Village, ${
      applicationDetails.postOffice
    } Post Office, Hili Police Station of Dakshin Dinajpur District, West Bengal State, expired on ${
      applicationDetails.dateOfDeath
        ? formatDate(applicationDetails.dateOfDeath)
        : ""
    }, leaving behind the following persons as his/her legal heirs`;
    // Load and convert logo to base64
    const logoBase64 = await getBase64FromUrl("/images/logo.png");
    const inputs = [
      {
        ref: applicationDetails.warishRefNo,
        refdate: applicationDetails.warishRefDate
          ? formatDate(applicationDetails.warishRefDate)
          : "",
        logo: logoBase64,
        table: tableData,
        body1,
        field20: `${domain_url}/services/e-governance/verification?id=${applicationDetails.id}`,
        digitally_signed: digitallySignedText,
      },
    ];

    const pdf = await generatePDF(templatePath, inputs);
    return new Blob([pdf], { type: "application/pdf" });
  };

  /* ================= HANDLE GENERATE ================= */

  const handleGeneratePDF = async (withSignature: boolean) => {
    setIsGenerating(true);

    try {
      const blob = await buildPDF(
        withSignature
          ? `Digitally Signed by Prodhan\nDate: ${formatDate(new Date())}`
          : "",
      );

      // Always download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${withSignature ? "signed_" : ""}warish_certificate_${applicationDetails.id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      // Upload if needed
      if (mode === "uploadAndDownload") {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        await fetch("/api/warish/certificate/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: `${withSignature ? "signed_" : ""}warish_certificate_${applicationDetails.id}.pdf`,
            fileType: "application/pdf",
            base64: `data:application/pdf;base64,${base64}`,
            warishId: applicationDetails.id,
            digitallySigned: withSignature,
          }),
        });
      }

      toast({
        title: "Success",
        description: "Warish Certificate generated successfully",
      });

      router.refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              disabled={isGenerating}
              onClick={() => handleGeneratePDF(false)}
            >
              {isGenerating ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <Printer className="h-5 w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Generate PDF</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="icon"
              disabled={isGenerating}
              onClick={() => handleGeneratePDF(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isGenerating ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <FileSignature className="h-5 w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Generate Signed PDF</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
