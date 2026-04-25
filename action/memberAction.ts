"use server";

import { currentRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { memberFormSchema } from "@/schema/member";
import { parseDateString } from "@/utils/utils";

import crypto from "crypto";
import { z } from "zod";
import { revalidatePath } from "next/cache";
export const addmemberdetails = async (formData: FormData) => {
  try {
    const values = Object.fromEntries(formData.entries());
    const validateField = memberFormSchema.safeParse(values);

    if (!validateField.success) {
      return {
        error: "Invalid fields: " + JSON.stringify(validateField.error.issues),
      };
    }

    const {
      salutation,
      firstName,
      middleName,
      lastName,
      fatherGuardianName,
      dob,
      gender,
      maritalStatus,
      religion,
      caste,
      eduQualification,
      computerLiterate,
      motherTongue,
      bloodGroup,
      contactNo,
      whatsappNo,
      email,
      address,
      village,
      pin,
      postOffice,
      district,
      policeStation,
      aadhar,
      pan,
      epic,
      profession,
      annualFamilyIncome,
    } = validateField.data;

    const userRole = await currentRole();
    if (userRole !== "admin") {
      return { error: "You are not authorized to do this" };
    }

    const existingMember = await db.member.findFirst({
      where: {
        OR: [{ firstName }, { fatherGuardianName }],
      },
    });

    if (existingMember) {
      return {
        error:
          "A member with this name or father/guardian name already exists.",
      };
    }

    const parsedate = parseDateString(dob);
    if (!parsedate) {
      return { error: "Invalid date format. Use DD-MM-YYYY." };
    }

    let photoUrl = null;
    const photoFile = formData.get("photo") as File | null;

    if (photoFile && photoFile.size > 0) {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (!cloudName || !apiKey || !apiSecret) {
        return { error: "Cloudinary configuration is missing" };
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const folder = "members";
      const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto
        .createHash("sha1")
        .update(stringToSign)
        .digest("hex");

      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", photoFile);
      cloudinaryFormData.append("api_key", apiKey);
      cloudinaryFormData.append("timestamp", timestamp.toString());
      cloudinaryFormData.append("signature", signature);
      cloudinaryFormData.append("folder", folder);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: cloudinaryFormData,
        }
      );

      if (!uploadResponse.ok) {
        return { error: "Failed to upload photo to Cloudinary" };
      }

      const uploadResult = (await uploadResponse.json()) as {
        secure_url?: string;
        url?: string;
      };

      photoUrl = uploadResult.secure_url || uploadResult.url || null;
    }

    const member = await db.member.create({
      data: {
        salutation,
        firstName,
        middleName,
        lastName,
        fatherGuardianName,
        dob: parsedate,
        gender,
        maritalStatus,
        religion,
        caste,
        eduQualification,
        computerLiterate,
        motherTongue,
        bloodGroup,
        contactNo,
        whatsappNo,
        email,
        address,
        village,
        pin,
        postOffice,
        district,
        policeStation,
        aadhar,
        pan,
        epic,
        profession,
        annualFamilyIncome,
        photo: photoUrl,
        financialYear: new Date().getFullYear().toString(),
      },

    });
    revalidatePath("/admindashboard/viewmenberdetails", 'page');
    return { success: "Member details added successfully", photoUrl: photoUrl };
  } catch (error) {
    console.error("Server error adding member:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unknown error occurred while adding the member.",
    };
  }
};

export async function updateMemberDetails(formData: FormData) {
  try {
    const memberId = formData.get("memberId") as string;
    if (!memberId) {
      return { error: "Member ID is required" };
    }

    const rawFormData = Object.fromEntries(formData.entries());
    const validatedFields = memberFormSchema.safeParse(rawFormData);

    if (!validatedFields.success) {
      return { error: "Invalid form data" };
    }

    const {
      salutation,
      firstName,
      middleName,
      lastName,
      fatherGuardianName,
      dob,
      gender,
      maritalStatus,
      religion,
      caste,
      eduQualification,
      computerLiterate,
      motherTongue,
      bloodGroup,
      contactNo,
      whatsappNo,
      email,
      address,
      pin,
      postOffice,
      district,
      policeStation,
      aadhar,
      pan,
      epic,
      profession,
      annualFamilyIncome,
    } = validatedFields.data;

    // Handle photo upload
    let photoUrl = null;
    const photo = formData.get("photo") as File | null;

    if (photo && photo.size > 0) {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (!cloudName || !apiKey || !apiSecret) {
        return { error: "Cloudinary configuration is missing" };
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const folder = "members";
      const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto
        .createHash("sha1")
        .update(stringToSign)
        .digest("hex");

      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", photo);
      cloudinaryFormData.append("api_key", apiKey);
      cloudinaryFormData.append("timestamp", timestamp.toString());
      cloudinaryFormData.append("signature", signature);
      cloudinaryFormData.append("folder", folder);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: cloudinaryFormData,
        }
      );

      if (!uploadResponse.ok) {
        return { error: "Failed to upload photo to Cloudinary" };
      }

      const uploadResult = (await uploadResponse.json()) as {
        secure_url?: string;
        url?: string;
      };

      photoUrl = uploadResult.secure_url || uploadResult.url || null;
    }
    const parsedate = parseDateString(dob);
    if (!parsedate) {
      return { error: "Invalid date format. Use DD-MM-YYYY." };
    }
    // Update member in the database
    const updatedMember = await db.member.update({
      where: { id: memberId },
      data: {
        salutation,
        firstName,
        middleName,
        lastName,
        fatherGuardianName,
        dob: parsedate,
        gender,
        maritalStatus,
        religion,
        caste,
        eduQualification,
        computerLiterate,
        motherTongue,
        bloodGroup,
        contactNo,
        whatsappNo,
        email,
        address,
        pin,
        postOffice,
        district,
        policeStation,
        aadhar,
        pan,
        epic,
        profession,
        annualFamilyIncome,
        photo: photoUrl || undefined,
      },
    });
    console.log(updatedMember);

    revalidatePath("/admindashboard/viewmenberdetails", 'page');

    return { success: "Member details updated successfully" };
  } catch (error) {
    console.error("Error updating member details:", error);
    return { error: "Failed to update member details" };
  }
}

export async function getMemberDetails(memberId: string) {
  try {
    const member = await db.member.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new Error("Member not found");
    }

    return member;
  } catch (error) {
    console.error("Error fetching member details:", error);
    throw error;
  }
}

type DeleteMemberResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function deleteMemberDetails(
  memberId: string
): Promise<DeleteMemberResult> {
  try {
    const role = await currentRole();

    if (role !== "admin") {
      return {
        success: false,
        error: "You are not authorized to perform this action.",
      };
    }

    await db.member.delete({
      where: {
        id: memberId,
      },
    });

    revalidatePath("/admindashboard/viewmenberdetails", 'page');

    return {
      success: true,
      message: "Member deleted successfully.",
    };
  } catch (error) {
    console.error("Error deleting member:", error);
    return {
      success: false,
      error: "An error occurred while deleting the member. Please try again.",
    };
  }
}
