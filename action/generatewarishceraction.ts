"use server";

import { db } from "@/lib/db";
import fs from "fs/promises";
import path from "path";
import { generate } from "@pdfme/generator";
import { loadJSONTemplate } from "@/lib/loadJSONTemplate";

export async function generateWarishCertificate(data: FormData) {
  try {
    const applicationId = data.get("applicationid");

    if (typeof applicationId !== "string") {
      throw new Error("Invalid application ID");
    }

    const warishData = await db.warishApplication.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        warishDetails: true,
      },
    });

    if (!warishData) {
      throw new Error("Warish application not found");
    }

    // Load the JSON template from the public folder
    const templatePath = path.join(
      process.cwd(),
      "public",
      "templates",
      "warishcertificate.json"
    );
    const templateContent = await fs.readFile(templatePath, "utf-8");
    const template = await loadJSONTemplate(templateContent);

    // Prepare the input data for pdfme
    const inputs = [
      {
        applicantName: warishData.applicantName,
        field5: warishData.warishRefNo,
      },
    ];

    // Generate PDF
    const pdf = await generate({
      template,
      inputs,
    });

    // Create the 'generated' folder if it doesn't exist
    const generatedFolderPath = path.join(process.cwd(), "public", "generated");
    await fs.mkdir(generatedFolderPath, { recursive: true });

    // Save the PDF to a file
    const outputPath = path.join(generatedFolderPath, `${applicationId}.pdf`);
    await fs.writeFile(outputPath, pdf);

    return { success: true, path: `/generated/${applicationId}.pdf` };
  } catch (error) {
    console.error("Error generating Warish certificate:", error);
    throw error;
  }
}
