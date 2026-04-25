// pageCounter.ts
import { PDFDocument, rgb } from "pdf-lib";

export async function applyPageNumbers(pdfBytes: Uint8Array) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const fontSize = 9;

  pages.forEach((page, index) => {
    const { width } = page.getSize();
    page.drawText(`Page ${index + 1} of ${pages.length}`, {
      x: width / 2 - 30,
      y: 15,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
  });

  return await pdfDoc.save();
}
