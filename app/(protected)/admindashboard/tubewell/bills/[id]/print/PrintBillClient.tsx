"use client";

import { format } from "date-fns";
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TubewelBill } from "@/components/PrintTemplet/tubewel-bill";

interface PrintBillClientProps {
  bill: any;
  gpProfile: any;
}

export function PrintBillClient({ bill, gpProfile }: PrintBillClientProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const masterRollEntries = bill.workOrders.flatMap(
    (wo: any) => wo.masterRollEntries || [],
  );

  // Collect all unique work types across all master roll entries
  const uniqueWorkTypes: string[] = Array.from(
    new Set(
      masterRollEntries.flatMap((entry: any) =>
        (entry.items || []).map((item: any) => item.workType)
      )
    )
  );

  const rawMaterials = bill.workOrders.flatMap((wo: any) => wo.materials || []);
  const materials = Object.values(
    rawMaterials.reduce((acc: any, curr: any) => {
      const key = curr.materialId || curr.material.id;
      if (!acc[key]) {
        acc[key] = { ...curr };
      } else {
        acc[key].quantity += curr.quantity;
      }
      return acc;
    }, {}),
  );

  const computedTotalLaborCost = masterRollEntries.reduce(
    (sum: number, entry: any) => sum + (entry.total || 0),
    0
  );

  const computedTotalMaterialCost = materials.reduce(
    (sum: number, m: any) => sum + (m.quantity * (m.rate || 0)),
    0
  );

  const computedNetAmount = computedTotalLaborCost + computedTotalMaterialCost;

  const ENTRIES_PER_PAGE = 12;

  // Total columns = 3 (Sl, Name, Village) + qty cols + rate cols + Total
  const totalCols = 3 + uniqueWorkTypes.length * 2 + 1;

  // Split entries into chunks for paging
  const chunks = [];
  for (let i = 0; i < masterRollEntries.length; i += ENTRIES_PER_PAGE) {
    chunks.push(masterRollEntries.slice(i, i + ENTRIES_PER_PAGE));
  }

  // If no entries, still show one empty page
  if (chunks.length === 0) chunks.push([]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 print:bg-white print:p-0 print:m-0 print:overflow-visible">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          /* Force hide common dashboard UI elements */
          aside, header, nav, .sidebar, .topbar, [role="navigation"] {
            display: none 
     !    important;
          }
          
          /* Reset parent layout and main containers */
          html, body, #__next, .flex, .flex-col, main, .main-content {
            display: block !important;
            height: auto !important;
            overflow: visible !important;
            position: static !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            min-height: auto !important;
            background: white !important;

                   }

          /* Ensure the specific main content container doesn't have constraints */
          .flex-1, .lg\\:ml-64, ml-72 {
            margin-left: 0 !important;
            padding: 0 !important;
          }

          /* Show only our bill content */
          .print-bill-container {
            display: block !important;
            visibility: visible !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }

          /* Keep background colors and colors as seen in screen */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* Pagination and break after each page chunk */
          .print-break-after-page {
            page-break-after: always !important;
            break-after: page !important;
            display: block !important;
            margin: 0 !important;
            padding: 1cm !important; /* Some padding for clarity */
          }

          @page {
            margin: 0.5cm;
            size: auto;
          }
        }
      `,
        }}
      />

      <div className="max-w-[1100px] mx-auto space-y-6 print-bill-container">
        <div className="flex items-center justify-between gap-4 print:hidden">
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href={`/admindashboard/tubewell/bills`}>
              <ArrowLeft className="h-4 w-4" /> Back to Bills
            </Link>
          </Button>
          <Button onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" /> Print Bill
          </Button>
          <TubewelBill bill={bill} gpProfile={gpProfile} />
        </div>

        {chunks.map((chunk, chunkIndex) => {
          const pageTotal = chunk.reduce(
            (sum: number, entry: any) => sum + entry.total,
            0,
          );
          const isLastPage = chunkIndex === chunks.length - 1;

          return (
            <div
              key={chunkIndex}
              className="bg-white p-6 md:p-10 text-slate-900 shadow-sm print:shadow-none print:p-2 border border-slate-200 print:border-none print:break-after-page mb-8 last:mb-0"
            >
              {/* Header matching image */}
              <div className="text-center space-y-1 mb-6">
                <h1 className="text-2xl font-bold underline decoration-1 underline-offset-4 tracking-wide">
                  No {gpProfile?.gpcode || "3"}{" "}
                  {gpProfile?.gpname || "Dhalpar Gram Panchayat"}
                </h1>
                <p className="text-base font-semibold">
                  {gpProfile?.gpaddress || "Trimohini, Dakshin Dinajpur"}
                </p>
                <h2 className="text-lg font-bold">Tube Well Muster Roll</h2>
                <p className="text-md font-medium italic underline decoration-1">
                  Bill for Head Mason (Page {chunkIndex + 1} of {chunks.length})
                </p>
              </div>

              {/* Mistri Info */}
              <div className="flex justify-between items-end mb-4 text-sm font-semibold">
                <div className="space-y-1">
                  <p className="flex items-center gap-2">
                    <span>Mistri Name:</span>
                    <span className="border-b border-dotted border-black px-4">
                      {bill.workOrders[0]?.mistri.name}
                    </span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span>Address:</span>
                    <span className="border-b border-dotted border-black px-4">
                      {bill.workOrders[0]?.mistri.address ||
                        ".................................................."}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p>
                    Bill No:{" "}
                    <span className="underline">{bill.billNumber}</span>
                  </p>
                  <p className="text-[10px]">
                    WO(s):{" "}
                    <span className="underline">
                      {bill.workOrders
                        .map((wo: any) => wo.orderNumber)
                        .join(", ")}
                    </span>
                  </p>
                  <p>
                    Date:{" "}
                    <span className="underline">
                      {format(new Date(bill.billDate), "dd/MM/yyyy")}
                    </span>
                  </p>
                </div>
              </div>

              {/* Master Roll Table - Dynamic based on DB work types */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-black text-[10px] text-center">
                  <thead>
                    <tr>
                      <th className="border border-black p-1 w-8" rowSpan={2}>Sl No</th>
                      <th className="border border-black p-1 min-w-[120px]" rowSpan={2}>Name of Place</th>
                      <th className="border border-black p-1 min-w-[100px]" rowSpan={2}>Village/Sansad</th>
                      {uniqueWorkTypes.map(wt => (
                        <th key={wt} className="border border-black p-1 w-12" rowSpan={2}>{wt}</th>
                      ))}
                      {uniqueWorkTypes.length > 0 && (
                        <th className="border border-black p-1" colSpan={uniqueWorkTypes.length}>Cost of</th>
                      )}
                      <th className="border border-black p-1 w-16" rowSpan={2}>Total</th>
                    </tr>
                    <tr>
                      {uniqueWorkTypes.map(wt => (
                        <th key={wt} className="border border-black p-1 w-12">{wt}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chunk.length === 0 ? (
                      <tr>
                        <td colSpan={totalCols} className="border border-black p-4 italic text-slate-400">
                          No master roll entries found.
                        </td>
                      </tr>
                    ) : (
                      chunk.map((entry: any, entryIndex: number) => {
                        // Build a lookup of workType -> item for this entry
                        const itemMap: Record<string, any> = {};
                        (entry.items || []).forEach((item: any) => {
                          itemMap[item.workType] = item;
                        });

                        return (
                          <tr key={entry.id} className="h-8">
                            <td className="border border-black p-1">
                              {chunkIndex * ENTRIES_PER_PAGE + entryIndex + 1}
                            </td>
                            <td className="border border-black p-1 text-left px-2">{entry.nameOfPlace}</td>
                            <td className="border border-black p-1">{entry.villageSansad}</td>
                            {/* Quantity columns */}
                            {uniqueWorkTypes.map(wt => (
                              <td key={wt} className="border border-black p-1">
                                {itemMap[wt]?.quantity > 0 ? itemMap[wt].quantity : ""}
                              </td>
                            ))}
                            {/* Rate columns */}
                            {uniqueWorkTypes.map(wt => (
                              <td key={wt} className="border border-black p-1">
                                {itemMap[wt]?.quantity > 0 ? `₹ ${itemMap[wt].rate.toFixed(2)}` : ""}
                              </td>
                            ))}
                            <td className="border border-black p-1 font-bold">
                              ₹ {entry.total.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                    <tr className="h-8 font-bold bg-slate-50">
                      <td className="border border-black p-1 text-right pr-4" colSpan={totalCols - 1}>
                        Page Total:
                      </td>
                      <td className="border border-black p-1">₹ {formatCurrency(pageTotal)}</td>
                    </tr>
                    {isLastPage && (
                      <tr className="h-8 font-black border-t-2 border-black bg-slate-100">
                        <td className="border border-black p-1 text-right pr-4" colSpan={totalCols - 1}>
                          Grand Total (Labor):
                        </td>
                        <td className="border border-black p-1">₹ {formatCurrency(computedTotalLaborCost)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Materials Section - Only on Last Page */}
              {isLastPage && materials.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-bold underline mb-2">
                    Materials Issued:
                  </h3>
                  <table className="w-full border-collapse border border-black text-[10px] text-center max-w-md">
                    <thead>
                      <tr>
                        <th className="border border-black p-1">Sl</th>
                        <th className="border border-black p-1 text-left">
                          Material
                        </th>
                        <th className="border border-black p-1">Qty</th>
                        <th className="border border-black p-1">Rate</th>
                        <th className="border border-black p-1">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((m: any, i: number) => (
                        <tr key={m.id}>
                          <td className="border border-black p-1">{i + 1}</td>
                          <td className="border border-black p-1 text-left px-2">
                            {m.material.name}
                          </td>
                          <td className="border border-black p-1">
                            {m.quantity} {m.material.unit}
                          </td>
                          <td className="border border-black p-1">₹ {m.rate}</td>
                          <td className="border border-black p-1">
                            ₹ {(m.quantity * m.rate).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-bold">
                        <td
                          className="border border-black p-1 text-right pr-2"
                          colSpan={4}
                        >
                          Subtotal (Materials):
                        </td>
                        <td className="border border-black p-1">
                          ₹ {formatCurrency(computedTotalMaterialCost)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Footer / Summary - Only on Last Page */}
              {isLastPage && (
                <div className="mt-6 flex justify-end">
                  <div className="bg-slate-50 border-2 border-black p-4 rounded-sm text-center min-w-[200px] print:bg-white">
                    <p className="text-xs font-bold uppercase mb-1">
                      Grand Net Payable
                    </p>
                    <p className="text-2xl font-black">
                      ₹ {formatCurrency(computedTotalLaborCost)}
                    </p>
                  </div>
                </div>
              )}

              {/* Signatures on Every Page */}
              <div className="mt-16 grid grid-cols-3 gap-4 text-center items-end text-[10px]">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-16 border-b border-black mb-1"></div>
                  <p className="font-bold uppercase">Prodhan</p>
                  <p>{gpProfile?.gpname || "No. 3 Dhalpara G.P."}</p>
                  <p>{gpProfile?.blockname || "Hili Block"}, D/Dinajpur</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-32 h-16 border-b border-black mb-1"></div>
                  <p className="font-bold uppercase">Executive Assistant</p>
                  <p>{gpProfile?.gpname || "No. 3 Dhalpara Gram Panchayat"}</p>
                  <p>P.O.- Trimohini, Dakshin Dinajpur</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-32 h-16 border-b border-black mb-1"></div>
                  <p className="font-bold uppercase">Nirman Sahayak</p>
                  <p>{gpProfile?.gpname || "No. 3 Dhalpara Gram Panchayat"}</p>
                  <p>Trimohini, D/Dinajpur</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
