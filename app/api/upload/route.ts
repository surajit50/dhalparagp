import { NextResponse } from "next/server";
import {
  v2 as cloudinary,
  type UploadApiResponse,
  type UploadApiErrorResponse,
} from "cloudinary";
import { Readable } from "node:stream";

/* =========================================================
   CORS
========================================================= */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/* =========================================================
   CLOUDINARY CONFIGURATION
========================================================= */

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME2 ||
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY2 ||
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET2 ||
    process.env.CLOUDINARY_API_SECRET,

  secure: true,
});

/* =========================================================
   TYPES
========================================================= */

type CloudinaryResourceType = "image" | "raw";

interface UploadResult {
  url: string;
  fileUrl: string;
  secureUrl: string;
  publicId: string;
  resourceType: string;
  format?: string;
  bytes: number;
  originalFilename: string;
  mimeType: string;
  width?: number;
  height?: number;
}

/* =========================================================
   SETTINGS
========================================================= */

// 20 MB
const MAX_FILE_SIZE = 20 * 1024 * 1024;

const allowedImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

const allowedDocumentTypes = [
  "application/pdf",
];

/* =========================================================
   HELPERS
========================================================= */

/**
 * Check whether the uploaded file is a PDF.
 */
function isPdfFile(file: File): boolean {
  return (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

/**
 * Determine Cloudinary resource type.
 *
 * PDF      -> raw
 * Images   -> image
 */
function getResourceType(
  file: File
): CloudinaryResourceType {
  if (isPdfFile(file)) {
    return "raw";
  }

  return "image";
}

/**
 * Validate uploaded file.
 */
function validateFile(file: File): string | null {
  if (!file.name) {
    return "Invalid file.";
  }

  if (file.size <= 0) {
    return "The uploaded file is empty.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "File size must not exceed 20 MB.";
  }

  const isPdf = isPdfFile(file);

  const isImage =
    allowedImageTypes.includes(file.type) ||
    /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);

  if (!isPdf && !isImage) {
    return "Only PDF, JPG, JPEG, PNG, WEBP and GIF files are allowed.";
  }

  return null;
}

/**
 * Clean folder name.
 *
 * Prevent unwanted characters/path manipulation.
 */
function sanitizeFolder(folder: string): string {
  const cleaned = folder
    .trim()
    .replace(/[^a-zA-Z0-9/_-]/g, "")
    .replace(/\/+/g, "/")
    .replace(/^\/|\/$/g, "");

  return cleaned || "uploads";
}

/* =========================================================
   CLOUDINARY UPLOAD
========================================================= */

function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  resourceType: CloudinaryResourceType
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,

        // Generate unique filenames
        unique_filename: true,

        // Do not overwrite existing files
        overwrite: false,

        // Keep original filename where possible
        use_filename: true,
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined
      ) => {
        if (error) {
          console.error(
            "Cloudinary upload error:",
            error
          );

          reject(error);
          return;
        }

        if (!result) {
          reject(
            new Error(
              "Cloudinary returned an empty upload response."
            )
          );
          return;
        }

        resolve(result);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

/* =========================================================
   POST
========================================================= */

export async function POST(request: Request) {
  try {
    /* -----------------------------------------------------
       Check Cloudinary configuration
    ----------------------------------------------------- */

    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME2 ||
      process.env.CLOUDINARY_CLOUD_NAME;

    const apiKey =
      process.env.CLOUDINARY_API_KEY2 ||
      process.env.CLOUDINARY_API_KEY;

    const apiSecret =
      process.env.CLOUDINARY_API_SECRET2 ||
      process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error(
        "Cloudinary environment variables are missing."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Cloudinary configuration is missing.",
        },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    /* -----------------------------------------------------
       Read FormData
    ----------------------------------------------------- */

    const formData = await request.formData();

    const fileValue = formData.get("file");

    if (!(fileValue instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "No file uploaded.",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const file = fileValue;

    /* -----------------------------------------------------
       Validate
    ----------------------------------------------------- */

    const validationError = validateFile(file);

    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: validationError,
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    /* -----------------------------------------------------
       Folder
    ----------------------------------------------------- */

    const requestedFolder =
      formData.get("folder");

    const folder =
      typeof requestedFolder === "string"
        ? sanitizeFolder(requestedFolder)
        : "uploads";

    /* -----------------------------------------------------
       Resource Type
    ----------------------------------------------------- */

    const resourceType =
      getResourceType(file);

    console.log("Uploading file:", {
      name: file.name,
      type: file.type,
      size: file.size,
      folder,
      resourceType,
    });

    /* -----------------------------------------------------
       Convert File -> Buffer
    ----------------------------------------------------- */

    const arrayBuffer =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(arrayBuffer);

    /* -----------------------------------------------------
       Upload
    ----------------------------------------------------- */

    const result =
      await uploadToCloudinary(
        buffer,
        folder,
        resourceType
      );

    console.log(
      "Cloudinary upload successful:",
      {
        publicId: result.public_id,
        resourceType:
          result.resource_type,
        secureUrl:
          result.secure_url,
      }
    );

    /* -----------------------------------------------------
       Response
    ----------------------------------------------------- */

    const response: UploadResult = {
      url: result.secure_url,

      fileUrl:
        result.secure_url,

      secureUrl:
        result.secure_url,

      publicId:
        result.public_id,

      resourceType:
        result.resource_type,

      format:
        result.format,

      bytes:
        result.bytes,

      originalFilename:
        file.name,

      mimeType:
        file.type,

      width:
        result.width,

      height:
        result.height,
    };

    return NextResponse.json(
      {
        success: true,
        ...response,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error: unknown) {
    console.error(
      "File upload error:",
      error
    );

    let message =
      "Failed to upload file.";

    if (error instanceof Error) {
      message =
        error.message ||
        message;
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}