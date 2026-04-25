"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type SchemeActionState = {
  message: string | null;
  error?: string;
  success?: boolean;
  scheme?: Scheme;
};

export type Scheme = {
  id: string;
  title: string;
  description: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function upsertScheme(
  prevState: SchemeActionState,
  formData: FormData
): Promise<SchemeActionState> {
  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const icon = formData.get("icon") as string;

  if (!title || !description || !icon) {
    return {
      message: "All fields are required",
      error: "All fields are required",
    };
  }

  try {
    let scheme: Scheme;

    if (id && id !== "new") {
      // Update existing scheme
      scheme = await db.governmentScheme.update({
        where: { id },
        data: { title, description, icon },
      });
    } else {
      // Create new scheme
      scheme = await db.governmentScheme.create({
        data: { title, description, icon },
      });
    }

    revalidatePath("/admindashboard/master/govt-scheme/view", 'page');
    return { message: "Scheme saved successfully", success: true, scheme };
  } catch (error) {
    console.error("Error saving scheme:", error);
    return { message: "Error saving scheme", error: "Error saving scheme" };
  } finally {
    await db.$disconnect();
  }
}

export async function getScheme(id: string): Promise<Scheme | null> {
  try {
    const scheme = await db.governmentScheme.findUnique({
      where: { id },
    });
    return scheme;
  } catch (error) {
    console.error("Error fetching scheme:", error);
    return null;
  } finally {
    await db.$disconnect();
  }
}
