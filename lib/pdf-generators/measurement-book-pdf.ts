import { PDFDocument, StandardFonts, rgb, PDFFont, PDFPage } from "pdf-lib";

// ============================================================================
// INTERFACE DEFINITIONS
// ============================================================================

export interface MBMeasurement {
  no: number;
  l: number;
  b: number;
  d: number;
  quantity?: number;       // Added for explicit quantities
  description?: string;    // Added for specific measurement descriptions
}

export interface MBItem {
  description: string;
  remarks?: string;
  unit?: string;           // Added for Abstract
  rate?: number;           // Added for Abstract
  amount?: number;         // Added for Abstract
  measurements: MBMeasurement[];
}

export interface MBData {
  mbNumber: string;
  workName: string;
  location: string;
  contractor: string;
  agreementNo: string;
  agreementDate: string;
  estimateAmount: string;
  measuredBy?: string;     // Added for Details Page
  measuredDate?: string;   // Added for Details Page
  items: MBItem[];
}

// ============================================================================
// PDF CONFIGURATION – BOOKLET DESIGN (A5 nested in A4 Landscape)
// ============================================================================

const CONFIG = {
  A4_LANDSCAPE: [841.89, 595.28] as [number, number],
  A5_PORTRAIT: [420.945, 595.28] as [number, number], // Exactly half of A4
  MARGIN: { TOP: 30, BOTTOM: 40, LEFT: 20, RIGHT: 20 },
  COLORS: {
    TEXT_MAIN: rgb(0.1, 0.1, 0.1),
    TEXT_MUTED: rgb(0.4, 0.4, 0.4),
    BORDER: rgb(0.6, 0.6, 0.6),
    ACCENT: rgb(0.2, 0.3, 0.5),
  },
  FONTS: {
    TITLE: 16,
    SUBTITLE: 11,
    HEADER: 9,
    NORMAL: 9,
    SMALL: 8,
  },
  // Measurement Column X positions and Widths mapping out to 380px total width
  COLUMNS: {
    PARTICULARS: { x: 20, w: 110 },
    NO:          { x: 130, w: 25 },
    L:           { x: 155, w: 35 },
    B:           { x: 190, w: 35 },
    D:           { x: 225, w: 35 },
    CONTENTS:    { x: 260, w: 55 },
    TOTAL:       { x: 315, w: 85 },
  },
  // Abstract Column mapping
  ABSTRACT_COLUMNS: {
    SL:          { x: 20, w: 30 },
    DESC:        { x: 50, w: 170 },
    UNIT:        { x: 220, w: 30 },
    RATE:        { x: 250, w: 40 },
    QTY:         { x: 290, w: 40 },
    AMOUNT:      { x: 330, w: 70 },
  }
};

// ============================================================================
// GENERATOR CLASS
// ============================================================================

class MeasurementBookGenerator {
  private fonts!: {
    regular: PDFFont;
    bold: PDFFont;
  };
  private data: MBData;

  constructor(data: MBData) {
    this.data = this.preprocessData(data);
  }

  private preprocessData(data: MBData): MBData {
    const clean = (text: string | undefined) =>
      text ? text.replace(/\r/g, '').replace(/[^\x00-\x7F\x0A]/g, '?').trim() : '';

    return {
      ...data,
      mbNumber: data.mbNumber || '..........',
      workName: clean(data.workName),
      location: clean(data.location),
      contractor: clean(data.contractor),
      items: (data.items || []).map(item => ({
        ...item,
        description: clean(item.description),
        remarks: clean(item.remarks),
        measurements: (item.measurements || []).map(m => ({
          ...m,
          no: Number(m.no) || 1,
          l: Number(m.l) || 0,
          b: Number(m.b) || 0,
          d: Number(m.d) || 0,
          description: clean(m.description)
        }))
      })),
    };
  }

