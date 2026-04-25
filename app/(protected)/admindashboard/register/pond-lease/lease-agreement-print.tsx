"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import { gpname, gpaddress } from "@/constants/gpinfor";
import { POND_LEASE_TERMS } from "@/constants/pond-lease-terms";

interface LeaseAgreementPrintProps {
  lease: any;
}

export function LeaseAgreementPrint({ lease }: LeaseAgreementPrintProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;

    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Lease Agreement - ${lease.pond.name}</title>
          <style>
            @media print {
              @page { size: A4; margin: 2cm; }
            }
            body {
              font-family: 'Georgia', 'Times New Roman', Times, serif;
              font-size: 12pt;
              line-height: 1.5;
              color: #1a1a1a;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            .header h1 {
              margin: 0;
              font-size: 22pt;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .header p {
              margin: 5px 0 0;
              font-size: 11pt;
              color: #555;
            }
            .title-wrapper {
              text-align: center;
              margin-bottom: 40px;
            }
            .title {
              text-align: center;
              font-weight: bold;
              font-size: 16pt;
              margin-bottom: 30px;
              padding-bottom: 5px;
              border-bottom: 2px solid #000;
              display: inline-block;
            }
            .section { margin-bottom: 25px; }
            .section-title {
              font-weight: bold;
              font-size: 14pt;
              margin-bottom: 15px;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
            }
            .details-table {
              width: 100%;
              border-collapse: collapse;
            }
            .details-table td {
              padding: 10px 0;
              vertical-align: top;
              border-bottom: 1px solid #f0f0f0;
            }
            .details-table td:first-child {
              width: 30%;
              font-weight: bold;
              color: #444;
            }
            .terms-list {
              list-style-type: decimal;
              padding-left: 20px;
            }
            .terms-list li {
              margin-bottom: 10px;
            }
            .signatures {
              margin-top: 100px;
              padding-top: 20px;
              display: flex;
              justify-content: space-between;
              border-top: 1px solid #eee;
            }
            .signature-box {
              text-align: center;
              width: 250px;
            }
            .signature-line {
              border-bottom: 1px solid #333;
              margin-top: 60px;
              margin-bottom: 10px;
            }
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 120px;
              color: #000;
              opacity: 0.04;
              z-index: -1;
              pointer-events: none;
              white-space: nowrap;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="watermark">${gpname}</div>
          ${content}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  });

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePrint}
        className="w-full justify-start font-normal"
      >
        <Printer className="h-4 w-4 mr-2" />
        Print Agreement
      </Button>

      {/* Hidden Print Content */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <div className="header">
            <h1>Office of the {gpname}</h1>
            <p>{gpaddress}</p>
          </div>

          <div className="title-wrapper">
            <div className="title">POND LEASE AGREEMENT</div>
          </div>

          <div className="section">
            <p>
              This agreement is made on this{" "}
              <strong>{format(new Date(), "do 'day of' MMMM, yyyy")}</strong>{" "}
              between the <strong>{gpname}</strong> (hereinafter referred to as
              the &apos;Lessor&apos;) and{" "}
              <strong>{lease.leasePartyName}</strong> (hereinafter referred to
              as the &apos;Lessee&apos;).
            </p>
          </div>

          <div className="section">
            <h2 className="section-title">Lease Details</h2>
            <table className="details-table">
              <tbody>
                <tr>
                  <td>Pond Name</td>
                  <td>{lease.pond.name}</td>
                </tr>
                <tr>
                  <td>Location</td>
                  <td>{lease.pond.location}</td>
                </tr>
                <tr>
                  <td>Lessee Name</td>
                  <td>{lease.leasePartyName}</td>
                </tr>
                <tr>
                  <td>Mobile Number</td>
                  <td>{lease.leasePartyMobile}</td>
                </tr>
                <tr>
                  <td>Address</td>
                  <td>{lease.leasePartyAddress || "N/A"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="section">
            <h2 className="section-title">Financial Terms</h2>
            <table className="details-table">
              <tbody>
                <tr>
                  <td>Yearly Lease Amount</td>
                  <td>{currency.format(lease.leaseAmountYearly)}</td>
                </tr>
                <tr>
                  <td>Total Lease Amount</td>
                  <td>{currency.format(lease.totalAmount)}</td>
                </tr>
                <tr>
                  <td>Amount Paid (Till Date)</td>
                  <td>{currency.format(lease.paidAmount)}</td>
                </tr>
                <tr>
                  <td>Outstanding Amount</td>
                  <td>{currency.format(lease.pendingAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="section">
            <h2 className="section-title">Lease Period</h2>
            <table className="details-table">
              <tbody>
                <tr>
                  <td>Start Date</td>
                  <td>
                    {format(new Date(lease.leaseStartDate), "dd MMM yyyy")}
                  </td>
                </tr>
                <tr>
                  <td>End Date</td>
                  <td>
                    {format(new Date(lease.leaseEndDate), "dd MMM yyyy")}
                  </td>
                </tr>
                <tr>
                  <td>Lease Duration</td>
                  <td>
                    {lease.leasePeriod} Year{parseInt(lease.leasePeriod) > 1 ? "s" : ""}
                  </td>
                </tr>
                <tr>
                  <td>Lease Status</td>
                  <td>{lease.status}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="section">
            <h2 className="section-title">Terms & Conditions</h2>
            <ol className="terms-list">
              {POND_LEASE_TERMS.map((term, index) => (
                <li key={index}>
                  <strong>{term.title}:</strong> {term.description}
                </li>
              ))}
            </ol>
          </div>

          {lease.remarks && (
            <div className="section">
              <h2 className="section-title">Remarks</h2>
              <p>{lease.remarks}</p>
            </div>
          )}

          <div className="signatures">
            <div className="signature-box">
              <div className="signature-line"></div>
              <p>Signature of Lessee</p>
            </div>
            <div className="signature-box">
              <div className="signature-line"></div>
              <p>Prodhan/Executive Assistant</p>
              <p>{gpname}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
