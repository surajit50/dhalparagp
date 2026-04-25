import { loadJSONTemplate } from "@/lib/loadJSONTemplate";
import { generate } from "@pdfme/generator";
import {
  text,
  image,
  table,
  multiVariableText,
  line,
  rectangle,
} from "@pdfme/schemas";
import type { Font } from "@pdfme/common";

export async function generatePDF(
  templatePath: string,
  inputs: any[],
  customFonts?: Font
) {
  try {
    if (!templatePath) {
      throw new Error("Template path is required");
    }

    const template = await loadJSONTemplate(templatePath);
    console.log("Template loaded successfully:", template);

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
      options: {
        font: customFonts,
      },
    });

    return pdf;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF. Please try again later.");
  }
}