  async generate(): Promise<Uint8Array> {
    // 1. Generate standard logical pages into a temporary document
    const tempDoc = await PDFDocument.create();
    this.fonts = {
      regular: await tempDoc.embedFont(StandardFonts.Helvetica),
      bold: await tempDoc.embedFont(StandardFonts.HelveticaBold),
    };

    this.drawCover(tempDoc);
    this.drawRules(tempDoc);
    this.drawDetails(tempDoc);
    this.drawMeasurements(tempDoc);
    this.drawAbstract(tempDoc);
    this.padBlankPages(tempDoc);

    // 2. Stitch the logical pages into a booklet structure in the final document
    const finalDoc = await PDFDocument.create();
    const pages = tempDoc.getPages();
    const embeddedPages = await finalDoc.embedPages(pages);
    const total = pages.length;

    // Saddle-stitch mapping (e.g., [Last Page, Page 1] on front, [Page 2, Second Last] on back)
    for (let i = 0; i < total / 2; i++) {
      const sheet = finalDoc.addPage(CONFIG.A4_LANDSCAPE);
      let leftIdx, rightIdx;
      
      if (i % 2 === 0) {
        // Front side of sheet
        leftIdx = total - 1 - i;
        rightIdx = i;
      } else {
        // Back side of sheet
        leftIdx = i;
        rightIdx = total - 1 - i;
      }

      sheet.drawPage(embeddedPages[leftIdx], { x: 0, y: 0 });
      sheet.drawPage(embeddedPages[rightIdx], { x: CONFIG.A5_PORTRAIT[0], y: 0 });

      // Draw faint center fold line
      sheet.drawLine({
        start: { x: CONFIG.A5_PORTRAIT[0], y: 0 },
        end: { x: CONFIG.A5_PORTRAIT[0], y: CONFIG.A5_PORTRAIT[1] },
        thickness: 0.5,
        color: CONFIG.COLORS.BORDER,
        dashArray: [5, 5]
      });
    }

    return await finalDoc.save();
  }

  // --------------------------------------------------------------------------
  // PAGE DRAWER METHODS
  // --------------------------------------------------------------------------

  private drawCover(doc: PDFDocument) {
    const page = doc.addPage(CONFIG.A5_PORTRAIT);
    const width = CONFIG.A5_PORTRAIT[0];
    const height = CONFIG.A5_PORTRAIT[1];

    // Decorative Border
    page.drawRectangle({
      x: 15, y: 15, width: width - 30, height: height - 30,
      borderColor: CONFIG.COLORS.BORDER, borderWidth: 2,
    });

    this.drawCenterText(page, "MEASUREMENT BOOK", height - 120, CONFIG.FONTS.TITLE + 4, this.fonts.bold);
    this.drawCenterText(page, `MB No: ${this.data.mbNumber}`, height - 160, CONFIG.FONTS.TITLE, this.fonts.bold);

    let y = height - 260;
    const details = [
      `Name of Work: ${this.data.workName}`,
      `Location: ${this.data.location}`,
      `Agency / Contractor: ${this.data.contractor}`,
      `Estimated Cost: Rs. ${this.data.estimateAmount}`,
    ];

    details.forEach(line => {
      const split = this.splitText(line, this.fonts.regular, CONFIG.FONTS.SUBTITLE, width - 80);
      split.forEach(s => {
        page.drawText(s, { x: 40, y, size: CONFIG.FONTS.SUBTITLE, font: this.fonts.regular });
        y -= 20;
      });
      y -= 10;
    });
  }

  private drawRules(doc: PDFDocument) {
    const page = doc.addPage(CONFIG.A5_PORTRAIT);
    const width = CONFIG.A5_PORTRAIT[0];
    const height = CONFIG.A5_PORTRAIT[1];

    this.drawCenterText(page, "RULES FOR MEASUREMENT BOOK", height - 60, CONFIG.FONTS.TITLE, this.fonts.bold);

    let y = height - 100;
    const rules = [
      "1. The Measurement Book is a crucial legal document. All entries must be exceptionally clear and fully legible.",
      "2. No entry may be erased. If a mistake is made, it should be crossed out cleanly, corrected, and initialed.",
      "3. Entries should be recorded directly in the field at the time of measurement.",
      "4. All measurements must be taken systematically, safely, and recorded fully.",
      "5. Pages should never be torn out or removed from the book under any circumstances."
    ];

    rules.forEach(rule => {
      const split = this.splitText(rule, this.fonts.regular, CONFIG.FONTS.NORMAL, width - 60);
      split.forEach(s => {
        page.drawText(s, { x: 30, y, size: CONFIG.FONTS.NORMAL, font: this.fonts.regular });
        y -= 16;
      });
      y -= 10;
    });
  }

