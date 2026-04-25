
"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { v2 as cloudinary } from "cloudinary"

import { NoticeSchema } from "@/schema"
import { NoticeTypes, NoticeStatus } from "@prisma/client"
import { currentUser } from "@/lib/auth"
import { Buffer } from "buffer"
import { deleteFromCloudinary, uploadToCloudinary } from "@/lib/cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function createStartWorkNotice(formData: FormData) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const workId = formData.get("workId") as string;
    const description = formData.get("description") as string;
    const commencementDate = formData.get("commencementDate") as string;
    const completionDate = formData.get("completionDate") as string | null;
    const agencyId = formData.get("agencyId") as string;
    const paperCount = parseInt(formData.get("paperCount") as string) || 0;

    if (!workId || !description || !commencementDate || !agencyId) {
      return { success: false, error: "Missing required fields" };
    }

    const work = await db.worksDetail.findUnique({
      where: { id: workId },
      include: {
        nitDetails: true,
        ApprovedActionPlanDetails: true,
        AwardofContract: {
          include: {
            workorderdetails: {
              include: {
                Bidagency: {
                  include: { agencydetails: true },
                },
              },
            },
          },
        },
      },
    });

    if (!work) {
      return { success: false, error: "Work not found" };
    }

    const reference = `SW/${work.nitDetails.memoNumber}/${work.workslno}/${new Date().getFullYear()}`;

    const workOrderBlobs = formData.getAll("workOrderFiles").filter((v): v is File => v instanceof File);
    const officialLetterBlobs = formData.getAll("officialLetterFiles").filter((v): v is File => v instanceof File);
    const otherFileBlobs = formData.getAll("otherFiles").filter((v): v is File => v instanceof File);
    const otherFileDescriptions = formData.getAll("otherFileDescriptions") as string[];
    const photoBlobs = formData.getAll("photos").filter((v): v is File => v instanceof File);

    const photoStatuses = formData.getAll("photoStatuses") as string[];
    const photoCaptions = formData.getAll("photoCaptions") as string[];

    const allFilesToUpload: { file: File, name: string }[] = [];
    workOrderBlobs.forEach(file => allFilesToUpload.push({ file, name: `Work Order - ${file.name}` }));
    officialLetterBlobs.forEach(file => allFilesToUpload.push({ file, name: `Official Letter - ${file.name}` }));
    otherFileBlobs.forEach((file, idx) => {
      const desc = otherFileDescriptions[idx] ? ` (${otherFileDescriptions[idx]})` : "";
      allFilesToUpload.push({ file, name: `Document - ${file.name}${desc}` });
    });

    const uploadedPapers: CloudinaryFile[] = [];
    for (const item of allFilesToUpload) {
      const file = item.file;
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const fileData: FileData = {
        name: item.name,
        type: file.type || "application/octet-stream",
        data: `data:${file.type};base64,${base64}`,
      };
      const uploadResult = await uploadToCloudinary(fileData);
      if (uploadResult.success && uploadResult.data) {
        uploadedPapers.push({
          name: item.name,
          url: uploadResult.data.url,
          type: file.type,
          cloudinaryId: uploadResult.data.public_id,
        });
      }
    }

    const uploadedPhotos: { url: string; publicId: string }[] = [];
    for (let i = 0; i < photoBlobs.length; i++) {
      const file = photoBlobs[i];
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const fileData: FileData = {
        name: file.name,
        type: file.type || "image/jpeg",
        data: `data:${file.type};base64,${base64}`,
      };
      const uploadResult = await uploadToCloudinary(fileData);
      if (uploadResult.success && uploadResult.data) {
        uploadedPhotos.push({
          url: uploadResult.data.url,
          publicId: uploadResult.data.public_id,
        });
      }
    }

    const notice = await db.notice.create({
      data: {
        title: `Start Work Notice - ${work.ApprovedActionPlanDetails.activityDescription}`,
        description: description,
        department: "BDO Office",
        type: "Agency",
        reference: reference,
        agencyId: agencyId,
        files: {
          create: uploadedPapers.map((paper) => ({
            name: paper.name,
            url: paper.url,
            type: paper.type,
            cloudinaryId: paper.cloudinaryId,
          })),
        },
      },
      include: { files: true },
    });

    const bidagency = await db.bidagency.findFirst({
      where: {
        worksDetailId: workId,
        agencyDetailsId: agencyId,
      },
    });

    for (let i = 0; i < uploadedPhotos.length; i++) {
      await db.workPhoto.create({
        data: {
          worksDetailId: workId,
          bidagencyId: bidagency?.id,
          status: (photoStatuses[i] as any) || "onset",
          imageUrl: uploadedPhotos[i].url,
          publicId: uploadedPhotos[i].publicId,
          isVerified: false,
        },
      });
    }

    await db.worksDetail.update({
      where: { id: workId },
      data: {
        workCommencementDate: new Date(commencementDate),
        completionDate: completionDate ? new Date(completionDate) : undefined,
        workStatus: "yettostart",
      },
    });

    revalidatePath("/admindashboard/notice/view", "page");
    revalidatePath("/admindashboard/work-manage/photos", "page");
    return { success: true, data: notice };
  } catch (error) {
    console.error("Error creating start work notice:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create start work notice",
    };
  }
}

