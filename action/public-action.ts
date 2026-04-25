"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { FormDownload } from "@prisma/client";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface AddFormResult {
  success: boolean;
  error?: string;
  form?: FormDownload;
}

export async function getForms(): Promise<FormDownload[]> {
  try {
    const forms = await db.formDownload.findMany({
      orderBy: { name: "asc" },
    });
    return forms;
  } catch (error) {
    console.error("Failed to fetch forms:", error);
    throw new Error("Failed to fetch forms");
  }
}

export async function incrementDownloadCount(formId: string): Promise<void> {
  try {
    await db.formDownload.update({
      where: { id: formId },
      data: { downloadCount: { increment: 1 } },
    });
    revalidatePath("/resources/forms", 'page');
  } catch (error) {
    console.error("Failed to increment download count:", error);
    throw new Error("Failed to increment download count");
  }
}

export async function addForm(formData: FormData): Promise<AddFormResult> {
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const file = formData.get("file") as File;

  if (!name || !category || !file) {
    return { success: false, error: "Missing required fields" };
  }

  if (file.type !== "application/pdf") {
    return { success: false, error: "File must be a PDF" };
  }

  try {
    const buffer = await file.arrayBuffer();

    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "raw",
            folder: "form-downloads",
            format: "pdf",
            type: "upload",
            access_mode: "public",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(
                new Error(
                  `Failed to upload file to Cloudinary: ${error.message}`
                )
              );
            } else if (result) {
              resolve(result);
            } else {
              reject(new Error("No result from Cloudinary upload"));
            }
          }
        );

        uploadStream.end(Buffer.from(buffer));
      }
    );

    console.log("Cloudinary upload result:", uploadResult);
    const downloadUrl = uploadResult.secure_url;

    const newForm = await db.formDownload.create({
      data: {
        name,
        category,
        downloadUrl,
        assetId: uploadResult.public_id,
      },
    });

    revalidatePath("/admindashboard/master/uploadform", 'page');
    console.log("New form created:", newForm);
    return { success: true, form: newForm };
  } catch (error) {
    console.error("Failed to add form:", error);
    if (error instanceof Error) {
      return { success: false, error: `Failed to add form: ${error.message}` };
    }
    return {
      success: false,
      error: "An unexpected error occurred while adding the form.",
    };
  }
}

export async function deleteForm(
  formId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Step 1: Delete form from the database
    const deletedForm = await db.formDownload.delete({
      where: { id: formId },
    });

    // Step 2: Delete associated Cloudinary asset
    const cloudinaryResponse = await cloudinary.uploader.destroy(
      deletedForm.assetId
    );
    console.log("Cloudinary response:", cloudinaryResponse);

    // Step 3: Revalidate the path
    revalidatePath("/admindashboard/master/uploadform", 'page');

    // Successful operation
    return { success: true };
  } catch (error) {
    console.error("Failed to delete form:", error);

    // Return structured error response
    return {
      success: false,
      error:
        error instanceof Error
          ? `Failed to delete form: ${error.message}`
          : "An unexpected error occurred while deleting the form.",
    };
  }
}

export async function updateForm(
  formId: string,
  formData: Partial<FormDownload>
): Promise<{ success: boolean; error?: string; form?: FormDownload }> {
  try {
    const updatedForm = await db.formDownload.update({
      where: { id: formId },
      data: formData,
    });
    revalidatePath("/admindashboard/master/uploadform", 'page');
    return { success: true, form: updatedForm };
  } catch (error) {
    console.error("Failed to update form:", error);
    if (error instanceof Error) {
      return {
        success: false,
        error: `Failed to update form: ${error.message}`,
      };
    }
    return {
      success: false,
      error: "An unexpected error occurred while updating the form.",
    };
  }
}
