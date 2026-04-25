import { NextRequest } from "next/server";
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
import type { Template } from "@pdfme/common";

async function loadTemplate(request: NextRequest): Promise<Template> {
  // Construct URL to the template in public directory
  const templateUrl = new URL(
    "/templates/printprayer.json",
    request.nextUrl.origin
  );

  const response = await fetch(templateUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch template: ${response.statusText}`);
  }

  return await response.json();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Load template first
    const template = await loadTemplate(req);

    // Format dates
    const nitDate = new Date(body.nitDate);
    const workOrderDate = new Date(body.workOrderDate);
    const nitDateFormatted = formatDate(nitDate);
    const workOrderDateFormatted = formatDate(workOrderDate);
    const currentDateFormatted = formatDate(new Date());

    // Format NIT details
    const nitDetails = `${body.nitNumber}/${nitDate.getFullYear()}`;

    // Prepare input data
    const inputs = [
      {
        gpname: gpname,
        nitDetails: nitDetails,
        nitDate: nitDateFormatted,
        workOrderNumber: body.workOrderNumber,
        workOrderDate: workOrderDateFormatted,
        workSlNo: body.workSlNo.toString(),
        workName: body.workName,
        contractorName: body.contractorName,
        contractorAddress: body.contractorAddress || "N/A",
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

    return new Response(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="print-prayer-${body.workOrderNumber}-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error in /api/print-prayer:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate PDF",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}