  private drawDetails(doc: PDFDocument) {
    const page = doc.addPage(CONFIG.A5_PORTRAIT);
    const height = CONFIG.A5_PORTRAIT[1];

    this.drawCenterText(page, "DETAILS OF WORK", height - 60, CONFIG.FONTS.TITLE, this.fonts.bold);

    let y = height - 130;
    const fields = [
      ["Agreement No / Date:", `${this.data.agreementNo} | ${this.data.agreementDate}`],
      ["Measured By:", this.data.measuredBy || ''],
      ["Date of Measurement:", this.data.measuredDate || ''],
    ];

    fields.forEach(([label, val]) => {
      page.drawText(label, { x: 30, y, size: CONFIG.FONTS.NORMAL, font: this.fonts.bold });
      page.drawText(val, { x: 170, y, size: CONFIG.FONTS.NORMAL, font: this.fonts.regular });
      y -= 30;
    });
  }

  private drawMeasurements(doc: PDFDocument) {
    let page = doc.addPage(CONFIG.A5_PORTRAIT);
    let y = CONFIG.A5_PORTRAIT[1] - CONFIG.MARGIN.TOP;
    let pageNum = 1;
    let runningQty = 0;
    let tableTopY = y - 30;

    const drawHeader = () => {
      page.drawText(`MB No: ${this.data.mbNumber}`, { x: 20, y: y - 10, size: 8, font: this.fonts.bold, color: CONFIG.COLORS.TEXT_MUTED });
      this.drawCenterText(page, "Measurements", y - 10, 10, this.fonts.bold);
      y -= 30;
      tableTopY = y;

      const cols = CONFIG.COLUMNS;
      const hY = y - 12;
      page.drawText("Particulars", { x: cols.PARTICULARS.x + 5, y: hY, size: CONFIG.FONTS.HEADER, font: this.fonts.bold });
      page.drawText("No", { x: cols.NO.x + 5, y: hY, size: CONFIG.FONTS.HEADER, font: this.fonts.bold });
      page.drawText("L", { x: cols.L.x + 5, y: hY, size: CONFIG.FONTS.HEADER, font: this.fonts.bold });
      page.drawText("B", { x: cols.B.x + 5, y: hY, size: CONFIG.FONTS.HEADER, font: this.fonts.bold });
      page.drawText("D", { x: cols.D.x + 5, y: hY, size: CONFIG.FONTS.HEADER, font: this.fonts.bold });
      page.drawText("Contents", { x: cols.CONTENTS.x + 5, y: hY, size: CONFIG.FONTS.HEADER, font: this.fonts.bold });
      page.drawText("Total", { x: cols.TOTAL.x + 5, y: hY, size: CONFIG.FONTS.HEADER, font: this.fonts.bold });

      y -= 20;
      this.drawMeasurementLines(page, tableTopY, y);
    };

    const doPageBreak = () => {
      this.drawMeasurementLines(page, tableTopY, y); 
      page.drawText("Carried Over:", { x: CONFIG.COLUMNS.CONTENTS.x - 55, y: y - 15, size: 8, font: this.fonts.bold });
      page.drawText(runningQty.toFixed(3), { x: CONFIG.COLUMNS.TOTAL.x + 5, y: y - 15, size: 8, font: this.fonts.bold });
      page.drawText(`Pg M-${pageNum++}`, { x: 360, y: 15, size: 8, font: this.fonts.regular });

      page = doc.addPage(CONFIG.A5_PORTRAIT);
      y = CONFIG.A5_PORTRAIT[1] - CONFIG.MARGIN.TOP;
      drawHeader();

      page.drawText("Brought Forward:", { x: CONFIG.COLUMNS.CONTENTS.x - 70, y: y - 15, size: 8, font: this.fonts.bold });
      page.drawText(runningQty.toFixed(3), { x: CONFIG.COLUMNS.TOTAL.x + 5, y: y - 15, size: 8, font: this.fonts.bold });
      y -= 25;
      tableTopY = y;
    };

    drawHeader();

    let itemSl = 1;
    for (const item of this.data.items) {
      const descText = `${itemSl++}. ${item.description}`;
      const descLines = this.splitText(descText, this.fonts.bold, CONFIG.FONTS.NORMAL, CONFIG.COLUMNS.PARTICULARS.w - 10);
      let rowH = descLines.length * 14 + 10;

      if (y - rowH < CONFIG.MARGIN.BOTTOM + 20) doPageBreak();

      let topY = y;
      let lineY = y - 12;
      descLines.forEach(l => {
        page.drawText(l, { x: CONFIG.COLUMNS.PARTICULARS.x + 5, y: lineY, size: CONFIG.FONTS.NORMAL, font: this.fonts.bold });
        lineY -= 14;
      });
      y -= rowH;
      this.drawMeasurementLines(page, topY, y);

      let itemTotal = 0;
      for (let i = 0; i < item.measurements.length; i++) {
        const m = item.measurements[i];
        if (y - 20 < CONFIG.MARGIN.BOTTOM + 20) doPageBreak();

        const qty = m.quantity ?? (m.no * m.l * m.b * m.d);
        itemTotal += qty;
        runningQty += qty;

        topY = y;
        const ty = y - 12;

        let mdY = ty;
        if (m.description) {
          const mDescLines = this.splitText(m.description, this.fonts.regular, CONFIG.FONTS.SMALL, CONFIG.COLUMNS.PARTICULARS.w - 10);
          mDescLines.forEach(l => {
            page.drawText(l, { x: CONFIG.COLUMNS.PARTICULARS.x + 5, y: mdY, size: CONFIG.FONTS.SMALL, font: this.fonts.regular });
            mdY -= 12;
          });
          y = mdY + 12 - 5;
        } else {
          y -= 20;
        }

        const cols = CONFIG.COLUMNS;
        page.drawText(m.no.toString(), { x: cols.NO.x + 5, y: ty, size: CONFIG.FONTS.NORMAL, font: this.fonts.regular });
        page.drawText(m.l ? m.l.toFixed(2) : '', { x: cols.L.x + 5, y: ty, size: CONFIG.FONTS.NORMAL, font: this.fonts.regular });
        page.drawText(m.b ? m.b.toFixed(2) : '', { x: cols.B.x + 5, y: ty, size: CONFIG.FONTS.NORMAL, font: this.fonts.regular });
        page.drawText(m.d ? m.d.toFixed(2) : '', { x: cols.D.x + 5, y: ty, size: CONFIG.FONTS.NORMAL, font: this.fonts.regular });
        page.drawText(qty.toFixed(3), { x: cols.CONTENTS.x + 5, y: ty, size: CONFIG.FONTS.NORMAL, font: this.fonts.regular });

        this.drawMeasurementLines(page, topY, y);
      }

      if (y - 25 < CONFIG.MARGIN.BOTTOM + 20) doPageBreak();
      topY = y;
      page.drawText("Item Total:", { x: CONFIG.COLUMNS.CONTENTS.x - 50, y: y - 16, size: CONFIG.FONTS.NORMAL, font: this.fonts.bold });
      page.drawText(itemTotal.toFixed(3), { x: CONFIG.COLUMNS.TOTAL.x + 5, y: y - 16, size: CONFIG.FONTS.NORMAL, font: this.fonts.bold, color: CONFIG.COLORS.ACCENT });
      y -= 25;
      this.drawMeasurementLines(page, topY, y);
    }

    this.drawMeasurementLines(page, tableTopY, y);
    page.drawText(`Pg M-${pageNum++}`, { x: 360, y: 15, size: 8, font: this.fonts.regular });
  }

