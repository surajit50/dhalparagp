import { db } from "@/lib/db"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Edit, Eye, UserPlus, Users, Cake, Home } from "lucide-react"
import { ExportButton } from "@/components/ExportButton"

type Member = {
  id: string
  salutation: string
  firstName: string
  middleName: string | null
  lastName: string | null
  fatherGuardianName: string | null
  dob: Date
  gender: string
  maritalStatus: string
  villageDataId: string | null
  photo: string | null
}

// Helper function to get full S3 URL
function getPhotoUrl(photoPath: string | null): string | null {
  if (!photoPath) return null

  // If it's already a full URL (starts with http), return as is
  if (photoPath.startsWith("http")) {
    return photoPath
  }

  // If it's a relative path, construct the full S3 URL
  const bucketUrl = process.env.NEXT_PUBLIC_S3_BUCKET_URL || process.env.NEXT_PUBLIC_SITE_URL
  return `${bucketUrl}${photoPath.startsWith("/") ? "" : "/"}${photoPath}`
}

export default async function MembersPage() {
  const members = await db.member.findMany({
    select: {
      id: true,
      salutation: true,
      firstName: true,
      middleName: true,
      lastName: true,
      fatherGuardianName: true,
      dob: true,
      gender: true,
      maritalStatus: true,
      villageDataId: true,
      photo: true,
    },
  })

  // Process members with proper S3 URLs
  const processedMembers = members.map((member) => ({
    ...member,
    photo: getPhotoUrl(member.photo),
  }))

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 pb-6 border-b">
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold">Members List</CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admindashboard/addmenberdetails">
              <Button className="w-full sm:w-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Member
              </Button>
            </Link>
            <ExportButton members={processedMembers} />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[50px] font-semibold">Sl No</TableHead>
                  <TableHead className="font-semibold">Image</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Guardian Name</TableHead>
                  <TableHead className="font-semibold">Gender</TableHead>
                  <TableHead className="font-semibold">Marital Status</TableHead>
                  <TableHead className="font-semibold">Date of Birth</TableHead>
                  <TableHead className="font-semibold">Village ID</TableHead>
                  <TableHead className="text-right font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedMembers.map((member: Member, index: number) => (
                  <TableRow key={member.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={member.photo || undefined}
                          alt={`${member.firstName} ${member.lastName || ""}`}
                          crossOrigin="anonymous"
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {member.firstName[0]}
                          {member.lastName?.[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {`${member.salutation} ${member.firstName} ${member.middleName || ""} ${member.lastName || ""}`}
                    </TableCell>
                    <TableCell>{member.fatherGuardianName || "N/A"}</TableCell>
                    <TableCell>{member.gender}</TableCell>
                    <TableCell>{member.maritalStatus}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center">
                        <Cake className="mr-2 h-4 w-4 text-muted-foreground" />
                        {member.dob.toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Home className="mr-2 h-4 w-4 text-muted-foreground" />
                        {member.villageDataId || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admindashboard/viewmenberdetails/${member.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admindashboard/editmenberdetails/${member.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
