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
import {
  Printer,
  Download,
  Eye,
  Loader2,
  MapPin,
  FileText,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getIssuedNOCs } from "@/action/land-conversion-actions";
import LandConversionLayout from "../components/LandConversionLayout";

// ───────────────── CONFIG ─────────────────
const PANCHAYAT_NAME = "OFFICE OF THE PRADHAN";
const PANCHAYAT_ADDRESS =
  "No. 3 Dhalpara Gram Panchayat, Trimohini, Hili, Dakshin Dinajpur";

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
  applicantName: string;
  applicantAddress: string;
  landParcels: LandParcel[];
  issueDate: string;
  expiryDate: string;
  signatoryName: string;
  signatoryDesignation: string;
}

// ───────────────── HELPERS ─────────────────
function landSummary(parcels: LandParcel[]) {
  if (!parcels.length) return "N/A";
  const p = parcels[0];
  return `${p.mouza} / Plot ${p.plotNo} (${p.area})${
    parcels.length > 1 ? ` +${parcels.length - 1} more` : ""
  }`;
}

// ───────────────── PDF GENERATOR ─────────────────
async function generateNocPdf(noc: IssuedNOC) {
  const { jsPDF } = await import("jspdf");
  const QRCode = (await import("qrcode")).default;

  const doc = new jsPDF("p", "mm", "a4");

  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 15;
  const innerW = pw - margin * 2;

  let y = margin;

  // ───────── HEADER ─────────
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text(PANCHAYAT_NAME, pw / 2, y + 8, { align: "center" });

  doc.setFontSize(11);
  doc.text("No. 3 Dhalpara Gram Panchayat", pw / 2, y + 14, {
    align: "center",
  });

  doc.setFontSize(10);
  doc.text("Trimohini, Hili, Dakshin Dinajpur", pw / 2, y + 20, {
    align: "center",
  });

  doc.line(margin, y + 24, pw - margin, y + 24);

  y += 32;

  // ───────── TITLE ─────────
  doc.setFontSize(13);
  doc.text("NO OBJECTION CERTIFICATE", pw / 2, y, {
    align: "center",
  });

  y += 10;

  // ───────── MEMO + DATE ─────────
  doc.setFont("times", "bold");
  doc.setFontSize(10);

  doc.text(`Memo No: ${noc.nocNo}`, margin, y);
  doc.text(`Date: ${noc.issueDate}`, pw - margin, y, { align: "right" });

  doc.setFont("times", "normal");
  y += 7;

  doc.text(`Ref: Application No. ${noc.applicationNo}`, margin, y);

  y += 10;

  // ───────── SUBJECT ─────────
  doc.setFont("times", "bold");
  doc.text("TO WHOM IT MAY CONCERN", pw / 2, y, { align: "center" });

  y += 10;

  // ───────── BODY ─────────
  doc.setFont("times", "normal");
  doc.setFontSize(11);

  const body = `
This is to certify that Sri/Smt. ${noc.applicantName}, resident of ${
    noc.applicantAddress || "N/A"
  }, has applied for land conversion vide Application No. ${
    noc.applicationNo
  }.

After careful verification of records, field inspection, and consideration of all relevant documents, it is hereby certified that this Gram Panchayat has no objection to the proposed conversion of land described below.

The permission is granted subject to compliance with all applicable rules and regulations.

This certificate is issued for official purposes.
`;

  const lines = doc.splitTextToSize(body.trim(), innerW);

  lines.forEach((line: string) => {
    doc.text(line, margin, y);
    y += 5;
  });

  y += 3;

  // ───────── LAND TABLE ─────────
  if (noc.landParcels.length > 0) {
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.text("SCHEDULE OF LAND", margin, y);
    y += 6;

    const cols = [
      "Mouza",
      "JL",
      "Khatian",
      "Plot",
      "Area",
      "Present",
      "Proposed",
    ];

    const colWidths = [25, 12, 22, 18, 15, 28, 28];

    let rowHeight = 6;

    // HEADER
    let x = margin;
    doc.setFont("times", "bold");

    cols.forEach((col, i) => {
      doc.rect(x, y, colWidths[i], rowHeight);
      doc.text(col, x + 2, y + 4);
      x += colWidths[i];
    });

    y += rowHeight;

    // ROWS
    doc.setFont("times", "normal");

    noc.landParcels.forEach((p) => {
      let x2 = margin;

      const row = [
        p.mouza,
        p.jlNo,
        p.khatianNo,
        p.plotNo,
        p.area,
        p.presentLandUse,
        p.proposedLandUse,
      ];

      row.forEach((cell, i) => {
        doc.rect(x2, y, colWidths[i], rowHeight);
        doc.text(String(cell || "-"), x2 + 2, y + 4);
        x2 += colWidths[i];
      });

      y += rowHeight;
    });

    y += 8;
  }

  // ───────── SIGNATURE ─────────
  const sigX = pw - margin - 60;

  doc.text("(Signature with Seal)", sigX, y + 10);
  doc.text(noc.signatoryDesignation, sigX, y + 16);
  doc.text("No. 3 Gram Panchayat", sigX, y + 22);

  // ───────── QR CODE ─────────
  const verifyUrl = `https://yourdomain.com/verify-noc?noc=${noc.nocNo}`;
  const qr = await QRCode.toDataURL(verifyUrl);

  const size = 28;

  doc.addImage(
    qr,
    "PNG",
    pw - margin - size,
    ph - margin - size,
    size,
    size
  );

  doc.setFontSize(7);
  doc.text("Scan to Verify", pw - margin - size, ph - margin - 5);

  // ───────── LEGAL FOOTER ─────────
  doc.setFontSize(8);
  doc.setTextColor(80);

  doc.text(
    "Issued as per applicable provisions of West Bengal Land Reforms Rules.",
    margin,
    ph - margin - 8
  );

  doc.setFontSize(7);
  doc.setTextColor(100);

  doc.text(
    "This certificate can be verified using the QR code.",
    margin,
    ph - margin - 2
  );

  return doc;
}
  


