"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  FamilyRelationship,
  Gender,
  LivingStatus,
  MaritialStatus,
} from "@prisma/client";

// Shared response type
export type WarishDetailResponse = {
  success: boolean;
  message: string;
  data: any | null;
};

// Helper function for common response formatting
const createResponse = (
  success: boolean,
  message: string,
  data: any = null
): WarishDetailResponse => ({
  success,
  message,
  data,
});

export async function createWarishDetail(
  formData: FormData
): Promise<WarishDetailResponse> {
  try {
    const rawData = {
      name: formData.get("name") as string,
      gender: formData.get("gender") as Gender,
      relation: formData.get("relation") as FamilyRelationship,
      livingStatus: formData.get("livingStatus") as LivingStatus,
      maritialStatus: formData.get("maritialStatus") as MaritialStatus,
      hasbandName: formData.get("hasbandName") as string,
      parentId: formData.get("parentId") as string | null,
      warishApplicationId: formData.get("warishApplicationId") as string,
    };

    // Validate required fields
    if (
      !rawData.name ||
      !rawData.gender ||
      !rawData.relation ||
      !rawData.livingStatus ||
      !rawData.maritialStatus ||
      !rawData.warishApplicationId
    ) {
      return createResponse(false, "Missing required fields");
    }

    const newDetail = await db.warishDetail.create({
      data: {
        ...rawData,
        hasbandName: rawData.hasbandName || null,
        parentId: rawData.parentId || null,
      },
    });

    revalidatePath(
      `/admindashboard/manage-warish/view/${rawData.warishApplicationId}`
    );
    return createResponse(
      true,
      "Successfully created warish detail",
      newDetail
    );
  } catch (error: any) {
    console.error("Creation error:", error);
    return createResponse(
      false,
      error.message || "Failed to create warish detail"
    );
  }
}

export async function updateWarishDetail(
  formData: FormData
): Promise<WarishDetailResponse> {
  try {
    // Extract and validate ID first
    const id = formData.get("id") as string;
    if (!id) {
      return createResponse(false, "Missing record ID");
    }

    // Get existing record to verify existence and get application ID
    const existingDetail = await db.warishDetail.findUnique({
      where: { id },
      select: { warishApplicationId: true },
    });

    if (!existingDetail) {
      return createResponse(false, "Warish detail not found");
    }

    // Extract other fields
    const rawData = {
      name: formData.get("name") as string,
      gender: formData.get("gender") as Gender,
      relation: formData.get("relation") as FamilyRelationship,
      livingStatus: formData.get("livingStatus") as LivingStatus,
      maritialStatus: formData.get("maritialStatus") as MaritialStatus,
      hasbandName: formData.get("hasbandName") as string,
    };

    // Validate required fields
    if (
      !rawData.name ||
      !rawData.gender ||
      !rawData.relation ||
      !rawData.livingStatus ||
      !rawData.maritialStatus
    ) {
      return createResponse(false, "All required fields must be filled");
    }

    // Update the record
    const updatedDetail = await db.warishDetail.update({
      where: { id },
      data: {
        ...rawData,
        hasbandName: rawData.hasbandName || null,
      },
    });

    // Revalidate proper path with actual ID
    revalidatePath(
      `/admindashboard/manage-warish/view/${existingDetail.warishApplicationId}`
    );

    return createResponse(
      true,
      "Successfully updated warish detail",
      updatedDetail
    );
  } catch (error: any) {
    console.error("Update error:", error);

    // Handle specific Prisma errors
    const errorMessage =
      error.code === "P2025"
        ? "Record not found"
        : error.message || "Failed to update warish detail";

    return createResponse(false, errorMessage);
  }
}

export async function deleteWarishDetail(
  id: string
): Promise<WarishDetailResponse> {
  try {
    const existingDetail = await db.warishDetail.findUnique({
      where: { id },
      select: {
        warishApplicationId: true,
        children: {
          select: { id: true },
        },
      },
    });

    if (!existingDetail) {
      return createResponse(false, "Warish detail not found");
    }

    // Recursively delete all child records
    if (existingDetail.children.length > 0) {
      for (const child of existingDetail.children) {
        await deleteWarishDetail(child.id);
      }
    }

    // Then delete the parent record
    const deletedDetail = await db.warishDetail.delete({
      where: { id },
    });

    revalidatePath(
      `/admindashboard/manage-warish/view/${existingDetail.warishApplicationId}`
    );
    return createResponse(
      true,
      "Successfully deleted warish detail",
      deletedDetail
    );
  } catch (error: any) {
    console.error("Deletion error:", error);
    const errorMessage =
      error.code === "P2025"
        ? "Record not found"
        : error.message || "Database operation failed";

    return createResponse(false, `Deletion failed: ${errorMessage}`);
  }
}

