import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/app/lib/cloudinary";

const MAX_FILE_SIZE = 1024 * 1024; // 250 KB in bytes (256,000 bytes)

const VALID_MIME_TYPES = ["application/pdf"];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const documentType = (formData.get("documentType") as string) || "document";

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Validate MIME type - PDF ONLY
    if (!VALID_MIME_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        {
          success: false,
          message: "Only PDF files are allowed. Please upload a valid PDF document.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        {
          success: false,
          message: `File size exceeds the 1 MB limit (Uploaded file is ${sizeInMb} MB). Please compress or select a smaller PDF.`,
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = `data:${file.type || "application/pdf"};base64,${buffer.toString("base64")}`;

    const currentYear = new Date().getFullYear();
    const folder = `digital_certificates/${currentYear}/${documentType}`;

    const result = await uploadToCloudinary(base64File, folder);

    return NextResponse.json({
      success: true,
      url: result.url,
      public_id: result.public_id,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error: any) {
    console.error("Digital certificate document upload error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload document to Cloudinary",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
