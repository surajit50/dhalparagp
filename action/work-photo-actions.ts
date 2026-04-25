"use server";


import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import { db } from "@/lib/db";
import { WorkPhotoStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";


export async function uploadWorkPhoto(data: {
  worksDetailId: string;
  status: WorkPhotoStatus;
  base64Image: string;
  fileName: string;
  fileType: string;
  latitude?: number;
  longitude?: number;
}) {
  try {
    const session = await auth();
    // Allow upload for agency, maybe staff/admin too.
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Attempt to upload image to Cloudinary
    const uploadResult = await uploadToCloudinary({
      data: data.base64Image,
      name: data.fileName,
      type: data.fileType,
    });

    if (!uploadResult.success || !uploadResult.data) {
      return { success: false, error: uploadResult.error || "Failed to upload image" };
    }

    // Save to database
    // We should probably find the bidagencyId of the user if they are an agency
    let bidagencyId = undefined;
    if (session.user.role === "agency" && session.user.agencyDetailsId) {
      const bidagency = await db.bidagency.findUnique({
        where: { agencyDetailsId: session.user.agencyDetailsId },
      });
      if (bidagency) {
        bidagencyId = bidagency.id;
      }
    }

    const photo = await db.workPhoto.create({
      data: {
        worksDetailId: data.worksDetailId,
        bidagencyId: bidagencyId,
        status: data.status,
        imageUrl: uploadResult.data.url,
        publicId: uploadResult.data.public_id,
        latitude: data.latitude,
        longitude: data.longitude,
        isVerified: false,
      },
    });

    revalidatePath("/agencydashboard/works/photos", 'page');
    revalidatePath(`/agencydashboard/works/photos/${data.worksDetailId}`, 'page');
    revalidatePath("/admindashboard/work-manage/photos", 'page');
    return { success: true, photo };
  } catch (error) {
    console.error("Photos update error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getWorkPhotos(worksDetailId: string) {
  try {
    const photos = await db.workPhoto.findMany({
      where: { worksDetailId },
      orderBy: { uploadedAt: "desc" },
      include: {
        Bidagency: {
          include: {
            agencydetails: true
          }
        }
      }
    });
    return photos;
  } catch (error) {
    console.error("Error fetching photos", error);
    return [];
  }
}

export async function rejectWorkPhoto(photoId: string, reason?: string) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return { success: false, error: "Unauthorized" };
    }

    // Fetch the photo to get its Cloudinary publicId
    const photo = await db.workPhoto.findUnique({ where: { id: photoId } });
    if (!photo) {
      return { success: false, error: "Photo not found" };
    }

    // Delete the image from Cloudinary to free storage
    if (photo.publicId) {
      await deleteFromCloudinary(photo.publicId);
    }

    // Mark as rejected in DB (keeps the record so agency can see the rejection reason)
    await db.workPhoto.update({
      where: { id: photoId },
      data: {
        isRejected: true,
        isVerified: false,
        rejectionReason: reason || "Rejected by admin",
        imageUrl: "",    // clear the URL since the image is deleted
        publicId: "",    // clear the publicId
      },
    });

    revalidatePath("/admindashboard/work-manage/photos", 'page');
    revalidatePath("/agencydashboard/works/photos", 'page');
    return { success: true };
  } catch (error) {
    console.error("Error rejecting photo:", error);
    return { success: false, error: "Failed to reject photo" };
  }
}


export async function verifyWorkPhoto(
  photoId: string,
  isVerified: boolean,
  options?: { completionDate?: Date }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return { success: false, error: "Unauthorized" };
    }

    await db.workPhoto.update({
      where: { id: photoId },
      data: { isVerified },
    });

    // If verifying, check the status and update WorksDetail
    if (isVerified) {
      const photo = await db.workPhoto.findUnique({ where: { id: photoId } });
      if (photo) {
        if (photo.status === "onset") {
          await db.worksDetail.update({
            where: { id: photo.worksDetailId },
            data: {
              workCommencementDate: photo.uploadedAt,
              workStatus: "workinprogress"
            }
          });
        } else if (photo.status === "complete") {
          await db.worksDetail.update({
            where: { id: photo.worksDetailId },
            data: {
              completionDate: options?.completionDate || photo.uploadedAt,
              workStatus: "workcompleted"
            }
          });
        }
      }
    }

    revalidatePath("/admindashboard/work-manage/photos", 'page'); // Update relevant paths soon
    return { success: true };
  } catch (error) {
    console.error("Error verifying photo", error);
    return { success: false, error: "Failed to verify photo" };
  }
}

export async function deleteWorkPhoto(photoId: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const photo = await db.workPhoto.findUnique({ where: { id: photoId } });
    if (!photo) {
      return { success: false, error: "Photo not found" };
    }

    // Delete from cloudinary
    if (photo.publicId) {
      await deleteFromCloudinary(photo.publicId);
    }

    // Delete from db
    await db.workPhoto.delete({ where: { id: photoId } });

    revalidatePath("/agencydashboard/works/photos", 'page');
    revalidatePath(`/agencydashboard/works/photos/${photo.worksDetailId}`, 'page');
    return { success: true };
  } catch (error) {
    console.error("Error deleting photo", error);
    return { success: false, error: "Failed to delete photo" };
  }
}
