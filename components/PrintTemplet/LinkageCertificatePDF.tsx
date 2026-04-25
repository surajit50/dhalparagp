"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { generatePDF } from "../pdfgenerator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Printer, Loader2, FileSignature } from "lucide-react";
import { formatDate } from "@/utils/utils";
import { domain_url } from "@/constants";

const templatePath = "/templates/linkagecertificate.json";

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

const buildLinkageTree = (details: any[]): any[] => {
  if (!details) return [];
  const map = new Map<string, any>();

  details.forEach((detail) => {
    map.set(detail.id, { ...detail, children: [] });
  });

  const roots: any[] = [];

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

const formatDisplayName = (
  name: string | undefined,
  livingStatus?: string | null,
): string => {
  const cleanName = (name || "").trim();
  if (!cleanName) return "";
  if (livingStatus === "dead" && !/^Late\s+/i.test(cleanName)) {
    return `Late ${cleanName}`;
  }
  return cleanName;
};

type TreeNode = {
  id: string;
  name?: string;
  relation?: string;
  gender?: string | null;
  livingStatus?: string | null;
  age?: number | null;
  children?: TreeNode[];
};

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const buildFamilyTreeSvgDataUrl = (roots: TreeNode[]): string => {
  if (!roots.length) return "";

  const NODE_W = 168;
  const NODE_H = 54;
  const H_GAP = 22;
  const V_GAP = 38;
  const PAD = 20;

  const countLeaves = (node: TreeNode): number => {
    if (!node.children?.length) return 1;
    return node.children.reduce((sum, child) => sum + countLeaves(child), 0);
  };

  const calcMaxDepth = (node: TreeNode, depth = 0): number => {
    if (!node.children?.length) return depth;
    return Math.max(...node.children.map((child) => calcMaxDepth(child, depth + 1)));
  };

  const totalLeaves = roots.reduce((sum, root) => sum + countLeaves(root), 0);
  const maxDepth = Math.max(...roots.map((root) => calcMaxDepth(root)));

  const width = PAD * 2 + totalLeaves * NODE_W + Math.max(totalLeaves - 1, 0) * H_GAP;
  const height = PAD * 2 + (maxDepth + 1) * NODE_H + maxDepth * V_GAP;

  let leafIndex = 0;
  const positions = new Map<string, { x: number; y: number; node: TreeNode }>();

  const assign = (node: TreeNode, depth: number): number => {
    const y = PAD + depth * (NODE_H + V_GAP);
    if (!node.children?.length) {
      const x = PAD + leafIndex * (NODE_W + H_GAP);
      leafIndex += 1;
      positions.set(node.id, { x, y, node });
      return x + NODE_W / 2;
    }

    const childCenters = node.children.map((child) => assign(child, depth + 1));
    const center = childCenters.reduce((a, b) => a + b, 0) / childCenters.length;
    const x = center - NODE_W / 2;
    positions.set(node.id, { x, y, node });
    return center;
  };

  roots.forEach((root) => assign(root, 0));

  let connectors = "";
  let nodes = "";

  positions.forEach(({ x, y, node }) => {
    const children = node.children || [];
    if (children.length) {
      const childCenters = children
        .map((child) => positions.get(child.id))
        .filter(Boolean) as Array<{ x: number; y: number; node: TreeNode }>;
      const parentCenterX = x + NODE_W / 2;
      const parentBottomY = y + NODE_H;
      const railY = parentBottomY + 16;
      connectors += `<line x1="${parentCenterX}" y1="${parentBottomY}" x2="${parentCenterX}" y2="${railY}" stroke="#94a3b8" stroke-width="1"/>`;
      const minChildX = Math.min(...childCenters.map((c) => c.x + NODE_W / 2));
      const maxChildX = Math.max(...childCenters.map((c) => c.x + NODE_W / 2));
      connectors += `<line x1="${minChildX}" y1="${railY}" x2="${maxChildX}" y2="${railY}" stroke="#94a3b8" stroke-width="1"/>`;
      childCenters.forEach((child) => {
        const cx = child.x + NODE_W / 2;
        connectors += `<line x1="${cx}" y1="${railY}" x2="${cx}" y2="${child.y}" stroke="#94a3b8" stroke-width="1"/>`;
      });
    }
  });

  positions.forEach(({ x, y, node }) => {
    const displayName = formatDisplayName(node.name, node.livingStatus) || "Unnamed";
    const line2 = `Relation: ${node.relation || "Member"}`;
    const line3 = `Gender: ${node.gender || "N/A"} | Age: ${
      node.age === null || node.age === undefined ? "N/A" : String(node.age)
    }`;
    const initial = escapeXml(displayName.charAt(0).toUpperCase());

    nodes += `
      <g>
        <rect x="${x}" y="${y}" width="${NODE_W}" height="${NODE_H}" rx="2" ry="2" fill="#ffffff" stroke="#64748b" stroke-width="1"/>
        <circle cx="${x + 16}" cy="${y + 16}" r="10" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
        <text x="${x + 16}" y="${y + 20}" text-anchor="middle" font-size="10" font-family="Helvetica, Arial, sans-serif" fill="#334155">${initial}</text>
        <text x="${x + 30}" y="${y + 14}" font-size="9" font-family="Helvetica, Arial, sans-serif" font-weight="600" fill="#0f172a">${escapeXml(
          displayName.length > 28 ? `${displayName.slice(0, 28)}...` : displayName,
        )}</text>
        <text x="${x + 30}" y="${y + 27}" font-size="8" font-family="Helvetica, Arial, sans-serif" fill="#334155">${escapeXml(
          line2.length > 35 ? `${line2.slice(0, 35)}...` : line2,
        )}</text>
        <text x="${x + 30}" y="${y + 40}" font-size="8" font-family="Helvetica, Arial, sans-serif" fill="#334155">${escapeXml(
          line3.length > 35 ? `${line3.slice(0, 35)}...` : line3,
        )}</text>
      </g>
    `;
  });

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff"/>
      ${connectors}
      ${nodes}
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/* ===================================================== */
/* GENERATE TABLE DATA                                   */
/* ===================================================== */

const generateTableData = (
  details: any[],
  depth = 0,
  parentIndex = "",
  parentDisplayName = "",
): Array<[string, string, string]> => {
  let rows: Array<[string, string, string]> = [];

  details.forEach((detail, index) => {
    const serial = parentIndex
      ? `${parentIndex}.${getSerialNumber(depth, index)}`
      : getSerialNumber(depth, index);

    rows.push([
      serial,
      formatDisplayName(detail.name, detail.livingStatus),
      parentDisplayName.trim(),
    ]);

    if (detail.children?.length) {
      rows.push(
        ...generateTableData(
          detail.children,
          depth + 1,
          serial,
          formatDisplayName(detail.name, detail.livingStatus),
        ),
      );
    }
  });

  return rows;
};

/* ===================================================== */
/* COMPONENT                                              */
/* ===================================================== */

type Props = {
  applicationDetails: any; // Using any for Linkage application to avoid complex imports, adjust if needed
  mode?: "downloadOnly" | "uploadAndDownload";
};

export default function LinkageCertificatePDF({
  applicationDetails,
  mode = "downloadOnly",
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  /* ================= BUILD PDF ================= */

  const buildPDF = async (digitallySignedText = "") => {
    // Keep PDF tree source aligned with print page source.
    const beneficiaries = applicationDetails.linkageApplicationBeneficiaries || [];
    const nestedLinkage = buildLinkageTree(beneficiaries);

    const tableData = generateTableData(nestedLinkage);
    const familyTreeImage = buildFamilyTreeSvgDataUrl(nestedLinkage);

    const applicantAddress = [
      applicationDetails.applicantVillage,
      applicationDetails.applicantPostOffice
        ? `${applicationDetails.applicantPostOffice} Post Office`
        : "",
      applicationDetails.applicantBlock ? `${applicationDetails.applicantBlock} Block` : "",
      applicationDetails.applicantDistrict ? `${applicationDetails.applicantDistrict} District` : "",
      "West Bengal",
    ]
      .filter(Boolean)
      .join(", ");

    // Provide a concise, print-friendly body paragraph
    const body1 =
      applicationDetails.certificate?.certificateBody ||
      `This is to certify that ${
        applicationDetails.applicantName || "the applicant"
      }${
        applicationDetails.applicantPhone ? ` (Contact: ${applicationDetails.applicantPhone})` : ""
      }, resident of ${applicantAddress || "the concerned area"}, has submitted an application before this office for issuance of a Family Linkage Certificate in relation to ${
        applicationDetails.linkedEntityName || "the concerned entity"
      }. The beneficiary particulars verified from records are listed below for official reference.`;

    // Load and convert logo to base64
    const logoBase64 = await getBase64FromUrl("/images/logo.png");
    
    // Attempt to use certificate memoNo / reference if it exists, else fallback to application config
    const refNo = applicationDetails.certificate?.certificateNo || applicationDetails.applicationNo || "";
    const refDate = applicationDetails.certificate?.issueDate 
      ? formatDate(applicationDetails.certificate.issueDate)
      : applicationDetails.createdAt ? formatDate(applicationDetails.createdAt) : "";

    const inputs = [
      {
        ref: refNo,
        refdate: refDate,
        logo: logoBase64,
        table: tableData,
        family_tree_image: familyTreeImage,
        body1,
        cert_title: `${applicationDetails.certificate?.certificateType || "Family Linkage"} Certificate`,
        note_text:
          "Note: This certificate remains valid subject to verification with the official portal records and the office register of the Gram Panchayat.",
        field20: `${domain_url}/services/e-governance/verification/linkage?id=${applicationDetails.id}`,
        digitally_signed: digitallySignedText,
      },
    ];

    const pdf = await generatePDF(templatePath, inputs);
    return new Blob([pdf as any], { type: "application/pdf" });
  };

  /* ================= HANDLE GENERATE ================= */

  const handleGeneratePDF = async (withSignature: boolean) => {
    setIsGenerating(true);

    try {
      const blob = await buildPDF(
        withSignature
          ? `Digitally Signed By The Pradhan\nOffice: Gram Panchayat\nDate: ${formatDate(new Date())}`
          : "",
      );

      // Always download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${withSignature ? "signed_" : ""}linkage_certificate_${applicationDetails.id}.pdf`;
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

        await fetch("/api/linkage/certificate/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: `${withSignature ? "signed_" : ""}linkage_certificate_${applicationDetails.id}.pdf`,
            fileType: "application/pdf",
            base64: `data:application/pdf;base64,${base64}`,
            applicationId: applicationDetails.id,
            digitallySigned: withSignature,
          }),
        });
      }

      toast({
        title: "Success",
        description: "Linkage Certificate generated successfully",
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
