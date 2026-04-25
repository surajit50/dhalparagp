"use client";

import { generate } from "@pdfme/generator";
import type { Template } from "@pdfme/common";
import {
  text,
  image,
  table,
  multiVariableText,
  line,
  rectangle,
  barcodes,
} from "@pdfme/schemas";

// Client-side PDF generation
export async function generatePDFAll(inputs: any[]) {
  try {
    // 1. Fetch the template from public directory
    const templateResponse = await fetch(
      "/templates/completationcertificate.json"
    );
    if (!templateResponse.ok) {
      throw new Error(
        `Failed to load template: ${templateResponse.statusText}`
      );
    }

    const template: Template = await templateResponse.json();

    // 2. Generate PDF
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
        ...barcodes,
      },
    });

    // 3. Create a download link
    const blob = new Blob([pdf], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    // 4. Create and click a download link
    const link = document.createElement("a");
    link.href = url;
    link.download = `completion-certificates-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();

    // 5. Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw error;
  }
}
