"use client";

import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Printer, FileText, ShieldCheck } from "lucide-react";
import { formatDate } from "@/utils/utils";
import { gpname, gpcode, blockname } from "@/constants/gpinfor";
import { POND_LEASE_TERMS } from "@/constants/pond-lease-terms";
import {
  formatPondAreaAcre,
  parsePondAreaDecimal,
} from "@/lib/utils/pond-lease";

interface LeaseAgreementPrintProps {
  lease: any;
  trigger?: React.ReactNode;
}

type LanguageMode = "bilingual" | "bengali" | "english";

export function LeaseAgreementPrint({ lease, trigger }: LeaseAgreementPrintProps) {
  const [open, setOpen] = useState(false);
  const [langMode, setLangMode] = useState<LanguageMode>("bilingual");
  const printableRef = useRef<HTMLDivElement>(null);

  const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const leaseStartDate = lease?.leaseStartDate ? new Date(lease.leaseStartDate) : new Date();
  const leaseEndDate = lease?.leaseEndDate ? new Date(lease.leaseEndDate) : new Date();
  const agreementYear = leaseStartDate.getFullYear();
  const memoNumber = `GP/${gpcode || "DGP"}/POND-LEASE/${agreementYear}/${(lease?.id || "0000").slice(-4).toUpperCase()}`;
  const agreementDate = formatDate(new Date());

  const fullAddress = [
    lease?.leasePartyAddressLine1,
    lease?.leasePartyAddressLine2,
    lease?.leasePartyCity,
    lease?.leasePartyPin ? `পিন-${lease.leasePartyPin}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const fullAddressEn = [
    lease?.leasePartyAddressLine1,
    lease?.leasePartyAddressLine2,
    lease?.leasePartyCity,
    lease?.leasePartyPin ? `PIN-${lease.leasePartyPin}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const pondAreaDecimal = parsePondAreaDecimal(lease?.pond?.area);
  const pondAreaAcre = formatPondAreaAcre(pondAreaDecimal);

  const getFullPrintCSS = () => `
    @page {
      size: A4 portrait;
      margin: 8mm 10mm 8mm 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Times New Roman', 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', 'Vrinda', Georgia, serif;
      font-size: 10pt;
      line-height: 1.35;
      color: #0f172a !important;
      background-color: #ffffff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      padding: 0;
    }

    .deed-outer-frame {
      border: 2px solid #1e3a8a !important;
      padding: 12px 16px;
      background: #ffffff !important;
      position: relative;
    }

    .watermark-text {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-32deg);
      font-size: 42pt;
      font-weight: 900;
      color: rgba(30, 58, 138, 0.04) !important;
      text-align: center;
      z-index: 0;
      pointer-events: none;
      white-space: nowrap;
      text-transform: uppercase;
      font-family: serif;
      line-height: 1.2;
    }

    .content-layer {
      position: relative;
      z-index: 1;
    }

    /* Header */
    .header-wrap {
      text-align: center;
      margin-bottom: 5px;
    }
    .govt-badge {
      display: inline-block;
      font-size: 8pt;
      font-weight: bold;
      background-color: #1e3a8a !important;
      color: #ffffff !important;
      padding: 1.5px 10px;
      border-radius: 2px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .dept-title {
      font-size: 8.5pt;
      font-weight: bold;
      color: #334155;
      margin-top: 2px;
    }
    .gp-title-bn {
      font-size: 14.5pt;
      font-weight: 900;
      color: #1e3a8a !important;
      margin: 1px 0;
      line-height: 1.15;
    }
    .gp-title-en {
      font-size: 10.5pt;
      font-weight: bold;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .gp-address-text {
      font-size: 8.2pt;
      color: #475569;
    }
    .gp-address-sub {
      font-size: 7.8pt;
      color: #64748b;
    }
    .header-divider-line {
      border-top: 2px solid #1e3a8a !important;
      border-bottom: 1px solid #94a3b8 !important;
      height: 3px;
      margin: 4px 0 6px 0;
    }

    /* Memo & Date Bar */
    .memo-date-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #f1f5f9 !important;
      border: 1px solid #cbd5e1 !important;
      border-left: 4px solid #1e3a8a !important;
      padding: 2.5px 8px;
      font-size: 8.5pt;
      font-weight: bold;
      margin-bottom: 6px;
    }
    .memo-val {
      font-family: monospace;
      color: #0f172a;
    }

    /* Deed Title */
    .deed-title-wrap {
      text-align: center;
      margin: 3px 0 6px 0;
    }
    .deed-title-badge {
      display: inline-block;
      background-color: #1e3a8a !important;
      color: #ffffff !important;
      font-size: 11.5pt;
      font-weight: 800;
      padding: 1.5px 14px;
      border-radius: 2px;
      letter-spacing: 0.3px;
    }
    .deed-title-en-sub {
      font-size: 8.5pt;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: 1px;
    }

    /* Parties */
    .parties-grid {
      display: flex;
      gap: 8px;
      margin-bottom: 6px;
    }
    .party-card {
      flex: 1;
      border: 1px solid #cbd5e1 !important;
      background-color: #f8fafc !important;
      padding: 4px 8px;
      border-radius: 2px;
    }
    .party-card-title {
      font-size: 8.2pt;
      font-weight: 800;
      color: #1e3a8a !important;
      text-transform: uppercase;
      border-bottom: 1px solid #e2e8f0 !important;
      padding-bottom: 1.5px;
      margin-bottom: 2.5px;
    }
    .party-card-body {
      font-size: 8.2pt;
      color: #1e293b;
      line-height: 1.3;
    }

    /* Preamble */
    .preamble-box {
      background-color: #f8fafc !important;
      border: 1px solid #e2e8f0 !important;
      border-left: 3px solid #1e3a8a !important;
      padding: 4px 8px;
      font-size: 8.5pt;
      line-height: 1.35;
      text-align: justify;
      margin-bottom: 6px;
    }

    /* Matrix 2 Columns */
    .matrix-2col {
      display: flex;
      gap: 8px;
      margin-bottom: 6px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .matrix-col {
      flex: 1;
      border: 1px solid #1e3a8a !important;
      border-radius: 2px;
      overflow: hidden;
    }
    .matrix-col-header {
      background-color: #1e3a8a !important;
      color: #ffffff !important;
      font-size: 8.2pt;
      font-weight: 800;
      padding: 2.5px 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      text-transform: uppercase;
    }
    .matrix-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8.2pt;
    }
    .matrix-table tr {
      border-bottom: 1px solid #e2e8f0 !important;
    }
    .matrix-table tr:last-child {
      border-bottom: none !important;
    }
    .matrix-table tr:nth-child(even) {
      background-color: #f8fafc !important;
    }
    .matrix-table td {
      padding: 2px 6px;
      vertical-align: middle;
    }
    .matrix-table td.lbl {
      width: 44%;
      font-weight: 700;
      color: #334155;
      border-right: 1px solid #e2e8f0 !important;
      background-color: #f1f5f9 !important;
    }
    .matrix-table td.val {
      width: 56%;
      font-weight: 600;
      color: #0f172a;
    }
    .status-badge {
      display: inline-block;
      background-color: #dcfce7 !important;
      color: #166534 !important;
      border: 1px solid #86efac !important;
      font-weight: 800;
      font-size: 7.5pt;
      padding: 0 4px;
      border-radius: 2px;
    }
    .area-badge {
      display: inline-block;
      background-color: #dbeafe !important;
      color: #1e40af !important;
      border: 1px solid #93c5fd !important;
      font-weight: 800;
      padding: 0 4px;
      border-radius: 2px;
    }

    /* Terms */
    .terms-section {
      margin-bottom: 6px;
      /* allow terms section to flow across pages seamlessly */
    }
    .terms-header {
      background-color: #1e3a8a !important;
      color: #ffffff !important;
      font-size: 8.2pt;
      font-weight: 800;
      padding: 2.5px 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      text-transform: uppercase;
      border-radius: 2px;
      margin-bottom: 3.5px;
    }
    .terms-ol {
      list-style-type: none;
      padding: 0;
      margin: 0;
      counter-reset: term-num;
    }
    .terms-ol li {
      counter-increment: term-num;
      position: relative;
      padding-left: 18px;
      margin-bottom: 3px;
      font-size: 8.2pt;
      line-height: 1.3;
      text-align: justify;
      color: #0f172a;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .terms-ol li::before {
      content: counter(term-num) ".";
      position: absolute;
      left: 0;
      top: 0;
      font-weight: bold;
      color: #1e3a8a;
    }
    .term-title-bn {
      font-weight: bold;
      color: #0f172a;
    }
    .term-en-sub {
      display: block;
      font-size: 7.5pt;
      color: #64748b;
      font-style: italic;
      margin-top: 0.5px;
    }

    /* Remarks */
    .remarks-box {
      border: 1px solid #cbd5e1 !important;
      background-color: #f8fafc !important;
      padding: 3.5px 8px;
      margin-bottom: 6px;
      font-size: 8.2pt;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Witnesses */
    .witnesses-box {
      border: 1px dashed #94a3b8 !important;
      background-color: #f8fafc !important;
      padding: 4px 8px;
      margin-bottom: 6px;
      font-size: 8pt;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .witnesses-title {
      font-weight: bold;
      color: #1e3a8a;
      font-size: 8pt;
      text-decoration: underline;
      margin-bottom: 2px;
    }
    .witness-columns {
      display: flex;
      gap: 12px;
    }
    .witness-col {
      flex: 1;
      line-height: 1.3;
    }

    /* Execution Signatures */
    .exec-signatures-row {
      display: flex;
      gap: 16px;
      margin-top: 6px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .exec-sign-card {
      flex: 1;
      text-align: center;
      border: 1px solid #cbd5e1 !important;
      background-color: #ffffff !important;
      padding: 5px;
      border-radius: 2px;
    }
    .thumb-impression-box {
      height: 40px;
      border: 1px dashed #94a3b8 !important;
      background-color: #fafafa !important;
      margin: 2px auto 3px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 7.2pt;
      color: #64748b;
      width: 80%;
    }
    .official-seal-box {
      height: 40px;
      border: 1px dashed #1e3a8a !important;
      background-color: #f0fdf4 !important;
      margin: 2px auto 3px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 7.2pt;
      color: #1e3a8a;
      width: 80%;
    }
    .sign-line {
      border-top: 1px solid #475569 !important;
      padding-top: 2px;
    }
    .sign-name-bn {
      font-size: 8.2pt;
      font-weight: bold;
      color: #0f172a;
    }
    .sign-title-en {
      font-size: 7.2pt;
      color: #64748b;
    }
    .sign-sub-note {
      font-size: 6.8pt;
      color: #94a3b8;
    }

    .page-break-avoid {
      page-break-inside: avoid;
      break-inside: avoid;
    }
  `;

  const handlePrint = () => {
    if (!printableRef.current) return;

    // Create an isolated hidden iframe to render and print cleanly
    const existingIframe = document.getElementById("lease-agreement-print-iframe");
    if (existingIframe) {
      document.body.removeChild(existingIframe);
    }

    const iframe = document.createElement("iframe");
    iframe.id = "lease-agreement-print-iframe";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const printContents = printableRef.current.innerHTML;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="bn">
        <head>
          <meta charset="utf-8" />
          <title>Pond Lease Agreement - ${lease?.pond?.name || "Agreement"}</title>
          <style>
            ${getFullPrintCSS()}
          </style>
        </head>
        <body>
          <div class="deed-outer-frame">
            ${printContents}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <FileText className="h-4 w-4 mr-2 text-blue-600" />
            Print Agreement / চুক্তিপত্র
          </DropdownMenuItem>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-slate-100">
        {/* Modal Toolbar */}
        <DialogHeader className="px-5 py-3 bg-white border-b flex flex-row items-center justify-between space-y-0 sticky top-0 z-20 shadow-xs">
          <div>
            <DialogTitle className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-800">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              Pond Lease Agreement (পুকুর ইজারা চুক্তিপত্র)
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Official Gram Panchayat Deed format for {lease?.pond?.name || "Pond"}
            </p>
          </div>

          <div className="flex items-center gap-2 pr-6">
            {/* Language Mode Selector */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-lg border text-xs font-medium">
              <button
                type="button"
                onClick={() => setLangMode("bilingual")}
                className={`px-2.5 py-1 rounded transition-all ${
                  langMode === "bilingual"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                বাংলা + English
              </button>
              <button
                type="button"
                onClick={() => setLangMode("bengali")}
                className={`px-2.5 py-1 rounded transition-all ${
                  langMode === "bengali"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setLangMode("english")}
                className={`px-2.5 py-1 rounded transition-all ${
                  langMode === "english"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                English
              </button>
            </div>

            <Button
              onClick={handlePrint}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm font-semibold"
            >
              <Printer className="h-4 w-4" />
              Print Deed
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Printable Document Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex justify-center bg-slate-200/70">
          <style dangerouslySetInnerHTML={{ __html: getFullPrintCSS() }} />
          <div
            ref={printableRef}
            className="deed-outer-frame bg-white text-slate-900 w-full max-w-[210mm] p-5 sm:p-6 border-2 border-blue-900 shadow-xl rounded-xs relative font-serif"
          >
            {/* Subtle Watermark */}
            <div className="watermark-text">
              {gpname}
              <br />
              GOVT. OF WEST BENGAL
            </div>

            <div className="content-layer">
              {/* Header Letterhead */}
              <div className="header-wrap">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "3px" }}>
                  <span className="govt-badge">
                    পশ্চিমবঙ্গ সরকার • Govt. of West Bengal
                  </span>
                </div>
                <div className="dept-title">
                  পঞ্চায়েত ও গ্রামোন্নয়ন দপ্তর • Department of Panchayats &amp; Rural Development
                </div>
                <h1 className="gp-title-bn">
                  ৩ নং ধালপাড়া গ্রাম পঞ্চায়েত কার্যালয়
                </h1>
                <h2 className="gp-title-en">
                  Office of the {gpname}
                </h2>
                <p className="gp-address-text">
                  গ্রাম - কিসমতদাপাট, ডাকঘর - ত্রিমোহিনী, ব্লক ও থানা - {blockname || "হিলি"}, জেলা - দক্ষিণ দিনাজপুর, পশ্চিমবঙ্গ - ৭৩৩১৪৫
                </p>
                <p className="gp-address-sub">
                  Vill-Kismatdapat, P.O.-Trimohini, Block &amp; P.S.-Hili, Dist-Dakshin Dinajpur, West Bengal, PIN-733145
                </p>
              </div>

              {/* Decorative Header Line */}
              <div className="header-divider-line"></div>

              {/* Memo & Date Bar */}
              <div className="memo-date-bar">
                <div>
                  <span style={{ color: "#475569" }}>স্মারক সংখ্যা / Memo No:</span>{" "}
                  <span className="memo-val font-bold">{memoNumber}</span>
                </div>
                <div>
                  <span style={{ color: "#475569" }}>তারিখ / Date:</span>{" "}
                  <span style={{ color: "#0f172a" }}>{agreementDate}</span>
                </div>
              </div>

              {/* Deed Title Ribbon */}
              <div className="deed-title-wrap">
                {(langMode === "bilingual" || langMode === "bengali") && (
                  <div className="deed-title-badge">
                    পুকুর ইজারা বন্দোবস্তের চুক্তিপত্র
                  </div>
                )}
                {(langMode === "bilingual" || langMode === "english") && (
                  <div className="deed-title-en-sub">
                    DEED OF POND LEASE AGREEMENT
                  </div>
                )}
              </div>

              {/* Parties 2-Column Grid */}
              <div className="parties-grid">
                <div className="party-card">
                  <div className="party-card-title">
                    প্রথম পক্ষ (১ম পক্ষ / Lessor - ইজারা প্রদানকারী):
                  </div>
                  <div className="party-card-body">
                    <strong>৩ নং ধালপাড়া গ্রাম পঞ্চায়েত</strong>, পক্ষে প্রধান / কার্যনির্বাহী সহায়ক, গ্রাম - কিসমতদাপাট, ডাকঘর - ত্রিমোহিনী, ব্লক ও থানা - হিলি, জেলা - দক্ষিণ দিনাজপুর, পশ্চিমবঙ্গ - ৭৩৩১৪৫।
                    {(langMode === "bilingual" || langMode === "english") && (
                      <div style={{ fontSize: "7.8pt", color: "#64748b", marginTop: "2px", fontStyle: "italic" }}>
                        (Office of the No. 3 Dhalpara Gram Panchayat, represented by Pradhan / EA)
                      </div>
                    )}
                  </div>
                </div>

                <div className="party-card">
                  <div className="party-card-title">
                    দ্বিতীয় পক্ষ (২য় পক্ষ / Lessee - ইজারাদার / গ্রহীতা):
                  </div>
                  <div className="party-card-body">
                    শ্রী/শ্রীমতী <strong>{lease?.leasePartyName}</strong>
                    {lease?.leasePartyFatherName && (
                      <>, পিতা/স্বামী: <strong>{lease.leasePartyFatherName}</strong></>
                    )}
                    , ঠিকানা: <strong>{fullAddress || "—"}</strong>, মোবাইল: <strong>{lease?.leasePartyMobile || "—"}</strong>।
                    {(langMode === "bilingual" || langMode === "english") && (
                      <div style={{ fontSize: "7.8pt", color: "#64748b", marginTop: "2px", fontStyle: "italic" }}>
                        (Lessee: {lease?.leasePartyName}, Address: {fullAddressEn || "—"}, Mob: {lease?.leasePartyMobile})
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Preamble Covenant */}
              <div className="preamble-box">
                {(langMode === "bilingual" || langMode === "bengali") && (
                  <p>
                    অদ্য <strong>{agreementDate}</strong> তারিখে উভয় পক্ষের পারস্পরিক সম্মতিক্রমে ৩ নং ধালপাড়া গ্রাম পঞ্চায়েতের মালিকানাধীন ও নিয়ন্ত্রিত নিম্ন তফসিলে বর্ণিত সরকারি পুকুরটি মৎস্য চাষ ও উৎপাদনের উদ্দেশ্যে দ্বিতীয় পক্ষকে নির্ধারিত মেয়াদের জন্য ও নির্ধারিত মূল্যে ইজারা বন্দোবস্ত প্রদান করা হইল এবং দ্বিতীয় পক্ষ নিম্নলিখিত শর্তাবলীতে আবদ্ধ থাকিয়া উক্ত ইজারা সানন্দে গ্রহণ করিলেন।
                  </p>
                )}
                {(langMode === "bilingual" || langMode === "english") && (
                  <p style={langMode === "bilingual" ? { fontSize: "7.8pt", color: "#475569", marginTop: "3px", fontStyle: "italic" } : undefined}>
                    This Deed of Lease Agreement is executed on this <strong>{agreementDate}</strong> between <strong>No. 3 Dhalpara Gram Panchayat</strong> (&apos;Lessor&apos; / First Party) and <strong>{lease?.leasePartyName}</strong> (&apos;Lessee&apos; / Second Party) for leasing the government pond detailed below strictly for pisciculture purposes.
                  </p>
                )}
              </div>

              {/* Structured Side-by-Side 2-Column Schedule & Financial Matrix */}
              <div className="matrix-2col">
                {/* Column 1: Pond Schedule */}
                <div className="matrix-col">
                  <div className="matrix-col-header">
                    <span>১. পুকুরের তফসিল ও বিবরণ</span>
                    <span style={{ fontSize: "7.5pt", fontWeight: "normal", opacity: 0.9 }}>Schedule of Pond</span>
                  </div>
                  <table className="matrix-table">
                    <tbody>
                      <tr>
                        <td className="lbl">পুকুরের নাম (Pond)</td>
                        <td className="val" style={{ color: "#1e3a8a", fontWeight: "bold" }}>
                          {lease?.pond?.name || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="lbl">মৌজা (Mouza)</td>
                        <td className="val">{lease?.pond?.mouzaName || "—"}</td>
                      </tr>
                      <tr>
                        <td className="lbl">জে. এল. নং (J.L. No.)</td>
                        <td className="val" style={{ fontFamily: "monospace" }}>{lease?.pond?.jlNo || "—"}</td>
                      </tr>
                      <tr>
                        <td className="lbl">দাগ / প্লট নং (Plot No.)</td>
                        <td className="val" style={{ fontFamily: "monospace", fontWeight: "bold" }}>{lease?.pond?.plotNo || "—"}</td>
                      </tr>
                      <tr>
                        <td className="lbl">মোট আয়তন (Area)</td>
                        <td className="val">
                          {pondAreaDecimal > 0 ? (
                            <span className="area-badge">
                              {pondAreaDecimal} শতক ({pondAreaAcre || "—"})
                            </span>
                          ) : (
                            lease?.pond?.area || "—"
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="lbl">অবস্থান (Location)</td>
                        <td className="val">{lease?.pond?.location || "—"}</td>
                      </tr>
                      <tr>
                        <td className="lbl">পুকুরের ধরণ (Type)</td>
                        <td className="val" style={{ fontSize: "7.8pt" }}>
                          {lease?.pond?.pondType === "PUBLIC"
                            ? "সাধারণ ব্যবহারিক পুকুর (Public)"
                            : "ইজারাযোগ্য পুকুর (Leaseable Tender)"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Column 2: Financial Terms & Duration */}
                <div className="matrix-col">
                  <div className="matrix-col-header">
                    <span>২. আর্থিক বিবরণ ও মেয়াদ</span>
                    <span style={{ fontSize: "7.5pt", fontWeight: "normal", opacity: 0.9 }}>Financials &amp; Period</span>
                  </div>
                  <table className="matrix-table">
                    <tbody>
                      <tr>
                        <td className="lbl">বার্ষিক ইজারা মূল্য (Yearly)</td>
                        <td className="val">{currencyFormatter.format(lease?.leaseAmountYearly || 0)}</td>
                      </tr>
                      <tr>
                        <td className="lbl">মোট চুক্তি মূল্য (Total)</td>
                        <td className="val" style={{ color: "#1e3a8a", fontWeight: "bold" }}>
                          {currencyFormatter.format(lease?.totalAmount || 0)}
                        </td>
                      </tr>
                      <tr>
                        <td className="lbl">জমাকৃত অর্থ (Paid)</td>
                        <td className="val" style={{ color: "#166534" }}>{currencyFormatter.format(lease?.paidAmount || 0)}</td>
                      </tr>
                      <tr>
                        <td className="lbl">অবশিষ্ট বকেয়া (Balance)</td>
                        <td className="val" style={{ color: "#991b1b", fontWeight: "bold" }}>
                          {currencyFormatter.format(lease?.pendingAmount || 0)}
                        </td>
                      </tr>
                      <tr>
                        <td className="lbl">ইজারার সময়কাল (Period)</td>
                        <td className="val font-bold">
                          {lease?.leasePeriod || "1"} বছর ({lease?.leasePeriod || "1"} Year{parseInt(lease?.leasePeriod || "1") > 1 ? "s" : ""})
                        </td>
                      </tr>
                      <tr>
                        <td className="lbl">মেয়াদ সীমা (Date Range)</td>
                        <td className="val" style={{ fontSize: "7.8pt" }}>
                          {formatDate(leaseStartDate)} - {formatDate(leaseEndDate)}
                        </td>
                      </tr>
                      <tr>
                        <td className="lbl">বর্তমান স্থিতি (Status)</td>
                        <td className="val">
                          <span className="status-badge">
                            {lease?.status || "ACTIVE"}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="terms-section">
                <div className="terms-header">
                  <span>৩. চুক্তিপত্রের সাধারণ ও বিশেষ শর্তাবলী</span>
                  <span style={{ fontSize: "7.5pt", fontWeight: "normal", opacity: 0.9 }}>Terms and Conditions of Lease Deed</span>
                </div>
                <ol className="terms-ol">
                  {POND_LEASE_TERMS.map((term, index) => (
                    <li key={index}>
                      {(langMode === "bilingual" || langMode === "bengali") && (
                        <div>
                          <strong className="term-title-bn">{term.titleBn}:</strong>{" "}
                          <span>{term.descriptionBn}</span>
                        </div>
                      )}
                      {(langMode === "bilingual" || langMode === "english") && (
                        <div className="term-en-sub">
                          <strong>{term.title}:</strong> {term.description}
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Remarks (if available) */}
              {lease?.remarks && (
                <div className="remarks-box">
                  <div style={{ fontSize: "7.8pt", fontWeight: "bold", color: "#1e3a8a", textTransform: "uppercase" }}>
                    ৪. বিশেষ বিবরণ / মন্তব্য (Remarks):
                  </div>
                  <div style={{ fontSize: "8.2pt", color: "#1e293b", marginTop: "2px" }}>
                    {lease.remarks}
                  </div>
                </div>
              )}

              {/* Witnesses Box */}
              <div className="witnesses-box">
                <div className="witnesses-title">
                  সাক্ষীগণের স্বাক্ষর ও বিবরণ (Signatures of Witnesses):
                </div>
                <div className="witness-columns">
                  <div className="witness-col">
                    <p style={{ fontWeight: "bold", color: "#1e293b" }}>১নং সাক্ষী (Witness 1):</p>
                    <p>স্বাক্ষর / Signature: ____________________________________</p>
                    <p>নাম / Name: _________________________________________</p>
                    <p>পিতা/স্বামী / Guardian: _________________________________</p>
                    <p>ঠিকানা ও মোবাঃ / Address &amp; Mob: __________________________</p>
                  </div>
                  <div className="witness-col">
                    <p style={{ fontWeight: "bold", color: "#1e293b" }}>২নং সাক্ষী (Witness 2):</p>
                    <p>স্বাক্ষর / Signature: ____________________________________</p>
                    <p>নাম / Name: _________________________________________</p>
                    <p>পিতা/স্বামী / Guardian: _________________________________</p>
                    <p>ঠিকানা ও মোবাঃ / Address &amp; Mob: __________________________</p>
                  </div>
                </div>
              </div>

              {/* Execution and Official Seal Blocks */}
              <div className="exec-signatures-row">
                {/* Lessee Signature Box */}
                <div className="exec-sign-card">
                  <div className="thumb-impression-box">
                    <span>বাম বৃদ্ধাঙ্গুলির ছাপ / LTI Box</span>
                  </div>
                  <div className="sign-line">
                    <p className="sign-name-bn">
                      ২য় পক্ষ / ইজারাদারের স্বাক্ষর ও টিপসই
                    </p>
                    <p className="sign-title-en">
                      Signature / Thumb Impression of Lessee
                    </p>
                    <p style={{ fontSize: "7.8pt", color: "#1e3a8a", fontWeight: "bold", marginTop: "1px" }}>
                      ({lease?.leasePartyName || "—"})
                    </p>
                  </div>
                </div>

                {/* GP Pradhan Signature Box */}
                <div className="exec-sign-card">
                  <div className="official-seal-box">
                    <span>গ্রাম পঞ্চায়েতের সীলমোহর / Official Seal</span>
                  </div>
                  <div className="sign-line">
                    <p className="sign-name-bn">
                      ১ম পক্ষ / প্রধান - ৩ নং ধালপাড়া গ্রাম পঞ্চায়েত
                    </p>
                    <p className="sign-title-en">
                      Pradhan / Executive Assistant, {gpname}
                    </p>
                    <p className="sign-sub-note">
                      (স্বাক্ষর ও সরকারি সীলমোহর)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
