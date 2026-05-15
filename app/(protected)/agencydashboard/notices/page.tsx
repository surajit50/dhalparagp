import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getAcceptedNitsForPayment } from "@/lib/agencydata";
import { formatDate } from "@/utils/utils";
import { Bell, FileText, Download, CheckCircle, Clock } from "lucide-react";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { currentUser } from "@/lib/auth";

export default async function NoticesPage() {
  const user = await currentUser();
  const agencyId = user?.agencyDetailsId;

  const [works, agencyNotices] = await Promise.all([
    getAcceptedNitsForPayment(),
    db.notice.findMany({
      where: {
        type: "Agency",
        OR: [
          { agencyId: null },
          { agencyId: agencyId || undefined },
        ],
      },
      include: {
        files: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Notices & Communications</h1>
      </div>

      {/* Agency Specific Notices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <Bell className="h-5 w-5" />
            Agency Communications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {agencyNotices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No official communications found.
                  </TableCell>
                </TableRow>
              ) : (
                agencyNotices.map((notice) => (
                  <TableRow key={notice.id}>
                    <TableCell>{formatDate(notice.createdAt)}</TableCell>
                    <TableCell className="font-medium">{notice.reference}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{notice.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {notice.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{notice.department}</TableCell>
                    <TableCell>
                      {notice.status === "OPEN" ? (
                        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 gap-1">
                          <Clock className="h-3 w-3" />
                          Open
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {notice.files.map((file) => (
                          <Link key={file.id} href={file.url} target="_blank">
                            <Button variant="outline" size="sm" className="gap-1">
                              <Download className="h-3 w-3" />
                              View
                            </Button>
                          </Link>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Official NITs & Work Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Notice Date</TableHead>
                <TableHead>Memo Number</TableHead>
                <TableHead>Subject / Work</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {works.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No active notices found.
                  </TableCell>
                </TableRow>
              ) : (
                works.map((work) => (
                  <TableRow key={work.id}>
                    <TableCell>
                      {work.nitDetails?.memoDate
                        ? formatDate(work.nitDetails.memoDate)
                        : "—"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {work.nitDetails?.memoNumber}
                    </TableCell>
                    <TableCell>
                      {work.ApprovedActionPlanDetails?.activityDescription}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">NIT / Work Order</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