interface CloudinaryFile {
  name: string
  url: string
  type: string
  cloudinaryId: string
}

interface FileData {
  name: string
  type: string
  data: string
}

export async function createNotice(formData: FormData) {
  try {
    // Collect File objects from FormData and convert to base64 for Cloudinary helper
    const fileBlobs = formData.getAll("files").filter((v): v is File => v instanceof File)

    const files: FileData[] = []
    for (const file of fileBlobs) {
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString("base64")
      files.push({
        name: file.name,
        type: (file.type as string) || "application/octet-stream",
        data: `data:${file.type};base64,${base64}`,
      })
    }

    const uploadedFiles: CloudinaryFile[] = []

    for (const file of files) {
      const uploadResult = await uploadToCloudinary(file)
      if (uploadResult.success && uploadResult.data) {
        uploadedFiles.push({
          name: file.name,
          url: uploadResult.data.url,
          type: file.type,
          cloudinaryId: uploadResult.data.public_id,
        })
      } else {
        await Promise.all(
          uploadedFiles.map((file) => deleteFromCloudinary(file.cloudinaryId))
        )
        return { success: false, error: "File upload failed" }
      }
    }

    const validatedFields = NoticeSchema.parse({
      title: formData.get("title"),
      description: formData.get("description"),
      department: formData.get("department"),
      type: formData.get("type"),
      reference: formData.get("reference"),
      agencyId: formData.get("agencyId") || undefined,
      files: uploadedFiles,
    })

    const existingNotice = await db.notice.findUnique({
      where: { reference: validatedFields.reference },
    })

    if (existingNotice) {
      await Promise.all(uploadedFiles.map((file: CloudinaryFile) => deleteFromCloudinary(file.cloudinaryId)))
      return {
        success: false,
        error: "A notice with this reference number already exists",
      }
    }

    const notice = await db.notice.create({
      data: {
        title: validatedFields.title,
        description: validatedFields.description,
        department: validatedFields.department,
        type: validatedFields.type,
        reference: validatedFields.reference,
        agencyId: (validatedFields.type as string) === "Agency" ? (validatedFields.agencyId || null) : null,
        files: {
          create: validatedFields.files.map((file) => ({
            name: file.name,
            url: file.url,
            type: file.type,
            cloudinaryId: file.cloudinaryId,
          })),
        },
      },
      include: { files: true },
    })

    revalidatePath("/admindashboard/notice/view", 'page')
    return { success: true, data: notice }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((err: z.ZodIssue) => err.message).join(", "),
      }
    }
    console.error("Error creating notice:", error)
    return { success: false, error: "Failed to create notice" }
  }
}

export async function updateNoticeStatus(id: string, status: NoticeStatus) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "admin") return { success: false, error: "Unauthorized" };

    await db.notice.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admindashboard/notice/view");
    return { success: true };
  } catch (error) {
    console.error("Error updating notice status:", error);
    return { success: false, error: "Failed to update notice status" };
  }
}