  private drawAbstract(doc: PDFDocument) {
    let page = doc.addPage(CONFIG.A5_PORTRAIT);
    let y = CONFIG.A5_PORTRAIT[1] - CONFIG.MARGIN.TOP;
    let pageNum = 1;
    let tableTopY = y - 30;
    let abstractTotal = 0;

    const drawHeader = () => {
      this.drawCenterText(page, "ABSTRACT OF COST", y - 10, CONFIG.FONTS.TITLE - 4, this.fonts.bold);
      y -= 30;
      tableTopY = y;

      const cols = CONFIG.ABSTRACT_COLUMNS;
      const hY = y - 12;
      page.drawText("Sl", { x: cols.SL.x + 5, y: hY, size: CONFIG.FONTS.HEADER, font: this.fonts.bold });
      page.drawText("Description", { x: cols.DESC.x + 5, y: hY, size: CONFIG.FONTS.HEADER, font: this.fonts.bold });
      page.drawText("Unit", { x: cols.UNIT.x + 5, y: hY, size: CONFIG.FONTS.HEADER, font: this.fonts.bold });
      page.drawText("Rate", { x: cols.RATE.x + 5, y: hY, size: CONFIG.FONTS.HEADER, font: this.fonts.bold });
      page.drawText("Qty", { x: cols.QTY.x + 5, y: hY, size: CONFIG.FONTS.HEADER, font: this.fonts.bold });
      page.drawText("Amount", { x: cols.AMOUNT.x + 5, y: hY, size: CONFIG.FONTS.HEADER, font: this.fonts.bold });

      y -= 20;
      this.drawAbstractLines(page, tableTopY, y);
    };

    const doPageBreak = () => {
      this.drawAbstractLines(page, tableTopY, y);
      page.drawText(`Pg A-${pageNum++}`, { x: 360, y: 15, size: 8, font: this.fonts.regular });
      page = doc.addPage(CONFIG.A5_PORTRAIT);
      y = CONFIG.A5_PORTRAIT[1] - CONFIG.MARGIN.TOP;
      drawHeader();
    };

    drawHeader();

    let sl = 1;
    for (const item of this.data.items) {
      let qty = 0;
      item.measurements.forEach(m => qty += (m.quantity ?? (m.no * m.l * m.b * m.d)));
      const rate = item.rate || 0;
      const amt = item.amount ?? (qty * rate);
      abstractTotal += amt;

      const descLines = this.splitText(item.description, this.fonts.regular, CONFIG.FONTS.NORMAL, CONFIG.ABSTRACT_COLUMNS.DESC.w - 5);
      const rowH = Math.max(20, descLines.length * 14 + 10);

      if (y - rowH < CONFIG.MARGIN.BOTTOM + 20) doPageBreak();

      let topY = y;
      page.drawText(sl.toString(), { x: CONFIG.ABSTRACT_COLUMNS.SL.x + 5, y: y - 14, size: CONFIG.FONTS.NORMAL, font: this.fonts.regular });

      let lineY = y - 14;
      descLines.forEach(l => {
        page.drawText(l, { x: CONFIG.ABSTRACT_COLUMNS.DESC.x + 5, y: lineY, size: CONFIG.FONTS.NORMAL, font: this.fonts.regular });
        lineY -= 14;
      });

      page.drawText(item.unit || '', { x: CONFIG.ABSTRACT_COLUMNS.UNIT.x + 5, y: y - 14, size: CONFIG.FONTS.NORMAL, font: this.fonts.regular });
      page.drawText(rate.toFixed(2), { x: CONFIG.ABSTRACT_COLUMNS.RATE.x + 5, y: y - 14, size: CONFIG.FONTS.NORMAL, font: this.fonts.regular });
      page.drawText(qty.toFixed(3), { x: CONFIG.ABSTRACT_COLUMNS.QTY.x + 5, y: y - 14, size: CONFIG.FONTS.NORMAL, font: this.fonts.regular });
      page.drawText(amt.toFixed(2), { x: CONFIG.ABSTRACT_COLUMNS.AMOUNT.x + 5, y: y - 14, size: CONFIG.FONTS.NORMAL, font: this.fonts.regular });

      y -= rowH;
      this.drawAbstractLines(page, topY, y);
      sl++;
    }

    if (y - 30 < CONFIG.MARGIN.BOTTOM) doPageBreak();
    let topY = y;
    page.drawText("Total Abstract Amount: Rs. " + abstractTotal.toFixed(2), { x: CONFIG.ABSTRACT_COLUMNS.DESC.x + 30, y: y - 20, size: CONFIG.FONTS.SUBTITLE, font: this.fonts.bold });
    y -= 35;
    this.drawAbstractLines(page, topY, y);
    page.drawText(`Pg A-${pageNum++}`, { x: 360, y: 15, size: 8, font: this.fonts.regular });
  }

