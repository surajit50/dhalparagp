"use client";

import { useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { formatDate } from "@/utils/utils";
import { blockname, gpname, nameinprodhan } from "@/constants/gpinfor";

interface LeaseCollectionListPrintProps {
  leases: any[];
  ponds: any[];
}

type ReportRow = {
  pond: any;
  lease: any | null;
};

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);
}

function getLeasePeriod(lease: any) {
  if (!lease?.leaseStartDate || !lease?.leaseEndDate) return "";
  return `${formatDate(new Date(lease.leaseStartDate))} to ${formatDate(new Date(lease.leaseEndDate))}`;
}

export function LeaseCollectionListPrint({
  leases,
  ponds,
}: LeaseCollectionListPrintProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const rows = useMemo<ReportRow[]>(() => {
    const leaseByPond = new Map<string, any>();

    for (const lease of leases) {
      const existing = leaseByPond.get(lease.pondId);
      if (
        !existing ||
        new Date(lease.createdAt) > new Date(existing.createdAt)
      ) {
        leaseByPond.set(lease.pondId, lease);
      }
    }

    return ponds
      .map((pond) => ({
        pond,
        lease: leaseByPond.get(pond.id) ?? null,
      }))
      .sort((a, b) => a.pond.name.localeCompare(b.pond.name));
  }, [leases, ponds]);

  const handlePrint = () => {
    if (!printRef.current) return;

    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Lease Collection List - ${gpname}</title>
          <style>
            @media print {
              @page { size: A4 landscape; margin: 1cm; }
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              font-size: 9pt;
              line-height: 1.3;
              color: #000;
            }
            .report-title {
              text-align: center;
              font-size: 12pt;
              font-weight: bold;
              margin-bottom: 12px;
              text-decoration: underline;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid #000;
              padding: 4px 3px;
              text-align: center;
              vertical-align: middle;
              font-size: 8pt;
            }
            th {
              font-weight: bold;
            }
            .text-left { text-align: left; }
            .footer {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
            }
            .sig-box {
              width: 40%;
              text-align: center;
              font-size: 9pt;
            }
            .sig-line {
              border-top: 1px solid #000;
              margin-top: 50px;
              padding-top: 4px;
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

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        disabled={rows.length === 0}
        className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
      >
        <Printer className="h-4 w-4 mr-2" />
        Print Collection List
      </Button>

      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <div className="report-title">
            List of Pond from where lease amount collected
          </div>

          <table>
            <thead>
              <tr>
                <th style={{ width: "4%" }}>Sl No</th>
                <th style={{ width: "10%" }}>Name of Panchayat Samiti</th>
                <th style={{ width: "10%" }}>Name of Gram Panchayat</th>
                <th style={{ width: "8%" }}>Name of Sansad</th>
                <th style={{ width: "14%" }}>
                  Location of the Pond
                  <br />
                  (JL No, Plot No)
                </th>
                <th style={{ width: "8%" }}>Name of owner GP/PS</th>
                <th style={{ width: "7%" }}>
                  Whether lease out?
                  <br />
                  (yes/no)
                </th>
                <th style={{ width: "12%" }}>Period of lease out?</th>
                <th style={{ width: "10%" }}>Name of lessee</th>
                <th style={{ width: "8%" }}>Amount of lease</th>
                <th style={{ width: "9%" }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ pond, lease }, index) => {
                const paidAmount = Number(lease?.paidAmount) || 0;
                const isLeasedOut = Boolean(lease);

                return (
                  <tr key={pond.id}>
                    <td>{index + 1}</td>
                    <td>{blockname}</td>
                    <td>{nameinprodhan}</td>
                    <td>-</td>
                    <td className="text-left">
                      {pond.name}
                      {pond.location ? ` — ${pond.location}` : ""}
                    </td>
                    <td>GP</td>
                    <td>{isLeasedOut ? "Yes" : "No"}</td>
                    <td>{getLeasePeriod(lease)}</td>
                    <td className="text-left">{lease?.leasePartyName || "-"}</td>
                    <td>{paidAmount > 0 ? formatAmount(paidAmount) : "-"}</td>
                    <td className="text-left">{lease?.remarks || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="footer">
            <div className="sig-box">
              <div className="sig-line">Counter signature of Pradhan</div>
            </div>
            <div className="sig-box">
              <div className="sig-line">
                Signature of Executive Assistant/Secretary
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
