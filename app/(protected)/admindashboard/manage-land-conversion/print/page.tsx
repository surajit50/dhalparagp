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
  const QRCode = (await import("qrcode")).default;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 15;
  const innerW = pw - margin * 2;

  // ─────────────────────────────────────────
  // HEADER (OFFICE PAD STYLE)
  // ─────────────────────────────────────────
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text("OFFICE OF THE PRADHAN", pw / 2, margin + 8, { align: "center" });

  doc.setFontSize(11);
  doc.text(
    "No. 3 Dhalpara Gram Panchayat",
    pw / 2,
    margin + 14,
    { align: "center" }
  );

  doc.setFontSize(10);
  doc.text(
    "Trimohini, Hili, Dakshin Dinajpur",
    pw / 2,
    margin + 20,
    { align: "center" }
  );

  doc.setLineWidth(0.5);
  doc.line(margin, margin + 24, pw - margin, margin + 24);

  // TITLE
  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.text("NO OBJECTION CERTIFICATE", pw / 2, margin + 32, {
    align: "center",
  });

  let y = margin + 42;

  // ─────────────────────────────────────────
  // MEMO SECTION
  // ─────────────────────────────────────────
  doc.setFont("times", "normal");
  doc.setFontSize(10);

  doc.text(`Memo No: ${noc.nocNo}`, margin + 2, y);
  doc.text(`Date: ${noc.issueDate}`, pw - margin - 2, y, { align: "right" });

  y += 8;

  doc.text(`Ref: Application No ${noc.applicationNo}`, margin + 2, y);

  y += 10;

  // ─────────────────────────────────────────
  // BODY
  // ─────────────────────────────────────────
  doc.setFont("times", "bold");
  doc.text("TO WHOM IT MAY CONCERN", pw / 2, y, { align: "center" });

  y += 10;

  doc.setFont("times", "normal");

  const body = `
This is to certify that Sri/Smt. ${noc.applicantName},
resident of ${noc.applicantAddress || "N/A"},
has applied for land conversion vide Application No. ${noc.applicationNo}.

After careful verification of records, field inspection, and consideration of all relevant documents, it is hereby certified that this Gram Panchayat has no objection to the proposed conversion of land described below.

The permission is granted subject to compliance with all applicable rules, regulations, and statutory provisions.

This certificate is issued on the request of the applicant for official purposes.
`;

  const lines = doc.splitTextToSize(body, innerW - 10);
  doc.text(lines, margin + 2, y);
  y += lines.length * 6 + 4;

  // ─────────────────────────────────────────
  // LAND DETAILS (SCHEDULE)
  // ─────────────────────────────────────────
  if (noc.landParcels.length > 0) {
    doc.setFont("times", "bold");
    doc.text("SCHEDULE OF LAND", margin + 2, y);
    y += 6;

    const headers = [
      "Mouza",
      "J.L",
      "Khatian",
      "Plot",
      "Area",
      "Present",
      "Proposed",
    ];

    const colWidths = [20, 15, 20, 20, 15, 30, 30];
    let x = margin + 2;

    doc.setFontSize(8);

    headers.forEach((h, i) => {
      doc.text(h, x, y);
      x += colWidths[i];
    });

    y += 5;

    doc.setFont("times", "normal");

    noc.landParcels.forEach((p) => {
      let x2 = margin + 2;

      const row = [
        p.mouza,
        p.jlNo,
        p.khatianNo,
        p.plotNo,
        p.area,
        p.presentLandUse,
        p.proposedLandUse,
      ];

      row.forEach((val, i) => {
        doc.text(val || "-", x2, y);
        x2 += colWidths[i];
      });

      y += 5;
    });

    y += 6;
  }

  // ─────────────────────────────────────────
  // SIGNATURE BLOCK
  // ─────────────────────────────────────────
  y += 10;

  doc.text("Place: ____________", margin + 2, y);
  doc.text("Date: ____________", margin + 2, y + 6);

  const sigX = pw - margin - 50;

  doc.text("(Signature)", sigX, y + 14);
  doc.text(noc.signatoryDesignation, sigX, y + 20);

  // ─────────────────────────────────────────
  // QR CODE
  // ─────────────────────────────────────────
  const verifyUrl = `https://yourdomain.com/verify-noc?noc=${noc.nocNo}`;
  const qrData = await QRCode.toDataURL(verifyUrl);

  const qrSize = 25;

  doc.addImage(
    qrData,
    "PNG",
    pw - margin - qrSize,
    ph - margin - qrSize,
    qrSize,
    qrSize
  );

  doc.setFontSize(7);
  doc.text(
    "Scan to Verify",
    pw - margin - qrSize,
    ph - margin - 5
  );

  // ─────────────────────────────────────────
  // FOOTER
  // ─────────────────────────────────────────
  doc.setFontSize(7);
  doc.setTextColor(100);

  doc.text(
    "This certificate can be verified using the QR code.",
    margin,
    ph - margin - 2
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
