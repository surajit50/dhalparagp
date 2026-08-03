"use client";

/**
 * Utility to print any document container cleanly via an isolated hidden iframe.
 * Avoids modal dialog clipping, background overlays, and blank pages.
 */
export function printDocumentById(
  elementId: string = "digital-certificate-printable",
  documentTitle: string = "Application for Issue of Digital Birth / Death Certificate"
) {
  if (typeof window === "undefined") return;

  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with id "${elementId}" not found. Falling back to window.print()`);
    window.print();
    return;
  }

  // Remove any previous print iframe
  const existingIframe = document.getElementById("certificate-print-iframe");
  if (existingIframe) {
    document.body.removeChild(existingIframe);
  }

  // Create isolated hidden iframe
  const iframe = document.createElement("iframe");
  iframe.id = "certificate-print-iframe";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${documentTitle}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 12mm 8mm 12mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12.5px;
            line-height: 1.3;
            color: #000000 !important;
            background-color: #ffffff !important;
            padding: 6px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000000;
            margin-top: 1px;
            margin-bottom: 2px;
          }
          th, td {
            border: 1px solid #000000;
            padding: 3px 6px;
            text-align: left;
            vertical-align: middle;
          }
          .border { border: 1px solid #000000 !important; }
          .border-t-0 { border-top: 0 !important; }
          .border-b-2 { border-bottom: 2px solid #000000 !important; }
          .border-b { border-bottom: 1px solid #000000 !important; }
          .border-t { border-top: 1px solid #000000 !important; }
          .border-dashed { border-style: dashed !important; }
          .border-black { border-color: #000000 !important; }
          .border-gray-400 { border-color: #9ca3af !important; }

          .bg-gray-100 { background-color: #f3f4f6 !important; }
          .bg-gray-200 { background-color: #e5e7eb !important; }
          .bg-gray-50 { background-color: #f9fafb !important; }
          .bg-black { background-color: #000000 !important; color: #ffffff !important; }
          .text-white { color: #ffffff !important; }

          .text-center { text-align: center !important; }
          .text-right { text-align: right !important; }
          .text-left { text-align: left !important; }
          .text-justify { text-align: justify !important; }

          .font-bold { font-weight: bold !important; }
          .font-semibold { font-weight: 600 !important; }
          .font-medium { font-weight: 500 !important; }
          .font-mono { font-family: monospace, monospace !important; }

          .uppercase { text-transform: uppercase !important; }
          .underline { text-decoration: underline !important; }
          .italic { font-style: italic !important; }

          .text-\\[17px\\] { font-size: 16px !important; }
          .text-\\[13px\\] { font-size: 12.5px !important; }
          .text-\\[12\\.5px\\] { font-size: 12px !important; }
          .text-\\[12px\\] { font-size: 11.5px !important; }
          .text-\\[11px\\] { font-size: 10.5px !important; }
          .text-\\[10px\\] { font-size: 9.5px !important; }
          .text-xs { font-size: 11px !important; }
          .text-sm { font-size: 13px !important; }

          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }

          .flex { display: flex; }
          .flex-1 { flex: 1 1 0%; }
          .justify-between { justify-content: space-between; }
          .items-center { align-items: center; }
          .items-end { align-items: flex-end; }
          .items-start { align-items: flex-start; }

          .gap-1 { gap: 4px; }
          .gap-1\\.5 { gap: 6px; }
          .gap-2 { gap: 8px; }
          .gap-4 { gap: 16px; }
          .gap-6 { gap: 24px; }
          .gap-8 { gap: 32px; }

          .w-full { width: 100%; }
          .w-44 { width: 176px; }
          .w-1\\/2 { width: 50%; }
          .w-1\\/3 { width: 33.333333%; }
          .w-2\\/3 { width: 66.666667%; }
          .w-3\\.5 { width: 14px; }
          .h-3\\.5 { height: 14px; }

          .ml-auto { margin-left: auto; }
          .mb-1 { margin-bottom: 3px; }
          .mb-1\\.5 { margin-bottom: 5px; }
          .mb-2 { margin-bottom: 6px; }
          .mb-3 { margin-bottom: 8px; }
          .mb-4 { margin-bottom: 10px; }
          .my-4 { margin-top: 8px; margin-bottom: 8px; }
          .mt-0\\.5 { margin-top: 2px; }
          .mt-1 { margin-top: 3px; }
          .pt-0\\.5 { padding-top: 2px; }
          .pt-1 { padding-top: 4px; }
          .pt-2 { padding-top: 6px; }
          .pt-4 { padding-top: 10px; }
          .pb-0\\.5 { padding-bottom: 2px; }
          .pb-2 { padding-bottom: 6px; }
          .p-2 { padding: 6px; }
          .p-2\\.5 { padding: 8px; }
          .px-2 { padding-left: 6px; padding-right: 6px; }
          .py-0\\.5 { padding-top: 2px; padding-bottom: 2px; }
          .py-1 { padding-top: 3px; padding-bottom: 3px; }

          .space-y-0\\.5 > * + * { margin-top: 2px; }
          .space-y-1\\.5 > * + * { margin-top: 4px; }
          .space-y-4 > * + * { margin-top: 10px; }

          .indent-6 { text-indent: 1.5rem; }
          .inline-block { display: inline-block; }
          .inline-flex { display: inline-flex; }

          .no-print, .print\\:hidden, button { display: none !important; }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);
  doc.close();

  // Trigger print after styles load
  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 2000);
  }, 250);
}
