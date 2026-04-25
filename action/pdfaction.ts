"use server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { v2 as cloudinary } from "cloudinary";
import { db } from "@/lib/db"; // Adjust the import path as needed

interface GeneratePdfResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

import { PassThrough } from "stream";

export async function generatePdf(content: string) {
  try {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const fontSize = 12;
    const lines = content.split("\n");
    let y = height - 50;

    for (const line of lines) {
      if (y < 50) {
        page = pdfDoc.addPage();
        y = height - 50;
      }
      page.drawText(line, {
        x: 50,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= fontSize + 5;
    }

    const pdfBytes = await pdfDoc.save();

    // Create a PassThrough stream
    const stream = new PassThrough();
    stream.end(pdfBytes);

    // Upload the stream to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      stream.pipe(
        cloudinary.uploader.upload_stream(
          { resource_type: "raw" },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
      );
    });

    if (!uploadResult) {
      return { success: false, error: "Failed to upload to Cloudinary" };
    }

    console.log(uploadResult);
  } catch (error) {
    console.error("Error generating PDF:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function getPdf(id: string) {
  try {
    // Query the database to find the PDF with the given ID
    const pdf = await db.pDF.findUnique({
      where: { id },
    });

    // Check if the PDF exists in the database
    if (!pdf) {
      return { success: false, error: "PDF not found" };
    }

    // Return the PDF filename and its Cloudinary URL
    return {
      success: true,
      filename: pdf.filename,
      contentUrl: pdf.contentUrl, // Return the Cloudinary URL of the PDF
    };
  } catch (error) {
    // Log and return the error if something goes wrong
    console.error("Error retrieving PDF:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error retrieving PDF",
    };
  }
}
