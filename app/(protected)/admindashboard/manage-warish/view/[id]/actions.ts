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