  private padBlankPages(doc: PDFDocument) {
    const pageCount = doc.getPageCount();
    const remainder = pageCount % 4;
    if (remainder !== 0) {
      const toAdd = 4 - remainder;
      for (let i = 0; i < toAdd; i++) {
        const page = doc.addPage(CONFIG.A5_PORTRAIT);
        this.drawCenterText(page, "[Intentionally Blank]", CONFIG.A5_PORTRAIT[1] / 2, 10, this.fonts.regular, CONFIG.COLORS.TEXT_MUTED);
      }
    }
  }

  // --------------------------------------------------------------------------
  // UI / DRAWING HELPERS
  // --------------------------------------------------------------------------

  private drawMeasurementLines(page: PDFPage, topY: number, bottomY: number) {
    page.drawLine({ start: { x: 20, y: topY }, end: { x: 400, y: topY }, thickness: 0.5, color: CONFIG.COLORS.BORDER });
    page.drawLine({ start: { x: 20, y: bottomY }, end: { x: 400, y: bottomY }, thickness: 0.5, color: CONFIG.COLORS.BORDER });
    const cols = Object.values(CONFIG.COLUMNS).map(c => c.x);
    [...cols, 400].forEach(x => {
      page.drawLine({ start: { x, y: topY }, end: { x, y: bottomY }, thickness: 0.5, color: CONFIG.COLORS.BORDER });
    });
  }

