import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/app/lib/cloudinary";
import { db } from "@/lib/db";

// Supported document types and their validation
const SUPPORTED_DOCUMENT_TYPES = [
  "death_certificate",
  "application_form",
  "affidavit",
  "heir_proof"
] as const;

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const documentType = formData.get("documentType") as string;
    const warishId = formData.get("warishId") as string;

    // Validate required fields
    if (!file || !documentType || !warishId) {
      return NextResponse.json(
        { error: "Missing required fields: file, documentType, or warishId" },
        { status: 400 }
      );
    }

    // Validate document type
    if (!SUPPORTED_DOCUMENT_TYPES.includes(documentType as any)) {
      return NextResponse.json(
        { error: `Unsupported document type. Supported types: ${SUPPORTED_DOCUMENT_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate file type based on document type
    const validMimeTypes: Record<string, string[]> = {
      death_certificate: ["application/pdf", "image/jpeg", "image/png"],
      application_form: ["application/pdf"],
      affidavit: ["application/pdf"],
      heir_proof: ["application/pdf"]
    };

    if (!validMimeTypes[documentType].includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type for ${documentType}. Accepted types: ${validMimeTypes[documentType].join(", ")}` },
        { status: 400 }
      );
    }

    // Check for existing document (upsert instead of create)
    const existingDoc = await db.warishDocument.findFirst({
      where: {
        warishId,
        documentType,
      },
    });

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      base64File,
      `warish_documents/${warishId}/${documentType}`
    );

    // Save or update document in database
    const operation = existingDoc 
      ? db.warishDocument.update({
          where: { id: existingDoc.id },
          data: {
            cloudinaryUrl: result.url,
            cloudinaryPublicId: result.public_id,
            updatedAt: new Date(),
          },
        })
      : db.warishDocument.create({
          data: {
            warishId,
            documentType,
            cloudinaryUrl: result.url,
            cloudinaryPublicId: result.public_id,
          },
        });

    const dbResult = await operation;

    return NextResponse.json({
      success: true,
      url: result.url,
      public_id: result.public_id,
      document: {
        id: dbResult.id,
        documentType: dbResult.documentType,
        createdAt: dbResult.createdAt,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process document upload", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
