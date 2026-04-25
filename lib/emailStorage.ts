import { v2 as cloudinary } from "cloudinary";
import { db } from "@/lib/db";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function storeEmailData(emailData: any, attachments: any[]) {
  try {
    // Upload attachments to Cloudinary
    const uploadedAttachments = await Promise.all(
      attachments.map(async (file) => {
        const result = await cloudinary.uploader.upload(
          `data:application/octet-stream;base64,${file.content.toString(
            "base64"
          )}`,
          { folder: "email-attachments" }
        );

        return {
          fileName: file.filename,
          fileUrl: result.secure_url,
          cloudinaryId: result.public_id,
        };
      })
    );

    // Store email in MongoDB
    const storedEmail = await db.email.create({
      data: {
        to: emailData.to,
        cc: emailData.cc || [],
        bcc: emailData.bcc || [],
        subject: emailData.subject,
        content: emailData.content,
        from: emailData.from,
        attachments: {
          create: uploadedAttachments,
        },
      },
      include: {
        attachments: true,
      },
    });

    return storedEmail;
  } catch (error) {
    console.error("Error storing email:", error);
    throw error;
  }
}
