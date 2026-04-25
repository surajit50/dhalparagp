import { currentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CalendarIcon, FileTextIcon, UserIcon } from "lucide-react"
import Link from "next/link"

const StaffDashboard = async () => {
  const cstaff = await currentUser()

  if (!cstaff) {
    return <div>Please log in to view your dashboard.</div>
  }

  const warishApplications = await db.warishApplication.findMany({
    where: {
      assingstaffId: cstaff.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const pendingApplications = warishApplications.filter(app => app.warishApplicationStatus === 'process')
  const approvedApplications = warishApplications.filter(app => app.warishApplicationStatus === 'approved')
  const rejectedApplications = warishApplications.filter(app => app.warishApplicationStatus === 'rejected')

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Welcome, {cstaff.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Badge>{pendingApplications.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingApplications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Applications</CardTitle>
            <Badge variant="secondary">{approvedApplications.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedApplications.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Applications</CardTitle>
            <Badge variant="destructive">{rejectedApplications.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedApplications.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application ID</TableHead>
                <TableHead>Applicant Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Application Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warishApplications.slice(0, 5).map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">{application.acknowlegment}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{application.applicantName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={application.warishApplicationStatus === 'approved' ? 'secondary' :
                        application.warishApplicationStatus === 'rejected' ? 'destructive' : 'default'}
                    >
                      {application.warishApplicationStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {format(new Date(application.createdAt), 'dd MMM yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button asChild size="sm">
                      <Link href={`/warish-applications/${application.id}`}>
                        <FileTextIcon className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {warishApplications.length > 5 && (
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <Link href="/all-applications">View All Applications</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default StaffDashboard