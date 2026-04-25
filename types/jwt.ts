import type { JwtPayload } from "jsonwebtoken"

/**
 * Defines the structure of our custom JWT payload by extending the default.
 * This provides type safety for both our custom claims and standard claims.
 */
export interface CustomJwtPayload extends JwtPayload {
  id: string
  email: string
  name: string | null
  role: "admin" | "staff" | "superadmin" | "user"
  // Standard claims like 'exp', 'iat', 'sub' are inherited from JwtPayload
}
