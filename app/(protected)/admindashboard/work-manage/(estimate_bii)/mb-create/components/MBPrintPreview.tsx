"use client";

import React, { useRef, useState, useMemo, JSX } from "react";
import { Button } from "@/components/ui/button";
import { Printer, X, FileDown } from "lucide-react";
import {
  MBPrintPreviewProps,
  PrintRow,
  MBEntry,
  Measurement,
} from "@/components/MBPrint/types";
import { CoverPage } from "@/components/MBPrint/CoverPage";
import { RulesPage } from "@/components/MBPrint/RulesPage";
import { DetailsPage } from "@/components/MBPrint/DetailsPage";
import { MeasurementPage } from "@/components/MBPrint/MeasurementPage";
import { AbstractPage } from "@/components/MBPrint/AbstractPage";
import { BlankPage } from "@/components/MBPrint/BlankPage";
import { printStyles } from "@/components/MBPrint/printStyles";
// @ts-ignore
import html2pdf from "html2pdf.js";

/** Ensure measurements is always an array (API may return JSON string or object). */
function normalizeMeasurements(entry: MBEntry): Measurement[] {
  const m = entry.measurements;
  if (Array.isArray(m)) return m;
  if (m == null) return [];
  if (typeof m === "string") {
    try {
      const parsed = JSON.parse(m);
      return Array.isArray(parsed) ? parsed : [parsed].filter(Boolean);
    } catch {
      return [];
    }
  }
  return [m].filter(Boolean);
}

