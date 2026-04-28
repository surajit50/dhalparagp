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
import { Printer, Download, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getIssuedNOCs } from "@/action/land-conversion-actions";
import LandConversionLayout from "../components/LandConversionLayout";

interface IssuedNOC {
  id: string;
  nocNo: string;
  applicationNo: string;
  applicantName: string;
  issueDate: string;
  expiryDate: string;
}

// ─── jsPDF NOC generator ───────────────────────────────────────────────────

async function generateNocPdf(noc: IssuedNOC): Promise<import("jspdf").jsPDF> {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pw = doc.internal.pageSize.getWidth();   // 210
  const ph = doc.internal.pageSize.getHeight();  // 297

  const margin = 15;
  const innerW = pw - margin * 2;

  // ── Outer double border ──
  doc.setDrawColor(30, 58, 138);   // blue-900
  doc.setLineWidth(1.2);
  doc.rect(margin, margin, innerW, ph - margin * 2);
  doc.setLineWidth(0.4);
  doc.rect(margin + 2.5, margin + 2.5, innerW - 5, ph - margin * 2 - 5);

  // ── Header band ──
  doc.setFillColor(30, 58, 138);
  doc.rect(margin + 2.5, margin + 2.5, innerW - 5, 28, "F");

  // Org name
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("GOVERNMENT OF WEST BENGAL", pw / 2, margin + 11, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Department of Land & Land Reforms", pw / 2, margin + 17, { align: "center" });
  doc.text("Dhalpara Gram Panchayat", pw / 2, margin + 22, { align: "center" });

  // NOC title
  doc.setTextColor(30, 58, 138);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("NO OBJECTION CERTIFICATE (NOC)", pw / 2, margin + 39, { align: "center" });

  // Underline below title
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.5);
  doc.line(margin + 30, margin + 41, pw - margin - 30, margin + 41);

  // ── Reference / Date row ──
  let y = margin + 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  // Left: NOC No & App No
  doc.text(`NOC No  :  ${noc.nocNo}`, margin + 8, y);
  doc.text(`App No  :  ${noc.applicationNo}`, margin + 8, y + 6);

  // Right: dates
  doc.text(`Date of Issue  :  ${noc.issueDate}`, pw - margin - 8, y, { align: "right" });
  doc.text(`Valid Upto      :  ${noc.expiryDate}`, pw - margin - 8, y + 6, { align: "right" });

  // Separator line
  y += 14;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(margin + 8, y, pw - margin - 8, y);

  // ── Salutation ──
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);

  const body1 =
    `This is to certify that the application for land conversion submitted by ` +
    `Sri/Smt. ${noc.applicantName} (hereinafter referred to as the "Applicant") ` +
    `bearing Application No. ${noc.applicationNo} has been duly examined and processed ` +
    `in accordance with the provisions of the West Bengal Land Reforms Act and applicable ` +
    `rules and regulations.`;

  const lines1 = doc.splitTextToSize(body1, innerW - 16);
  doc.text(lines1, margin + 8, y);
  y += lines1.length * 6 + 6;

  const body2 =
    `After due verification of documents, field inspection reports, and approval by the ` +
    `competent authority, the Department hereby grants this No Objection Certificate ` +
    `for the conversion of the specified land parcel from its present land use to the ` +
    `proposed land use as described in the application.`;

  const lines2 = doc.splitTextToSize(body2, innerW - 16);
  doc.text(lines2, margin + 8, y);
  y += lines2.length * 6 + 6;

  const body3 =
    `This certificate is issued subject to full compliance with all conditions mentioned ` +
    `in the approved application, subsequent inspection reports, and any directives issued ` +
    `by the Land Conversion Officer from time to time. Any violation of conditions shall ` +
    `render this certificate null and void.`;

  const lines3 = doc.splitTextToSize(body3, innerW - 16);
  doc.text(lines3, margin + 8, y);
  y += lines3.length * 6 + 6;

  // ── Conditions box ──
  y += 4;
  doc.setFillColor(239, 246, 255);   // blue-50
  doc.setDrawColor(147, 197, 253);   // blue-300
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

  // ── Signature section ──
  y += condBoxH + 20;
  const sigX = pw - margin - 55;

  doc.setDrawColor(50, 50, 50);
  doc.setLineWidth(0.3);
  doc.line(sigX, y, pw - margin - 8, y);

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text("Authorized Signatory", (sigX + pw - margin - 8) / 2, y, { align: "center" });

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text("Land Conversion Officer", (sigX + pw - margin - 8) / 2, y, { align: "center" });
  doc.text("Dhalpara Gram Panchayat", (sigX + pw - margin - 8) / 2, y + 4.5, { align: "center" });

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

// ─── Page component ────────────────────────────────────────────────────────

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
          result.data.map((n) => ({
            id: n.id,
            nocNo: n.nocNo,
            applicationNo: n.application.applicationNo,
            applicantName: n.application.applicantName,
            issueDate: new Date(n.issueDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }),
            expiryDate: new Date(n.expiryDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }),
          }))
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

  // Download as PDF file
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

  // Open PDF in new browser tab → user can Ctrl+P from there
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
        {/* ── Certificate list ── */}
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
            items.map((it) => (
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
                </CardHeader>
              </Card>
            ))
          )}
        </div>

        {/* ── Preview panel ── */}
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
                  {/* ── On-screen preview (mirrors the PDF layout) ── */}
                  <div className="border-4 border-double border-blue-200 p-8 bg-white min-h-[600px] relative overflow-hidden font-serif">
                    {/* watermark */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                      <span className="text-[120px] font-black uppercase tracking-widest rotate-[-30deg] text-blue-900">
                        NOC
                      </span>
                    </div>

                    {/* Header */}
                    <div className="text-center space-y-1 mb-8 pb-6 border-b-2 border-blue-900">
                      <h2 className="text-xl font-extrabold uppercase tracking-widest text-slate-900">
                        Government of West Bengal
                      </h2>
                      <p className="text-sm font-semibold text-slate-600">
                        Department of Land &amp; Land Reforms
                      </p>
                      <p className="text-xs text-slate-500">
                        Dhalpara Gram Panchayat
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
                        </span>{" "}
                        bearing Application No.{" "}
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
                        for the conversion of the specified land parcel from its
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

                    {/* Signature */}
                    <div className="pt-16 flex justify-end">
                      <div className="text-center border-t border-slate-900 pt-2 px-10">
                        <p className="font-bold text-slate-900 text-sm">
                          Authorized Signatory
                        </p>
                        <p className="text-xs text-slate-600">
                          Land Conversion Officer
                        </p>
                        <p className="text-xs text-slate-500">
                          Dhalpara Gram Panchayat
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
