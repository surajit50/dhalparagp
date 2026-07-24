"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { formatDate } from "@/utils/utils";
import { gpname, gpaddress } from "@/constants/gpinfor";
import { formatPondLocationDisplay, formatPondAreaAcre, parsePondAreaDecimal } from "@/lib/utils/pond-lease";

interface PondInventoryPrintProps {
  ponds: any[];
}

export function PondInventoryPrint({ ponds }: PondInventoryPrintProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;

    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Pond Inventory - ${gpname}</title>
          <style>
            @media print {
              @page { size: A4 portrait; margin: 1.5cm; }
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-size: 10pt;
              line-height: 1.4;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
            }
            .header h1 {
              margin: 0;
              font-size: 18pt;
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
              font-size: 14pt;
              font-weight: bold;
              margin: 15px 0;
              text-decoration: underline;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }
            th, td {
              border: 1px solid #999;
              padding: 6px 4px;
              text-align: left;
              vertical-align: top;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
              font-size: 9pt;
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
              margin-top: 20px;
              padding: 10px;
              background-color: #f9f9f9;
              border: 1px solid #ddd;
              display: inline-block;
              min-width: 250px;
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

  const available = ponds.filter(p => p.status === "AVAILABLE").length;
  const leased = ponds.filter(p => p.status === "LEASED").length;
  const publicPonds = ponds.filter(p => p.pondType === "PUBLIC" || p.status === "PUBLIC_USE").length;

  return (
    <>
      <Button
        variant="outline"
        onClick={handlePrint}
        className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50 gap-2 h-10"
      >
        <Printer className="h-4 w-4" />
        Print Inventory
      </Button>

      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <div className="header">
            <h1>OFFICE OF THE {gpname}</h1>
            <p>{gpaddress}</p>
          </div>

          <div className="report-title">POND INVENTORY REGISTER</div>

          <p>
            Report Generated on: <strong>{formatDate(new Date())}</strong>
          </p>

          <table>
            <thead>
              <tr>
                <th style={{ width: "5%" }}>Sl.</th>
                <th style={{ width: "25%" }}>Pond Name</th>
                <th style={{ width: "30%" }}>Location Details</th>
                <th style={{ width: "20%" }}>Area</th>
                <th style={{ width: "20%" }}>Current Status</th>
              </tr>
            </thead>
            <tbody>
              {ponds.map((pond, index) => {
                const areaDec = pond.area ? parsePondAreaDecimal(pond.area) : 0;
                let statusText = "AVAILABLE";
                if (pond.pondType === "PUBLIC" || pond.status === "PUBLIC_USE") statusText = "PUBLIC USE";
                else if (pond.status === "LEASED") statusText = "LEASED";

                return (
                  <tr key={pond.id}>
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: "bold" }}>{pond.name}</td>
                    <td>{formatPondLocationDisplay(pond)}</td>
                    <td>
                      {pond.area ? (
                        <>
                          {pond.area} Dec<br/>
                          <span style={{ fontSize: "8pt", color: "#666" }}>
                            {formatPondAreaAcre(areaDec)}
                          </span>
                        </>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td style={{ fontWeight: "bold" }}>
                      {statusText}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="summary">
            <div style={{ fontWeight: "bold", marginBottom: "5px" }}>Summary</div>
            <div>Total Ponds: <strong>{ponds.length}</strong></div>
            <div>Available: <strong>{available}</strong></div>
            <div>Leased: <strong>{leased}</strong></div>
            <div>Public Use: <strong>{publicPonds}</strong></div>
          </div>

          <div className="footer">
            <div className="sig-box">
              <div className="sig-line"></div>
              <p>Prepared By</p>
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
