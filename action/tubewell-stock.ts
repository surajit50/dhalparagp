"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addTubewellStock(data: { tubewellType: string; quantity: number }) {
  await db.tubewellStock.create({
    data: {
      tubewellType: data.tubewellType,
      quantity: data.quantity,
    },
  });
  revalidatePath("/(protected)/admindashboard/stock-manage/add");
}

export async function updateTubewellStock(id: string, data: { tubewellType: string; quantity: number }) {
  await db.tubewellStock.update({
    where: { id },
    data: {
      tubewellType: data.tubewellType,
      quantity: data.quantity,
      lastUpdated: new Date(),
    },
  });
  revalidatePath("/(protected)/admindashboard/stock-manage/add");
}

export async function deleteTubewellStock(id: string) {
  await db.tubewellStock.delete({
    where: { id },
  });
  revalidatePath("/(protected)/admindashboard/stock-manage/add");
}
