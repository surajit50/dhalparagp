import { User } from "next-auth";
import { UserRole } from "@prisma/client";

export interface ExtendedUser extends User {
  id: string;
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
}
