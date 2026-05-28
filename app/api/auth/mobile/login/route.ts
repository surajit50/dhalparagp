import { type NextRequest, NextResponse } from "next/server"

import { getUserEmail } from "@/data/user"
import { generateTwoFactorToken, generateVerificationToken } from "@/lib/token"
import { sendTwoFactorTokenEmail, sendVerificationEmail } from "@/lib/mail"
import { getTwoFactorTokenEmail } from "@/data/two-factor-token"
import { db } from "@/lib/db"
import { compare } from "bcryptjs"
import jwt from "jsonwebtoken"


const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "your-super-secret-jwt-key-for-dev"

// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*', // Update this with your mobile app's origin in production
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With',
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  // Add CORS headers to all responses
  const headers = new Headers(corsHeaders)
  headers.append('Content-Type', 'application/json')

  try {
    const body = await request.json()
    const { email, password, code } = body

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid input",
          message: "Email and password are required." 
        },
        { status: 400, headers }
      )
    }

    const existingUser = await getUserEmail(email)

    // User existence check
    if (!existingUser || !existingUser.email || !existingUser.password) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid credentials!",
          message: "User not found or password not set." 
        },
        { status: 401, headers }
      )
    }

    // User status check
    if (existingUser.userStatus !== "active") {
      return NextResponse.json(
        {
          success: false,
          error: "Account inactive.",
          message: "Your account is currently inactive. Please contact support."
        },
        { status: 403, headers }
      )
    }

    // Password validation
    const isValidPassword = await compare(password, existingUser.password)
    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials!",
          message: "The email or password you entered is incorrect."
        },
        { status: 401, headers }
      )
    }

    // Email verification check
    if (!existingUser.emailVerified) {
      const verificationToken = await generateVerificationToken(existingUser.email)
      await sendVerificationEmail(verificationToken.email, verificationToken.token)
      return NextResponse.json(
        {
          success: false,
          error: "Email not verified",
          message: "Please verify your email. A new confirmation email has been sent.",
          emailVerificationRequired: true,
        },
        { status: 403, headers }
      )
    }

    // 2FA handling
    if (existingUser.isTwoFactorEnabled && existingUser.email) {
      if (code) {
        const twoFactorToken = await getTwoFactorTokenEmail(existingUser.email)

        if (!twoFactorToken || twoFactorToken.token !== code) {
          return NextResponse.json(
            {
              success: false,
              error: "Invalid 2FA code!",
              message: "The two-factor authentication code is invalid."
            },
            { status: 401, headers }
          )
        }

        const hasExpired = new Date(twoFactorToken.expires) < new Date()
        if (hasExpired) {
          return NextResponse.json(
            {
              success: false,
              error: "2FA Code expired!",
              message: "The two-factor authentication code has expired. Please request a new one."
            },
            { status: 401, headers }
          )
        }

        // Process 2FA
        try {
          await db.$transaction([
            db.twoFactorToken.delete({ where: { id: twoFactorToken.id } }),
            db.twoFactorConfirmation.deleteMany({ where: { userId: existingUser.id } }),
            db.twoFactorConfirmation.create({ data: { userId: existingUser.id } })
          ])
        } catch (dbError) {
          console.error("2FA DB Error:", dbError)
          return NextResponse.json(
            {
              success: false,
              error: "Server error",
              message: "Could not process 2FA. Please try again."
            },
            { status: 500, headers }
          )
        }
      } else {
        // Send 2FA code
        const twoFactorToken = await generateTwoFactorToken(existingUser.email)
        await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token)
        return NextResponse.json(
          {
            success: false,
            message: "2FA code sent to your email",
            twoFactorRequired: true,
          },
          { status: 200, headers }
        )
      }
    }

    // Generate JWT token
    const tokenPayload = {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      role: existingUser.role,
      agencyDetailsId: existingUser.agencyDetailsId,
      isTwoFactorEnabled: existingUser.isTwoFactorEnabled,
      platform: 'mobile',
      iat: Math.floor(Date.now() / 1000)
    }

    const token = jwt.sign(tokenPayload, NEXTAUTH_SECRET, {
      expiresIn: "90d" // Extended expiration for mobile
    })

    // Return successful response
    return NextResponse.json(
      {
        success: true,
        message: "Login successful!",
        token,
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
          isTwoFactorEnabled: existingUser.isTwoFactorEnabled
        }
      },
      { status: 200, headers }
    )

  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Server error",
        message: "An unexpected error occurred. Please try again."
      },
      { status: 500, headers }
    )
  }
}
