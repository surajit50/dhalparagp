// actions/warish.ts
"use server";

import { db } from "@/lib/db";
import { WarishDetailProps } from "@/types";

export async function deleteWarishDetail(id: string) {
  try {
   console.log(id)
  } catch (error) {
    throw new Error("Failed to delete warish detail");
  }
}

export async function updateWarishDetail(
  id: string,
  updatedData: Partial<WarishDetailProps>
) {
  try {
   console.log(id)
  } catch (error) {
    throw new Error("Failed to update warish detail");
  }
}
