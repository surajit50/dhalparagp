import { User } from "next-auth";
import { UserRole } from "@prisma/client";
import UserInfoDetailPage from "./user-info-detail-page";
import { ExtendedUser } from "../types/auth";

interface ProfileOptionProps {
  user: User & {
    role: UserRole;
    isTwoFactorEnabled: boolean;
    isOAuth: boolean;
  };
}

export default function ProfileOption({ user }: ProfileOptionProps) {
  // Ensure all required properties are present and create an ExtendedUser object
  const extendedUser: ExtendedUser = {
    ...user,
    id: user.id || "",
    name: user.name || null,
    email: user.email || null,
    image: user.image || null,
    role: user.role,
    isTwoFactorEnabled: user.isTwoFactorEnabled,
    isOAuth: user.isOAuth,
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <UserInfoDetailPage user={extendedUser} />
    </div>
  );
}
