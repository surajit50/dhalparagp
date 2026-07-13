"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer, FileText } from "lucide-react";
import { addYears, getYear } from "date-fns";
import { formatDate } from "@/utils/utils";
import { gpname, gpaddress } from "@/constants/gpinfor";

interface PendingListPrintProps {
  leases: any[];
}

export function PendingListPrint({ leases }: PendingListPrintProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const pendingLeases = leases.filter((lease) => lease.pendingAmount > 0);

  const handlePrint = () => {
    if (!printRef.current) return;

    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Pending Lease Payments - ${gpname}</title>
          <style>
            @media print {
              @page { size: A4 landscape; margin: 1.5cm; }
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 10pt;
              line-height: 1.4;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
            }
            .header h1 {
              margin: 0;
              font-size: 20pt;
              font-weight: bold;
              text-transform: uppercase;
            }
            .header p {
              margin: 5px 0 0;
              font-size: 10pt;
              color: #666;
            }
            .report-title {
              text-align: center;
              font-size: 16pt;
              font-weight: bold;
              margin: 20px 0;
              text-decoration: underline;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #999;
              padding: 8px 6px;
              text-align: left;
              vertical-align: top;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
              font-size: 9pt;
            }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .year-breakdown {
              font-size: 8pt;
              color: #555;
              margin-top: 4px;
            }
            .footer {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
            }
            .sig-box {
              text-align: center;
              width: 200px;
            }
            .sig-line {
              border-top: 1px solid #333;
              margin-top: 40px;
            }
            .summary {
              margin-top: 30px;
              padding: 15px;
              background-color: #f9f9f9;
              border: 1px solid #ddd;
              display: inline-block;
              min-width: 300px;
            }
          </style>
        </head>
        <body>
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

  const totalPending = pendingLeases.reduce((sum, l) => sum + l.pendingAmount, 0);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
      >
        <Printer className="h-4 w-4 mr-2" />
        Print Pending List
      </Button>

      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <div className="header">
            <h1>OFFICE OF THE {gpname}</h1>
            <p>{gpaddress}</p>
          </div>

          <div className="report-title">PENDING LEASE PAYMENT REPORT</div>

          <p>
            Report Generated on: <strong>{formatDate(new Date())}</strong>
          </p>

          <table>
            <thead>
              <tr>
                <th style={{ width: "5%" }}>Sl.</th>
                <th style={{ width: "20%" }}>Pond & Location</th>
                <th style={{ width: "20%" }}>Lessee Details</th>
                <th style={{ width: "15%" }}>Lease Period</th>
                <th style={{ width: "10%" }}>Yearly Due</th>
                <th style={{ width: "10%" }}>Total Paid</th>
                <th style={{ width: "20%" }}>Pending Breakdown</th>
              </tr>
            </thead>
            <tbody>
              {pendingLeases.map((lease, index) => {
                const totalPaid = Number(lease.paidAmount) || 0;
                const yearlyAmount = Number(lease.leaseAmountYearly) || 0;
                let remainingPaid = totalPaid;

                const breakdown = [];
                for (let i = 0; i < parseInt(lease.leasePeriod || "1"); i++) {
                  const yearStart = addYears(new Date(lease.leaseStartDate), i);
                  const paidForThisYear = Math.min(remainingPaid, yearlyAmount);
                  remainingPaid -= paidForThisYear;
                  const pendingForYear = yearlyAmount - paidForThisYear;

                  if (pendingForYear > 0) {
                    breakdown.push({
                      year: getYear(yearStart),
                      amount: pendingForYear,
                      index: i + 1,
                    });
                  }
                }

                return (
                  <tr key={lease.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="font-bold">{lease.pond.name}</div>
                      <div style={{ fontSize: "8pt", color: "#666" }}>
                        {lease.pond.location}
                      </div>
                    </td>
                    <td>
                      <div className="font-bold">{lease.leasePartyName}</div>
                      <div style={{ fontSize: "8pt", color: "#666" }}>
                        Mob: {lease.leasePartyMobile}
                      </div>
                    </td>
                    <td>
                      {formatDate(new Date(lease.leaseStartDate))} to
                      <br />
                      {formatDate(new Date(lease.leaseEndDate))}
                    </td>
                    <td className="text-right">{currency.format(yearlyAmount)}</td>
                    <td className="text-right">{currency.format(totalPaid)}</td>
                    <td className="text-right font-bold">
                      {currency.format(lease.pendingAmount)}
                      {breakdown.map((item) => (
                        <div key={item.year} className="year-breakdown">
                          Year {item.index} ({item.year}):{" "}
                          {currency.format(item.amount)}
                        </div>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="summary">
            <div
              style={{
                fontSize: "11pt",
                fontWeight: "bold",
                marginBottom: "10px",
                borderBottom: "1px solid #ddd",
                paddingBottom: "5px",
              }}
            >
              Summary Statement
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "5px",
              }}
            >
              <span>Total Number of Pending Leases:</span>
              <strong>{pendingLeases.length}</strong>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12pt",
                color: "#d32f2f",
              }}
            >
              <span>Total Outstanding Amount:</span>
              <strong>{currency.format(totalPending)}</strong>
            </div>
          </div>

          <div className="footer">
            <div className="sig-box">
              <div className="sig-line"></div>
              <p>Prepared By</p>
            </div>
            <div className="sig-box">
              <div className="sig-line"></div>
              <p>Executive Assistant / Secretary</p>
              <p>{gpname}</p>
            </div>
            <div className="sig-box">
              <div className="sig-line"></div>
              <p>Prodhan</p>
              <p>{gpname}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