// ───────────────── PAGE ─────────────────
export default function NOCPrintPage() {
  const { toast } = useToast();

  const [items, setItems] = useState<IssuedNOC[]>([]);
  const [selected, setSelected] = useState<IssuedNOC | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    async function load() {
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
              applicantAddress: n.application.applicantAddress || "",
              landParcels: [primary, ...additional],
              issueDate: new Date(
                n.certificate.issueDate
              ).toLocaleDateString("en-IN"),
              expiryDate: "N/A",
              signatoryName:
                n.certificate.signatoryName || DEFAULT_SIGNATORY_NAME,
              signatoryDesignation:
                n.certificate.signatoryDesignation ||
                DEFAULT_SIGNATORY_DESIGNATION,
            };
          });

          setItems(mapped);
        } else {
          toast({
            title: "Error",
            description: "Failed to load NOCs",
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: "Error",
          description: "Something went wrong",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [toast]);

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

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LIST */}
        <div className="space-y-3">
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : items.length === 0 ? (
            <p>No NOC found</p>
          ) : (
            items.map((it) => (
              <Card
                key={it.id}
                onClick={() => setSelected(it)}
                className={`cursor-pointer ${
                  selected?.id === it.id ? "border-blue-500" : ""
                }`}
              >
                <CardHeader>
                  <CardTitle>{it.nocNo}</CardTitle>
                  <CardDescription>{it.applicantName}</CardDescription>

                  <div className="text-xs text-gray-500">
                    {landSummary(it.landParcels)}
                  </div>

                  <Badge variant="outline">ISSUED</Badge>
                </CardHeader>
              </Card>
            ))
          )}
        </div>

        {/* PREVIEW */}
        <div className="lg:col-span-2">
          {selected ? (
            <Card>
              <CardHeader className="flex justify-between flex-row">
                <div>
                  <CardTitle>Certificate Preview</CardTitle>
                  <CardDescription>
                    Download or print official NOC
                  </CardDescription>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handlePrint} disabled={pdfLoading}>
                    <Printer className="h-4 w-4 mr-2" /> Print
                  </Button>

                  <Button onClick={handleDownload} disabled={pdfLoading}>
                    <Download className="h-4 w-4 mr-2" /> PDF
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-gray-500">
                  Click print or download to generate official certificate.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center text-gray-500">
              <Eye className="mx-auto mb-2" />
              Select a certificate
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
