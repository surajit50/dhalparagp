import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Get all unique villages (distinct by lgdcode)
    const villages = await db.villageInfo.findMany({
      select: {
        id: true,
        name: true,
        lgdcode: true,
        jlno: true,
      },
      distinct: ["lgdcode"], // Get unique villages by LGD code
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(villages)
  } catch (error) {
    console.error("Error fetching villages:", error)
    return NextResponse.json({ error: "Failed to fetch villages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, lgdcode, jlno } = body

    // Validate required fields
    if (!name || !lgdcode || !jlno) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const currentYear = new Date().getFullYear().toString()

    // Find or create year record
    let yearRecord = await db.yeardatas.findFirst({
      where: { yeardata: currentYear },
    })

    if (!yearRecord) {
      yearRecord = await db.yeardatas.create({
        data: { yeardata: currentYear },
      })
    }

    // Check if village with same LGD code already exists for the current year
    const existingVillageByLGD = await db.villageInfo.findFirst({
      where: {
        lgdcode: Number(lgdcode),
        yeardatasId: yearRecord.id,
      },
    })

    if (existingVillageByLGD) {
      return NextResponse.json(
        { error: `A village with LGD Code '${lgdcode}' already exists for the year ${currentYear}` },
        { status: 400 },
      )
    }

    // Check if village with same JL number already exists for the current year
    const existingVillageByJL = await db.villageInfo.findFirst({
      where: {
        jlno: Number(jlno),
        yeardatasId: yearRecord.id,
      },
    })

    if (existingVillageByJL) {
      return NextResponse.json(
        { error: `A village with JL Number '${jlno}' already exists for the year ${currentYear}` },
        { status: 400 },
      )
    }

    // Create new village info record
    const newVillage = await db.villageInfo.create({
      data: {
        name,
        lgdcode: Number(lgdcode),
        jlno: Number(jlno),
        yeardatasId: yearRecord.id,
        isDraft: true, // Start as draft
      },
      select: {
        id: true,
        name: true,
        lgdcode: true,
        jlno: true,
      },
    })

    return NextResponse.json(newVillage, { status: 201 })
  } catch (error) {
    console.error("Error creating village:", error)
    return NextResponse.json({ error: "Failed to create village" }, { status: 500 })
  }
}
