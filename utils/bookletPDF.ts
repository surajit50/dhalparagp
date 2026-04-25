/**
 * Converts a PDF to booklet format (2-up saddle stitch).
 * When printed double-sided and folded, pages read in correct order.
 */
import { PDFDocument } from "pdf-lib";

// A4 dimensions in points (72 pts = 1 inch)
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

export async function toBooklet(pdfBytes: Uint8Array): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(pdfBytes);
  let srcPages = srcDoc.getPages();
  let pageCount = srcPages.length;

  // Pad to multiple of 4 for proper booklet folding
  if (pageCount % 4 !== 0) {
    const targetCount = Math.ceil(pageCount / 4) * 4;
    for (let i = 0; i < targetCount - pageCount; i++) {
      srcDoc.addPage([A4_WIDTH, A4_HEIGHT]);
    }
    srcPages = srcDoc.getPages();
    pageCount = srcPages.length;
  }

  const newDoc = await PDFDocument.create();
  const sheetCount = pageCount / 2;

  // Half-sheet dimensions (each logical page fits in half of landscape A4)
  const halfWidth = A4_HEIGHT / 2; // 420.95
  const scale = Math.min(halfWidth / A4_WIDTH, A4_WIDTH / A4_HEIGHT);
  const scaledW = A4_WIDTH * scale;
  const scaledH = A4_HEIGHT * scale;

  for (let sheetIndex = 0; sheetIndex < sheetCount; sheetIndex++) {
    // Saddle-stitch booklet order
    const leftPageIndex = sheetIndex % 2 === 0 ? pageCount - 1 - sheetIndex : sheetIndex;
    const rightPageIndex = sheetIndex % 2 === 0 ? sheetIndex : pageCount - 1 - sheetIndex;

    // Landscape A4 sheet: 2 portrait pages side by side
    const sheet = newDoc.addPage([A4_HEIGHT, A4_WIDTH]);

    const [leftEmbed] = await newDoc.embedPdf(srcDoc, [leftPageIndex]);
    sheet.drawPage(leftEmbed, {
      x: 0,
      y: 0,
      width: scaledW,
      height: scaledH,
    });

    const [rightEmbed] = await newDoc.embedPdf(srcDoc, [rightPageIndex]);
    sheet.drawPage(rightEmbed, {
      x: halfWidth,
      y: 0,
      width: scaledW,
      height: scaledH,
    });
  }

  return await newDoc.save();
}
