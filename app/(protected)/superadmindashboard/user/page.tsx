import { getUsers } from "@/action/userinfo";
import UserManagement from "@/components/user-manage";
import { currentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function UserManagementPage() {
  // Fetch the list of users
  const initialUsers = await getUsers();

  // Fetch the currently logged-in user
  const loggedInUser = await currentUser();

  // Extract the role, defaulting to 'user' if undefined to prevent crashes
  const currentRole = loggedInUser?.role || "user";

  // Pass BOTH required props to the client component
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/superadmindashboard">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      <UserManagement
        initialUsers={initialUsers}
        currentUserRole={currentRole}
      />
    </div>
  );
}
