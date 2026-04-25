
"use client"

import { useCurrentUser } from "@/hooks/use-current-user"
import { UserRole } from "@prisma/client"
import { 
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  User, 
  Calendar, 
  MapPin, 
  Phone 
} from "lucide-react"
import { format } from "date-fns"

interface BookingDetails {
  id: string
  serviceType: "WATER_TANKER" | "DUSTBIN_VAN"
  bookingDate: Date
  status: string
  amount: number
  address: string
  phone: string
}

export function BookingConfirmation({ booking }: { booking: BookingDetails }) {
  const user = useCurrentUser()
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <CardTitle className="text-2xl">
          Booking Confirmed!
        </CardTitle>
        <CardDescription>
          Thank you {user?.name} for your booking
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* User Role Badge */}
        {user?.role && (
          <div className="flex justify-center">
            <Badge variant="outline" className="capitalize">
              {user.role.toLowerCase()} account
            </Badge>
          </div>
        )}

        {/* Booking Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <User className="h-6 w-6 text-blue-500" />
            <div>
              <p className="font-medium">{user?.name}</p>
              <p className="text-sm text-muted-foreground">
                {user?.isOAuth ? "OAuth User" : "Email User"}
              </p>
              {user?.isTwoFactorEnabled && (
                <Badge variant="secondary" className="mt-1">
                  2FA Enabled
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Calendar className="h-6 w-6 text-blue-500" />
            <div>
              <p className="font-medium">
                {format(booking.bookingDate, "PPP")}
              </p>
              <p className="text-sm text-muted-foreground">Service Date</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <MapPin className="h-6 w-6 text-blue-500" />
            <div>
              <p className="font-medium">{booking.address}</p>
              <p className="text-sm text-muted-foreground">Service Address</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Phone className="h-6 w-6 text-blue-500" />
            <div>
              <p className="font-medium">{booking.phone}</p>
              <p className="text-sm text-muted-foreground">Contact Number</p>
            </div>
          </div>
        </div>

        {/* Security Status */}
        {user && (
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Account Security</h3>
            <div className="flex gap-4 text-sm">
              <Badge variant={user.isTwoFactorEnabled ? "success" : "warning"}>
                {user.isTwoFactorEnabled ? "2FA Enabled" : "2FA Disabled"}
              </Badge>
              <Badge variant={user.isOAuth ? "success" : "default"}>
                {user.isOAuth ? "OAuth Login" : "Email Login"}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
