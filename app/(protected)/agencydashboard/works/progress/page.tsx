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
import { Progress } from "@/components/ui/progress";
import { getAcceptedNitsForPayment } from "@/lib/agencydata";
import { formatDate } from "@/utils/utils";
import Link from "next/link";

export default async function WorkProgressUpdatePage() {
  const works = await getAcceptedNitsForPayment();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Work Progress</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Track Progress of Your Works</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Work Name</TableHead>
                <TableHead>AOC Date</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {works.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No active works found for progress tracking.
                  </TableCell>
                </TableRow>
              ) : (
                works.map((work) => {
                  // Assuming progress can be calculated from work details if needed
                  // For now using a placeholder or 0
                  const progress = 0;
                  return (
                    <TableRow key={work.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {
                              work.ApprovedActionPlanDetails
                                ?.activityDescription
                            }
                          </span>
                          <span className="text-xs text-muted-foreground">
                            NIT: {work.nitDetails?.memoNumber}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {work.AwardofContract?.workordeermemodate
                          ? formatDate(work.AwardofContract.workordeermemodate)
                          : "—"}
                      </TableCell>
                      <TableCell className="w-[200px]">
                        <div className="flex flex-col gap-1">
                          <Progress value={progress} className="h-2" />
                          <span className="text-xs text-right">
                            {progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{work.workStatus}</TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link
                            href={`/agencydashboard/works/progress/${work.id}`}
                          >
                            Update Progress
                          </Link>
                        </Button>
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
