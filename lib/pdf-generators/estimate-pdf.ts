import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from 'pdf-lib';

// ============================================================================
// INTERFACE DEFINITIONS
// ============================================================================

export interface EstimateMeasurement {
  description: string;
  nos: number;
  length: number;
  breadth: number;
  depth: number;
  quantity: number;
}

export interface SubItem {
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface EstimateItem {
  slNo: number;
  schedulePageNo: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  measurements?: EstimateMeasurement[];
  subItems?: SubItem[];
}

export interface EstimatePDFData {
  projectName: string;
  projectLocation: string;
  activityCode: string;
  fund: string;
  items: EstimateItem[];
  itemwiseTotal: number;
  gstAmount: number;
  costExclLWC: number;
  lwcAmount: number;
  costInclLWC: number;
  contingency: number;
  grandTotal: number;
  amountInWords: string;
  mode: 'detailed' | 'abstract';
}

// ============================================================================
// PDF CONFIGURATION – MODERN PROFESSIONAL DESIGN
// ============================================================================

const CONFIG = {
  PAGE_SIZE: [595.28, 841.89] as [number, number],
  MARGIN: { TOP: 40, BOTTOM: 40, LEFT: 30, RIGHT: 30 },
  COLORS: {
    TEXT_MAIN: rgb(0.1, 0.1, 0.1),
    TEXT_MUTED: rgb(0.4, 0.4, 0.4),
    BORDER: rgb(0.8, 0.8, 0.8),
    HEADER_BG: rgb(0.96, 0.97, 0.98),
    ROW_ALT_BG: rgb(0.99, 0.99, 0.99),
    ACCENT: rgb(0.2, 0.4, 0.6),
  },
  FONTS: {
    TITLE: 14,
    SUBTITLE: 10,
    HEADER: 8,
    NORMAL: 8,
    SMALL: 7,
    FOOTER: 7,
  },
  SPACING: {
    LINE_HEIGHT: 12,
    SECTION_GAP: 20,
    CELL_PADDING: 4,
  },
  // Columns for Abstract Mode
  COL_WIDTHS_ABSTRACT: [25, 35, 235, 50, 40, 50, 60],
  // Columns for Detailed Mode
  COL_WIDTHS_DETAILED: [25, 35, 175, 30, 35, 35, 35, 45, 35, 45, 55],
};

// ============================================================================
// GENERATOR CLASS
// ============================================================================

class EstimatePDFGenerator {
  private pdfDoc!: PDFDocument;
  private page!: PDFPage;
  private y!: number;
  private width!: number;
  private height!: number;
  private fonts!: {
    regular: PDFFont;
    bold: PDFFont;
  };
  private data: EstimatePDFData;
  private colX: number[] = [];
  private currentWidths: number[] = [];

  constructor(data: EstimatePDFData) {
    this.data = this.preprocessData(data);
    this.currentWidths = this.data.mode === 'abstract' ? CONFIG.COL_WIDTHS_ABSTRACT : CONFIG.COL_WIDTHS_DETAILED;
    this.calculateColumnPositions();
  }

  private preprocessData(data: EstimatePDFData): EstimatePDFData {
    const clean = (text: string | undefined) =>
      text ? text.replace(/\r/g, '').replace(/[^\x00-\x7F\x0A]/g, '?').trim() : '';

    return {
      ...data,
      projectName: clean(data.projectName),
      projectLocation: clean(data.projectLocation),
      fund: clean(data.fund),
      items: data.items.map(item => ({
        ...item,
        description: clean(item.description),
        subItems: item.subItems?.map(sub => ({ ...sub, description: clean(sub.description) })),
        measurements: item.measurements?.map(m => ({ ...m, description: clean(m.description) })),
      })),
      amountInWords: clean(data.amountInWords),
    };
  }

