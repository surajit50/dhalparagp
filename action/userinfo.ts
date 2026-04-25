// action/userinfo.ts
'use server'

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

import { revalidatePath } from 'next/cache'
import * as z from "zod";
import { CreateUserSchema } from "@/schema";
import bcrypt from "bcryptjs";

export const createUser = async (values: z.infer<typeof CreateUserSchema>) => {
  const currentUsers = await currentUser();

  // Allow both 'admin' and 'superadmin' to create users
  if (!currentUsers || !["admin", "superadmin"].includes(currentUsers.role)) {
    return { error: "Unauthorized. Only admins and super admins can create users." };
  }

  const parseResult = CreateUserSchema.safeParse(values);

  if (!parseResult.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name, role, mobileNumber, designation, agencyDetailsId } = parseResult.data;

  try {
    const normalizedEmail = email.toLowerCase();
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return { error: "Email is already in use!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role,
        mobileNumber,
        designation: role === "staff" ? designation : null,
        agencyDetailsId: role === "agency" ? agencyDetailsId : null,
        emailVerified: new Date(),
      },
    });

    revalidatePath("/admindashboard/user", 'page');
    return { success: "User created successfully", user };
  } catch (error) {
    console.error("User creation error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
};

export const userProfileUpdate = async (
  id: string | undefined,
  name: string | undefined
) => {
  try {
    const user = await db.user.update({
      where: {
        id,
      },
      data: {
        name,
      },
    });
    
    revalidatePath('/dashboard/profile', 'page')
    return { success: "Data is updated...." };
    
  } catch (error) {
    return { error: "Data is not updated ...." };
  }
};

export const userProfileImage = async (imageurl: string, imageKey: string) => {
  const cuser = await currentUser();
  const id = cuser?.id;

  try {
    const findpreimage = await db.user.findUnique({
      where: { id },
    });

    if (findpreimage) {
      const { image, imageKey: previmagekey } = findpreimage;

      if (image !== null && previmagekey !== null) {
       
      }
    }

    await db.user.update({
      where: { id },
      data: {
        image: imageurl,
        imageKey,
      },
    });


    return { success: "Profile image uploaded successfully" };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while uploading profile image" };
  }
};

export type UserRole = 'user' | 'admin' | 'staff' | 'superadmin' | 'agency' | 'citizen'

export async function toggleTwoFactor(userIds: string[], enable: boolean) {
  // Allow both 'admin' and 'superadmin' to toggle 2FA
  const currentUsers = await currentUser();
  if (!currentUsers || !["admin", "superadmin"].includes(currentUsers.role)) {
    return { success: false, message: 'Unauthorized. You do not have permission to toggle 2FA.' }
  }

  try {
    await db.user.updateMany({
      where: {
        id: { in: userIds }
      },
      data: { isTwoFactorEnabled: enable }
    })
    return { success: true, message: `Two-factor authentication ${enable ? 'enabled' : 'disabled'} for selected users.` }
  } catch (error) {
    console.error('Error updating users:', error)
    return { success: false, message: 'Failed to update users. Please try again.' }
  }
}

export async function getUsers() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isTwoFactorEnabled: true,
        role: true,
        image: true,
        designation: true,
      },
      orderBy: {
        name: 'asc'
      }
    })
    return users.map((user, index) => ({
      ...user,
      slno: index + 1,
      avatar: user.image || `/placeholder.svg?height=40&width=40`
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    throw new Error('Failed to fetch users')
  }
}

export async function updateUserRole(userId: string, role: UserRole) {
  // ONLY 'superadmin' can change roles
  const currentUsers = await currentUser();
  if (!currentUsers || currentUsers.role !== "superadmin") {
     return { success: false, message: 'Unauthorized. Only Super Admins can change user roles.' }
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: { role }
    })
    return { success: true, message: `User role updated to ${role}.` }
  } catch (error) {
    console.error('Error updating user role:', error)
    return { success: false, message: 'Failed to update user role. Please try again.' }
  }
}

interface UpdateUserParams {
  id: string;
  name: string | null;
  image: string | null;
  imageKey?: string | null;
}

export async function updateUser(values: UpdateUserParams) {
  try {
    const currentUsers = await currentUser();

    if (!currentUsers) {
      return { error: "Unauthorized" };
    }

    if (currentUsers.id !== values.id) {
      return { error: "Unauthorized to update this user" };
    }

    const existingUser = await db.user.findUnique({
      where: { id: values.id },
    });

  

    await db.user.update({
      where: { id: values.id },
      data: {
        name: values.name,
        image: values.image,
        imageKey: values.imageKey ?? null,
      },
    });

    revalidatePath("/", 'page');

    return { success: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating user:", error);
    return { error: "Something went wrong" };
  }
}

export async function resetUserPassword(userId: string) {
  const currentUsers = await currentUser();

  // Allow both 'admin' and 'superadmin' to reset passwords
  if (!currentUsers || !["admin", "superadmin"].includes(currentUsers.role)) {
    return { error: "Unauthorized. Only admins and super admins can reset passwords." };
  }

  try {
    const hashedPassword = await bcrypt.hash("Test@123", 10);

    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return { success: "Password reset to Default (Test@123) successfully" };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { error: "Failed to reset password. Please try again." };
  }
}
