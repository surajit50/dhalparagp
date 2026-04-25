// app/api/search/route.ts
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { searchQuery } = await request.json()

    if (!searchQuery?.trim()) {
      return NextResponse.json(
        { error: "Please enter a search term" },
        { status: 400 }
      )
    }

    const result = await db.warishApplication.findFirst({
      where: {
        OR: [
          { acknowlegment: searchQuery },
          { warishRefNo: searchQuery },
          { nameOfDeceased: { contains: searchQuery, mode: "insensitive" } },
        ],
      },
    })

    if (!result) {
      return NextResponse.json(
        { error: `No application found for "${searchQuery}"` },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Database Error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching the application" },
      { status: 500 }
    )
  }
}
