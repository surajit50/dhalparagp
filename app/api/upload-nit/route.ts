import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { gpcode } from "@/constants/gpinfor";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const nitId = formData.get("nitId") as string | null;
    const fileName = formData.get("fileName") as string | null;
    const fileType = formData.get("fileType") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    if (!nitId || !fileName || !fileType) {
      return NextResponse.json(
        { success: false, message: "Missing NIT or file information" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, message: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "File size must not exceed 5MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "nit-documents",
            resource_type: "raw",
            format: "pdf",
            type: "upload",
            access_mode: "public",
          },
          (error, uploadResult) => {
            if (error) reject(error);
            else resolve(uploadResult as { secure_url: string });
          }
        );
        uploadStream.end(buffer);
      }
    );

    const nitDetails = await db.nitDetails.update({
      where: { id: nitId },
      data: { publishhardcopy: result.secure_url, isPublished: true },
    });

    await db.notice.create({
      data: {
        title: `${nitDetails.memoNumber}/${gpcode}/${nitDetails.memoDate.getFullYear()}`,
        description: "Dhalpara Gram Panchayat",
        department: "P&rd",
        type: "Tender",
        reference: `${nitDetails.memoNumber}/${gpcode}/${nitDetails.memoDate.getFullYear()}`,
        files: {
          create: {
            name: fileName,
            url: result.secure_url,
            type: fileType,
          },
        },
      },
      include: { files: true },
    });

    revalidatePath("/admindashboard/manage-tender/upload");

    return NextResponse.json({
      success: true,
      url: result.secure_url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Upload failed" },
      { status: 500 }
    );
  }
}
