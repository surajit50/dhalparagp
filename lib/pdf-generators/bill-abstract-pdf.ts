import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from 'pdf-lib';

// ============================================================================
// INTERFACE DEFINITIONS
// ============================================================================

export interface BillAbstractEntry {
  workItemDescription: string;
  mbNumber: string;
  mbPageNumber: string;
  quantityExecuted: number;
  unit: string;
  rate: number;
  amount: number;
  remarks?: string;
  isHeader?: boolean;
  isSubItem?: boolean;
  slNo?: string;
}

export interface BillAbstractPDFData {
  billType: string;
  projectName: string;
  projectLocation: string;
  entries: BillAbstractEntry[];
  itemwiseTotal: number;
  contractualPercent: string;
  contractualDeduction: number;
  actualValue: number;
  sayAmount: number;
  cgstPercent: string;
  cgstAmount: number;
  sgstPercent: string;
  sgstAmount: number;
  lwcPercent: string;
  lwcAmount: number;
  subTotal: number;
  grossBillAmount: number;
  mbNumber: string;
  mbPages: string;
}

// ============================================================================
// PDF CONFIGURATION – ARCHITECTURAL DESIGN STYLE
// ============================================================================

const CONFIG = {
  PAGE_SIZE: [595.28, 841.89] as [number, number], // A4
  MARGIN: { TOP: 40, BOTTOM: 40, LEFT: 30, RIGHT: 30 },
  COLORS: {
    PRIMARY: rgb(0.05, 0.1, 0.2),    // Deep Navy
    ACCENT: rgb(0.3, 0.45, 0.6),     // Muted Steel Blue
    SUCCESS_BG: rgb(0.95, 0.98, 0.95),
    TEXT_MAIN: rgb(0.15, 0.15, 0.15),
    TEXT_MUTED: rgb(0.5, 0.5, 0.5),
    BORDER_LIGHT: rgb(0.9, 0.9, 0.9),
    BORDER_DARK: rgb(0.7, 0.7, 0.7),
    HEADER_BG: rgb(0.97, 0.98, 1.0), 
    ROW_ALT_BG: rgb(0.99, 0.99, 1.0),
  },
  FONTS: {
    TITLE: 16,
    SUBTITLE: 9,
    HEADER: 7.5,
    NORMAL: 8.5,
    SMALL: 7,
    FOOTER: 7,
  },
  SPACING: {
    LINE_HEIGHT: 13,
    SECTION_GAP: 24,
    CELL_PADDING: 6,
  },
  // Column widths tuned for engineering descriptions
  COLUMN_WIDTHS: [25, 260, 45, 40, 30, 45, 50, 40],
};

// ============================================================================
// GENERATOR CLASS
// ============================================================================

class BillAbstractGenerator {
  private pdfDoc!: PDFDocument;
  private page!: PDFPage;
  private y!: number;
  private width!: number;
  private height!: number;
  private fonts!: { regular: PDFFont; bold: PDFFont; };
  private data: BillAbstractPDFData;
  private colX: number[] = [];

  constructor(data: BillAbstractPDFData) {
    this.data = this.preprocessData(data);
    this.calculateColumnPositions();
  }

  private preprocessData(data: BillAbstractPDFData): BillAbstractPDFData {
    const clean = (text: string | undefined) =>
      text ? text.replace(/[^\x00-\x7F]/g, '').trim() : '';

    return {
      ...data,
      billType: clean(data.billType),
      projectName: clean(data.projectName),
      projectLocation: clean(data.projectLocation),
      entries: data.entries.map(e => ({
        ...e,
        workItemDescription: clean(e.workItemDescription),
        unit: clean(e.unit),
        remarks: e.remarks ? clean(e.remarks) : undefined,
      })),
    };
  }

  private calculateColumnPositions() {
    let currentX = CONFIG.MARGIN.LEFT;
    CONFIG.COLUMN_WIDTHS.forEach(width => {
      this.colX.push(currentX);
      currentX += width;
    });
  }

