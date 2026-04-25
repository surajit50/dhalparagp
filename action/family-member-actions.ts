"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { familyMemberSchema } from "@/schema/family-lineage-certificate-schema"
import type { ActionResult, FamilyMember } from "@/types"

export async function addFamilyMember(
  certificateId: string,
  memberData: Partial<FamilyMember>,
): Promise<ActionResult<FamilyMember>> {
  try {
    const validatedData = familyMemberSchema.parse(memberData)

    const familyMember = await db.familyMember.create({
      data: {
        certificateId,
        name: validatedData.name!,
        relation: validatedData.relation!,
       
        parentId: validatedData.parentId,
      },
    })

    revalidatePath("/certificates", 'page')

    return {
      success: true,
      data: familyMember as FamilyMember,
      message: "Family member added successfully",
    }
  } catch (error) {
    console.error("Error adding family member:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add family member",
    }
  }
}

export async function updateFamilyMember(
  id: string,
  memberData: Partial<FamilyMember>,
): Promise<ActionResult<FamilyMember>> {
  try {
    const validatedData = familyMemberSchema.parse(memberData)

    const familyMember = await db.familyMember.update({
      where: { id },
      data: {
        name: validatedData.name!,
        relation: validatedData.relation!,
        parentId: validatedData.parentId,
      },
    })

    revalidatePath("/certificates", 'page')

    return {
      success: true,
      data: familyMember as FamilyMember,
      message: "Family member updated successfully",
    }
  } catch (error) {
    console.error("Error updating family member:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update family member",
    }
  }
}

export async function deleteFamilyMember(id: string): Promise<ActionResult> {
  try {
    // First, update any children to remove their parent reference
    await db.familyMember.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    })

    // Then delete the member
    await db.familyMember.delete({
      where: { id },
    })

    revalidatePath("/certificates", 'page')

    return {
      success: true,
      message: "Family member deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting family member:", error)
    return {
      success: false,
      error: "Failed to delete family member",
    }
  }
}

export async function getFamilyMembers(certificateId: string): Promise<ActionResult<FamilyMember[]>> {
  try {
    const familyMembers = await db.familyMember.findMany({
      where: { certificateId },
      orderBy: { createdAt: "asc" },
    })

    return {
      success: true,
      data: familyMembers as FamilyMember[],
    }
  } catch (error) {
    console.error("Error fetching family members:", error)
    return {
      success: false,
      error: "Failed to fetch family members",
    }
  }
}
