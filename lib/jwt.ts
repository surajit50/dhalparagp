import jwt from "jsonwebtoken"
import type { CustomJwtPayload } from "@/types/jwt"

/**
 * Verifies a JWT token.
 * The `jsonwebtoken.verify` function automatically handles:
 * - Signature verification
 * - Token expiration (throws TokenExpiredError)
 *
 * @param token The JWT token string.
 * @returns The decoded payload if the token is valid, otherwise null.
 */
export function verifyJWT(token: string): CustomJwtPayload | null {
  if (!process.env.NEXTAUTH_SECRET) {
    console.error("JWT Secret (NEXTAUTH_SECRET) is not defined in environment variables.")
    return null
  }

  try {
    // The 'as' cast is used here because jwt.verify returns a generic JwtPayload or string.
    // We are confident in our payload structure, so we cast it to our custom type.
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET) as CustomJwtPayload
    return decoded
  } catch (error) {
    // Log the specific error for debugging purposes on the server
    if (error instanceof jwt.TokenExpiredError) {
      console.log("JWT Verification Failed: Token has expired.")
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.log("JWT Verification Failed:", error.message)
    } else {
      console.error("An unexpected error occurred during JWT verification:", error)
    }
    return null
  }
}
