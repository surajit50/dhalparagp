"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import StaffAssignmentForm from "@/components/staff-assignment-form";
import BulkAssignStaff from "@/components/bulk-assign-staff";
import { Users } from "lucide-react";

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
  applicantName: string;
  applicantMobileNumber: string;
  nameOfDeceased: string;
  dateOfDeath: Date;
  warishApplicationStatus: string;
}

interface PendingApplicationsTableProps {
  applications: Application[];
  staffMembers: Staff[];
}

export default function PendingApplicationsTable({
  applications,
  staffMembers,
}: PendingApplicationsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkAssign, setShowBulkAssign] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(applications.map((app) => app.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const isAllSelected = selectedIds.length === applications.length && applications.length > 0;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={handleSelectAll}
          />
          <span className="text-sm text-gray-600">
            {selectedIds.length > 0
              ? `${selectedIds.length} selected`
              : "Select all"}
          </span>
        </div>
        {selectedIds.length > 0 && (
          <Button
            onClick={() => setShowBulkAssign(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Users className="mr-2 h-4 w-4" />
            Bulk Assign ({selectedIds.length})
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>App ID</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Deceased</TableHead>
              <TableHead>Death Date</TableHead>
              <TableHead>Assign Staff</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(app.id)}
                    onCheckedChange={(checked) =>
                      handleSelectOne(app.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell className="font-mono">
                  {app.acknowlegment}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div>{app.applicantName}</div>
                    <div className="text-sm text-gray-500">
                      {app.applicantMobileNumber}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{app.nameOfDeceased}</TableCell>
                <TableCell>
                  {format(app.dateOfDeath, "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  <StaffAssignmentForm
                    applicationId={app.id}
                    staffMembers={staffMembers}
                  />
                </TableCell>
                <TableCell>
                  <Badge
                    className={statusVariant[app.warishApplicationStatus]}
                  >
                    {app.warishApplicationStatus}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {showBulkAssign && (
        <BulkAssignStaff
          selectedIds={selectedIds}
          staffMembers={staffMembers}
          onClose={() => {
            setShowBulkAssign(false);
            setSelectedIds([]);
          }}
        />
      )}
    </>
  );
}