export function MBPrintPreview({
  entries,
  workDetails,
  estimateItems = [],
  metadata,
  onClose,
}: MBPrintPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const toAlpha = (n: number) => String.fromCharCode(97 + n);

  /* ============================================
     BUILD PRINT ROWS
  ============================================ */
  const rows = useMemo(() => {
    const out: PrintRow[] = [];
    let mainSl = 0;
    let subSl = 0;
    let lastEstimateId: string | null = null;

    entries.forEach((entry) => {
      const measurements = normalizeMeasurements(entry);
      const entryWithMeasurements = { ...entry, measurements };
      const parent = estimateItems.find((i) => i.id === entry.estimateItemId);
      const schedulePageNo = parent?.schedulePageNo ?? "";

      if (entry.estimateItemId !== lastEstimateId) {
        mainSl++;
        subSl = 0;
        lastEstimateId = entry.estimateItemId;
        const parentDesc = parent?.description ?? "";
        const cleaned =
          schedulePageNo && parentDesc.startsWith(schedulePageNo)
            ? parentDesc.slice(schedulePageNo.length)
            : parentDesc;
        out.push({
          type: "group-header",
          slNo: mainSl,
          description: cleaned,
          schedulePageNo,
        });
      }

      const baseDesc =
        schedulePageNo && entry.workItemDescription.startsWith(schedulePageNo)
          ? entry.workItemDescription.slice(schedulePageNo.length)
          : entry.workItemDescription;
      const firstParticular = measurements[0]?.description?.trim?.();
      const headerDesc = firstParticular || baseDesc;

      const isSubItem = !!entry.subItemId;
      const slNo = isSubItem ? `${mainSl}(${toAlpha(subSl++)})` : mainSl;

      out.push({
        type: "header",
        entry: { ...entryWithMeasurements, workItemDescription: headerDesc },
        slNo,
        hasMeasurements: measurements.length > 0,
        showParentHeader: false,
        isSubItem,
      });

      measurements.forEach((measurement, idx) => {
        out.push({
          type: "measurement",
          measurement,
          idx: idx + 1,
          parentEntry: entryWithMeasurements,
        });
      });

      if (measurements.length > 0) {
        out.push({ type: "total", entry: entryWithMeasurements });
      }
    });
    return out;
  }, [entries, estimateItems]);

  /* ============================================
     PAGINATION (each page content fits in A5 portrait inside A4 landscape sheet)
  ============================================ */
  const pages = useMemo(() => {
    const MAX_HEIGHT = 520; // px – safe usable height for A5 page

    const estimateHeight = (row: PrintRow) => {
      if (row.type === "group-header") {
        const chars = row.description?.length ?? 0;
        const lines = Math.max(1, Math.ceil(chars / 50));
        return 20 + lines * 16;
      }
      if (row.type === "header") {
        const chars = row.entry.workItemDescription.length;
        const lines = Math.max(1, Math.ceil(chars / 50));
        return 20 + lines * 16;
      }
      if (row.type === "measurement") return 22;
      if (row.type === "total") return 26;
      return 22;
    };

    // Group rows into blocks that must stay together
    const blocks: PrintRow[][] = [];
    let currentBlock: PrintRow[] = [];
    rows.forEach((row) => {
      if (row.type === "group-header" || row.type === "header") {
        if (currentBlock.length > 0) {
          blocks.push(currentBlock);
          currentBlock = [];
        }
        currentBlock.push(row);
      } else {
        currentBlock.push(row);
      }
    });
    if (currentBlock.length > 0) blocks.push(currentBlock);

    const TRANSFER_ROW = 26; // height for "Brought forward" / "Carried forward"

    const newPages: PrintRow[][] = [];
    let currentPage: PrintRow[] = [];
    let pageHeight = 0;

    blocks.forEach((block) => {
      const blockH = block.reduce((sum, row) => sum + estimateHeight(row), 0);
      const overhead = currentPage.length > 0 ? TRANSFER_ROW : 0;
      if (
        pageHeight + blockH + overhead > MAX_HEIGHT &&
        currentPage.length > 0
      ) {
        newPages.push(currentPage);
        currentPage = [];
        pageHeight = TRANSFER_ROW; // start with brought forward row
      }
      currentPage.push(...block);
      pageHeight += blockH;
    });
    if (currentPage.length) newPages.push(currentPage);

    return newPages;
  }, [rows]);

  const safeWorkDetails = workDetails ?? {};
  const safeMetadata = {
    mbNumber: metadata?.mbNumber ?? "",
    mbPageNumber: metadata?.mbPageNumber ?? "",
    measuredDate: metadata?.measuredDate ?? "",
    measuredBy: metadata?.measuredBy ?? "",
  };

  /* ============================================
     BUILD MEASUREMENT PAGES (actual content)
  ============================================ */
  let runningQty = 0;
  let runningAmount = 0;

  const measurementPages = pages.map((pageRows, index) => {
    const pageQty = pageRows
      .filter((r) => r.type === "total")
      .reduce(
        (sum, r) =>
          sum +
          (r.type === "total" ? Number(r.entry.quantityExecuted) || 0 : 0),
        0,
      );

    const pageAmount = pageRows
      .filter((r) => r.type === "total")
      .reduce(
        (sum, r) =>
          sum + (r.type === "total" ? Number(r.entry.amount) || 0 : 0),
        0,
      );

    const broughtQty = runningQty;
    const broughtAmt = runningAmount;

    runningQty += pageQty;
    runningAmount += pageAmount;

    return (
      <MeasurementPage
        key={index}
        rows={pageRows}
        pageIndex={index}
        mbNumber={safeMetadata.mbNumber}
        metadata={{
          ...safeMetadata,
          totalMeasurementPages: pages.length,
        }}
        broughtForwardQuantity={broughtQty}
        broughtForwardAmount={broughtAmt}
        carryForwardQuantity={runningQty}
        carryForwardAmount={runningAmount}
      />
    );
  });

  /* ============================================
     ALL PAGES IN READING ORDER
  ============================================ */
  const estimatedCost =
    workDetails?.ApprovedActionPlanDetails?.estimatedCost ??
    workDetails?.finalEstimateAmount ??
    0;
  const tenderedAmount =
    workDetails?.AwardofContract?.workorderdetails?.[0]?.Bidagency
      ?.biddingAmount ?? 0;

  const allPages: JSX.Element[] = [
    <CoverPage key="cover" metadata={safeMetadata} />,
    <RulesPage key="rules" />,
    <DetailsPage
      key="details"
      workDetails={safeWorkDetails}
      metadata={safeMetadata}
    />,
    ...measurementPages,
    <AbstractPage
      key="abstract"
      pageNo={measurementPages.length + 4}
      entries={entries}
      metadata={safeMetadata}
      estimatedCost={estimatedCost}
      tenderedAmount={tenderedAmount}
    />,
  ];

  // Pad to a multiple of 4 pages for true saddle-stitch booklet printing
  while (allPages.length % 4 !== 0) {
    allPages.push(
      <BlankPage
        key={`blank-${allPages.length + 1}`}
        pageNo={allPages.length + 1}
      />,
    );
  }

  /* ============================================
     BOOKLET IMPOSITION – correct saddle‑stitch pairing
     For Duplex (Double-Sided) Printing:
     Sheet 1 Front: [Last Page, Page 1]
     Sheet 1 Back:  [Page 2, Second-Last Page]
     Sheet 2 Front: [Third-Last Page, Page 3]
     Sheet 2 Back:  [Page 4, Fourth-Last Page]
     ...
  ============================================ */
  const sheets: JSX.Element[][] = [];
  const total = allPages.length;
  for (let i = 0; i < total / 2; i++) {
    let leftPage, rightPage;

    if (i % 2 === 0) {
      // Front side of the physical sheet (even index)
      leftPage = allPages[total - 1 - i];
      rightPage = allPages[i];
    } else {
      // Back side of the physical sheet (odd index)
      // We swap left and right so that Page 2 prints on the back of Page 1
      leftPage = allPages[i];
      rightPage = allPages[total - 1 - i];
    }

    sheets.push([leftPage, rightPage]);
  }

  /* ============================================
     PRINT FUNCTION
  ============================================ */
  const handlePrint = () => {
    if (!printRef.current) return;
    const win = window.open("", "_blank");
    if (!win) return;
    const content = printRef.current.innerHTML;
    const doc = win.document;
    doc.open();
    doc.write(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Measurement Book - ${metadata.mbNumber || "Print"}</title>
  <style>${printStyles}</style>
</head>
<body>
  <div class="print-root">${content}</div>
</body>
</html>
    `);
    doc.close();
    const doPrint = () => {
      win.focus();
      win.print();
      win.onafterprint = () => win.close();
    };
    if (doc.readyState === "complete") {
      setTimeout(doPrint, 100);
    } else {
      win.onload = () => setTimeout(doPrint, 100);
    }
  };

  /* ============================================
     PDF FUNCTION
  ============================================ */
  const handlePDF = async () => {
    if (!printRef.current) return;
    setIsGenerating(true);
    try {
      const filename = `mb-${metadata?.mbNumber || "measurement-book"}.pdf`;
      await html2pdf().from(printRef.current).save(filename);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  /* ============================================
     UI
  ============================================ */
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4 md:p-8">
      <div className="bg-white/95 backdrop-blur-xl w-full h-full max-w-[1400px] rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border border-white/20">
        {/* TOOLBAR */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-white/60 sticky top-0 z-10 flex justify-between items-center shadow-sm backdrop-blur-md">
          <div className="flex items-baseline space-x-4">
            <h2 className="text-xl font-semibold text-slate-800 tracking-tight flex items-center">
              <Printer className="w-5 h-5 mr-3 text-blue-600" />
              Measurement Book Preview
            </h2>
            <span className="hidden sm:inline-flex bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-100">
              {allPages.length} Pages · {sheets.length} Sheets (A4, 2‑up)
            </span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePDF}
              disabled={isGenerating}
              className="shadow-sm hover:bg-slate-50 transition-colors border-slate-300 text-slate-700"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Save PDF
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all hover:shadow-lg"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Book
            </Button>
            <div className="w-px h-6 bg-slate-200 mx-1 self-center" />
            <Button
              variant="ghost"
              onClick={onClose}
              className="rounded-full w-10 h-10 p-0 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* PRINT CONTAINER */}
        <div className="flex-1 overflow-auto bg-slate-100/80 p-6 md:p-10 flex flex-col items-center gap-8 print-preview-scroll">
          <div
            ref={printRef}
            className="print-content-wrapper space-y-8 flex flex-col items-center"
          >
            {sheets.map((sheet, index) => (
              <div
                key={index}
                className="sheet bg-white rounded-sm transition-all duration-300 hover:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.2)]"
                style={{
                  boxShadow:
                    "0 8px 30px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
                  border: "1px solid #e2e8f0",
                }}
              >
                {sheet[0]}
                {sheet[1]}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
