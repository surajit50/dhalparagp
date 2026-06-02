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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Printer,
  Download,
  Loader2,
  FileText,
  Search,
  RefreshCw,
  Eye,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getIssuedNOCs } from "@/action/land-conversion-actions";
import LandConversionLayout from "../components/LandConversionLayout";

// ───────────────── CONFIG ─────────────────
const PANCHAYAT_NAME = "OFFICE OF THE PRADHAN";

const DEFAULT_SIGNATORY_NAME = "Pradhan";
const DEFAULT_SIGNATORY_DESIGNATION = "Pradhan";

// ───────────────── TYPES ─────────────────
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
  memoNumber: string;
  applicantName: string;
  applicantAddress: string;
  landParcels: LandParcel[];
  issueDate: string;
  expiryDate: string;
  signatoryName: string;
  signatoryDesignation: string;
}

// ───────────────── PDF GENERATOR ─────────────────

/** Fetches a public image and returns a base64 data-URL string */
async function fetchImageAsBase64(publicPath: string): Promise<string> {
  const res = await fetch(publicPath);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function generateNocPdf(noc: IssuedNOC) {
  const { jsPDF } = await import("jspdf");
  const QRCode = (await import("qrcode")).default;

  // Load GP logo
  let logoBase64: string | null = null;
  try {
    logoBase64 = await fetchImageAsBase64("/images/logo.png");
  } catch {
    logoBase64 = null;
  }

  const doc = new jsPDF("p", "mm", "a4");
  const pw  = doc.internal.pageSize.getWidth();   // 210 mm
  const ph  = doc.internal.pageSize.getHeight();  // 297 mm
  const ml  = 20;   // left margin
  const mr  = 20;   // right margin
  const tw  = pw - ml - mr;  // usable text width = 170 mm

  // ─── PAGE BORDER ─────────────────────────────────────────────
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, pw - 20, ph - 20);
  doc.setLineWidth(0.2);

  let y = 14;

  // ─── LETTERHEAD ───────────────────────────────────────────────
  // Logo – left side
  const logoSize = 24;
  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", ml, y, logoSize, logoSize);
  }

  // Text block – centred on the full page width
  const headerY = y + 4;

  doc.setTextColor(0, 0, 0);

  // "OFFICE OF THE PRADHAN"
  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.text("OFFICE OF THE PRADHAN", pw / 2, headerY, { align: "center" });

  // "No. 3 Dhalpara Gram Panchayat" — large & bold
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.text("No. 3 Dhalpara Gram Panchayat", pw / 2, headerY + 8, { align: "center" });

  // Address line
  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.text(
    "Trimohini, Hili, Dakshin Dinajpur \u2013 733126, West Bengal",
    pw / 2, headerY + 17,
    { align: "center", maxWidth: tw }
  );

  y = headerY + 22;   // move cursor past the letterhead block


  // Thin line under letterhead
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.line(ml, y, pw - mr, y);
  doc.setLineWidth(0.2);
  y += 5;

  // Memo No & Date row
  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(`Memo No: ${noc.memoNumber || "—"}`, ml, y);
  doc.text(`Date: ${noc.issueDate}`, pw - mr, y, { align: "right" });
  y += 4;

  // Second dividing line
  doc.setLineWidth(0.4);
  doc.line(ml, y, pw - mr, y);
  doc.setLineWidth(0.2);
  y += 8;

  // ─── CERTIFICATE TITLE ───────────────────────────────────────
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("NO OBJECTION CERTIFICATE", pw / 2, y, { align: "center" });
  y += 5;

  // underline
  const tw2 = doc.getTextWidth("NO OBJECTION CERTIFICATE");
  doc.setLineWidth(0.5);
  doc.line(pw / 2 - tw2 / 2, y, pw / 2 + tw2 / 2, y);
  doc.setLineWidth(0.2);
  y += 4;

  doc.setFont("times", "italic");
  doc.setFontSize(9);
  doc.text("(Land Conversion – No Objection Certificate)", pw / 2, y, { align: "center" });
  y += 8;

  // ─── REF ROW ─────────────────────────────────────────────────
  doc.setFont("times", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(0, 0, 0);
  doc.text(`Ref: Application No. ${noc.applicationNo}`, ml, y);
  y += 6;

  // Light separator
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.2);
  doc.line(ml, y, pw - mr, y);
  y += 5;

  // ─── GREETING ────────────────────────────────────────────────
  doc.setDrawColor(0, 0, 0);
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("TO WHOM IT MAY CONCERN", pw / 2, y, { align: "center" });
  y += 7;

  // ─── BODY PARAGRAPHS ─────────────────────────────────────────
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const lineH = 5.5;

  const paragraphs = [
    `    This is to certify that Sri / Smt. ${noc.applicantName}, resident of ${
      noc.applicantAddress || "N/A"
    }, has submitted an application for conversion of land vide Application No. ${noc.applicationNo} before this Gram Panchayat.`,

    `    After due examination of all relevant records, verification of submitted documents, physical field inspection of the concerned plot(s), and upon satisfaction of the applicable rules and regulations, this office finds no objection to the proposed conversion of land as detailed in the Schedule below.`,

    `    This No Objection Certificate is issued on the date mentioned herein and shall remain valid for a period of Six (6) months from the date of issue. The permission is conditional upon strict compliance with all applicable provisions of the West Bengal Panchayat Act, Land Reforms Rules, and any other relevant statutory obligations.`,
  ];

  for (const para of paragraphs) {
    const lines = doc.splitTextToSize(para, tw);
    for (const ln of lines) {
      doc.text(ln, ml, y);
      y += lineH;
    }
    y += 3;
  }

  y += 2;

  // ─── LAND SCHEDULE TABLE ─────────────────────────────────────
  if (noc.landParcels.length > 0) {
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("SCHEDULE OF LAND", ml, y);
    y += 5;

    // Column widths summing exactly to tw (170 mm)
    const cols = ["#", "Mouza", "JL No", "Khatian", "Plot No", "Area (Dec)", "Present Status", "Proposed Status"];
    const cw   = [8, 35, 14, 22, 16, 16, 30, 30]; // total = 170
    const rh   = 7;

    // Header row – dark background
    doc.setFillColor(40, 40, 40);
    doc.setDrawColor(40, 40, 40);
    doc.rect(ml, y, tw, rh, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("times", "bold");
    doc.setFontSize(8);
    let hx = ml;
    cols.forEach((col, i) => {
      doc.text(col, hx + cw[i] / 2, y + 4.8, { align: "center" });
      hx += cw[i];
    });
    y += rh;

    // Data rows
    doc.setFont("times", "normal");
    doc.setFontSize(8.5);
    noc.landParcels.forEach((p, idx) => {
      const bg = idx % 2 === 0 ? [245, 245, 245] : [255, 255, 255];
      doc.setFillColor(bg[0], bg[1], bg[2]);
      doc.setDrawColor(160, 160, 160);
      doc.rect(ml, y, tw, rh, "FD");
      doc.setTextColor(0, 0, 0);
      const cells = [
        String(idx + 1),
        p.mouza       || "—", p.jlNo        || "—",
        p.khatianNo   || "—", p.plotNo       || "—",
        p.area        || "—",
        p.presentLandUse  || "—",
        p.proposedLandUse || "—",
      ];
      let cx = ml;
      cells.forEach((cell, i) => {
        const t = cell.length > 13 ? cell.slice(0, 12) + "…" : cell;
        doc.text(t, cx + cw[i] / 2, y + 4.8, { align: "center" });
        cx += cw[i];
      });
      y += rh;
    });

    // Bottom border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.4);
    doc.line(ml, y, ml + tw, y);
    doc.setLineWidth(0.2);
    y += 7;
  }

  // ─── DECLARATION ─────────────────────────────────────────────
  doc.setFont("times", "italic");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const decl = "This certificate is issued without prejudice to any future decision of the competent authority and does not confer any absolute right on the applicant to carry out the proposed conversion.";
  const declLines = doc.splitTextToSize(decl, tw);
  for (const ln of declLines) {
    doc.text(ln, ml, y);
    y += 5;
  }
  y += 6;

  // ─── SIGNATURE BLOCK ─────────────────────────────────────────
  const sigBlockW = 65;
  const sigX = pw - mr - sigBlockW;
  doc.setFont("times", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(0, 0, 0);
  doc.text("Authorised Signatory", sigX + sigBlockW / 2, y, { align: "center" });
  y += 12;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.line(sigX, y, sigX + sigBlockW, y);
  y += 5;
  doc.setFont("times", "normal");
  doc.setFontSize(9);
  doc.text(noc.signatoryDesignation, sigX + sigBlockW / 2, y, { align: "center" });
  y += 5;
  doc.text("No. 3 Dhalpara Gram Panchayat", sigX + sigBlockW / 2, y, { align: "center" });

  // ─── QR CODE ─────────────────────────────────────────────────
  const verifyUrl = `https://dhalparagp.gov.in/verify?noc=${noc.nocNo}`;
  const qr = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 120 });
  const qrSize = 26;
  const qrX = ml;
  const qrY = ph - ml - 30;
  doc.addImage(qr, "PNG", qrX, qrY, qrSize, qrSize);
  doc.setTextColor(71, 85, 105);
  doc.setFont("times", "normal");
  doc.setFontSize(6.5);
  doc.text("Scan to verify", qrX + qrSize / 2, qrY + qrSize + 3, { align: "center" });

  // ─── FOOTER ──────────────────────────────────────────────────
 

  return doc;
}