  private drawAbstractLines(page: PDFPage, topY: number, bottomY: number) {
    page.drawLine({ start: { x: 20, y: topY }, end: { x: 400, y: topY }, thickness: 0.5, color: CONFIG.COLORS.BORDER });
    page.drawLine({ start: { x: 20, y: bottomY }, end: { x: 400, y: bottomY }, thickness: 0.5, color: CONFIG.COLORS.BORDER });
    const cols = Object.values(CONFIG.ABSTRACT_COLUMNS).map(c => c.x);
    [...cols, 400].forEach(x => {
      page.drawLine({ start: { x, y: topY }, end: { x, y: bottomY }, thickness: 0.5, color: CONFIG.COLORS.BORDER });
    });
  }

  private drawCenterText(page: PDFPage, text: string, y: number, size: number, font: PDFFont, color = CONFIG.COLORS.TEXT_MAIN) {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (CONFIG.A5_PORTRAIT[0] - w) / 2, y, size, font, color });
  }

  private splitText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
    if (!text) return [''];
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (font.widthOfTextAtSize(testLine, size) <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);
    return lines;
  }
}

// Keep the old function names exported for your application aliases
export async function generateMeasurementBookPDF(data: MBData): Promise<Uint8Array> {
  const generator = new MeasurementBookGenerator(data);
  return await generator.generate();
}

export async function generateRealGovtMB(data: MBData): Promise<Uint8Array> {
  return generateMeasurementBookPDF(data);
}
