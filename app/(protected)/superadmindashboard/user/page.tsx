import { getUsers } from '@/action/userinfo'
import UserManagement from '@/components/user-manage' // Adjust path if needed
import { currentUser } from "@/lib/auth" // Import your auth utility

export default async function UserManagementPage() {
  // Fetch the list of users
  const initialUsers = await getUsers()
  
  // Fetch the currently logged-in user
  const loggedInUser = await currentUser()

  // Extract the role, defaulting to 'user' if undefined to prevent crashes
  const currentRole = loggedInUser?.role || 'user'

  // Pass BOTH required props to the client component
  return <UserManagement initialUsers={initialUsers} currentUserRole={currentRole} />
}
