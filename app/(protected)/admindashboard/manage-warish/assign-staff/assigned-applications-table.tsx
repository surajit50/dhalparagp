"use client";

import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ReassignStaff from "@/components/reassign-staff";

const statusVariant: Record<string, string> = {
  submitted: "bg-yellow-100 text-yellow-800",
  process: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

interface Staff {
  id: string;
  name: string;
}

interface Application {
  id: string;
  acknowlegment: string;
  assingstaffId: string | null;
  updatedAt: Date;
  warishApplicationStatus: string;
}

interface AssignedApplicationsTableProps {
  applications: Application[];
  staffMembers: Staff[];
}

export default function AssignedApplicationsTable({
  applications,
  staffMembers,
}: AssignedApplicationsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>App ID</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Assigned On</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => {
            const staff = staffMembers.find(
              (s) => s.id === app.assingstaffId
            );
            return (
              <TableRow key={app.id}>
                <TableCell className="font-mono">
                  {app.acknowlegment}
                </TableCell>
                <TableCell>
                  {staff ? (
                    <div className="flex items-center gap-2">
                      <span>{staff.name}</span>
                    </div>
                  ) : (
                    "Unassigned"
                  )}
                </TableCell>
                <TableCell>
                  {format(app.updatedAt, "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  {format(app.updatedAt, "dd/MM/yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  <Badge
                    className={statusVariant[app.warishApplicationStatus]}
                  >
                    {app.warishApplicationStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ReassignStaff
                    applicationId={app.id}
                    currentStaffId={app.assingstaffId}
                    currentStaffName={staff?.name || null}
                    staffMembers={staffMembers}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

