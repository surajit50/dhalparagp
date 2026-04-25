export const printStyles = `
@page {
  size: A4 landscape;
  margin: 0;
}

* {
  box-sizing: border-box;
  -webkit-print-color-adjust: exact !important;
  color-adjust: exact !important;
  print-color-adjust: exact !important;
}

@media print {
  /* Prevent background printing issues */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}

html, body {
  margin: 0;
  padding: 0;
  font-family: "Merriweather", "Times New Roman", Times, serif;
  font-size: 11px;
  color: #1e293b; /* slate-800 for better readability */
  background: #e2e8f0;
}

.print-root {
  margin: 0;
  padding: 0;
  width: 100%;
}

/* PRINT RESET */
@media print {
  html, body, .print-root {
    background: #fff !important;
  }

  .sheet {
    page-break-after: always;
    break-after: page;
    box-shadow: none !important;
    border: none !important;
  }

  .page-container {
    overflow: hidden;
  }
}

/* SHEET (BOOKLET SPREAD) */
.sheet {
  width: 297mm;
  height: 210mm;
  display: flex;
  gap: 16mm; /* Increased gap for center binding (gutter) */
  padding: 0 4mm; /* Adjusted outer margins to shift content side by side */
  page-break-after: always;
  box-sizing: border-box;
  overflow: hidden;
  background: white;
}

/* PAGE HALF */
.page-container {
  flex: 1;
  height: 210mm;
  padding: 5mm;
  display: flex;
  overflow: hidden;
}

/* PAGE BORDER */
.page-border {
  border: 2px solid #0f172a; /* Stronger border for the page */
  padding: 6mm;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* HEADER */
.page-header {
  height: 10mm;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11.5px;
  font-weight: 700;
  border-bottom: 2px solid #0f172a;
  padding-bottom: 2mm;
  margin-bottom: 3mm;
  color: #0f172a;
}

/* CONTENT */
.content {
  flex: 1;
  overflow: hidden;
}

/* TABLE */
table.mb-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 10.5px;
  color: #1e293b;
}

table.mb-table thead {
  display: table-header-group;
}

table.mb-table tr {
  page-break-inside: avoid;
  break-inside: avoid;
}

/* HEADER CELLS */
table.mb-table th {
  border: 1px solid #475569;
  padding: 6px 4px;
  text-align: center;
  font-weight: 700;
  background: #eef2ff; /* Lighter background for better readability */
  color: #0f172a;
  font-size: 10px;
}

/* BODY CELLS */
table.mb-table td {
  border: 1px solid #64748b;
  padding: 4px 5px;
  vertical-align: top;
  line-height: 1.4;
  word-break: break-word;
}

/* GROUP HEADER */
table.mb-table .group-header td {
  font-weight: 700;
  background: #f8fafc;
  color: #0f172a;
}

/* TOTAL ROW */
table.mb-table .total-row td {
  font-weight: 700;
  border-top: 1.5px solid #0f172a;
  border-bottom: 1.5px solid #0f172a;
  background-color: #fefce8; /* Light yellow to highlight totals */
}

/* BROUGHT / CARRIED */
table.mb-table .transfer-row td {
  font-weight: 700;
  border-top: 1px dashed #64748b;
  color: #334155;
}

/* Keep each item's rows together */
table.mb-table tbody.item-group {
  break-inside: avoid;
  page-break-inside: avoid; /* fallback for older browsers */
}

/* Handle long descriptions gracefully */
table.mb-table td.description-cell {
  word-break: break-word;
  overflow-wrap: break-word;
  font-size: 9.5px; /* slightly smaller than default 10.5px */
  line-height: 1.3;
}

/* Prevent brought/carried rows from breaking with next content */
tbody:first-of-type .transfer-row,
tbody:last-of-type .transfer-row {
  break-inside: avoid;
}

/* SIGNATURE */
.signature-block {
  height: 18mm;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 5mm;
  width: 100%;
}

.signature {
  width: 45mm;
  text-align: center;
  font-size: 11px;
  position: relative;
  color: #1e293b;
  font-weight: 600;
}

.signature::before {
  content: "";
  display: block;
  border-top: 1.5px dotted #475569;
  margin-bottom: 2mm;
}

/* ALIGNMENTS */
.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.page-number {
  font-weight: 700;
  font-size: 11.5px;
  color: #0f172a;
}
`;
