"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, Eye, Loader2, MapPin, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getIssuedNOCs } from "@/action/land-conversion-actions";
import LandConversionLayout from "../components/LandConversionLayout";

// ─── Configuration ──────────────────────────────────────────────────────────
const PANCHAYAT_HEADING = "Office of the Pradhan";
const PANCHAYAT_ADDRESS = "No 3 Dhalpara Gram Panchayat, Trimohini, Hili, Dakshin Dinajpur";
const DEFAULT_SIGNATORY_NAME = "Sri. / Smt. ______________"; // fallback if certificate has no signatory
const DEFAULT_SIGNATORY_DESIGNATION = "Pradhan";

// ─── Types ──────────────────────────────────────────────────────────────────
interface LandParcel {
  khatianNo: string;
  plotNo: string;
  mouza: string;
  jlNo: string;
  area: string;
  presentLandUse: string;
  proposedLandUse: string;
}

interface IssuedNOC {
  id: string;
  nocNo: string;
  applicationNo: string;
  applicantName: string;
  applicantAddress: string;
  landParcels: LandParcel[];
  issueDate: string;
  expiryDate: string;
  signatoryName: string;
  signatoryDesignation: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function landSummary(parcels: LandParcel[]): string {
  if (!parcels.length) return "N/A";
  const first = parcels[0];
  const parts = [];
  if (first.mouza) parts.push(`Mouza: ${first.mouza}`);
  if (first.plotNo) parts.push(`Plot: ${first.plotNo}`);
  if (first.area) parts.push(`Area: ${first.area}`);
  return parts.join(" | ") + (parcels.length > 1 ? ` +${parcels.length - 1} more` : "");
}

// ─── jsPDF NOC generator ────────────────────────────────────────────────────
async function generateNocPdf(noc: IssuedNOC): Promise<import("jspdf").jsPDF> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 15;
  const innerW = pw - margin * 2;

  // ── Outer double border ──
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(1.2);
  doc.rect(margin, margin, innerW, ph - margin * 2);
  doc.setLineWidth(0.4);
  doc.rect(margin + 2.5, margin + 2.5, innerW - 5, ph - margin * 2 - 5);

  // ── Header band (only panchayat details) ──
  doc.setFillColor(30, 58, 138);
  doc.rect(margin + 2.5, margin + 2.5, innerW - 5, 20, "F");   // height adjusted for two lines
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(PANCHAYAT_HEADING, pw / 2, margin + 10, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(PANCHAYAT_ADDRESS, pw / 2, margin + 16, { align: "center" });

  // NOC title
  doc.setTextColor(30, 58, 138);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("NO OBJECTION CERTIFICATE (NOC)", pw / 2, margin + 32, { align: "center" });
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.5);
  doc.line(margin + 30, margin + 34, pw - margin - 30, margin + 34);

  let y = margin + 44;

  // ── Reference / Date row ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text(`NOC No  :  ${noc.nocNo}`, margin + 8, y);
  doc.text(`App No  :  ${noc.applicationNo}`, margin + 8, y + 6);
  doc.text(`Date of Issue  :  ${noc.issueDate}`, pw - margin - 8, y, { align: "right" });
  doc.text(`Valid Upto      :  ${noc.expiryDate}`, pw - margin - 8, y + 6, { align: "right" });

  y += 14;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(margin + 8, y, pw - margin - 8, y);

