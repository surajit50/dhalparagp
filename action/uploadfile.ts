"use server";

import { auth } from "@/auth";
import { s3 } from "@/lib/s3utils";
import {  PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxFileSize = 5 * 1024 * 1024; // 5MB

const generateFileName = (bytes = 32) => {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
};

export async function getSignedURL(type: string, size: number) {
  const session = await auth();

  if (!session) {
    return { error: "Not authenticated" };
  }

  if (!acceptedTypes.includes(type)) {
    return { error: "Invalid file type" };
  }

  if (size > maxFileSize) {
    return { error: "File too large" };
  }

  const filename = generateFileName();
  const key = `uploads/${filename}`;

  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    ContentType: type,
  });

  try {
    const signedURL = await getSignedUrl(s3, putObjectCommand, {
      expiresIn: 60,
    });

    return { success: { url: signedURL, key } };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return { error: "Failed to generate signed URL" };
  }
}
