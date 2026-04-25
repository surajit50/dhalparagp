"use client";

import React from "react";
import { PrintRow } from "./types";

interface MeasurementPageProps {
  rows: PrintRow[];
  pageIndex: number;
  mbNumber: string;
  metadata: any;
  broughtForwardQuantity: number;
  broughtForwardAmount: number;
  carryForwardQuantity: number;
  carryForwardAmount: number;
}

export function MeasurementPage({
  rows,
  pageIndex,
  mbNumber,
  metadata,
  broughtForwardQuantity,
  broughtForwardAmount,
  carryForwardQuantity,
  carryForwardAmount,
}: MeasurementPageProps) {
  const totalPages = metadata.totalMeasurementPages ?? 1;
  const showBroughtForward = pageIndex > 0;
  const showCarryForward = pageIndex < totalPages - 1;

  const pageNumber =
    metadata.startPage ? metadata.startPage + pageIndex : pageIndex + 4;

  // Group rows by item (each item starts with a "header" row)
  const items: PrintRow[][] = [];
  let currentItem: PrintRow[] = [];

  rows.forEach((row) => {
    if (row.type === "header") {
      if (currentItem.length) {
        items.push(currentItem);
        currentItem = [];
      }
      currentItem.push(row);
    } else {
      currentItem.push(row);
    }
  });
  if (currentItem.length) {
    items.push(currentItem);
  }

  return (
    <div className="page-container">
      <div className="page-border" style={{ backgroundColor: "#fff" }}>
        {/* HEADER */}
        <div className="page-header" style={{ padding: "0 8px" }}>
          <div style={{ fontWeight: "bold", color: "#0f172a" }}>
            Measurement Book No : {mbNumber}
          </div>
          <div className="page-number">Page No : {pageNumber}</div>
        </div>

        {/* TABLE */}
        <div className="content">
          <table className="mb-table">
            <thead>
              <tr>
                <th style={{ width: "6%" }}>Sl No</th>
                <th style={{ width: "30%" }}>Particulars</th>
                <th style={{ width: "6%" }}>Nos</th>
                <th style={{ width: "10%" }}>Length</th>
                <th style={{ width: "10%" }}>Breadth</th>
                <th style={{ width: "10%" }}>Depth</th>
                <th style={{ width: "8%" }}>Quantity</th>
                <th style={{ width: "8%" }}>Rate</th>
                <th style={{ width: "12%" }}>Amount</th>
              </tr>
            </thead>

            {/* BROUGHT FORWARD (separate tbody) */}
            <tbody>
              {showBroughtForward && (
                <tr className="transfer-row">
                  <td colSpan={6} style={{ textAlign: "right", paddingRight: "16px", fontWeight: "bold" }}>
                    Brought Forward
                  </td>
                  <td className="text-right">
                    {(Number(broughtForwardQuantity) || 0).toFixed(3)}
                  </td>
                  <td></td>
                  <td className="text-right">
                    {(Number(broughtForwardAmount) || 0).toFixed(2)}
                  </td>
                </tr>
              )}
            </tbody>

            {/* Each item in its own tbody to keep together */}
            {items.map((itemRows, idx) => (
              <tbody key={idx} className="item-group">
                {itemRows.map((row, index) => {
                  if (row.type === "group-header") {
                    return (
                      <tr key={index} className="group-header">
                        <td style={{ textAlign: "center", fontWeight: "bold" }}>{row.slNo}</td>
                        <td colSpan={8} style={{ fontWeight: "bold" }}>
                          {row.description}
                        </td>
                      </tr>
                    );
                  }

                  if (row.type === "header") {
                    return (
                      <tr key={index}>
                        <td style={{ textAlign: "center", fontWeight: "600" }}>{row.slNo}</td>
                        <td colSpan={8} style={{ fontWeight: "600", color: "#1e293b" }}>
                          {row.entry.workItemDescription}
                        </td>
                      </tr>
                    );
                  }

                  if (row.type === "measurement") {
                    const m = row.measurement;
                    return (
                      <tr key={index}>
                        <td></td>
                        <td className="description-cell">
                          {(m.description && String(m.description).trim()) ||
                            row.parentEntry?.workItemDescription ||
                            ""}
                        </td>
                        <td className="text-center">{m.nos}</td>
                        <td className="text-right">{m.length}</td>
                        <td className="text-right">{m.breadth}</td>
                        <td className="text-right">{m.depth}</td>
                        <td className="text-right" style={{ fontWeight: "500" }}>
  {(Number(m.quantity) || 0).toFixed(3)}
</td>
                        <td></td>
                        <td></td>
                      </tr>
                    );
                  }

                  if (row.type === "total") {
                    return (
                      <tr key={index} className="total-row">
                        <td colSpan={6} style={{ textAlign: "right", paddingRight: "16px", fontWeight: "bold" }}>
                          Item Total
                        </td>
                        <td className="text-right">
                          {(Number(row.entry.quantityExecuted) || 0).toFixed(3)}
                        </td>
                        <td className="text-right">
                          {(Number(row.entry.rate) || 0).toFixed(2)}
                        </td>
                        <td className="text-right">
                          {(Number(row.entry.amount) || 0).toFixed(2)}
                        </td>
                      </tr>
                    );
                  }

                  return null;
                })}
              </tbody>
            ))}

            {/* CARRIED FORWARD (separate tbody) */}
            <tbody>
              {showCarryForward && (
                <tr className="transfer-row">
                  <td colSpan={6} style={{ textAlign: "right", paddingRight: "16px", fontWeight: "bold" }}>
                    Carried Forward
                  </td>
                  <td className="text-right">
                    {(Number(carryForwardQuantity) || 0).toFixed(3)}
                  </td>
                  <td></td>
                  <td className="text-right">
                    {(Number(carryForwardAmount) || 0).toFixed(2)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* SIGNATURE */}
        <div
          className="signature-block"
          style={{ marginTop: "auto", paddingBottom: "16px", paddingLeft: "32px", paddingRight: "32px" }}
        >
          <div className="signature">Measured by</div>
          <div className="signature">Checked by</div>
        </div>
      </div>
    </div>
  );
}