  // ── Salutation & body ──
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);

  const addressText = noc.applicantAddress || "Address not provided";
  const body1 =
    `This is to certify that the application for land conversion submitted by ` +
    `Sri/Smt. ${noc.applicantName}, residing at ${addressText}, bearing Application No. ` +
    `${noc.applicationNo} has been duly examined and processed in accordance with the ` +
    `provisions of the West Bengal Land Reforms Act and applicable rules and regulations.`;

  const lines1 = doc.splitTextToSize(body1, innerW - 16);
  doc.text(lines1, margin + 8, y);
  y += lines1.length * 6 + 4;

  const body2 =
    `After due verification of documents, field inspection reports, and approval by the ` +
    `competent authority, the Department hereby grants this No Objection Certificate ` +
    `for the conversion of the specified land parcel(s) from their present land use to ` +
    `the proposed land use as described in the application.`;

  const lines2 = doc.splitTextToSize(body2, innerW - 16);
  doc.text(lines2, margin + 8, y);
  y += lines2.length * 6 + 4;

  // ── Land Details Table (all parcels) ──
  if (noc.landParcels.length > 0) {
    y += 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138);
    doc.text("LAND DETAILS", margin + 8, y);
    y += 6;

    // Table header
    const colWidths = [18, 18, 20, 22, 18, 30, 30];
    const startX = margin + 8;
    const headers = ["Mouza", "J.L. No.", "Khatian No.", "Plot No.", "Area", "Present Use", "Proposed Use"];

    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(147, 197, 253);
    doc.setLineWidth(0.2);
    doc.rect(startX, y - 4, innerW - 16, 6, "FD");

    let colX = startX;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    headers.forEach((hdr, i) => {
      doc.text(hdr, colX + 1, y);
      colX += colWidths[i];
    });
    y += 6;

    // Rows
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(50, 50, 50);
    noc.landParcels.forEach((parcel) => {
      const row = [
        parcel.mouza || "—",
        parcel.jlNo || "—",
        parcel.khatianNo || "—",
        parcel.plotNo || "—",
        parcel.area || "—",
        parcel.presentLandUse || "—",
        parcel.proposedLandUse || "—",
      ];
      doc.setFillColor(255, 255, 255);
      doc.rect(startX, y - 4, innerW - 16, 6, "F");
      let colX2 = startX;
      row.forEach((val, i) => {
        doc.text(val, colX2 + 1, y);
        colX2 += colWidths[i];
      });
      y += 6;
    });

    y += 4;
  }

  // ── Conditions box ──
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(147, 197, 253);
  doc.setLineWidth(0.3);
  const condBoxH = 28;
  doc.roundedRect(margin + 8, y, innerW - 16, condBoxH, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 58, 138);
  doc.text("CONDITIONS:", margin + 13, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);
  const conditions = [
    "1. The conversion must be completed within the validity period of this certificate.",
    "2. The applicant must obtain all other statutory clearances before commencing work.",
    "3. This NOC is non-transferable and applies only to the land specified in the application.",
  ];
  conditions.forEach((cond, i) => {
    doc.text(cond, margin + 13, y + 13 + i * 5);
  });

  // ── Signature section (dynamic signatory) ──
  y += condBoxH + 20;
  const sigX = pw - margin - 55;

  doc.setDrawColor(50, 50, 50);
  doc.setLineWidth(0.3);
  doc.line(sigX, y, pw - margin - 8, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  const centerX = (sigX + pw - margin - 8) / 2;
  doc.text(noc.signatoryName, centerX, y, { align: "center" });
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(noc.signatoryDesignation, centerX, y, { align: "center" });
  doc.text(PANCHAYAT_ADDRESS, centerX, y + 4.5, { align: "center" });

  // ── Footer ──
  const footerY = ph - margin - 6;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.2);
  doc.line(margin + 8, footerY - 3, pw - margin - 8, footerY - 3);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(130, 130, 130);
  doc.text(
    `This is a computer-generated certificate. | NOC No: ${noc.nocNo} | Issued: ${noc.issueDate}`,
    pw / 2,
    footerY,
    { align: "center" }
  );

  return doc;
}