  async generate(): Promise<Uint8Array> {
    this.pdfDoc = await PDFDocument.create();
    this.fonts = {
      regular: await this.pdfDoc.embedFont(StandardFonts.Helvetica),
      bold: await this.pdfDoc.embedFont(StandardFonts.HelveticaBold),
    };

    this.addNewPage();
    this.drawHeader();
    this.drawTable();
    this.drawCalculationSection();
    this.drawCertificateAndSignatures();
    this.drawPageNumbers();

    return await this.pdfDoc.save();
  }

  private addNewPage() {
    this.page = this.pdfDoc.addPage(CONFIG.PAGE_SIZE);
    const { width, height } = this.page.getSize();
    this.width = width;
    this.height = height;
    this.y = height - CONFIG.MARGIN.TOP;
  }

  private checkPageBreak(neededSpace: number) {
    if (this.y - neededSpace < CONFIG.MARGIN.BOTTOM + 20) {
      this.addNewPage();
      return true;
    }
    return false;
  }

  private drawHeader() {
    const title = 'BILL ABSTRACT STATEMENT';
    const titleWidth = this.fonts.bold.widthOfTextAtSize(title, CONFIG.FONTS.TITLE);
    
    this.page.drawText(title, {
      x: (this.width - titleWidth) / 2,
      y: this.y,
      size: CONFIG.FONTS.TITLE,
      font: this.fonts.bold,
      color: CONFIG.COLORS.PRIMARY,
    });
    
    // Modern decorative underline
    this.page.drawLine({
      start: { x: (this.width - titleWidth) / 2, y: this.y - 5 },
      end: { x: (this.width + titleWidth) / 2, y: this.y - 5 },
      thickness: 1.5,
      color: CONFIG.COLORS.ACCENT,
    });

    this.y -= 35;

    // Project Info Card
    this.page.drawRectangle({
      x: CONFIG.MARGIN.LEFT,
      y: this.y - 40,
      width: this.width - (CONFIG.MARGIN.LEFT * 2),
      height: 45,
      color: CONFIG.COLORS.HEADER_BG,
      borderColor: CONFIG.COLORS.BORDER_LIGHT,
      borderWidth: 1,
    });

    this.page.drawText('PROJECT DETAILS', {
      x: CONFIG.MARGIN.LEFT + 10,
      y: this.y - 5,
      size: CONFIG.FONTS.SMALL,
      font: this.fonts.bold,
      color: CONFIG.COLORS.ACCENT,
    });

    const projectText = `${this.data.projectName}${this.data.projectLocation ? ' — ' + this.data.projectLocation : ''}`;
    this.page.drawText(projectText.toUpperCase(), {
      x: CONFIG.MARGIN.LEFT + 10,
      y: this.y - 22,
      size: CONFIG.FONTS.NORMAL,
      font: this.fonts.bold,
      color: CONFIG.COLORS.TEXT_MAIN,
    });

    this.y -= 65;
  }

  private drawTableHeader() {
    const headerHeight = 30;
    this.page.drawRectangle({
      x: CONFIG.MARGIN.LEFT,
      y: this.y - headerHeight,
      width: this.width - (CONFIG.MARGIN.LEFT * 2),
      height: headerHeight,
      color: CONFIG.COLORS.PRIMARY,
    });

    const headers = ['SL.', 'ITEM DESCRIPTION', 'MB REF', 'QTY', 'UNIT', 'RATE', 'AMOUNT', 'REMARKS'];
    headers.forEach((text, i) => {
      const tw = this.fonts.bold.widthOfTextAtSize(text, CONFIG.FONTS.HEADER);
      let tx = this.colX[i] + (CONFIG.COLUMN_WIDTHS[i] - tw) / 2;
      
      this.page.drawText(text, {
        x: tx,
        y: this.y - 18,
        size: CONFIG.FONTS.HEADER,
        font: this.fonts.bold,
        color: rgb(1, 1, 1),
      });
    });

    this.y -= headerHeight;
  }

