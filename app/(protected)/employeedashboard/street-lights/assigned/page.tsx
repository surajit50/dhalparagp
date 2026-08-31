import Link from "next/link";
import { ChevronLeft, Edit } from "lucide-react";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils/date";
import { StatusBadge } from "@/components/street-lights/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = {
  title: "Assigned Complaints | Street Light Register",
  description: "View and manage street light complaints assigned to you.",
};

export default async function AssignedComplaintsPage() {
  const user = await currentUser();
  if (!user || user.role !== "staff") {
    redirect("/auth/login");
  }

  const complaints = await db.streetLightComplaint.findMany({
    where: {
      assignedStaffId: user.id,
    },
    include: {
      streetLight: {
        include: {
          mouza: true,
        },
      },
      assignedAgency: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-background to-muted/30 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/40">
        <div className="flex items-center gap-4">
          <Link
            href="/employeedashboard/home"
            className="w-10 h-10 bg-card rounded-xl flex items-center justify-center border border-border/40 shadow-sm hover:bg-muted transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Assigned Complaints
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              Verify and manage street light repairs assigned to you
            </p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
        <div className="p-6">
          <div className="rounded-lg border border-border/50 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Complaint No.</TableHead>
                  <TableHead>Light ID & Landmark</TableHead>
                  <TableHead>Date Assigned</TableHead>
                  <TableHead>Assigned Agency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!complaints.length ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No complaints assigned to you right now.
                    </TableCell>
                  </TableRow>
                ) : (
                  complaints.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold">
                        {c.complaintNo}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-orange-700">
                          {c.streetLight?.lightId || "—"}
                        </span>
                        {c.streetLight?.landmark && (
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {c.streetLight.landmark}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {c.assignedDate ? formatDate(c.assignedDate) : formatDate(c.createdAt)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {c.assignedAgency?.name || <span className="text-muted-foreground italic">Not Assigned</span>}
                      </TableCell>
                      <TableCell>
                        <StatusBadge type="complaint" value={c.status} />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <Link href={`/employeedashboard/street-lights/complaints/${c.id}`}>
                            <Edit className="w-3.5 h-3.5 mr-2" />
                            View & Update
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