// ───────────────── PAGE ─────────────────
export default function NOCPrintPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<IssuedNOC[]>([]);
  const [selected, setSelected] = useState<IssuedNOC | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await getIssuedNOCs();
      if (res.success && res.data) {
        const mapped = res.data.map((n: any) => {
          const primary: LandParcel = {
            khatianNo: n.application.khatianNo || "",
            plotNo: n.application.plotNo || "",
            mouza: n.application.mouza || "",
            jlNo: n.application.jlNo || "",
            area: n.application.landAreaDec || "",
            presentLandUse: n.application.presentLandUse || "",
            proposedLandUse: n.application.proposedLandUse || "",
          };
          const additional: LandParcel[] =
            n.application.landDetails?.map((ld: any) => ({
              khatianNo: ld.khatianNo || "",
              plotNo: ld.plotNo || "",
              mouza: ld.mouza || "",
              jlNo: ld.jlNo || "",
              area: ld.landAreaDec || "",
              presentLandUse: ld.presentLandUse || "",
              proposedLandUse: ld.proposedLandUse || "",
            })) || [];
          return {
            id: n.id,
            nocNo: n.certificate.certificateNo,
            applicationNo: n.application.applicationNo,
            applicantName: n.application.applicantName,
            memoNumber: n.certificate.memoNumber || "",
            applicantAddress: n.application.applicantAddress || "",
            landParcels: [primary, ...additional],
            issueDate: (() => {
              const d = new Date(n.certificate.issueDate);
              const day = String(d.getDate()).padStart(2, "0");
              const month = String(d.getMonth() + 1).padStart(2, "0");
              return `${day}/${month}/${d.getFullYear()}`;
            })(),
            expiryDate: "N/A",
            signatoryName: n.certificate.signatoryName || DEFAULT_SIGNATORY_NAME,
            signatoryDesignation: n.certificate.signatoryDesignation || DEFAULT_SIGNATORY_DESIGNATION,
          };
        });
        setItems(mapped);
      } else {
        toast({ title: "Error", description: "Failed to load NOCs", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const handleDownload = async () => {
    if (!selected) return;
    setPdfLoading(true);
    const doc = await generateNocPdf(selected);
    doc.save(`NOC_${selected.nocNo}.pdf`);
    setPdfLoading(false);
  };

  const handlePrint = async () => {
    if (!selected) return;
    setPdfLoading(true);
    const doc = await generateNocPdf(selected);
    window.open(doc.output("bloburl"));
    setPdfLoading(false);
  };

  const filtered = items.filter(
    (it) =>
      it.nocNo.toLowerCase().includes(search.toLowerCase()) ||
      it.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      it.applicationNo.toLowerCase().includes(search.toLowerCase()) ||
      it.memoNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <LandConversionLayout
      title="NOC Print & Download"
      description="View issued NOC certificates and generate PDF copies."
      icon={FileText}
    >
      <div className="space-y-6">
        {/* ─── ISSUED NOC TABLE ─── */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-base text-gray-800">
                  Issued NOC Certificates
                </CardTitle>
                <CardDescription>
                  {filtered.length} certificate(s) found
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by NOC No, name, App No..."
                    className="pl-9 h-9 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button size="sm" variant="outline" onClick={load} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-sm">Loading certificates...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <FileText className="h-10 w-10 mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-medium">No NOC certificates found</p>
                <p className="text-xs text-gray-400 mt-1">
                  No certificates have been issued yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="text-xs font-semibold text-gray-600 uppercase w-10">#</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600 uppercase">NOC No</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600 uppercase">App No</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600 uppercase">Applicant Name</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600 uppercase">Memo No</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center">Issue Date</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center">Parcels</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600 uppercase text-center">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-600 uppercase text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((it, idx) => (
                      <TableRow
                        key={it.id}
                        className={`cursor-pointer transition-colors ${
                          selected?.id === it.id
                            ? "bg-orange-50 hover:bg-orange-50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() =>
                          setSelected(selected?.id === it.id ? null : it)
                        }
                      >
                        <TableCell className="text-gray-500 text-sm">{idx + 1}</TableCell>
                        <TableCell className="font-mono font-bold text-orange-900 text-sm">
                          {it.nocNo}
                        </TableCell>
                        <TableCell className="font-mono text-orange-700 text-sm">
                          {it.applicationNo}
                        </TableCell>
                        <TableCell className="font-medium text-gray-800 text-sm">
                          {it.applicantName}
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm font-mono text-xs">
                          {it.memoNumber || "—"}
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-600">
                          {it.issueDate}
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-600">
                          {it.landParcels.length}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 text-xs"
                          >
                            ISSUED
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(selected?.id === it.id ? null : it);
                            }}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Preview
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── DETAIL & PRINT PANEL ─── */}
        {selected && (
          <Card className="border-orange-200 shadow-sm">
            <CardHeader className="bg-orange-50 border-b">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <CardTitle className="text-base text-orange-900">
                    Certificate Preview —{" "}
                    <span className="font-mono">{selected.nocNo}</span>
                  </CardTitle>
                  <CardDescription className="text-orange-700">
                    {selected.applicantName} · App: {selected.applicationNo}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePrint}
                    disabled={pdfLoading}
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    {pdfLoading ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Printer className="h-4 w-4 mr-1" />
                    )}
                    Print
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDownload}
                    disabled={pdfLoading}
                    className="bg-orange-700 hover:bg-orange-800"
                  >
                    {pdfLoading ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-1" />
                    )}
                    Download PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setSelected(null)}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Certificate details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-orange-50/50 rounded-lg border border-orange-100 text-sm">
                <div>
                  <span className="text-orange-700 font-semibold block uppercase text-[10px] mb-1">NOC No</span>
                  <span className="font-mono font-bold text-slate-800">{selected.nocNo}</span>
                </div>
                <div>
                  <span className="text-orange-700 font-semibold block uppercase text-[10px] mb-1">Memo No</span>
                  <span className="font-mono text-slate-700 text-xs">{selected.memoNumber || "—"}</span>
                </div>
                <div>
                  <span className="text-orange-700 font-semibold block uppercase text-[10px] mb-1">Issue Date</span>
                  <span className="font-medium text-slate-800">{selected.issueDate}</span>
                </div>
                <div>
                  <span className="text-orange-700 font-semibold block uppercase text-[10px] mb-1">Signatory</span>
                  <span className="font-medium text-slate-800">{selected.signatoryName}</span>
                </div>
              </div>

              {/* Land parcels sub-table */}
              {selected.landParcels.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Schedule of Land ({selected.landParcels.length} parcel
                    {selected.landParcels.length > 1 ? "s" : ""})
                  </h4>
                  <div className="overflow-x-auto rounded-md border border-gray-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableHead className="text-xs font-semibold uppercase text-gray-500">Mouza</TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-gray-500">JL No</TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-gray-500">Khatian</TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-gray-500">Plot</TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-gray-500 text-right">Area (Dec)</TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-gray-500">Present Use</TableHead>
                          <TableHead className="text-xs font-semibold uppercase text-gray-500">Proposed Use</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selected.landParcels.map((p, i) => (
                          <TableRow key={i} className="hover:bg-gray-50">
                            <TableCell className="text-sm text-gray-800 font-medium">{p.mouza || "—"}</TableCell>
                            <TableCell className="text-sm text-gray-700">{p.jlNo || "—"}</TableCell>
                            <TableCell className="text-sm text-gray-700">{p.khatianNo || "—"}</TableCell>
                            <TableCell className="text-sm text-gray-700">{p.plotNo || "—"}</TableCell>
                            <TableCell className="text-sm text-gray-700 text-right">{p.area || "—"}</TableCell>
                            <TableCell className="text-sm text-gray-600 italic">{p.presentLandUse || "—"}</TableCell>
                            <TableCell className="text-sm text-gray-600 italic">{p.proposedLandUse || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-400 italic border-t pt-2">
                Click <strong>Print</strong> to open a browser-printable PDF or{" "}
                <strong>Download PDF</strong> to save the certificate locally.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </LandConversionLayout>
  );
}
