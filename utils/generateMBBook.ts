import { generate } from "@pdfme/generator";
import { text, table } from "@pdfme/schemas";
import { paginateMB } from "./paginateMB";
import { estimateToMB } from "./estimateToMB";
import { applyPageNumbers } from "./pageCounter";
import { toBooklet } from "./bookletPDF";
import { abstract, completion, cover, measure } from "@/templates";

export interface MBBookData {
  workName: string;
  workId: string;
  location: string;
  fund: string;
  agency: string;
  abstractItems: Array<{
    description: string;
    quantity: number;
    unit: string;
    rate?: number;
    amount: number;
  }>;
  measurements: Array<{
    description: string;
    nos?: number;
    length: number;
    breadth: number;
    depth: number;
    quantity?: number;
    unit?: string;
    rate?: number;
    amount?: number;
  }>;
  completionDate: string;
  officer: string;
  /** If true, skip booklet conversion and return standard portrait PDF */
  skipBooklet?: boolean;
}

export async function generateMBBook(data: MBBookData) {
  const templates: any[] = [];
  const inputs: any[] = [];

  /* ---------------- COVER ---------------- */
  templates.push(cover);
  inputs.push({
    header_title: data.agency || "Gram Panchayat",
    header_address: data.location || "",
    title: "MEASUREMENT BOOK",
    registerNo: `MB Register No : ${data.workId || ""} / 2025–26`,
    office: data.agency || "",
    year: "Financial Year : 2025–2026",
  });

  /* ---------------- ABSTRACT ---------------- */
  const abstractPages = paginateMB(data.abstractItems, 10);
  // Only add abstract pages if we have data
  if (abstractPages.length > 0) {
    abstractPages.forEach((items, pageIdx) => {
      templates.push(abstract);
      const tableData = items.map((it: any, idx: number) => {
        const rate = it.rate ?? (it.amount && it.quantity ? it.amount / it.quantity : 0);
        return [
          String(pageIdx * 10 + idx + 1), // Continuous numbering across pages
          it.description || "",
          it.unit || "",
          String(Number(it.quantity || 0).toFixed(2)),
          String(Number(rate).toFixed(2)),
          String(Number(it.amount || 0).toFixed(2)),
        ];
      });
      inputs.push({
        abstractTable: JSON.stringify(tableData),
      });
    });
  }

  /* ---------------- MEASUREMENT BOOK ---------------- */
  const mbRows = estimateToMB(data.measurements);
  const mbPages = paginateMB(mbRows, 12);

  // Only add measurement pages if we have data
  if (mbPages.length > 0) {
    mbPages.forEach((rows, pageIdx) => {
      templates.push(measure);
      const tableData = rows.map((row: any) => [
        String(row.slNo),
        row.description || "",
        String(row.nos ?? 1),
        String(Number(row.length || 0).toFixed(2)),
        String(Number(row.breadth || 0).toFixed(2)),
        String(Number(row.depth || 0).toFixed(2)),
        String(Number(row.quantity || 0).toFixed(3)),
        row.unit || "cum",
        String(Number(row.rate ?? 0).toFixed(2)),
        String(Number(row.amount ?? 0).toFixed(2)),
      ]);
      inputs.push({
        broughtForward: pageIdx > 0 ? "Brought Forward..." : "",
        carryForward: pageIdx < mbPages.length - 1 ? "Carry Forward..." : "",
        mbTable: JSON.stringify(tableData),
      });
    });
  }

  /* ---------------- COMPLETION ---------------- */
  templates.push(completion);
  inputs.push({
    certText: "Certified that the above measurements have been recorded on the spot and the work has been completed as per specification.",
    measuredBy: "Measured By : ____________________",
    verifiedBy: "Verified By : ____________________",
    date: `Date : ${data.completionDate || "_____________"}`,
  });

  /* ---------------- GENERATE ONCE ---------------- */
  const combinedTemplate = {
    schemas: templates.flatMap((t) => t.schemas),
    basePdf: templates[0].basePdf,
  };
  const pdf = await generate({
    template: combinedTemplate,
    inputs,
    plugins: { text, table },
  });

  const withPageNumbers = await applyPageNumbers(pdf);

  // Skip booklet conversion by default - booklet is only for saddle-stitch printing
  // Users can enable booklet format when explicitly needed
  if (data.skipBooklet === false) {
    return await toBooklet(withPageNumbers);
  }
  return withPageNumbers;
}
