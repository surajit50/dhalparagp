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
import { formatDate, getFinancialYear } from "@/utils/utils";
import { differenceInYears } from "date-fns";
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
  
  // Agreement date is the start date of the lease
  const agreementDate = formatDate(leaseStartDate);
  
  // Financial Year determined by the first date of agreement start (e.g. "2024-25")
  const startFinancialYear = getFinancialYear(leaseStartDate);
  
  // Calculate total period in years based on start and end dates
  const calculatedYears = Math.max(1, differenceInYears(leaseEndDate, leaseStartDate));
  const leasePeriod = lease?.leasePeriod ? Number(lease.leasePeriod) : calculatedYears;

  const memoNumber = `GP/${gpcode || "DGP"}/POND-LEASE/${startFinancialYear}/${(lease?.id || "0000").slice(-4).toUpperCase()}`;

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

  const totalAmount = lease?.totalAmount || 0;
  const yearlyAmount = lease?.leaseAmountYearly || 0;

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
      font-family: 'Cambria', 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1a1a1a;
    }
    .container {
      max-width: 7.5in;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 12pt;
      border-bottom: 2pt solid #000;
      padding-bottom: 6pt;
    }
    .header-title {
      font-size: 14pt;
      font-weight: bold;
      letter-spacing: 0.5pt;
    }
    .header-gp {
      font-size: 10pt;
      margin-top: 2pt;
    }
    .memo-number {
      text-align: right;
      font-size: 9pt;
      margin-bottom: 8pt;
      font-style: italic;
    }
    .section-title {
      font-size: 11pt;
      font-weight: bold;
      margin-top: 10pt;
      margin-bottom: 6pt;
      border-bottom: 1pt dashed #666;
      padding-bottom: 2pt;
      text-transform: uppercase;
      letter-spacing: 0.3pt;
    }
    .party-info {
      margin-bottom: 8pt;
    }
    .info-row {
      display: flex;
      margin-bottom: 4pt;
      font-size: 10pt;
    }
    .info-label {
      font-weight: bold;
      width: 120pt;
    }
    .info-value {
      flex: 1;
    }
    .terms {
      margin-top: 10pt;
      font-size: 10pt;
    }
    .term-item {
      margin-bottom: 8pt;
      text-align: justify;
      line-height: 1.4;
    }
    .term-number {
      font-weight: bold;
      display: inline-block;
      min-width: 20pt;
    }
    .financial-summary {
      background: #f5f5f5;
      border: 1pt solid #999;
      padding: 8pt;
      margin: 10pt 0;
      font-size: 10pt;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4pt;
    }
    .summary-label {
      font-weight: bold;
    }
    .summary-value {
      text-align: right;
      font-weight: bold;
    }
    .footer {
      margin-top: 20pt;
      display: flex;
      justify-content: space-between;
      font-size: 10pt;
    }
    .signature-box {
      text-align: center;
      width: 150pt;
    }
    .sig-line {
      border-top: 1pt solid #000;
      margin-top: 30pt;
      padding-top: 4pt;
      font-weight: bold;
    }
    .page-break {
      page-break-after: always;
    }
    @media print {
      body { margin: 0; padding: 0; }
    }
  `;

  const handlePrint = () => {
    if (!printableRef.current) return;

    const content = printableRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Pond Lease Agreement - ${lease?.leasePartyName}</title>
          <style>${getFullPrintCSS()}</style>
        </head>
        <body>
          ${content}
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const AgreementContent = () => {
    if (langMode === "bengali") {
      return (
        <div className="container">
          <div className="header">
            <div className="header-title">{gpname}</div>
            <div className="header-gp">পুকুর ইজারা চুক্তিপত্র</div>
          </div>

          <div className="memo-number">মেমো নং: {memoNumber}</div>
          <div className="memo-number">তারিখ: {agreementDate}</div>

          <div className="section-title">চুক্তির পক্ষসমূহ</div>
          <div className="party-info">
            <div className="info-row">
              <span className="info-label">১. স্থানীয় সংস্থা:</span>
              <span className="info-value">{gpname}</span>
            </div>
            <div className="info-row">
              <span className="info-label">২. ইজারাকৃত:</span>
              <span className="info-value">{lease?.leasePartyName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">পিতার নাম:</span>
              <span className="info-value">{lease?.leasePartyFatherName || "—"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">ঠিকানা:</span>
              <span className="info-value">{fullAddress || "—"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">মোবাইল:</span>
              <span className="info-value">{lease?.leasePartyMobile}</span>
            </div>
          </div>

          <div className="section-title">পুকুর বিবরণ</div>
          <div className="party-info">
            <div className="info-row">
              <span className="info-label">পুকুরের নাম:</span>
              <span className="info-value">{lease?.pond?.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">অবস্থান:</span>
              <span className="info-value">{lease?.pond?.location}</span>
            </div>
            {pondAreaDecimal > 0 && (
              <>
                <div className="info-row">
                  <span className="info-label">ক্ষেত্রফল (ডেসিমেল):</span>
                  <span className="info-value">{pondAreaDecimal} ডেসিমেল</span>
                </div>
                <div className="info-row">
                  <span className="info-label">ক্ষেত্রফল (একর):</span>
                  <span className="info-value">{pondAreaAcre}</span>
                </div>
              </>
            )}
          </div>

          <div className="section-title">ইজারা শর্তাবলী</div>
          <div className="party-info">
            <div className="info-row">
              <span className="info-label">ইজারা শুরু:</span>
              <span className="info-value">{formatDate(leaseStartDate)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">ইজারা শেষ:</span>
              <span className="info-value">{formatDate(leaseEndDate)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">ইজারার মেয়াদ:</span>
              <span className="info-value">{leasePeriod} বছর</span>
            </div>
          </div>

          <div className="financial-summary">
            <div className="summary-row">
              <span className="summary-label">মোট ইজারা পরিমাণ:</span>
              <span className="summary-value">₹ {totalAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">বার্ষিক পরিমাণ:</span>
              <span className="summary-value">₹ {yearlyAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="section-title">শর্ত ও নিয়মাবলী</div>
          <div className="terms">
            {POND_LEASE_TERMS.map((term, index) => (
              <div key={index} className="term-item">
                <span className="term-number">{index + 1}.</span>
                <span>{term.descriptionBn}</span>
              </div>
            ))}
          </div>

          <div className="footer">
            <div className="signature-box">
              <div className="sig-line">ইজারাকৃত</div>
            </div>
            <div className="signature-box">
              <div className="sig-line">প্রধান</div>
              <div style={{ marginTop: "4pt" }}>{gpname}</div>
            </div>
          </div>
        </div>
      );
    }

    if (langMode === "english") {
      return (
        <div className="container">
          <div className="header">
            <div className="header-title">{gpname}</div>
            <div className="header-gp">Pond Lease Agreement</div>
          </div>

          <div className="memo-number">Memo No: {memoNumber}</div>
          <div className="memo-number">Date: {agreementDate}</div>

          <div className="section-title">Parties to the Agreement</div>
          <div className="party-info">
            <div className="info-row">
              <span className="info-label">1. Gram Panchayat:</span>
              <span className="info-value">{gpname}</span>
            </div>
            <div className="info-row">
              <span className="info-label">2. Lessee:</span>
              <span className="info-value">{lease?.leasePartyName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Father's Name:</span>
              <span className="info-value">{lease?.leasePartyFatherName || "—"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Address:</span>
              <span className="info-value">{fullAddressEn || "—"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Mobile:</span>
              <span className="info-value">{lease?.leasePartyMobile}</span>
            </div>
          </div>

          <div className="section-title">Pond Details</div>
          <div className="party-info">
            <div className="info-row">
              <span className="info-label">Pond Name:</span>
              <span className="info-value">{lease?.pond?.name}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Location:</span>
              <span className="info-value">{lease?.pond?.location}</span>
            </div>
            {pondAreaDecimal > 0 && (
              <>
                <div className="info-row">
                  <span className="info-label">Area (Decimal):</span>
                  <span className="info-value">{pondAreaDecimal} Decimal</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Area (Acre):</span>
                  <span className="info-value">{pondAreaAcre}</span>
                </div>
              </>
            )}
          </div>

          <div className="section-title">Lease Terms</div>
          <div className="party-info">
            <div className="info-row">
              <span className="info-label">Lease Start Date:</span>
              <span className="info-value">{formatDate(leaseStartDate)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Lease End Date:</span>
              <span className="info-value">{formatDate(leaseEndDate)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Lease Period:</span>
              <span className="info-value">{leasePeriod} Year{leasePeriod > 1 ? "s" : ""}</span>
            </div>
          </div>

          <div className="financial-summary">
            <div className="summary-row">
              <span className="summary-label">Total Lease Amount:</span>
              <span className="summary-value">₹ {totalAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Yearly Amount:</span>
              <span className="summary-value">₹ {yearlyAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <div className="section-title">Terms and Conditions</div>
          <div className="terms">
            {POND_LEASE_TERMS.map((term, index) => (
              <div key={index} className="term-item">
                <span className="term-number">{index + 1}.</span>
                <span>{term.description}</span>
              </div>
            ))}
          </div>

          <div className="footer">
            <div className="signature-box">
              <div className="sig-line">Lessee</div>
            </div>
            <div className="signature-box">
              <div className="sig-line">Head</div>
              <div style={{ marginTop: "4pt" }}>{gpname}</div>
            </div>
          </div>
        </div>
      );
    }

    // Bilingual
    return (
      <div className="container">
        <div className="header">
          <div className="header-title">{gpname}</div>
          <div className="header-gp">Pond Lease Agreement / পুকুর ইজারা চুক্তিপত্র</div>
        </div>

        <div className="memo-number">Memo No: {memoNumber} | মেমো নং: {memoNumber}</div>
        <div className="memo-number">Date: {agreementDate} | তারিখ: {agreementDate}</div>

        <div className="section-title">Parties to the Agreement | চুক্তির পক্ষসমূহ</div>
        <div className="party-info">
          <div className="info-row">
            <span className="info-label">1. Gram Panchayat / গ্রাম পঞ্চায়েত:</span>
            <span className="info-value">{gpname}</span>
          </div>
          <div className="info-row">
            <span className="info-label">2. Lessee / ইজারাকৃত:</span>
            <span className="info-value">{lease?.leasePartyName}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Father's Name / পিতার নাম:</span>
            <span className="info-value">{lease?.leasePartyFatherName || "—"}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Address / ঠিকানা:</span>
            <span className="info-value">{fullAddressEn || "—"}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Mobile / মোবাইল:</span>
            <span className="info-value">{lease?.leasePartyMobile}</span>
          </div>
        </div>

        <div className="section-title">Pond Details | পুকুর বিবরণ</div>
        <div className="party-info">
          <div className="info-row">
            <span className="info-label">Pond Name / পুকুরের নাম:</span>
            <span className="info-value">{lease?.pond?.name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Location / অবস্থান:</span>
            <span className="info-value">{lease?.pond?.location}</span>
          </div>
          {pondAreaDecimal > 0 && (
            <>
              <div className="info-row">
                <span className="info-label">Area (Decimal) / ক্ষেত্রফল (ডেসিমেল):</span>
                <span className="info-value">{pondAreaDecimal} Decimal / ডেসিমেল</span>
              </div>
              <div className="info-row">
                <span className="info-label">Area (Acre) / ক্ষেত্রফল (একর):</span>
                <span className="info-value">{pondAreaAcre}</span>
              </div>
            </>
          )}
        </div>

        <div className="section-title">Lease Terms | ইজারা শর্তাবলী</div>
        <div className="party-info">
          <div className="info-row">
            <span className="info-label">Lease Start Date / ইজারা শুরু:</span>
            <span className="info-value">{formatDate(leaseStartDate)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Lease End Date / ইজারা শেষ:</span>
            <span className="info-value">{formatDate(leaseEndDate)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Lease Period / ইজারার মেয়াদ:</span>
            <span className="info-value">
              {leasePeriod} Year{leasePeriod > 1 ? "s" : ""} / {leasePeriod} বছর
            </span>
          </div>
        </div>

        <div className="financial-summary">
          <div className="summary-row">
            <span className="summary-label">Total Lease Amount / মোট ইজারা পরিমাণ:</span>
            <span className="summary-value">₹ {totalAmount.toLocaleString("en-IN")}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Yearly Amount / বার্ষিক পরিমাণ:</span>
            <span className="summary-value">₹ {yearlyAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="section-title">Terms and Conditions | শর্ত ও নিয়মাবলী</div>
        <div className="terms">
          {POND_LEASE_TERMS.map((term, index) => (
            <div key={index} className="term-item">
              <span className="term-number">{index + 1}.</span>
              <span>{term.description}</span>
              <div style={{ marginTop: "4pt", marginLeft: "20pt", fontStyle: "italic" }}>
                {term.descriptionBn}
              </div>
            </div>
          ))}
        </div>

        <div className="footer">
          <div className="signature-box">
            <div className="sig-line">Lessee / ইজারাকৃত</div>
          </div>
          <div className="signature-box">
            <div className="sig-line">Head / প্রধান</div>
            <div style={{ marginTop: "4pt" }}>{gpname}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <FileText className="h-4 w-4 mr-2" />
            Print Agreement
          </DropdownMenuItem>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <DialogTitle>Pond Lease Agreement</DialogTitle>
          </div>
          <div className="flex gap-2 pr-6">
            <select
              value={langMode}
              onChange={(e) => setLangMode(e.target.value as LanguageMode)}
              className="px-3 py-2 text-sm border rounded-md"
            >
              <option value="bilingual">Bilingual</option>
              <option value="english">English</option>
              <option value="bengali">Bengali</option>
            </select>
            <Button size="sm" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </DialogHeader>

        <div
          ref={printableRef}
          className="p-8 bg-white text-black"
          style={{ fontFamily: "Cambria, serif" }}
        >
          <AgreementContent />
        </div>
      </DialogContent>
    </Dialog>
  );
}