export async function requestWarishCorrection(formData: FormData): Promise<WarishDetailResponse> {
  try {
    const warishApplicationId = formData.get("warishApplicationId") as string | null;
    const warishDetailId = formData.get("warishDetailId") as string | null;
    const modificationsJson = formData.get("modifications") as string;
    const reasonForModification = formData.get("reasonForModification") as string;
    const requestedBy = formData.get("requestedBy") as string;

    let modifications = [];
    if (modificationsJson) {
      modifications = JSON.parse(modificationsJson);
    } else {
      // Fallback for single field from FormData
      const fieldToModify = formData.get("fieldToModify") as string;
      const currentValue = formData.get("currentValue") as string;
      const proposedValue = formData.get("proposedValue") as string;
      
      if (fieldToModify && proposedValue) {
        modifications = [{ field: fieldToModify, oldValue: currentValue, newValue: proposedValue }];
      }
    }

    if (modifications.length === 0 || !reasonForModification || !requestedBy || (!warishApplicationId && !warishDetailId)) {
      return createResponse(false, "Missing required fields");
    }

    let targetType: 'application' | 'detail';
    if (warishDetailId) {
      targetType = 'detail';
    } else if (warishApplicationId) {
      targetType = 'application';
    } else {
      return createResponse(false, "Either warishApplicationId or warishDetailId must be provided");
    }

    const request = await db.warishModificationRequest.create({
      data: {
        warishApplicationId: warishApplicationId || undefined,
        warishDetailId: warishDetailId || undefined,
        targetType,
        modifications,
        // Legacy fields for backward compatibility
        fieldToModify: modifications[0].field,
        currentValue: String(modifications[0].oldValue || ""),
        proposedValue: String(modifications[0].newValue),
        reasonForModification,
        requestedBy,
        status: "pending",
      },
    });

    return createResponse(true, "Correction request submitted", request);
  } catch (error: any) {
    return createResponse(false, error.message || "Failed to submit correction request");
  }
}

export async function reviewWarishCorrection(
  requestId: string,
  approve: boolean,
  reviewedBy: string,
  reviewComments?: string
): Promise<WarishDetailResponse> {
  try {
    const request = await db.warishModificationRequest.findUnique({ where: { id: requestId } });
    if (!request) return createResponse(false, "Request not found");

    if (approve) {
      const updateData: any = {};
      if (request.modifications && Array.isArray(request.modifications)) {
        request.modifications.forEach((mod: any) => {
          updateData[mod.field] = mod.newValue;
        });
      } else if (request.fieldToModify && request.proposedValue) {
        updateData[request.fieldToModify] = request.proposedValue;
      }

      if (Object.keys(updateData).length > 0) {
        if (request.targetType === 'detail' && request.warishDetailId) {
          await db.warishDetail.update({
            where: { id: request.warishDetailId },
            data: updateData,
          });
        } else if (request.targetType === 'application' && request.warishApplicationId) {
          await db.warishApplication.update({
            where: { id: request.warishApplicationId },
            data: updateData,
          });
        }
      }
    }

    const updatedRequest = await db.warishModificationRequest.update({
      where: { id: requestId },
      data: {
        status: approve ? "approved" : "rejected",
        reviewedBy,
        reviewedDate: new Date(),
        reviewComments,
      },
    });

    return createResponse(true, approve ? "Correction approved and applied" : "Correction rejected", updatedRequest);
  } catch (error: any) {
    return createResponse(false, error.message || "Failed to review correction request");
  }
}


export async function getWarishCorrectionRequests(warishApplicationId: string) {
  return db.warishModificationRequest.findMany({
    where: { warishApplicationId },
    orderBy: { requestedDate: "desc" },
  });
}
