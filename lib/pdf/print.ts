export function downloadPdfBytes(pdfBytes: Uint8Array, filename: string) {
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // allow the download to start before revoking
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function printPdfBytes(pdfBytes: Uint8Array) {
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.src = url;

  const cleanup = () => {
    try {
      document.body.removeChild(iframe);
    } catch {
      // ignore
    }
    URL.revokeObjectURL(url);
  };

  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      // Some browsers need a tick before printing to reliably render the PDF
      window.setTimeout(() => {
        iframe.contentWindow?.print();
        // don't keep the iframe around
        window.setTimeout(cleanup, 1000);
      }, 250);
    } catch {
      cleanup();
      // If print fails (popup blockers, etc.), the caller can fall back to download.
      throw new Error("Printing failed");
    }
  };

  document.body.appendChild(iframe);
}


