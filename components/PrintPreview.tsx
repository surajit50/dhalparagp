import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Printer } from "lucide-react";
import { convertToWords } from "@/utils/convertToWords";
import { useState } from "react";

interface PrintPreviewProps {
  showPreview: boolean;
  setShowPreview: (value: boolean) => void;
  projectInfo: any;
  items: any[];
  contingency: number;
  itemTotal: number;
  gst: number;
  costExclLWC: number;
  lwc: number;
  costInclLWC: number;
  finalCost: number;
}

export default function PrintPreview({
  showPreview,
  setShowPreview,
  projectInfo,
  items,
  contingency,
  itemTotal,
  gst,
  costExclLWC,
  lwc,
  costInclLWC,
  finalCost,
}: PrintPreviewProps) {
  const [viewMode, setViewMode] = useState<"detailed" | "abstract">("detailed");

  const handlePrint = () => {
    const element = document.getElementById("estimate-print");
    if (!element) {
      alert("Preview element not found");
      return;
    }

    const printWindow = window.open("", "", "height=500,width=800");
    if (!printWindow) {
      alert("Please allow popups to print");
      return;
    }

    printWindow.document.write("<html><head><title>Estimate</title>");
    printWindow.document.write(
      '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">'
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write(element.innerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (!showPreview) return null;

  return (
    <Card className="border-0 shadow-lg mt-8">
      <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white flex flex-row items-center justify-between">
        <CardTitle>Print Preview</CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-800/50 rounded-lg p-1">
            <Button
              variant={viewMode === "detailed" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("detailed")}
              className="text-xs h-8"
            >
              Detailed Estimate
            </Button>
            <Button
              variant={viewMode === "abstract" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("abstract")}
              className="text-xs h-8"
            >
              Abstract Estimate
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handlePrint}
              className="h-8 gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowPreview(false)}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div
          id="estimate-print"
          className="bg-white p-12 text-slate-900 space-y-6"
        >
          {/* HEADER */}
          <div className="border-b-2 border-slate-300 pb-6">
            <h1 className="text-3xl font-bold text-center text-orange-600 mb-2">
              {viewMode === "detailed"
                ? "DETAILED ESTIMATE"
                : "ABSTRACT ESTIMATE"}
            </h1>
            <div className="text-center text-sm text-slate-700 space-y-1">
              <p className="font-semibold">
                Project: {projectInfo.projectName || "---"}
              </p>
              <p>
                Code: {projectInfo.projectCode || "---"} | Location:{" "}
                {projectInfo.location || "---"}
              </p>
              <p>
                Prepared By: {projectInfo.preparedBy || "---"} | Date:{" "}
                {projectInfo.date}
              </p>
            </div>
          </div>

          {/* TABLE */}
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-200">
                <th className="border border-slate-400 px-2 py-2 text-left font-bold w-12">
                  Sl No
                </th>
                <th className="border border-slate-400 px-2 py-2 text-left font-bold w-20">
                  Page/Schedule
                </th>
                <th className="border border-slate-400 px-2 py-2 text-left font-bold">
                  Items of Work
                </th>
                {viewMode === "detailed" && (
                  <>
                    <th className="border border-slate-400 px-2 py-2 text-center font-bold w-16">
                      Nos
                    </th>
                    <th className="border border-slate-400 px-2 py-2 text-center font-bold w-16">
                      Length (M)
                    </th>
                    <th className="border border-slate-400 px-2 py-2 text-center font-bold w-16">
                      Breadth (M)
                    </th>
                    <th className="border border-slate-400 px-2 py-2 text-center font-bold w-16">
                      Depth (M)
                    </th>
                  </>
                )}
                <th className="border border-slate-400 px-2 py-2 text-right font-bold w-20">
                  Quantity
                </th>
                <th className="border border-slate-400 px-2 py-2 text-center font-bold w-16">
                  Unit
                </th>
                <th className="border border-slate-400 px-2 py-2 text-right font-bold w-24">
                  Rate (₹/Unit)
                </th>
                <th className="border border-slate-400 px-2 py-2 text-right font-bold w-24">
                  Amount (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) =>
                viewMode === "detailed" ? (
                  <>
                    {/* Item Description Row */}
                    <tr key={`item-${idx}-desc`}>
                      <td className="border border-slate-300 px-2 py-1 text-center align-top">
                        {item.slNo}
                      </td>
                      <td className="border border-slate-300 px-2 py-1 align-top">
                        {item.schedulePageNo}
                      </td>
                      <td
                        colSpan={
                          // If there are subitems, span all 9 columns to hide quantity/rate cells
                          (item.subItems && item.subItems.length > 0) ||
                          (item.measurements && item.measurements.length > 0)
                            ? 9
                            : 1
                        }
                        className="border border-slate-300 px-2 py-1 text-xs whitespace-pre-wrap align-top font-medium"
                      >
                        {item.description}
                      </td>
                      {/* Only show quantity/rate cells if NO subitems */}
                      {(!item.subItems || item.subItems.length === 0) &&
                        (!item.measurements ||
                          item.measurements.length === 0) && (
                          <>
                            <td className="border border-slate-300 px-2 py-1 text-center align-top">
                              {item.nos ? Number(item.nos).toFixed(3) : ""}
                            </td>
                            <td className="border border-slate-300 px-2 py-1 text-center align-top">
                              {item.length > 0
                                ? Number(item.length).toFixed(3)
                                : "-"}
                            </td>
                            <td className="border border-slate-300 px-2 py-1 text-center align-top">
                              {item.breadth > 0
                                ? Number(item.breadth).toFixed(3)
                                : "-"}
                            </td>
                            <td className="border border-slate-300 px-2 py-1 text-center align-top">
                              {item.depth > 0
                                ? Number(item.depth).toFixed(3)
                                : "-"}
                            </td>
                            <td className="border border-slate-300 px-2 py-1 text-right align-top">
                              {item.quantity
                                ? Number(item.quantity).toFixed(3)
                                : "0.00"}
                            </td>
                            <td className="border border-slate-300 px-2 py-1 text-center align-top">
                              {item.unit}
                            </td>
                            <td className="border border-slate-300 px-2 py-1 text-right align-top">
                              {Number(item.rate).toFixed(3)}
                            </td>
                            <td className="border border-slate-300 px-2 py-1 text-right font-bold align-top">
                              {Number(item.amount).toFixed(3)}
                            </td>
                          </>
                        )}
                    </tr>

                    {/* Measurement/SubItem Rows */}
                    {item.subItems && item.subItems.length > 0
                      ? item.subItems.map((sub: any, sIdx: number) => (
                          <tr key={`item-${idx}-sub-${sIdx}`}>
                            <td
                              colSpan={2}
                              className="border-l border-slate-300"
                            ></td>
                            <td className="border border-slate-300 px-2 py-1 text-xs pl-8 text-slate-600">
                              {String.fromCharCode(97 + sIdx)}){" "}
                              {sub.description}
                            </td>
                            <td className="border border-slate-300 px-2 py-1 text-center"></td>
                            <td className="border border-slate-300 px-2 py-1 text-center"></td>
                            <td className="border border-slate-300 px-2 py-1 text-center"></td>
                            <td className="border border-slate-300 px-2 py-1 text-center"></td>
                            <td className="border border-slate-300 px-2 py-1 text-right">
                              {Number(sub.quantity).toFixed(3)}
                            </td>
                            <td className="border border-slate-300 px-2 py-1 text-center">
                              {sub.unit}
                            </td>
                            <td className="border border-slate-300 px-2 py-1 text-right">
                              {Number(sub.rate).toFixed(3)}
                            </td>
                            <td className="border border-slate-300 px-2 py-1 text-right">
                              {Number(sub.amount).toFixed(3)}
                            </td>
                          </tr>
                        ))
                      : item.measurements && item.measurements.length > 0
                      ? item.measurements.map((m: any, mIdx: number) => (
                          <tr key={`item-${idx}-meas-${mIdx}`}>
                            <td
                              colSpan={2}
                              className="border-l border-slate-300"
                            ></td>
                            <td className="border border-slate-300 px-2 py-1 text-xs pl-8 text-slate-600">
                              {m.description}
                            </td>
                            <td className="border border-slate-300 px-2 py-1 text-center">
                              {m.nos}
                            </td>
                            <td className="border border-slate-300 px-2 py-1 text-center">
                              {m.length}
                            </td>
                            <td className="border border-slate-300 px-2 py-1 text-center">
                              {m.breadth}
                            </td>
                            <td className="border border-slate-300 px-2 py-1 text-center">
                              {m.depth}
                            </td>
                            <td className="border border-slate-300 px-2 py-1 text-right">
                              {m.quantity.toFixed(3)}
                            </td>
                            <td
                              colSpan={3}
                              className="border-r border-slate-300"
                            ></td>
                          </tr>
                        ))
                      : null}

                    {/* Total Row - Show only if there are subitems or measurements */}
                    {(item.subItems && item.subItems.length > 0) ||
                    (item.measurements && item.measurements.length > 0) ? (
                      <tr
                        key={`item-${idx}-total`}
                        className="font-semibold bg-slate-50"
                      >
                        <td
                          colSpan={7}
                          className="border border-slate-300 px-2 py-1 text-right"
                        >
                          Total
                        </td>
                        <td className="border border-slate-300 px-2 py-1 text-right">
                          {Number(item.quantity).toFixed(3)}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 text-center">
                          {item.unit}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 text-right">
                          {Number(item.rate).toFixed(3)}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 text-right font-bold">
                          {Number(item.amount).toFixed(3)}
                        </td>
                      </tr>
                    ) : null}
                  </>
                ) : (
                  // ABSTRACT VIEW
                  <>
                    <tr
                      key={`item-${idx}-abstract`}
                      className="hover:bg-slate-50"
                    >
                      <td className="border border-slate-300 px-2 py-2 text-center align-top">
                        {item.slNo}
                      </td>
                      <td className="border border-slate-300 px-2 py-2 align-top">
                        {item.schedulePageNo}
                      </td>
                      <td className="border border-slate-300 px-2 py-2 text-xs whitespace-pre-wrap align-top">
                        {item.description}
                      </td>
                      <td className="border border-slate-300 px-2 py-2 text-right align-top font-medium">
                        {/* Hide quantity if there are subitems */}
                        {item.subItems && item.subItems.length > 0
                          ? ""
                          : Number(item.quantity).toFixed(3)}
                      </td>
                      <td className="border border-slate-300 px-2 py-2 text-center align-top">
                        {/* Hide unit if there are subitems */}
                        {item.subItems && item.subItems.length > 0
                          ? ""
                          : item.unit}
                      </td>
                      <td className="border border-slate-300 px-2 py-2 text-right align-top">
                        {/* Hide rate if there are subitems */}
                        {item.subItems && item.subItems.length > 0
                          ? ""
                          : Number(item.rate).toFixed(3)}
                      </td>
                      <td className="border border-slate-300 px-2 py-2 text-right font-bold align-top">
                        {/* Hide amount if there are subitems */}
                        {item.subItems && item.subItems.length > 0
                          ? ""
                          : Number(item.amount).toFixed(3)}
                      </td>
                    </tr>
                    {item.subItems &&
                      item.subItems.length > 0 &&
                      item.subItems.map((sub: any, sIdx: number) => (
                        <tr key={`item-${idx}-sub-${sIdx}-abs`}>
                          <td className="border border-slate-300 px-2 py-2 text-center align-top"></td>
                          <td className="border border-slate-300 px-2 py-2 align-top"></td>
                          <td className="border border-slate-300 px-2 py-2 text-xs whitespace-pre-wrap align-top pl-8">
                            {String.fromCharCode(97 + sIdx)}) {sub.description}
                          </td>
                          <td className="border border-slate-300 px-2 py-2 text-right align-top font-medium">
                            {Number(sub.quantity).toFixed(3)}
                          </td>
                          <td className="border border-slate-300 px-2 py-2 text-center align-top">
                            {sub.unit}
                          </td>
                          <td className="border border-slate-300 px-2 py-2 text-right align-top">
                            {Number(sub.rate).toFixed(3)}
                          </td>
                          <td className="border border-slate-300 px-2 py-2 text-right font-bold align-top">
                            {Number(sub.amount).toFixed(3)}
                          </td>
                        </tr>
                      ))}
                  </>
                )
              )}
            </tbody>
          </table>

          {/* ABSTRACT SUMMARY - right side only */}
          <div className="grid grid-cols-2 gap-12">
            <div />
            {/* left side intentionally blank */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-300 pb-1">
                <span>A. Itemwise Total</span>
                <span className="font-semibold">{itemTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-300 pb-1">
                <span>B. GST @18%</span>
                <span className="font-semibold">{gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-300 pb-1">
                <span>C = A + B</span>
                <span className="font-semibold">{costExclLWC.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-300 pb-1">
                <span>D. Labour Welfare Cess @1%</span>
                <span className="font-semibold">{lwc.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pb-2 font-semibold">
                <span>E = C + D</span>
                <span>{costInclLWC.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-300 pb-1">
                <span>F. Contingency (LS)</span>
                <span className="font-semibold">{contingency.toFixed(2)}</span>
              </div>
              <div className="flex justify-between bg-orange-50 px-3 py-2 rounded font-bold text-base whitespace-nowrap gap-4">
                <span className="whitespace-nowrap">SAY / Final Cost (G)</span>
                <span className="whitespace-nowrap">
                  ₹{finalCost.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-600 italic pt-4">
                In Words: Rupees {convertToWords(finalCost)} Only
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t-2 border-slate-300 pt-6 text-xs text-slate-600 grid grid-cols-3 gap-4">
            <div>
              <p className="mb-8 font-semibold">Prepared By:</p>
              <p>_____________________</p>
            </div>
            <div>
              <p className="mb-8 font-semibold">Checked By:</p>
              <p>_____________________</p>
            </div>
            <div>
              <p className="mb-8 font-semibold">Approved By:</p>
              <p>_____________________</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
