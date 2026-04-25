
import ProfileOption from "@/components/profile-option";
import { UserRole } from "@prisma/client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
// Define the shape of the session user
interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
}

// Update the ExtendedUser type to match the session user structure
interface ExtendedUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
}

export default async function AdminProfilePage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }
  if (!session || !session.user) {
    return <div>Access Denied</div>;
  }

  // Convert SessionUser to ExtendedUser, providing default values where necessary
  const extendedUser: ExtendedUser = {
    id: session.user.id || "",
    name: session.user.name || null,
    email: session.user.email || null,
    image: session.user.image || null,
    role: session.user.role,
    isTwoFactorEnabled: session.user.isTwoFactorEnabled,
    isOAuth: session.user.isOAuth,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileOption user={extendedUser} />
    </div>
  );
}
