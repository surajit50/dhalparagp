import { NextResponse } from "next/server";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { Readable } from "node:stream";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME2,
  api_key: process.env.CLOUDINARY_API_KEY2,
  api_secret: process.env.CLOUDINARY_API_SECRET2,
});

/**
 * Upload a buffer to Cloudinary using `upload_stream` (avoids the
 * deprecated `url.parse()` path that the base64-dataURI method triggers).
 */
function uploadToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Empty Cloudinary response"));
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400, headers: corsHeaders }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const folder = (formData.get("folder") as string) || "street-lights";

    // Upload via stream (no url.parse() deprecation)
    const result = await uploadToCloudinary(buffer, folder);

    return NextResponse.json(
      {
        url: result.secure_url,
        fileUrl: result.secure_url,
        publicId: result.public_id,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500, headers: corsHeaders }
    );
  }
}
 
