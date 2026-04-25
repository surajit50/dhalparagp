"use server"

import { db } from "@/lib/db"
import { z } from "zod"

const UpdateAocSchema = z.object({
  workId: z.string().min(1),
  workodermenonumber: z.string().min(1),
  workordeermemodate: z.string().min(1),
  isdelivery: z.string().optional(),
  deliveryDate: z.string().optional(),
})

export async function updateAocDetails(formData: FormData) {
  try {
    const parsed = UpdateAocSchema.safeParse({
      workId: formData.get("workId"),
      workodermenonumber: formData.get("workodermenonumber"),
      workordeermemodate: formData.get("workordeermemodate"),
      isdelivery: formData.get("isdelivery")?.toString(),
      deliveryDate: formData.get("deliveryDate")?.toString(),
    })

    if (!parsed.success) {
      return { error: "Validation failed" }
    }

    const { workId, workodermenonumber, workordeermemodate, isdelivery, deliveryDate } = parsed.data

    const work = await db.worksDetail.findUnique({ where: { id: workId }, include: { AwardofContract: true } })
    if (!work) return { error: "Work not found" }

    const aoc = Array.isArray(work.AwardofContract) ? work.AwardofContract[0] : work.AwardofContract
    if (!aoc) return { error: "AOC record not found for this work" }

    const updated = await db.awardofContract.update({
      where: { id: aoc.id },
      data: {
        workodermenonumber,
        workordeermemodate: new Date(workordeermemodate),
        isdelivery: isdelivery === "true",
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
      },
    })

    return { success: true, data: updated }
  } catch (e: any) {
    console.error("updateAocDetails error", e)
    return { error: e?.message || "Failed to update" }
  }
}

