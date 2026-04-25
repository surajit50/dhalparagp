import { loadJSONTemplate } from "@/lib/loadJSONTemplate";
import { generate } from "@pdfme/generator";
import {
  text,
  image,
  table,
  multiVariableText,
  line,
  rectangle,
  barcodes,
} from "@pdfme/schemas";

export async function generatePDF(templatePath: string, inputs: any[]) {
  try {
    // Ensure the template path is valid and log for debugging
    if (!templatePath) {
      throw new Error("Template path is required");
    }

    console.log(`Loading template from: ${templatePath}`);

    // Load the JSON template from the path
    const template = await loadJSONTemplate(templatePath);

    console.log("Template loaded successfully");

    // Generate the PDF using the provided template and inputs
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

    return pdf;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF. Please try again later.");
  }
}
