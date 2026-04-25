import { generateEstimatePDF, EstimatePDFData } from './estimate-pdf';

// ============================================================================
// INTERFACE DEFINITIONS
// ============================================================================

export interface AbstractCostItem {
  slNo: number;
  schedulePageNo: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  subItems?: Array<{
    description: string;
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
  }>;
}

export interface AbstractCostPDFData {
  projectName: string;
  projectLocation: string;
  activityCode: string;
  fund: string;
  items: AbstractCostItem[];
  itemwiseTotal: number;
  gstAmount: number;
  costCivilWork: number;
  lwcAmount: number;
  costCivilWorkIncl: number;
  contingencyAmount: number;
  grandTotal: number;
  sayAmount: number;
  amountInWords: string;
}

// ============================================================================
// EXPORTED FUNCTION (Wrapper around EstimatePDFGenerator)
// ============================================================================

/**
 * Generates an Abstract Cost PDF.
 * Now uses the same professional pdf-lib based generator as other PDFs for consistency.
 */
export async function generateAbstractPDF(data: AbstractCostPDFData): Promise<Uint8Array> {
  // Map AbstractCostPDFData to EstimatePDFData format used by the modern generator
  const mappedData: EstimatePDFData = {
    projectName: data.projectName,
    projectLocation: data.projectLocation,
    activityCode: data.activityCode,
    fund: data.fund,
    items: data.items,
    itemwiseTotal: data.itemwiseTotal,
    gstAmount: data.gstAmount,
    costExclLWC: data.costCivilWork,
    lwcAmount: data.lwcAmount,
    costInclLWC: data.costCivilWorkIncl,
    contingency: data.contingencyAmount,
    grandTotal: data.sayAmount || data.grandTotal, // Use sayAmount if available
    amountInWords: data.amountInWords,
    mode: 'abstract',
  };

  return await generateEstimatePDF(mappedData);
}