  private drawTable() {
    this.drawTableHeader();
    
    this.data.entries.forEach((entry, i) => {
      const isHeader = !!entry.isHeader;
      const isSubItem = !!entry.isSubItem;
      
      const mbText = (entry.mbNumber || entry.mbPageNumber)
        ? `${entry.mbNumber ? 'M' + entry.mbNumber : ''} P${entry.mbPageNumber || ''}`.trim()
        : '';

      const cells = [
        entry.slNo || (i + 1).toString(),
        (isSubItem ? '  ' : '') + entry.workItemDescription,
        mbText,
        entry.quantityExecuted ? entry.quantityExecuted.toFixed(2) : '',
        entry.unit || '',
        entry.rate ? entry.rate.toFixed(2) : '',
        entry.amount.toFixed(2),
        entry.remarks || ''
      ];

      const cellLines = cells.map((text, idx) => 
        this.splitText(text, isHeader ? this.fonts.bold : this.fonts.regular, CONFIG.FONTS.NORMAL, CONFIG.COLUMN_WIDTHS[idx] - (CONFIG.SPACING.CELL_PADDING * 2))
      );
      
      const rowHeight = Math.max(22, Math.max(...cellLines.map(l => l.length)) * CONFIG.SPACING.LINE_HEIGHT + 10);

      if (this.checkPageBreak(rowHeight)) this.drawTableHeader();

      // Alternate row background
      if (i % 2 === 0) {
        this.page.drawRectangle({
          x: CONFIG.MARGIN.LEFT,
          y: this.y - rowHeight,
          width: this.width - (CONFIG.MARGIN.LEFT * 2),
          height: rowHeight,
          color: CONFIG.COLORS.ROW_ALT_BG,
        });
      }

      cellLines.forEach((lines, colIdx) => {
        let lineY = this.y - 15;
        lines.forEach(line => {
          const font = isHeader ? this.fonts.bold : this.fonts.regular;
          const tw = font.widthOfTextAtSize(line, CONFIG.FONTS.NORMAL);
          let tx = this.colX[colIdx] + CONFIG.SPACING.CELL_PADDING;

          // Align numbers to the right
          if ([3, 5, 6].includes(colIdx)) {
            tx = this.colX[colIdx] + CONFIG.COLUMN_WIDTHS[colIdx] - tw - CONFIG.SPACING.CELL_PADDING;
          }

          this.page.drawText(line, { x: tx, y: lineY, size: CONFIG.FONTS.NORMAL, font, color: CONFIG.COLORS.TEXT_MAIN });
          lineY -= CONFIG.SPACING.LINE_HEIGHT;
        });
      });

      this.y -= rowHeight;
      this.page.drawLine({
        start: { x: CONFIG.MARGIN.LEFT, y: this.y },
        end: { x: this.width - CONFIG.MARGIN.RIGHT, y: this.y },
        thickness: 0.5,
        color: CONFIG.COLORS.BORDER_LIGHT,
      });
    });
  }