// ─── Page Component ─────────────────────────────────────────────────────────
export default function NOCPrintPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<IssuedNOC[]>([]);
  const [selected, setSelected] = useState<IssuedNOC | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const result = await getIssuedNOCs();
      if (result.success && result.data) {
        setItems(
          result.data.map((n) => {
            // Primary land from the application
            const primary: LandParcel = {
              khatianNo: n.application.khatianNo || "",
              plotNo: n.application.plotNo || "",
              mouza: n.application.mouza || "",
              jlNo: n.application.jlNo || "",
              area: n.application.landAreaDec || "",
              presentLandUse: n.application.presentLandUse || "",
              proposedLandUse: n.application.proposedLandUse || "",
            };

            // Additional lands from the landDetails array (if any)
            const additional: LandParcel[] = (n.application.landDetails || []).map(
              (ld: any) => ({
                khatianNo: ld.khatianNo || "",
                plotNo: ld.plotNo || "",
                mouza: ld.mouza || "",
                jlNo: ld.jlNo || "",
                area: ld.landAreaDec || "",
                presentLandUse: ld.presentLandUse || "",
                proposedLandUse: ld.proposedLandUse || "",
              })
            );

            // Certificate signatory, fallback to default if empty
            const signatoryName =
              n.certificate?.signatoryName?.trim() || DEFAULT_SIGNATORY_NAME;
            const signatoryDesignation =
              n.certificate?.signatoryDesignation?.trim() || DEFAULT_SIGNATORY_DESIGNATION;

            return {
              id: n.id,
              nocNo: n.certificate.certificateNo,
              applicationNo: n.application.applicationNo,
              applicantName: n.application.applicantName,
              applicantAddress: n.application.applicantAddress || "",
              landParcels: [primary, ...additional],
              issueDate: new Date(n.certificate.issueDate).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }),
              expiryDate: n.certificate.expiryDate
                ? new Date(n.certificate.expiryDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "N/A",
              signatoryName,
              signatoryDesignation,
            };
          })
        );
      } else if (!result.success) {
        toast({
          title: "Failed to load issued NOCs",
          description: result.error ?? "Please try again.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }
    load();
  }, [toast]);

  const handleDownload = async () => {
    if (!selected) return;
    setIsPdfLoading(true);
    try {
      const doc = await generateNocPdf(selected);
      doc.save(`NOC_${selected.nocNo}.pdf`);
    } catch {
      toast({ title: "PDF generation failed", variant: "destructive" });
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!selected) return;
    setIsPdfLoading(true);
    try {
      const doc = await generateNocPdf(selected);
      const blobUrl = doc.output("bloburl") as unknown as string;
      window.open(blobUrl, "_blank");
    } catch {
      toast({ title: "PDF generation failed", variant: "destructive" });
    } finally {
      setIsPdfLoading(false);
    }
  };

  return (
    <LandConversionLayout
      title="Print Certificates"
      description="View and print issued land conversion NOC certificates."
      icon={Printer}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Certificate list ── */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            Issued Certificates ({items.length})
          </h3>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p className="text-sm">Loading certificates...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed">
              <p className="text-sm text-gray-500">No certificates issued yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {items.map((it) => (
                <Card
                  key={it.id}
                  className={`cursor-pointer transition-all ${
                    selected?.id === it.id
                      ? "border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500"
                      : "hover:bg-gray-50 border-gray-200"
                  }`}
                  onClick={() => setSelected(it)}
                >
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <CardTitle className="text-base font-bold text-blue-900">
                        {it.nocNo}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className="text-[10px] h-5 bg-blue-50 text-blue-700 border-blue-200"
                      >
                        ISSUED
                      </Badge>
                    </div>
                    <CardDescription className="text-xs font-medium text-gray-700">
                      {it.applicantName}
                    </CardDescription>
                    <p className="text-[10px] text-gray-500 mt-2">
                      App: {it.applicationNo}
                    </p>
                    {it.applicantAddress && (
                      <div className="flex items-start gap-1 mt-1.5 text-[10px] text-gray-500">
                        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{it.applicantAddress}</span>
                      </div>
                    )}
                    {it.landParcels.length > 0 && (
                      <div className="flex items-start gap-1 mt-1 text-[10px] text-gray-500">
                        <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{landSummary(it.landParcels)}</span>
                      </div>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Preview panel ── */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-6">
              <Card className="border-blue-100 shadow-sm">
                <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Certificate Preview</CardTitle>
                    <CardDescription>
                      Review the NOC then print or download as PDF.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9"
                      onClick={handlePrint}
                      disabled={isPdfLoading}
                    >
                      {isPdfLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Printer className="h-4 w-4 mr-2" />
                      )}
                      Print
                    </Button>
                    <Button
                      size="sm"
                      className="h-9 bg-blue-700 hover:bg-blue-800"
                      onClick={handleDownload}
                      disabled={isPdfLoading}
                    >
                      {isPdfLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Download PDF
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-8">
                  {/* On‑screen preview (mirrors PDF) */}
                  <div className="border-4 border-double border-blue-200 p-8 bg-white min-h-[600px] relative overflow-hidden font-serif">
                    {/* Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                      <span className="text-[120px] font-black uppercase tracking-widest rotate-[-30deg] text-blue-900">
                        NOC
                      </span>
                    </div>

                    {/* Header (only panchayat details) */}
                    <div className="text-center space-y-1 mb-8 pb-6 border-b-2 border-blue-900">
                      <h2 className="text-xl font-extrabold uppercase tracking-widest text-slate-900">
                        {PANCHAYAT_HEADING}
                      </h2>
                      <p className="text-sm font-semibold text-slate-600">
                        {PANCHAYAT_ADDRESS}
                      </p>
                      <div className="h-1 w-20 bg-blue-800 mx-auto rounded-full mt-2" />
                      <h3 className="text-lg font-bold pt-3 text-blue-900 underline underline-offset-4">
                        No Objection Certificate (NOC)
                      </h3>
                    </div>

                    {/* Meta row */}
                    <div className="flex justify-between items-start text-sm font-semibold mb-6">
                      <div className="space-y-1">
                        <p>
                          NOC No:{" "}
                          <span className="font-mono text-blue-800">
                            {selected.nocNo}
                          </span>
                        </p>
                        <p>
                          App No:{" "}
                          <span className="font-mono text-blue-800">
                            {selected.applicationNo}
                          </span>
                        </p>
                      </div>
                      <div className="text-right space-y-1 text-gray-700">
                        <p>Date of Issue: {selected.issueDate}</p>
                        <p>Valid Upto: {selected.expiryDate}</p>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="space-y-4 text-sm text-slate-800 leading-relaxed text-justify">
                      <p>
                        This is to certify that the application for land conversion
                        submitted by{" "}
                        <span className="font-bold border-b border-dotted border-slate-900 px-0.5">
                          {selected.applicantName}
                        </span>
                        {selected.applicantAddress && (
                          <span>
                            , residing at{" "}
                            <span className="italic">{selected.applicantAddress}</span>
                          </span>
                        )}
                        , bearing Application No.{" "}
                        <span className="font-mono font-semibold">
                          {selected.applicationNo}
                        </span>{" "}
                        has been duly examined and processed in accordance with the
                        provisions of the West Bengal Land Reforms Act and applicable
                        rules and regulations.
                      </p>

                      <p>
                        After due verification of documents, field inspection reports,
                        and approval by the competent authority, the Department hereby
                        grants this{" "}
                        <span className="font-bold">No Objection Certificate</span>{" "}
                        for the conversion of the specified land parcel(s) from their
                        present land use to the proposed land use as described in the
                        application.
                      </p>

                      <p>
                        This certificate is issued subject to full compliance with all
                        conditions mentioned in the approved application, subsequent
                        inspection reports, and any directives issued by the Land
                        Conversion Officer from time to time. Any violation of
                        conditions shall render this certificate null and void.
                      </p>
                    </div>

                    {/* Land Details Table */}
                    {selected.landParcels.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-bold text-blue-900 mb-2 uppercase tracking-wide">
                          Land Details
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full border border-blue-200 text-xs">
                            <thead>
                              <tr className="bg-blue-50">
                                <th className="px-2 py-1.5 text-left font-semibold text-blue-900 border-b border-blue-200">Mouza</th>
                                <th className="px-2 py-1.5 text-left font-semibold text-blue-900 border-b border-blue-200">J.L. No.</th>
                                <th className="px-2 py-1.5 text-left font-semibold text-blue-900 border-b border-blue-200">Khatian No.</th>
                                <th className="px-2 py-1.5 text-left font-semibold text-blue-900 border-b border-blue-200">Plot No.</th>
                                <th className="px-2 py-1.5 text-left font-semibold text-blue-900 border-b border-blue-200">Area</th>
                                <th className="px-2 py-1.5 text-left font-semibold text-blue-900 border-b border-blue-200">Present Use</th>
                                <th className="px-2 py-1.5 text-left font-semibold text-blue-900 border-b border-blue-200">Proposed Use</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selected.landParcels.map((parcel, idx) => (
                                <tr key={idx} className="even:bg-gray-50">
                                  <td className="px-2 py-1 border-b border-blue-100">{parcel.mouza || "—"}</td>
                                  <td className="px-2 py-1 border-b border-blue-100">{parcel.jlNo || "—"}</td>
                                  <td className="px-2 py-1 border-b border-blue-100">{parcel.khatianNo || "—"}</td>
                                  <td className="px-2 py-1 border-b border-blue-100">{parcel.plotNo || "—"}</td>
                                  <td className="px-2 py-1 border-b border-blue-100">{parcel.area || "—"}</td>
                                  <td className="px-2 py-1 border-b border-blue-100">{parcel.presentLandUse || "—"}</td>
                                  <td className="px-2 py-1 border-b border-blue-100">{parcel.proposedLandUse || "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Conditions */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-900 space-y-1">
                      <p className="font-bold mb-2">CONDITIONS:</p>
                      <p>
                        1. The conversion must be completed within the validity period
                        of this certificate.
                      </p>
                      <p>
                        2. The applicant must obtain all other statutory clearances
                        before commencing work.
                      </p>
                      <p>
                        3. This NOC is non-transferable and applies only to the land
                        specified in the application.
                      </p>
                    </div>

                    {/* Signature block – dynamic */}
                    <div className="pt-16 flex justify-end">
                      <div className="text-center border-t border-slate-900 pt-2 px-10">
                        <p className="font-bold text-slate-900 text-sm">
                          {selected.signatoryName}
                        </p>
                        <p className="text-xs text-slate-600">
                          {selected.signatoryDesignation}
                        </p>
                        <p className="text-xs text-slate-500">
                          {PANCHAYAT_ADDRESS}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-3 border-t border-gray-200 text-center text-[10px] text-gray-400 italic">
                      This is a computer-generated certificate. | NOC No:{" "}
                      {selected.nocNo} | Issued: {selected.issueDate}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-blue-100 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                <div className="p-4 bg-slate-50 rounded-full mb-4">
                  <Eye className="h-12 w-12 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">
                  Select a certificate from the list to preview
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Once selected, you can print or download the NOC as a PDF.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </LandConversionLayout>
  );
}