export async function getUnreadAgencyNotices() {
  try {
    const user = await currentUser();
    if (!user || !user.id || user.role !== "agency") return { success: false, data: [] };

    const agencyId = user.agencyDetailsId;

    const unreadNotices = await db.notice.findMany({
      where: {
        type: "Agency",
        status: "OPEN",
        OR: [
          { agencyId: null },
          { agencyId: agencyId || undefined },
        ],
        acknowledgments: {
          none: {
            userId: user.id,
          },
        },
      },
      include: {
        files: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: unreadNotices };
  } catch (error) {
    console.error("Error fetching unread notices:", error);
    return { success: false, data: [] };
  }
}

export async function acknowledgeNotice(noticeId: string) {
  try {
    const user = await currentUser();
    if (!user || !user.id) return { success: false, error: "Unauthorized" };

    await db.noticeAcknowledgment.upsert({
      where: {
        noticeId_userId: {
          noticeId,
          userId: user.id,
        },
      },
      update: {},
      create: {
        noticeId,
        userId: user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error acknowledging notice:", error);
    return { success: false, error: "Failed to acknowledge notice" };
  }
}

export async function getNotices(type?: NoticeTypes, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit
    
    // Default to excluding 'Agency' notices if no specific type is requested
    const where = type ? { type } : { type: { not: "Agency" as NoticeTypes } }

    const [notices, total] = await Promise.all([
      db.notice.findMany({
        where,
        include: { files: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.notice.count({ where }),
    ])

    return {
      data: notices.map((notice: any) => ({
        id: notice.id,
        title: notice.title,
        description: notice.description,
        department: notice.department,
        type: notice.type as "Tender" | "Notice" | "Circular" | "Other",
        reference: notice.reference,
        date: notice.createdAt.toISOString(),
        files: notice.files.map((file: any) => ({
          name: file.name,
          url: file.url,
          type: file.type,
          cloudinaryId: file.cloudinaryId,
        })),
      })),
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    }
  } catch (error) {
    console.error("Error fetching notices:", error)
    return { data: [], pagination: { total: 0, pages: 0, currentPage: page, limit } }
  }
}


export async function deleteNotice(id: string) {
  try {
    const notice = await db.notice.findUnique({
      where: { id },
      include: { files: true },
    });

    if (!notice) {
      return { success: false, error: "Notice not found" };
    }

    // Delete files from Cloudinary
    await Promise.allSettled(
      notice.files.map((file: any) => 
        file.cloudinaryId ? deleteFromCloudinary(file.cloudinaryId) : Promise.resolve()
      )
    );

    // Delete notice from database
    await db.notice.delete({
      where: { id },
    });

    revalidatePath("/admindashboard/notice/view", 'page');
    return { success: true };
  } catch (error) {
    console.error("Error deleting notice:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete notice"
    };
  }
}

export async function updateNotice(id: string, formData: FormData) {
  try {
    // Extract File objects and convert to base64 for Cloudinary helper
    const fileBlobs = formData.getAll("files").filter((v): v is File => v instanceof File);
    const files: FileData[] = [];
    for (const file of fileBlobs) {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      files.push({
        name: file.name,
        type: (file.type as string) || "application/octet-stream",
        data: `data:${file.type};base64,${base64}`,
      });
    }

    // Parse removed files
    const removedFiles: string[] = formData.has("removedFiles") 
      ? JSON.parse(formData.get("removedFiles") as string) 
      : [];

    // Extract other fields
    const validatedFields = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      department: formData.get("department") as string,
      type: formData.get("type") as NoticeTypes,
      reference: formData.get("reference") as string,
      agencyId: (formData.get("agencyId") as string) || undefined,
    };

    // Check for existing reference
    const existingReferenceNotice = await db.notice.findUnique({
      where: { reference: validatedFields.reference },
    });

    if (existingReferenceNotice && existingReferenceNotice.id !== id) {
      return { 
        success: false, 
        error: "A notice with this reference number already exists" 
      };
    }

    // Upload new files
    const uploadedFiles: CloudinaryFile[] = [];
    for (const file of files) {
      const uploadResult = await uploadToCloudinary(file);
      if (uploadResult.success && uploadResult.data) {
        uploadedFiles.push({
          name: file.name,
          url: uploadResult.data.url,
          type: file.type,
          cloudinaryId: uploadResult.data.public_id,
        });
      } else {
        await Promise.allSettled(
          uploadedFiles.map((f: CloudinaryFile) => deleteFromCloudinary(f.cloudinaryId))
        );
        return { success: false, error: "File upload failed" };
      }
    }

    const existingNotice = await db.notice.findUnique({
      where: { id },
      include: { files: true },
    });

    if (!existingNotice) {
      await Promise.allSettled(
        uploadedFiles.map(f => deleteFromCloudinary(f.cloudinaryId))
      );
      return { success: false, error: "Notice not found" };
    }

    // Identify files to delete
    const filesToDelete = existingNotice.files.filter((file: any) => 
      removedFiles.includes(file.cloudinaryId || "")
    );

    // Update notice
    const updatedNotice = await db.notice.update({
      where: { id },
      data: {
        title: validatedFields.title,
        description: validatedFields.description,
        department: validatedFields.department,
        type: validatedFields.type,
        reference: validatedFields.reference,
        agencyId: (validatedFields.type as string) === "Agency" ? (validatedFields.agencyId || null) : null,
        files: {
          // Delete removed files
          deleteMany: {
            cloudinaryId: {
              in: filesToDelete.map(f => f.cloudinaryId || "")
            }
          },
          // Add new files
          create: uploadedFiles.map((file: CloudinaryFile) => ({
            name: file.name,
            url: file.url,
            type: file.type,
            cloudinaryId: file.cloudinaryId,
          })),
        },
      },
      include: { files: true },
    });

    // Delete files from Cloudinary after successful update
    await Promise.allSettled(
      filesToDelete.map((file: any) => 
        file.cloudinaryId ? deleteFromCloudinary(file.cloudinaryId) : Promise.resolve()
      )
    );

    revalidatePath("/admindashboard/notice/view", 'page');
    return { success: true, data: updatedNotice };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((err: z.ZodIssue) => err.message).join(", "),
      };
    }
    console.error("Error updating notice:", error);
    return { success: false, error: "Failed to update notice" };
  }
}
