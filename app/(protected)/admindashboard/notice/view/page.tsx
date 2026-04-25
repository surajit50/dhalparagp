import { db } from "@/lib/db";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Calendar,
  Download,
  Eye,
  Pencil,
  Trash2,
  FileText,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { deleteNotice, updateNoticeStatus } from "@/action/notice";
import { revalidatePath } from "next/cache";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Mail } from "lucide-react";
import { NoticeMessageDialog } from "@/components/form/NoticeMessageDialog";

const Page = async () => {
  const notices = await db.notice.findMany({
    include: { files: true, agency: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notice Management</h1>
          <p className="text-muted-foreground">
            Manage official notices and circulars
          </p>
        </div>

        <Link href="/admindashboard/notice/add">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Notice
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Notices</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {notices.length}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {[...new Set(notices.map((n) => n.department))].length}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Files Attached
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {notices.reduce((a, n) => a + n.files.length, 0)}
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Notices
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                <TableRow>
                  <TableHead>Notice</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {notices.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      No notices found
                    </TableCell>
                  </TableRow>
                )}

                {notices.map((notice) => (
                  <TableRow key={notice.id} className="hover:bg-muted/50">
                    {/* Title */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{notice.title}</span>

                          <Badge variant="outline" className="text-xs">
                            {notice.reference}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notice.description}
                        </p>
                      </div>
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700">
                        {notice.type}
                      </Badge>
                    </TableCell>

                    {/* Department */}
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4 text-green-600" />
                        {notice.department}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {notice.status === "OPEN" ? (
                        <Badge
                          variant="outline"
                          className="text-blue-600 border-blue-200 bg-blue-50 gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          Open
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-200 bg-green-50 gap-1"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </Badge>
                      )}
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 text-green-600" />
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>

                    {/* Files */}
                    <TableCell>
                      {notice.files.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {notice.files.map((file, i) => (
                            <Button
                              key={i}
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs gap-1"
                            >
                              <Download className="h-3 w-3 text-green-600" />
                              {file.name}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No files
                        </span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {/* Mark Complete/Open */}
                        <form
                          action={async () => {
                            "use server";
                            await updateNoticeStatus(
                              notice.id,
                              notice.status === "OPEN" ? "COMPLETED" : "OPEN",
                            );
                          }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            title={
                              notice.status === "OPEN"
                                ? "Mark as Completed"
                                : "Mark as Open"
                            }
                          >
                            {notice.status === "OPEN" ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-blue-600" />
                            )}
                          </Button>
                        </form>

                        {/* Send Message */}
                        {notice.agencyId && (
                          <NoticeMessageDialog notice={notice} />
                        )}

                        {/* View */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4 text-green-600" />
                            </Button>
                          </DialogTrigger>

                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle className="text-xl">
                                {notice.title}
                              </DialogTitle>
                            </DialogHeader>

                            <ScrollArea className="max-h-[70vh] pr-4">
                              <div className="space-y-6">
                                <div className="flex gap-2">
                                  <Badge variant="outline">
                                    {notice.reference}
                                  </Badge>

                                  <Badge>{notice.type}</Badge>
                                </div>

                                <div className="text-muted-foreground">
                                  {notice.description}
                                </div>

                                {notice.files.length > 0 && (
                                  <div>
                                    <h3 className="font-medium mb-2">Files</h3>

                                    <div className="flex gap-2 flex-wrap">
                                      {notice.files.map((file, i) => (
                                        <Button key={i} size="sm">
                                          <Download className="h-4 w-4 mr-1" />
                                          {file.name}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>

                        {/* Edit */}
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            href={`/admindashboard/notice/edit/${notice.id}`}
                          >
                            <Pencil className="h-4 w-4 text-blue-600" />
                          </Link>
                        </Button>

                        {/* Delete */}
                        <form
                          action={async () => {
                            "use server";
                            await deleteNotice(notice.id);
                            revalidatePath("/admindashboard/notice/view");
                          }}
                        >
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
