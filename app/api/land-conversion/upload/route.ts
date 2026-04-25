import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/app/lib/cloudinary";
import { db } from "@/lib/db";
import { LandConversionDocumentType } from "@prisma/client";

const SUPPORTED_DOCUMENT_TYPES: LandConversionDocumentType[] = [
  "ID_PROOF",
  "LAND_DOCUMENT",
  "OTHER",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const VALID_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const documentType = formData.get("documentType") as string;
    const applicationId = formData.get("applicationId") as string;

    if (!file || !documentType || !applicationId) {
      return NextResponse.json(
        { error: "Missing required fields: file, documentType, or applicationId" },
        { status: 400 }
      );
    }

    if (!SUPPORTED_DOCUMENT_TYPES.includes(documentType as LandConversionDocumentType)) {
      return NextResponse.json(
        { error: `Unsupported document type. Use: ${SUPPORTED_DOCUMENT_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    if (!VALID_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use PDF or image (JPEG, PNG, WebP)." },
        { status: 400 }
      );
    }

    const existingDoc = await db.landConversionDocument.findFirst({
      where: {
        applicationId,
        documentType: documentType as LandConversionDocumentType,
      },
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64File = `data:${file.type};base64,${buffer.toString("base64")}`;

    const result = await uploadToCloudinary(
      base64File,
      `land_conversion/${applicationId}/${documentType}`
    );

    const operation = existingDoc
      ? db.landConversionDocument.update({
          where: { id: existingDoc.id },
          data: {
            cloudinaryUrl: result.url,
            cloudinaryPublicId: result.public_id,
            updatedAt: new Date(),
          },
        })
      : db.landConversionDocument.create({
          data: {
            applicationId,
            documentType: documentType as LandConversionDocumentType,
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
    console.error("Land conversion upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload document",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
