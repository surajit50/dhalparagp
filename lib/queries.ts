import { db } from "./db";

export async function getFamilyCertificateWithMembers(certificateId: string) {
  try {
    const certificate = await db.familyLineageCertificate.findUnique({
      where: { id: certificateId },
      include: {
        familyMembers: {
          where: { parentId: null }, // Get root level members
          include: {
            children: {
              include: {
                children: {
                  include: {
                    children: true // Goes 3 levels deep
                  }
                }
              }
            }
          }
        }
      }
    });

    return certificate;
  } catch (error) {
    console.error('Error fetching certificate:', error);
    throw error;
  }
}