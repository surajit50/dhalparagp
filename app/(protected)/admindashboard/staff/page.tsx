
import { db } from "@/lib/db"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, User, Shield } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

export default async function StaffPage() {
  const staffData = await db.user.findMany({
    where: { role: "staff" },
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <User className="h-8 w-8" />
          Staff Management
        </h1>
        <p className="text-muted-foreground">
          View and manage all staff members and their security settings
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-muted/50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Staff Members
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-220px)]">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[200px]">Staff Member</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Security Status</TableHead>
                  <TableHead className="text-right">2FA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffData.map((staff) => (
                  <TableRow key={staff.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={staff.image || undefined} alt={staff.name || ""} />
                          <AvatarFallback className="font-medium">
                            {staff.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{staff.name || "Unnamed Staff"}</div>
                          <Badge variant="outline" className="mt-1">
                            {staff.role}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{staff.email}</TableCell>
                    <TableCell>
                      <Badge variant={staff.isTwoFactorEnabled ? "default" : "secondary"}>
                        {staff.isTwoFactorEnabled ? "Secure" : "Needs Setup"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {staff.isTwoFactorEnabled ? (
                        <div className="flex justify-end items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="font-medium">Enabled</span>
                        </div>
                      ) : (
                        <div className="flex justify-end items-center gap-1 text-red-600">
                          <XCircle className="h-5 w-5" />
                          <span className="font-medium">Disabled</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
