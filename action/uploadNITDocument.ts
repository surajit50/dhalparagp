"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { gpcode } from "@/constants/gpinfor";

export async function uploadNITDocument(
  nitId: string,
  fileUrl: string,
  fileName: string,
  fileType: string
) {
  try {
    const newnitdetails = await db.nitDetails.update({
      where: { id: nitId },
      data: { publishhardcopy: fileUrl, isPublished: true },
    });

    await db.notice.create({
      data: {
        title: `${newnitdetails.memoNumber}/${gpcode}/${newnitdetails.memoDate.getFullYear()}`,
        description: "Dhalpara Gram Panchayat",
        department: "P&rd",
        type: "Tender",
        reference: `${newnitdetails.memoNumber}/${gpcode}/${newnitdetails.memoDate.getFullYear()}`,
        files: {
          create: {
            name: fileName,
            url: fileUrl,
            type: fileType,
          },
        },
      },
      include: { files: true },
    });

    revalidatePath("/nit-documents", 'page');

    return { success: true, message: "NIT document uploaded successfully" };
  } catch (error) {
    console.error("NIT document upload error:", error);
    return { success: false, message: "Failed to upload NIT document" };
  }
}