  private calculateColumnPositions() {
    let currentX = CONFIG.MARGIN.LEFT;
    this.currentWidths.forEach(width => {
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
    this.drawSummary();
    this.drawFooter();

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
    if (this.y - neededSpace < CONFIG.MARGIN.BOTTOM) {
      this.addNewPage();
      this.drawTableHeader();
      return true;
    }
    return false;
  }

  private drawHeader() {
    const title = 'PROBABLE ESTIMATE';
    const subTitle = this.data.mode === 'detailed' ? 'Detailed Estimate with Measurements' : 'Abstract Estimate';
    
    const tw1 = this.fonts.bold.widthOfTextAtSize(title, CONFIG.FONTS.TITLE);
    this.page.drawText(title, { x: (this.width - tw1) / 2, y: this.y, size: CONFIG.FONTS.TITLE, font: this.fonts.bold, color: CONFIG.COLORS.ACCENT });
    this.y -= 15;
    
    const tw2 = this.fonts.regular.widthOfTextAtSize(subTitle, CONFIG.FONTS.SUBTITLE);
    this.page.drawText(subTitle, { x: (this.width - tw2) / 2, y: this.y, size: CONFIG.FONTS.SUBTITLE, font: this.fonts.regular, color: CONFIG.COLORS.TEXT_MUTED });
    this.y -= CONFIG.SPACING.SECTION_GAP;

    // Project Details Box
    const boxY = this.y;
    this.drawDetailRow('Project:', this.data.projectName);
    this.drawDetailRow('Location:', this.data.projectLocation);
    this.drawDetailRow('Activity Code:', this.data.activityCode, this.width / 2);
    this.drawDetailRow('Fund:', this.data.fund, this.width / 2, boxY - 12);

    this.y -= CONFIG.SPACING.SECTION_GAP / 2;
  }

  private drawDetailRow(label: string, value: string, xOffset: number = CONFIG.MARGIN.LEFT, yOffset: number = this.y) {
    this.page.drawText(label, { x: xOffset, y: yOffset, size: 8, font: this.fonts.bold, color: CONFIG.COLORS.TEXT_MUTED });
    this.page.drawText(value, { x: xOffset + 60, y: yOffset, size: 8, font: this.fonts.regular, color: CONFIG.COLORS.TEXT_MAIN });
    if (xOffset === CONFIG.MARGIN.LEFT) this.y -= 12;
  }

  private drawTableHeader() {
    const headerHeight = 25;
    this.page.drawRectangle({
      x: CONFIG.MARGIN.LEFT,
      y: this.y - headerHeight,
      width: this.width - CONFIG.MARGIN.LEFT - CONFIG.MARGIN.RIGHT,
      height: headerHeight,
      color: CONFIG.COLORS.HEADER_BG,
    });

    const headers = this.data.mode === 'abstract' 
      ? ['Sl', 'Page', 'Item Description', 'Quantity', 'Unit', 'Rate', 'Amount']
      : ['Sl', 'Page', 'Item Description', 'Nos', 'L', 'B', 'D', 'Qty', 'Unit', 'Rate', 'Amount'];

    const topY = this.y;
    const bottomY = this.y - headerHeight;

    headers.forEach((h, i) => {
      const tw = this.fonts.bold.widthOfTextAtSize(h, CONFIG.FONTS.HEADER);
      const tx = this.colX[i] + (this.currentWidths[i] - tw) / 2;
      this.page.drawText(h, { x: tx, y: bottomY + 8, size: CONFIG.FONTS.HEADER, font: this.fonts.bold, color: CONFIG.COLORS.ACCENT });
      
      if (i > 0) {
        this.page.drawLine({ start: { x: this.colX[i], y: topY }, end: { x: this.colX[i], y: bottomY }, thickness: 0.5, color: CONFIG.COLORS.BORDER });
      }
    });

    this.page.drawLine({ start: { x: CONFIG.MARGIN.LEFT, y: topY }, end: { x: this.width - CONFIG.MARGIN.RIGHT, y: topY }, thickness: 1, color: CONFIG.COLORS.BORDER });
    this.page.drawLine({ start: { x: CONFIG.MARGIN.LEFT, y: bottomY }, end: { x: this.width - CONFIG.MARGIN.RIGHT, y: bottomY }, thickness: 1, color: CONFIG.COLORS.ACCENT });

    this.y = bottomY;
  }

  private drawTable() {
    this.drawTableHeader();

    this.data.items.forEach((item, index) => {
      this.drawItemRows(item, index);
    });

    this.page.drawLine({ start: { x: CONFIG.MARGIN.LEFT, y: this.y }, end: { x: this.width - CONFIG.MARGIN.RIGHT, y: this.y }, thickness: 1, color: CONFIG.COLORS.BORDER });
  }

  private drawItemRows(item: EstimateItem, index: number) {
    const isDetailed = this.data.mode === 'detailed';
    const descLines = this.splitText(item.description, this.fonts.bold, CONFIG.FONTS.NORMAL, this.currentWidths[2] - 10);
    const rowHeight = Math.max(20, descLines.length * CONFIG.SPACING.LINE_HEIGHT + 8);

    this.checkPageBreak(rowHeight);

    // Main Item Row
    const rowTopY = this.y;
    if (index % 2 === 0) {
      this.page.drawRectangle({ x: CONFIG.MARGIN.LEFT, y: this.y - rowHeight, width: this.width - CONFIG.MARGIN.LEFT - CONFIG.MARGIN.RIGHT, height: rowHeight, color: CONFIG.COLORS.ROW_ALT_BG });
    }

    this.page.drawText(item.slNo.toString(), { x: this.colX[0] + 5, y: this.y - 12, size: CONFIG.FONTS.NORMAL, font: this.fonts.bold });
    this.page.drawText(item.schedulePageNo || '', { x: this.colX[1] + 5, y: this.y - 12, size: CONFIG.FONTS.NORMAL, font: this.fonts.regular });
    
    let lineY = this.y - 12;
    descLines.forEach(line => {
      this.page.drawText(line, { x: this.colX[2] + 5, y: lineY, size: CONFIG.FONTS.NORMAL, font: this.fonts.bold });
      lineY -= CONFIG.SPACING.LINE_HEIGHT;
    });

    if (!isDetailed) {
      this.drawCell(item.quantity.toFixed(2), 3, true);
      this.drawCell(item.unit, 4, true);
      this.drawCell(item.rate.toFixed(2), 5, true);
      this.drawCell(item.amount.toFixed(2), 6, true);
    }

    this.y -= rowHeight;
    this.drawRowLines(rowTopY, this.y);

    // Detailed Mode: Measurements & Sub-items
    if (isDetailed) {
      // Sub-items
      item.subItems?.forEach((sub, idx) => {
        const subLines = this.splitText(`   ${String.fromCharCode(97 + idx)}) ${sub.description}`, this.fonts.regular, CONFIG.FONTS.NORMAL, this.currentWidths[2] - 10);
        const subH = Math.max(15, subLines.length * CONFIG.SPACING.LINE_HEIGHT + 4);
        this.checkPageBreak(subH);
        const subTop = this.y;
        
        let subY = this.y - 10;
        subLines.forEach(l => {
          this.page.drawText(l, { x: this.colX[2], y: subY, size: CONFIG.FONTS.NORMAL, font: this.fonts.regular });
          subY -= CONFIG.SPACING.LINE_HEIGHT;
        });

        this.drawCell(sub.quantity.toFixed(2), 7, true);
        this.drawCell(sub.unit, 8, true);
        this.drawCell(sub.rate.toFixed(2), 9, true);
        this.drawCell(sub.amount.toFixed(2), 10, true);

        this.y -= subH;
        this.drawRowLines(subTop, this.y);
      });

      // Measurements
      item.measurements?.forEach(m => {
        const mLines = this.splitText(m.description, this.fonts.regular, CONFIG.FONTS.SMALL, this.currentWidths[2] - 15);
        const mH = Math.max(12, mLines.length * 10 + 4);
        this.checkPageBreak(mH);
        const mTop = this.y;

        let mY = this.y - 8;
        mLines.forEach(l => {
          this.page.drawText(l, { x: this.colX[2] + 10, y: mY, size: CONFIG.FONTS.SMALL, font: this.fonts.regular, color: CONFIG.COLORS.TEXT_MUTED });
          mY -= 10;
        });

        this.drawCell(m.nos.toString(), 3, false, true);
        this.drawCell(m.length.toFixed(2), 4, false, true);
        this.drawCell(m.breadth.toFixed(2), 5, false, true);
        this.drawCell(m.depth.toFixed(2), 6, false, true);
        this.drawCell(m.quantity.toFixed(3), 7, false, true);

        this.y -= mH;
        this.drawRowLines(mTop, this.y);
      });

      // Item Total Row
      const tH = 18;
      this.checkPageBreak(tH);
      const tTop = this.y;
      this.page.drawRectangle({ x: this.colX[7], y: this.y - tH, width: this.width - this.colX[7] - CONFIG.MARGIN.RIGHT, height: tH, color: CONFIG.COLORS.HEADER_BG });
      this.page.drawText('Item Total:', { x: this.colX[2] + 50, y: this.y - 12, size: CONFIG.FONTS.NORMAL, font: this.fonts.bold });
      this.drawCell(item.quantity.toFixed(2), 7, true);
      this.drawCell(item.unit, 8, true);
      this.drawCell(item.rate.toFixed(2), 9, true);
      this.drawCell(item.amount.toFixed(2), 10, true);
      this.y -= tH;
      this.drawRowLines(tTop, this.y);
    }
  }

  private drawCell(text: string, colIdx: number, isBold: boolean = false, isSmall: boolean = false) {
    const font = isBold ? this.fonts.bold : this.fonts.regular;
    const size = isSmall ? CONFIG.FONTS.SMALL : CONFIG.FONTS.NORMAL;
    const tw = font.widthOfTextAtSize(text, size);
    const tx = this.colX[colIdx] + (this.currentWidths[colIdx] - tw) / 2;
    this.page.drawText(text, { x: tx, y: this.y - 12, size, font, color: CONFIG.COLORS.TEXT_MAIN });
  }

  private drawRowLines(topY: number, bottomY: number) {
    this.colX.forEach(x => {
      this.page.drawLine({ start: { x, y: topY }, end: { x, y: bottomY }, thickness: 0.5, color: CONFIG.COLORS.BORDER });
    });
    this.page.drawLine({ start: { x: this.width - CONFIG.MARGIN.RIGHT, y: topY }, end: { x: this.width - CONFIG.MARGIN.RIGHT, y: bottomY }, thickness: 0.5, color: CONFIG.COLORS.BORDER });
  }

  private drawSummary() {
    this.checkPageBreak(150);
    this.y -= CONFIG.SPACING.SECTION_GAP;

    const blockW = 220;
    const startX = this.width - CONFIG.MARGIN.RIGHT - blockW;

    const drawLine = (label: string, value: number, isBold: boolean = false) => {
      const font = isBold ? this.fonts.bold : this.fonts.regular;
      this.page.drawText(label, { x: startX + 10, y: this.y, size: 9, font });
      const val = `Rs. ${value.toFixed(2)}`;
      const valW = font.widthOfTextAtSize(val, 9);
      this.page.drawText(val, { x: this.width - CONFIG.MARGIN.RIGHT - 10 - valW, y: this.y, size: 9, font });
      this.y -= 15;
    };

    drawLine('Itemwise Total:', this.data.itemwiseTotal);
    drawLine('Add GST @ 18%:', this.data.gstAmount);
    drawLine('Civil Work (Excl. LWC):', this.data.costExclLWC);
    drawLine('Add LWC @ 1%:', this.data.lwcAmount);
    
    this.y -= 5;
    this.page.drawRectangle({ x: startX, y: this.y - 20, width: blockW, height: 25, color: CONFIG.COLORS.HEADER_BG });
    this.y -= 12;
    drawLine('GRAND TOTAL:', this.data.grandTotal, true);

    this.page.drawRectangle({ x: startX, y: this.y + 10, width: blockW, height: 85, borderWidth: 1, borderColor: CONFIG.COLORS.BORDER });

    this.y -= 20;
    const words = `[In words: ${this.data.amountInWords}]`;
    const wordLines = this.splitText(words, this.fonts.bold, CONFIG.FONTS.SMALL, this.width - CONFIG.MARGIN.LEFT - CONFIG.MARGIN.RIGHT);
    wordLines.forEach(l => {
      this.page.drawText(l, { x: CONFIG.MARGIN.LEFT, y: this.y, size: CONFIG.FONTS.SMALL, font: this.fonts.bold });
      this.y -= 10;
    });
  }

  private drawFooter() {
    const pages = this.pdfDoc.getPages();
    pages.forEach((page, i) => {
      const text = `Page ${i + 1} of ${pages.length} | Generated on ${new Date().toLocaleDateString()}`;
      const tw = this.fonts.regular.widthOfTextAtSize(text, CONFIG.FONTS.FOOTER);
      page.drawText(text, { x: (this.width - tw) / 2, y: CONFIG.MARGIN.BOTTOM / 2, size: CONFIG.FONTS.FOOTER, font: this.fonts.regular, color: CONFIG.COLORS.TEXT_MUTED });
    });
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

// ============================================================================
// EXPORTED FUNCTION
// ============================================================================

export async function generateEstimatePDF(data: EstimatePDFData): Promise<Uint8Array> {
  const generator = new EstimatePDFGenerator(data);
  return await generator.generate();
}
