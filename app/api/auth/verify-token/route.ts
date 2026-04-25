import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/jwt"







export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    const decoded = await verifyJWT(token)

    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    return NextResponse.json({ isValid: true, userId: decoded.userId })
  } catch (error) {
    console.error("Error verifying token:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
