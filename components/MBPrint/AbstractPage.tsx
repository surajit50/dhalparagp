import React from "react";
import { convertToWords } from "@/utils/convertToWords";
import { MBEntry, MBPrintMetadata } from "./types";

interface AbstractPageProps {
  pageNo: number;
  entries: MBEntry[];
  estimatedCost: string | number;
  tenderedAmount: string | number;
  metadata: MBPrintMetadata;
}

export const AbstractPage: React.FC<AbstractPageProps> = ({
  pageNo,
  entries,
  estimatedCost,
  tenderedAmount,
  metadata,
}) => {
  // Financial calculations wrapped to avoid NaN / negative issues
  const safeNumber = (val: any): number => {
    const n = typeof val === "number" ? val : parseFloat(val ?? "0");
    return Number.isFinite(n) ? n : 0;
  };

  // 1. Calculate Itemwise Total
  const itemwiseTotal = Math.max(
    0,
    entries.reduce((sum, entry) => sum + safeNumber(entry.amount), 0),
  );

  // 2. Calculate Contractual Percentage
  const estCost = Math.max(0, safeNumber(estimatedCost));
  const tendAmount = Math.max(0, safeNumber(tenderedAmount));
  let percentage = 0;
  let isLess = true;

  if (estCost > 0 && tendAmount > 0) {
    if (tendAmount < estCost) {
      percentage =
        Math.round(((estCost - tendAmount) / estCost) * 100 * 100) / 100;
      isLess = true;
    } else if (tendAmount > estCost) {
      percentage =
        Math.round(((tendAmount - estCost) / estCost) * 100 * 100) / 100;
      isLess = false;
    } else {
      percentage = 0;
    }
  }

  // 3. Calculate Less/Add Amount
  const adjustmentAmount =
    percentage > 0 ? (itemwiseTotal * percentage) / 100 : 0;
  const actualValue = isLess
    ? itemwiseTotal - adjustmentAmount
    : itemwiseTotal + adjustmentAmount;

  // 4. Round to nearest integer (SAY)
  const sayValue = Math.round(actualValue);

  // 5. Taxes (CGST 9%, SGST 9%)
  const cgstRate = 9.0;
  const sgstRate = 9.0;
  const cgstAmount = Math.round((sayValue * cgstRate) / 100);
  const sgstAmount = Math.round((sayValue * sgstRate) / 100);

  // 6. Sub Total
  const subTotal = sayValue + cgstAmount + sgstAmount;

  // 7. Cess (1%)
  const cessRate = 1.0;
  const cessAmount = Math.round((subTotal * cessRate) / 100);

  // 8. Gross Bill Amount
  const grossBillAmount = subTotal + cessAmount;

  // Format helper
  const fmt = (num: number) => num.toFixed(2);

  return (
    <div className="page-container" key="abstract-page">
      <div className="page-border" style={{ backgroundColor: "#fff" }}>
        
        <div className="page-header" style={{ padding: "0 8px" }}>
          <div style={{ fontWeight: "bold", color: "#000" }}>MB No: {metadata.mbNumber}</div>
          <div style={{ flex: 1, textAlign: "center", fontSize: "13px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "2px", color: "#000" }}>
            ABSTRACT OF COST
          </div>
          <div className="page-number">Page No: {pageNo}</div>
        </div>

        <div className="content" style={{ width: "100%", margin: "0 auto", fontSize: "11px" }}>
          <table className="mb-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left", fontWeight: "bold", paddingLeft: "16px" }}>Description</th>
                <th style={{ textAlign: "right", fontWeight: "bold", paddingRight: "16px", width: "128px" }}>Amount (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: "bold", color: "#000", paddingLeft: "16px" }}>Total of Work Value</td>
                <td className="text-right" style={{ fontWeight: "bold", color: "#000", paddingRight: "16px" }}>
                  {fmt(itemwiseTotal)}
                </td>
              </tr>
              <tr>
                <td style={{ paddingLeft: "16px" }}>
                  {isLess ? "Less Contractor Less" : "Add Contractor Add"} (
                  {percentage.toFixed(2)}%)
                </td>
                <td className="text-right" style={{ paddingRight: "16px", color: "#333" }}>
                  {isLess ? "(-)" : "(+)"} {fmt(adjustmentAmount)}
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: "bold", color: "#000", paddingLeft: "16px" }}>Total Value of Work Done</td>
                <td className="text-right" style={{ fontWeight: "bold", color: "#000", paddingRight: "16px" }}>
                  {fmt(actualValue)}
                </td>
              </tr>
              <tr>
                <td style={{ paddingLeft: "16px" }}>SAY</td>
                <td className="text-right" style={{ paddingRight: "16px" }}>{fmt(sayValue)}</td>
              </tr>
              <tr>
                <td style={{ paddingLeft: "16px" }}>Add CGST @ {cgstRate}%</td>
                <td className="text-right" style={{ paddingRight: "16px" }}>{fmt(cgstAmount)}</td>
              </tr>
              <tr>
                <td style={{ paddingLeft: "16px" }}>Add SGST @ {sgstRate}%</td>
                <td className="text-right" style={{ paddingRight: "16px" }}>{fmt(sgstAmount)}</td>
              </tr>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <td style={{ fontWeight: "bold", color: "#000", paddingLeft: "16px" }}>Sub Total</td>
                <td className="text-right" style={{ fontWeight: "bold", color: "#000", paddingRight: "16px" }}>
                  {fmt(subTotal)}
                </td>
              </tr>
              <tr>
                <td style={{ paddingLeft: "16px" }}>Add Labour Cess @ {cessRate}%</td>
                <td className="text-right" style={{ paddingRight: "16px" }}>{fmt(cessAmount)}</td>
              </tr>
              <tr className="total-row" style={{ backgroundColor: "#f1f5f9" }}>
                <td style={{ fontSize: "12px", fontWeight: "bold", paddingLeft: "16px", paddingBottom: "12px", paddingTop: "12px", color: "#000" }}>
                  GROSS BILL AMOUNT
                </td>
                <td className="text-right" style={{ fontSize: "12px", fontWeight: "bold", paddingRight: "16px", paddingBottom: "12px", paddingTop: "12px", color: "#000" }}>
                  Rs. {fmt(grossBillAmount)}
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginTop: "24px", marginBottom: "16px", fontWeight: "bold", color: "#000", textAlign: "center", fontStyle: "italic", letterSpacing: "1px" }}>
            (Rupees {convertToWords(grossBillAmount)} Only)
          </div>

          <div className="signature-block" style={{ marginTop: "32px", paddingLeft: "32px", paddingRight: "32px" }}>
            <div className="signature" style={{ color: "#000", fontWeight: "bold" }}>
              Measured by
              <br />
              <span style={{ color: "#666", fontSize: "10px", fontWeight: "normal", display: "block", marginTop: "4px" }}>
                {metadata.measuredBy || "-"}
              </span>
            </div>
            <div className="signature" style={{ color: "#000", fontWeight: "bold" }}>
              Checked by
              <br />
              <span style={{ color: "#666", fontSize: "10px", fontWeight: "normal", display: "block", marginTop: "4px" }}>
                (Signature & Designation)
              </span>
            </div>
          </div>
          
        </div>
        
        <div className="signature-block" style={{ marginTop: "auto", paddingBottom: "16px", paddingLeft: "32px", paddingRight: "32px", display: "flex", justifyContent: "center", width: "100%" }}>
          <div className="signature" style={{ color: "#000", fontWeight: "bold", margin: "0 auto" }}>
            Signature of agency 
          </div>
        </div>
      </div>
    </div>
  );
};
