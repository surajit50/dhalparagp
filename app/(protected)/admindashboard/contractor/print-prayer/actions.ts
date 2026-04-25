"use server";

import { generate } from "@pdfme/generator";
import {
  text,
  image,
  table,
  multiVariableText,
  line,
  rectangle,
} from "@pdfme/schemas";
import { formatDate } from "@/utils/utils";
import { gpname } from "@/constants/gpinfor";
import { loadJSONTemplate } from "@/lib/loadJSONTemplate";

interface PrintPrayerData {
  workName: string;
  nitNumber: string;
  nitDate: Date;
  workSlNo: number | string;
  contractorName: string;
  contractorAddress: string;
  workOrderNumber: string;
  workOrderDate: Date;
  activityCode: string;
  
}

export async function generatePrintPrayerPDF(data: PrintPrayerData) {
  try {
    // Load template using the utility function
    const template = await loadJSONTemplate("/templates/printprayer.json");

    // Format dates
    const nitDateFormatted = formatDate(data.nitDate);
    const workOrderDateFormatted = formatDate(data.workOrderDate);
    const currentDateFormatted = formatDate(new Date());

    // Format NIT details
    const nitDetails = `${data.nitNumber}/${data.nitDate.getFullYear()}`;
   
    // Prepare input data
    const inputs = [
      {
        gpname: gpname,
        nitDetails: nitDetails,
        nitDate: nitDateFormatted,
        workOrderNumber: data.workOrderNumber,
        workOrderDate: workOrderDateFormatted,
        workSlNo: data.workSlNo.toString(),
        workName: `${data.workName} - ${data.activityCode}`,
        contractorName: data.contractorName,
        contractorAddress: data.contractorAddress || "N/A",
        currentDate: currentDateFormatted,
     
        
      },
    ];

    // Generate PDF
    const pdf = await generate({
      template,
      inputs,
      plugins: {
        text,
        image,
        table,
        line,
        multiVariableText,
        rectangle,
      },
    });

    return pdf;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF");
  }
}

