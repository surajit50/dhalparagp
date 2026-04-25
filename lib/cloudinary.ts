import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';

if (!process.env.CLOUDINARY_CLOUD_NAME) {
  throw new Error("Missing CLOUDINARY_CLOUD_NAME environment variable");
}

if (!process.env.CLOUDINARY_API_KEY) {
  throw new Error("Missing CLOUDINARY_API_KEY environment variable");
}

if (!process.env.CLOUDINARY_API_SECRET) {
  throw new Error("Missing CLOUDINARY_API_SECRET environment variable");
}

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

interface FileData {
  name: string;
  type: string;
  data: string; // Base64 encoded file data
}

interface CloudinaryFile {
  url: string;
  public_id: string;
  type: string;
  name: string;
}

interface UploadResult {
  success: boolean;
  data?: CloudinaryFile;
  error?: string;
}

interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Uploads a file to Cloudinary
 * @param file - File data including name, type and base64 encoded content
 * @returns Promise with upload result
 */
export async function uploadToCloudinary(file: FileData): Promise<UploadResult> {
  try {
    // Remove data URI prefix if present
    const base64Data = file.data.replace(/^data:.*?;base64,/, "");

    // Upload to Cloudinary with proper typing
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload(
        `data:${file.type};base64,${base64Data}`,
        {
          resource_type: "auto",
          folder: "notices",
          use_filename: true,
          unique_filename: true,
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!);
        }
      );
    });

    return {
      success: true,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        type: file.type,
        name: file.name,
      },
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "File upload failed"
    };
  }
}

/**
 * Deletes a file from Cloudinary
 * @param publicId - The public ID of the file to delete
 * @returns Promise with deletion result
 */
export async function deleteFromCloudinary(publicId: string): Promise<DeleteResult> {
  try {
    await cloudinary.uploader.destroy(publicId);
    return { success: true };
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete file"
    };
  }
}

export { cloudinary };