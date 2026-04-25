import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Get email with attachments
    const email = await db.email.findUnique({
      where: { id },
      include: { attachments: true },
    });

    if (!email) {
      return NextResponse.json(
        { error: "Email not found" },
        { status: 404 }
      );
    }

    // Delete attachments from Cloudinary
    if (email.attachments.length > 0) {
      const deletePromises = email.attachments.map(async (attachment) => {
        if (attachment.cloudinaryId) {
          try {
            await cloudinary.uploader.destroy(attachment.cloudinaryId);
          } catch (error) {
            console.error(`Error deleting attachment from Cloudinary: ${attachment.cloudinaryId}`, error);
          }
        }
      });
      await Promise.all(deletePromises);
    }

    // Delete attachments from database first
    await db.attachment.deleteMany({
      where: { emailId: id }
    });

    // Then delete email
    await db.email.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting email:", error);
    return NextResponse.json(
      { error: "Failed to delete email" },
      { status: 500 }
    );
  }
} 