  private drawCalculationSection() {
    this.checkPageBreak(220);
    this.y -= 20;

    const boxWidth = 240;
    const boxX = this.width - CONFIG.MARGIN.RIGHT - boxWidth;
    const startY = this.y;

    const drawRow = (label: string, value: string, isBold = false, isTotal = false) => {
      this.y -= 18;
      const font = isBold ? this.fonts.bold : this.fonts.regular;
      const color = isTotal ? CONFIG.COLORS.PRIMARY : CONFIG.COLORS.TEXT_MAIN;
      
      this.page.drawText(label, { x: boxX + 12, y: this.y, size: CONFIG.FONTS.NORMAL, font, color });
      const valW = font.widthOfTextAtSize(value, CONFIG.FONTS.NORMAL);
      this.page.drawText(value, { x: this.width - CONFIG.MARGIN.RIGHT - 12 - valW, y: this.y, size: CONFIG.FONTS.NORMAL, font, color });
    };

    drawRow('Subtotal (Item-wise)', this.data.itemwiseTotal.toFixed(2), true);
    drawRow(`Contractor Variation (${this.data.contractualPercent}%)`, `(${this.data.contractualDeduction.toFixed(2)})`);
    
    this.y -= 5;
    this.page.drawLine({ start: { x: boxX + 10, y: this.y }, end: { x: this.width - CONFIG.MARGIN.RIGHT - 10, y: this.y }, thickness: 0.5, color: CONFIG.COLORS.BORDER_LIGHT });
    
    drawRow('Actual Assessment', this.data.actualValue.toFixed(2), true);
    drawRow('GST (CGST + SGST)', (this.data.cgstAmount + this.data.sgstAmount).toFixed(2));
    drawRow('Labor Welfare Cess', this.data.lwcAmount.toFixed(2));

    // Highlight Final Amount
    this.y -= 10;
    this.page.drawRectangle({ x: boxX, y: this.y - 12, width: boxWidth, height: 28, color: CONFIG.COLORS.SUCCESS_BG });
    this.y -= 5;
    drawRow('GROSS PAYABLE', `₹ ${this.data.grossBillAmount.toFixed(2)}`, true, true);

    this.page.drawRectangle({
      x: boxX,
      y: this.y - 10,
      width: boxWidth,
      height: startY - this.y + 10,
      borderColor: CONFIG.COLORS.BORDER_DARK,
      borderWidth: 1,
    });

    this.y -= 40;
  }

  private drawCertificateAndSignatures() {
    const cert = `Certified that the necessary measurements were made and are recorded at pages ${this.data.mbPages} of MB No. ${this.data.mbNumber}. Work performed as per specification.`;
    const lines = this.splitText(cert, this.fonts.regular, CONFIG.FONTS.SMALL, this.width - 100);
    
    lines.forEach(line => {
      this.page.drawText(line, { x: CONFIG.MARGIN.LEFT, y: this.y, size: CONFIG.FONTS.SMALL, font: this.fonts.regular, color: CONFIG.COLORS.TEXT_MUTED });
      this.y -= 10;
    });

    this.y -= 50;
    const sigs = ['Contractor', 'Nirman Sahayak', 'Secretary', 'Pradhan'];
    const sigWidth = (this.width - 60) / 4;

    sigs.forEach((sig, i) => {
      const x = CONFIG.MARGIN.LEFT + (i * sigWidth);
      this.page.drawLine({ start: { x: x + 10, y: this.y + 15 }, end: { x: x + sigWidth - 10, y: this.y + 15 }, thickness: 0.5, color: CONFIG.COLORS.TEXT_MUTED });
      const tw = this.fonts.bold.widthOfTextAtSize(sig, CONFIG.FONTS.SMALL);
      this.page.drawText(sig, { x: x + (sigWidth - tw) / 2, y: this.y, size: CONFIG.FONTS.SMALL, font: this.fonts.bold, color: CONFIG.COLORS.PRIMARY });
    });
  }

  private drawPageNumbers() {
    const pages = this.pdfDoc.getPages();
    pages.forEach((page, i) => {
      page.drawText(`Page ${i + 1} of ${pages.length}`, {
        x: this.width / 2 - 20,
        y: 20,
        size: CONFIG.FONTS.FOOTER,
        font: this.fonts.regular,
        color: CONFIG.COLORS.TEXT_MUTED,
      });
    });
  }

  private splitText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
    if (!text) return [''];
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const test = currentLine ? `${currentLine} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) < maxWidth) {
        currentLine = test;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });
    lines.push(currentLine);
    return lines;
  }
}

export async function generateBillAbstractPDF(data: BillAbstractPDFData): Promise<Uint8Array> {
  const generator = new BillAbstractGenerator(data);
  return await generator.generate();
}
