"use server"

import { db } from "@/lib/db"

export async function getAllAgencies() {
  try {
    return await db.agencyDetails.findMany({
      orderBy: { name: "asc" }
    })
  } catch (error) {
    console.error("Error fetching agencies:", error)
    return []
  }
}
