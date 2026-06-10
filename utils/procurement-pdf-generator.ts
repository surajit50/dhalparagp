import { generate } from "@pdfme/generator";
import { text, barcodes } from "@pdfme/schemas";
import { niqTemplate } from "./procurement-pdf-templates";

export async function generateNiqPdf(data: {
  gpName: string;
  gpAddress: string;
  nitNo: string;
  nitDate: string;
  workName: string;
  items: any[];
  submissionDeadline: string;
  openingDate: string;
}) {
  const plugins = { text, ...barcodes };

  const body = `
    Sealed quotations are hereby invited from the bonafied and resourceful agencies/suppliers for the following work:
    
    1. Name of Work: ${data.workName}
    
    2. Items to be supplied/worked:
    ${data.items.map((it, i) => `   ${String.fromCharCode(97 + i)}) ${it.description} - ${it.quantity} ${it.unit}`).join('\n')}
    
    3. Last date of submission: ${data.submissionDeadline}
    4. Date of opening: ${data.openingDate}
    
    Terms & Conditions:
    1. The rate should be inclusive of all taxes (GST, Cess, etc.).
    2. The agency must provide valid Trade License, PAN, and GST registration.
    3. The authority reserves the right to accept or reject any quotation without assigning any reason.
    4. Payment will be made through e-Pradan/PFMS after successful completion and verification.
  `;

  const inputs = [
    {
      gpName: data.gpName.toUpperCase(),
      gpAddress: `${data.gpAddress}\nBlock: Hili, Dist: Dakshin Dinajpur`,
      nitNo: `Memo No: ${data.nitNo}`,
      nitDate: `Date: ${data.nitDate}`,
      title: "NOTICE INVITING QUOTATION",
      body: body,
      qrCode: `https://dhalparagp.gov.in/verify/niq/${data.nitNo.replace(/\//g, '-')}`,
      signature: "Pradhan / Executive Assistant\nNo. 3 Dhalpara Gram Panchayat"
    }
  ];

  const pdf = await generate({ template: niqTemplate, inputs, plugins });
  return pdf;
}
