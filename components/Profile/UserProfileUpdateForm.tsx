import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ExtendedUser } from "@/next-auth"

interface UserInfoDetailPageProps {
  user?: ExtendedUser
}

export default function UserInfoDetailPage({ user }: UserInfoDetailPageProps) {
  if (!user) {
    return (
      <Card className="w-full max-w-[550px] shadow-xl">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No user data available</p>
        </CardContent>
      </Card>
    )
  }

  const userDetails = [
    { label: "ID", value: user.id },
    { label: "Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Role", value: user.role },
  ]

  return (
    <Card className="w-full max-w-[550px] shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">User Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <Avatar className="w-24 h-24">
            <AvatarImage src={user.image || ""} alt={user.name || "User avatar"} />
            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
        </div>
        {userDetails.map((detail) => (
          <div
            key={detail.label}
            className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg p-3 bg-secondary"
          >
            <p className="font-medium mb-1 sm:mb-0">{detail.label}</p>
            <p className="truncate bg-background p-2 max-w-[250px] text-sm rounded">
              {detail.value || "N/A"}
            </p>
          </div>
        ))}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg p-3 bg-secondary">
          <p className="font-medium mb-1 sm:mb-0">2FA Authentication</p>
          <Badge variant={user.isTwoFactorEnabled ? "default" : "destructive"}>
            {user.isTwoFactorEnabled ? "ON" : "OFF"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
