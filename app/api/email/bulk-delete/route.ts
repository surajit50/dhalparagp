import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request: Request) {
  try {
    const { emailIds } = await request.json();

    if (!Array.isArray(emailIds) || emailIds.length === 0) {
      return NextResponse.json(
        { error: "No email IDs provided" },
        { status: 400 }
      );
    }

    // Get all emails with their attachments
    const emails = await db.email.findMany({
      where: { id: { in: emailIds } },
      include: { attachments: true },
    });

    // Delete attachments from Cloudinary
    const cloudinaryDeletePromises = emails.flatMap((email) =>
      email.attachments.map(async (attachment) => {
        if (attachment.cloudinaryId) {
          try {
            await cloudinary.uploader.destroy(attachment.cloudinaryId);
          } catch (error) {
            console.error(`Error deleting attachment from Cloudinary: ${attachment.cloudinaryId}`, error);
          }
        }
      })
    );
    await Promise.all(cloudinaryDeletePromises);

    // Delete attachments from database first
    await db.attachment.deleteMany({
      where: { emailId: { in: emailIds } }
    });

    // Then delete emails
    await db.email.deleteMany({
      where: { id: { in: emailIds } },
    });

    return NextResponse.json({ 
      success: true,
      message: `Successfully deleted ${emails.length} emails`
    });
  } catch (error) {
    console.error("Error bulk deleting emails:", error);
    return NextResponse.json(
      { error: "Failed to delete emails" },
      { status: 500 }
    );
  }
} 