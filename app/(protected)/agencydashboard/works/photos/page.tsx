import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { Camera, Upload, Eye, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function UploadWorkPhotosPage() {
  const user = await currentUser();
  const loginAgencyId = user?.agencyDetailsId;

  const works = loginAgencyId
    ? await db.worksDetail.findMany({
        where: {
          AwardofContract: {
            workorderdetails: {
              some: { Bidagency: { agencyDetailsId: loginAgencyId } },
            },
          },
        },
        include: {
          nitDetails: true,
          ApprovedActionPlanDetails: true,
          workPhotos: {
            select: { status: true, isVerified: true },
          },
        },
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Work Photos</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Manage Work Site Photos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Name</TableHead>
                <TableHead>NIT No.</TableHead>
                <TableHead>Photo Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {works.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No active works found for photo uploads.
                  </TableCell>
                </TableRow>
              ) : (
                works.map((work) => {
                  const photos = work.workPhotos;
                  const onsetVerified  = photos.some(p => p.status === "onset"   && p.isVerified);
                  const ongoingVerified = photos.some(p => p.status === "ongoing"  && p.isVerified);
                  const completeVerified = photos.some(p => p.status === "complete" && p.isVerified);
                  const allVerified = onsetVerified && ongoingVerified && completeVerified;
                  const uploadedCount = photos.length;

                  return (
                    <TableRow key={work.id}>
                      <TableCell className="font-medium">
                        {work.ApprovedActionPlanDetails?.activityDescription}
                      </TableCell>
                      <TableCell>{work.nitDetails?.memoNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Stage pills */}
                          {(["onset", "ongoing", "complete"] as const).map((stage) => {
                            const verified = photos.some(p => p.status === stage && p.isVerified);
                            const uploaded = photos.some(p => p.status === stage);
                            return (
                              <span
                                key={stage}
                                className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${
                                  verified
                                    ? "bg-green-100 text-green-700"
                                    : uploaded
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {stage}
                              </span>
                            );
                          })}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({uploadedCount}/3)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {allVerified ? (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-600 text-white gap-1">
                              <CheckCircle2 className="h-3 w-3" /> All Complete
                            </Badge>
                            <Button asChild variant="ghost" size="sm" className="gap-1 text-slate-600">
                              <Link href={`/agencydashboard/works/photos/${work.id}`}>
                                <Eye className="h-4 w-4" /> View
                              </Link>
                            </Button>
                          </div>
                        ) : (
                          <Button asChild variant="outline" size="sm" className="gap-2">
                            <Link href={`/agencydashboard/works/photos/${work.id}`}>
                              <Upload className="h-4 w-4" />
                              Upload Photos
                            </Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
